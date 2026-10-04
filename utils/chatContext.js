// utils/chatContext.js

const SYSTEM_PROMPT = `
You are a helpful AI assistant.

Instructions:
- Answer questions clearly and accurately.
- If the user asks for code, provide clean and practical code.
- If the user asks for an explanation, explain it simply and structurally.
- If you are unsure, clearly say that you are unsure instead of guessing.
`;

const ALLOWED_ROLES = new Set([
  "user",
  "assistant",
  "system",
]);

export const buildMessagesForAI = ({
  chatdata,
  oldMessages = [],
  currentMessage,
}) => {
  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT.trim(),
    },
  ];

  // Add previous conversation summary
  if (
    typeof chatdata?.summary === "string" &&
    chatdata.summary.trim() !== ""
  ) {
    messages.push({
      role: "system",
      content: `Previous conversation summary:\n${chatdata.summary.trim()}`,
    });
  }

  // Add previous messages
  for (const message of oldMessages) {
    if (
      !ALLOWED_ROLES.has(message.role) ||
      typeof message.content !== "string" ||
      message.content.trim() === ""
    ) {
      continue;
    }

    messages.push({
      role: message.role,
      content: message.content,
    });
  }

  // Add the current user message
  if (
    typeof currentMessage !== "string" ||
    currentMessage.trim() === ""
  ) {
    throw new Error("Current message is required");
  }

  messages.push({
    role: "user",
    content: currentMessage.trim(),
  });

  return messages;
};