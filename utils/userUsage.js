// utils/userUsage.js

export const addUserTokenUsage = async (userData, totalTokens) => {
  const tokenCount = Number(totalTokens);

  if (!Number.isInteger(tokenCount) || tokenCount < 0) {
    throw new Error("Invalid token count");
  }

  if (!userData.usage) {
    userData.usage = {};
  }

  userData.usage.totalTokenUsed =
    (userData.usage.totalTokenUsed || 0) + tokenCount;

  await userData.save();

  return userData.usage.totalTokenUsed;
};