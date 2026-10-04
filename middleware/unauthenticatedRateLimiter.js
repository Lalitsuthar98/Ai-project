// middleware/unauthenticatedRateLimiter.js

import { redisClient } from "../config/redis.js";

const unauthenticatedRateLimiter = async (req, res, next) => {
  try {
    const ipAddress = req.ip;

    const key = `rate-limiter:ip:${ipAddress}`;

    const requestCount = await redisClient.incr(key);

    if (requestCount === 1) {
      await redisClient.expire(key, 60);
    }

    if (requestCount > 10) {
      const remainingTime = await redisClient.ttl(key);

      return res.status(429).json({
        message: "Too many requests. Try again later.",
        retryAfter: Math.max(remainingTime, 0),
      });
    }

    return next();
  } catch (error) {
    console.error(
      "Unauthenticated rate limiter error:",
      error
    );

    return res.status(503).json({
      message: "Rate limiter service unavailable",
    });
  }
};

export default unauthenticatedRateLimiter;
