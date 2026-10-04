// utils/redisTokenUsage.js

import { redisClient } from "../config/redis.js";

const getTokenWindowSeconds = () => {
  const seconds = Number(process.env.TOKEN_WINDOW_SECONDS);

  if (!Number.isInteger(seconds) || seconds <= 0) {
    throw new Error("Invalid TOKEN_WINDOW_SECONDS in .env");
  }

  return seconds;
};

// Generate Redis key
export const getTokenUsageKey = (userId) => {
  return `token-usage:${userId}`;
};

// Get current token usage
export const getCurrentTokenUsage = async (userId) => {
  const key = getTokenUsageKey(userId);

  const tokenUsed = await redisClient.get(key);

  return {
    key,
    tokenUsed: Number(tokenUsed || 0),
  };
};

// Add token usage to Redis
export const addRedisTokenUsage = async (userId, tokens) => {
  const tokenCount = Number(tokens);

  if (!Number.isInteger(tokenCount) || tokenCount < 0) {
    throw new Error("Invalid token count");
  }

  if (tokenCount === 0) {
    const currentUsage = await getCurrentTokenUsage(userId);
    return currentUsage.tokenUsed;
  }

  const key = getTokenUsageKey(userId);

  // Atomically increase the token count
  const totalTokenUsed = await redisClient.incrBy(key, tokenCount);

  // Set expiry if the key does not already have one
  const ttl = await redisClient.ttl(key);

  if (ttl === -1) {
    await redisClient.expire(
      key,
      getTokenWindowSeconds()
    );
  }

  return totalTokenUsed;
};
