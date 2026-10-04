// middleware/loadUserMiddleware.js

import mongoose from "mongoose";
import user from "../model/userSchema.js";

const loadUserMiddleware = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        message: "Invalid user ID",
      });
    }

    const existingUser = await user
      .findById(userId)
      .select("-password");

    if (!existingUser) {
      return res.status(404).json({
        message: "User doesn't exist",
      });
    }

    req.userdata = existingUser;

    return next();
  } catch (error) {
    console.error("Load user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export default loadUserMiddleware;