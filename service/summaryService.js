// service/summaryService.js

import chat from "../model/chatSchema.js";
import msg from "../model/msgSchema.js";

import { generateAIResponse } from "./openRouterService.js";

import { addUserTokenUsage } from "../utils/userUsage.js";
import { addChatTokenUsage } from "../utils/tokenUsage.js";
import { addRedisTokenUsage } from "../utils/redisTokenUsage.js";

const SUMMARY_CHUNK_SIZE = 20;

export const updateSummaryIfNeeded = async (chatId) => {
  try {
    const chatData = await chat.findById(chatId);

    if (!chatData) {
      return;
    }

    const messageCount = chatData.messageCount || 0;

    const summarizedTill =
      chatData.summarizedTillMessageNumber || 0;

    const unsummarizedCount =
      messageCount - summarizedTill;

    if (unsummarizedCount < SUMMARY_CHUNK_SIZE) {
      return;
    }

    const messagesToSummarize = await msg
      .find({
        chatId: chatData._id,
      })
      .sort({ createdAt: 1 })
      .skip(summarizedTill)
      .limit(SUMMARY_CHUNK_SIZE);

    if (messagesToSummarize.length === 0) {
      return;
    }

    const formattedMessages = messagesToSummarize
      .map((message) => {
        return `${message.role}: ${message.content}`;
      })
      .join("\n");

    const summaryMessages = [
      {
        role: "system",
        content:
          "You summarize conversations clearly and preserve important facts.",
      },
      {
        role: "user",
        content: `
Previous summary:
${chatData.summary || "No previous summary"}

New conversation messages:
${formattedMessages}

Create an updated, concise summary.
        `,
      },
    ];

    const { aiReply, usage } = await generateAIResponse({
      model: chatData.model,
      messages: summaryMessages,
    });

    const totalTokens = Number(usage?.totalTokens || 0);

    // Update summary
    chatData.summary = aiReply;

    chatData.summaryUpdatedAt = new Date();

    chatData.summarizedTillMessageNumber =
      summarizedTill + messagesToSummarize.length;

    // Update chat usage
    addChatTokenUsage(chatData, usage);

    // Update permanent user usage in MongoDB
    const userData = await import("../model/userSchema.js");

    const existingUser = await userData.default.findById(
      chatData.userId
    );

    if (existingUser) {
      await addUserTokenUsage(existingUser, totalTokens);
    }

    // Update active Redis usage
    await addRedisTokenUsage(
      chatData.userId.toString(),
      totalTokens
    );

    await chatData.save();

    console.log(
      `Summary updated for chat ${chatData._id}`
    );

  } catch (error) {
    console.error("Summary update error:", error);
  }
};