

import mongoose from "mongoose";

import msg from "../model/msgSchema.js";
import chat from "../model/chatSchema.js";

import {
  generateAIResponseStream,
} from "../service/openRouterService.js";

import {
  updateSummaryIfNeeded,
} from "../service/summaryService.js";

import {
  buildMessagesForAI,
} from "../utils/chatContext.js";

import {
  addUserTokenUsage,
} from "../utils/userUsage.js";

import {
  addChatTokenUsage,
} from "../utils/tokenUsage.js";

import {
  addRedisTokenUsage,
} from "../utils/redisTokenUsage.js";


// ==================================================
// GET MESSAGES
// ==================================================

export const getmessage = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        message: "Invalid chat ID",
      });
    }

    const chatData = await chat.findOne({
      _id: chatId,
      userId: req.userdata._id,
    });

    if (!chatData) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    const messagesData = await msg
      .find({
        chatId: chatData._id,
        userId: req.userdata._id,
      })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      chatId: chatData._id,
      messages: messagesData,
    });

  } catch (error) {
    console.error("Get message error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// ==================================================
// SEND MESSAGE - STREAMING
// ==================================================

export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, model } = req.body;

    // ------------------------------------------------
    // VALIDATE MESSAGE
    // ------------------------------------------------

    if (
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return res.status(400).json({
        message: "Message content is required",
      });
    }

    const cleanContent = content.trim();

    let chatData;

    // ------------------------------------------------
    // EXISTING CHAT
    // ------------------------------------------------

    if (chatId) {
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({
          message: "Invalid chat ID",
        });
      }

      chatData = await chat.findOne({
        _id: chatId,
        userId: req.userdata._id,
      });

      if (!chatData) {
        return res.status(404).json({
          message: "Chat not found",
        });
      }

    } else {

      // ------------------------------------------------
      // NEW CHAT
      // ------------------------------------------------

      const selectedModel =
        model || process.env.DEFAULT_AI_MODEL;

      if (!selectedModel) {
        return res.status(400).json({
          message: "AI model is required",
        });
      }

      chatData = await chat.create({
        userId: req.userdata._id,
        model: selectedModel,
        topic: cleanContent.slice(0, 40),
      });
    }

    // ------------------------------------------------
    // FETCH UNSUMMARIZED MESSAGES
    // ------------------------------------------------

    const oldMessages = await msg
      .find({
        chatId: chatData._id,
      })
      .sort({ createdAt: 1 })
      .skip(
        chatData.summarizedTillMessageNumber || 0
      );

    // ------------------------------------------------
    // BUILD AI CONTEXT
    // ------------------------------------------------

    const messagesForAI = buildMessagesForAI({
      chatdata: chatData,
      oldMessages,
      currentMessage: cleanContent,
    });

    // =================================================
    // START STREAMING RESPONSE
    // =================================================

    const stream = await generateAIResponseStream({
      model: chatData.model,
      messages: messagesForAI,
    });

    // ------------------------------------------------
    // STREAM HEADERS
    // ------------------------------------------------

    res.setHeader(
      "Content-Type",
      "text/event-stream; charset=utf-8"
    );

    res.setHeader(
      "Cache-Control",
      "no-cache, no-transform"
    );

    res.setHeader(
      "Connection",
      "keep-alive"
    );

    // Important when using some proxies
    res.flushHeaders();

    // ------------------------------------------------
    // VARIABLES FOR COMPLETE RESPONSE
    // ------------------------------------------------

    let aiReply = "";

    let usage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };

    // =================================================
    // RECEIVE OPENROUTER CHUNKS
    // =================================================

    for await (const chunk of stream) {

      // -----------------------------------------------
      // GET TEXT FROM CURRENT CHUNK
      // -----------------------------------------------

      const text =
        chunk?.choices?.[0]?.delta?.content;

      // -----------------------------------------------
      // SEND TEXT TO FRONTEND
      // -----------------------------------------------

      if (text) {

        // Keep complete response for MongoDB
        aiReply += text;

        // Send chunk to React
        res.write(
          `data: ${JSON.stringify({
            type: "chunk",
            content: text,
          })}\n\n`
        );
      }

      // -----------------------------------------------
      // GET USAGE
      // -----------------------------------------------

      if (chunk?.usage) {

        usage = {
          promptTokens: Number(
            chunk.usage?.promptTokens ??
            chunk.usage?.prompt_tokens ??
            usage.promptTokens
          ),

          completionTokens: Number(
            chunk.usage?.completionTokens ??
            chunk.usage?.completion_tokens ??
            usage.completionTokens
          ),

          totalTokens: Number(
            chunk.usage?.totalTokens ??
            chunk.usage?.total_tokens ??
            usage.totalTokens
          ),
        };
      }
    }

    // =================================================
    // STREAM FINISHED
    // =================================================

    if (!aiReply || typeof aiReply !== "string") {

      res.write(
        `data: ${JSON.stringify({
          type: "error",
          message: "AI response is empty or invalid",
        })}\n\n`
      );

      return res.end();
    }

    // ------------------------------------------------
    // FALLBACK TOKEN CALCULATION
    // ------------------------------------------------

    if (!usage.totalTokens) {
      usage.totalTokens =
        usage.promptTokens +
        usage.completionTokens;
    }

    const totalTokens = Number(
      usage.totalTokens || 0
    );

    // =================================================
    // SAVE USER MESSAGE
    // =================================================

    const userMessage = await msg.create({
      chatId: chatData._id,
      userId: req.userdata._id,
      role: "user",
      content: cleanContent,
    });

    // =================================================
    // SAVE ASSISTANT MESSAGE
    // =================================================

    const assistantMessage = await msg.create({
      chatId: chatData._id,
      userId: req.userdata._id,
      role: "assistant",
      content: aiReply,

      usage: {
        promptTokens: Number(
          usage.promptTokens || 0
        ),

        completionTokens: Number(
          usage.completionTokens || 0
        ),

        totalTokens,
      },
    });

    // =================================================
    // UPDATE MESSAGE COUNT
    // =================================================

    chatData.messageCount =
      (chatData.messageCount || 0) + 2;

    // =================================================
    // UPDATE TOPIC
    // =================================================

    if (
      !chatData.topic ||
      chatData.topic.toLowerCase() === "new chat"
    ) {
      chatData.topic =
        cleanContent.slice(0, 40);
    }

    // =================================================
    // UPDATE CHAT TOKEN USAGE
    // =================================================

    addChatTokenUsage(
      chatData,
      usage
    );

    // =================================================
    // UPDATE PERMANENT USER TOKEN USAGE
    // =================================================

    await addUserTokenUsage(
      req.userdata,
      totalTokens
    );

    // =================================================
    // UPDATE REDIS TOKEN USAGE
    // =================================================

    const tokenUsed =
      await addRedisTokenUsage(
        req.userId,
        totalTokens
      );

    // =================================================
    // SAVE CHAT
    // =================================================

    await chatData.save();

    // =================================================
    // RUN SUMMARY IN BACKGROUND
    // =================================================

    updateSummaryIfNeeded(
      chatData._id
    ).catch((error) => {
      console.error(
        "Background summary error:",
        error
      );
    });

    // =================================================
    // SEND FINAL EVENT
    // =================================================

    res.write(
      `data: ${JSON.stringify({
        type: "done",

        chatId: chatData._id,

        usage,

        tokenUsed,

        tokenLimit:
          Number(process.env.TOKEN_LIMIT),

        userMessage,

        assistantMessage,
      })}\n\n`
    );

    // ------------------------------------------------
    // CLOSE STREAM
    // ------------------------------------------------

    res.end();

  } catch (error) {

    console.error(
      "Send message error:",
      error
    );

    // If streaming has not started,
    // normal JSON response is possible.
    if (!res.headersSent) {

      return res.status(500).json({
        message: "Internal server error",
      });
    }

    // If streaming already started,
    // send error as a stream event.
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: "Internal server error",
      })}\n\n`
    );

    res.end();
  }
};
