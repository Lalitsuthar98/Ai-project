// middleware/tokenUsageMiddleware.js

import {
  getCurrentTokenUsage,
} from "../utils/redisTokenUsage.js";

const tokenUsageMiddleware = async (req, res, next) => {
  try {
    const tokenLimit = Number(process.env.TOKEN_LIMIT);

    if (!Number.isInteger(tokenLimit) || tokenLimit <= 0) {
      console.error("Invalid TOKEN_LIMIT in .env");

      return res.status(500).json({
        message: "Token limit configuration error",
      });
    }

    const { key, tokenUsed } = await getCurrentTokenUsage(
      req.userId
    );

    if (tokenUsed >= tokenLimit) {
      return res.status(429).json({
        message:
          "Token limit reached. Please try again later.",
        tokenUsed,
        tokenLimit,
        retryAfter: await getRemainingTime(key),
      });
    }

    // Store information for the controller
    req.tokenUsageKey = key;
    req.tokenUsed = tokenUsed;
    req.tokenLimit = tokenLimit;

    next();
  } catch (error) {
    console.error("Token usage middleware error:", error);

    return res.status(500).json({
      message: "Unable to check token usage",
    });
  }
};

const getRemainingTime = async (key) => {
  // This function will be replaced with a shared utility later.
  const { redisClient } = await import("../config/redis.js");

  const ttl = await redisClient.ttl(key);

  return ttl > 0 ? ttl : 0;
};

export default tokenUsageMiddleware;
