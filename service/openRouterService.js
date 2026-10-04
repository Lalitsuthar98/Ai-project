

import openrouter from "../config/openRouter.js";


// ==================================================
// NORMAL AI RESPONSE
// ==================================================

export const generateAIResponse = async ({
  model,
  messages,
}) => {
  if (!model) {
    throw new Error("AI model is required");
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Messages must be a non-empty array");
  }

  const completion = await openrouter.chat.send({
    chatRequest: {
      model,
      messages,
    },
  });

  const aiReply = completion?.choices?.[0]?.message?.content;

  if (!aiReply || typeof aiReply !== "string") {
    throw new Error("AI response is empty or invalid");
  }

  const promptTokens = Number(
    completion?.usage?.promptTokens ??
    completion?.usage?.prompt_tokens ??
    0
  );

  const completionTokens = Number(
    completion?.usage?.completionTokens ??
    completion?.usage?.completion_tokens ??
    0
  );

  const totalTokens = Number(
    completion?.usage?.totalTokens ??
    completion?.usage?.total_tokens ??
    promptTokens + completionTokens
  );

  return {
    aiReply,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens,
    },
  };
};


// ==================================================
// STREAM AI RESPONSE
// ==================================================

export const generateAIResponseStream = async ({
  model,
  messages,
}) => {
  if (!model) {
    throw new Error("AI model is required");
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Messages must be a non-empty array");
  }

  const stream = await openrouter.chat.send({
    chatRequest: {
      model,
      messages,
      stream: true,
    },
  });

  return stream;
};