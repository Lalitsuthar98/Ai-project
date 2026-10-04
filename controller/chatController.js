// controller/chatController.js

import mongoose from "mongoose";

import chat from "../model/chatSchema.js";
import msg from "../model/msgSchema.js";


// GET RECENT CHATS
export const getRecentChat = async (req, res) => {
  try {
    const chats = await chat
      .find({
        userId: req.userdata._id,
      })
      .select("topic updatedAt model")
      .sort({ updatedAt: -1 })
      .limit(20);

    return res.status(200).json({
      chats,
    });

  } catch (error) {
    console.error("Get recent chat error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// GET SINGLE CHAT
export const getSingleChat = async (req, res) => {
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

    return res.status(200).json({
      chatId: chatData._id,
      userId: chatData.userId,
      topic: chatData.topic,
      model: chatData.model,
      summary: chatData.summary,
      usage: chatData.usage,
      createdAt: chatData.createdAt,
      updatedAt: chatData.updatedAt,
    });

  } catch (error) {
    console.error("Get single chat error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// CREATE CHAT
export const createChat = async (req, res) => {
  try {
    const { model } = req.body;

    if (
      typeof model !== "string" ||
      model.trim() === ""
    ) {
      return res.status(400).json({
        message: "AI model is required",
      });
    }

    const newChat = await chat.create({
      userId: req.userdata._id,
      model: model.trim(),
    });

    return res.status(201).json({
      chatId: newChat._id,
      userId: newChat.userId,
      model: newChat.model,
      topic: newChat.topic,
      createdAt: newChat.createdAt,
    });

  } catch (error) {
    console.error("Create chat error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// DELETE CHAT
export const deleteChat = async (req, res) => {
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

    await msg.deleteMany({
      chatId: chatData._id,
      userId: req.userdata._id,
    });

    await chat.deleteOne({
      _id: chatData._id,
      userId: req.userdata._id,
    });

    return res.status(200).json({
      message: "Chat deleted successfully",
    });

  } catch (error) {
    console.error("Delete chat error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};