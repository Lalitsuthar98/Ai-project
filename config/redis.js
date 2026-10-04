// config/redis.js

import { createClient } from "redis";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is missing in .env");
}

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (error) => {
  console.error("Redis error:", error.message);
});

redisClient.on("connect", () => {
  console.log("Redis connecting...");
});

redisClient.on("ready", () => {
  console.log("Redis client is ready");
});

redisClient.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

redisClient.on("end", () => {
  console.log("Redis connection closed");
});

const connectRedis = async () => {
  if (redisClient.isOpen) {
    console.log("Redis is already connected");
    return;
  }

  await redisClient.connect();

  console.log("Redis connected successfully");
};

export {
  redisClient,
  connectRedis,
};