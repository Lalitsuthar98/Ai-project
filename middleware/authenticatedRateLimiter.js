// middleware/authenticatedRateLimiter.js

import { redisClient } from "../config/redis.js";

const authenticateRateLimiter = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const key = `rate-limiter:user:${userId}`;

    const requestCount = await redisClient.incr(key);

    if (requestCount === 1) {
      await redisClient.expire(key, 60);
    }

    if (requestCount > 20) {
      const remainingTime = await redisClient.ttl(key);

      return res.status(429).json({
        message: "Too many requests. Try again later.",
        retryAfter: Math.max(remainingTime, 0),
      });
    }

    return next();
  } catch (error) {
    console.error(
      "Authenticated rate limiter error:",
      error
    );

    return res.status(503).json({
      message: "Rate limiter service unavailable",
    });
  }
};

export default authenticateRateLimiter;