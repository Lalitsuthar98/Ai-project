// utils/tokenUsage.js

export const addChatTokenUsage = (chatData, usage) => {
  const promptTokens = Number(usage?.promptTokens || 0);
  const completionTokens = Number(usage?.completionTokens || 0);
  const totalTokens = Number(usage?.totalTokens || 0);

  if (!chatData.usage) {
    chatData.usage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };
  }

  chatData.usage.promptTokens += promptTokens;

  chatData.usage.completionTokens += completionTokens;

  chatData.usage.totalTokens += totalTokens;

  return chatData;
};