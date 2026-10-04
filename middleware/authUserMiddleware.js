// middleware/authUserMiddleware.js

import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.js";

const authuserMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Authentication token is missing",
      });
    }

    if (!process.env.SECRET_KEY) {
      console.error("SECRET_KEY is missing");

      return res.status(500).json({
        message: "Authentication configuration error",
      });
    }

    const payload = jwt.verify(
      token,
      process.env.SECRET_KEY
    );

    const blockedToken = await redisClient.get(
      `blocklist:${token}`
    );

    if (blockedToken) {
      return res.status(401).json({
        message: "Session expired. Please login again",
      });
    }

    if (!payload?.id) {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    req.userId = payload.id;
    req.token = token;
    req.tokenpayload = payload;

    next();

  } catch (error) {
    console.error("Authentication error:", error.message);

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export default authuserMiddleware;