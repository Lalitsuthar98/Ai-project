// controller/userController.js

import user from "../model/userSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import {
  loginSchema,
  signupSchema,
} from "../validator/userValidator.js";

import msg from "../model/msgSchema.js";
import chat from "../model/chatSchema.js";
import { redisClient } from "../config/redis.js";


// CREATE JWT
const createToken = (id, email) => {
  if (!process.env.SECRET_KEY) {
    throw new Error("JWT secret key is missing");
  }

  return jwt.sign(
    {
      id: id.toString(),
      email,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );
};


// SIGNUP
const signup = async (req, res) => {
  try {
    const result = signupSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: result.error.issues[0].message,
      });
    }

    const {
      name,
      age,
      email,
      password,
    } = result.data;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await user.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const profile = await user.create({
      name: name.trim(),
      age,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Profile created successfully",
      profile: {
        id: profile._id,
        name: profile.name,
        age: profile.age,
        email: profile.email,
      },
    });

  } catch (error) {
    console.error("Signup error:", error);

    // Handle MongoDB duplicate email index
    if (error.code === 11000) {
      return res.status(409).json({
        message: "User email already exists",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// LOGIN
const login = async (req, res) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: result.error.issues[0].message,
      });
    }

    const {
      email,
      password,
    } = result.data;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await user.findOne({
      email: normalizedEmail,
    });

    if (!existingUser) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    console.log("LOGIN EMAIL:", normalizedEmail);
    console.log("USER FOUND:", !!existingUser);


    const isMatch = await bcrypt.compare(
      password,
      existingUser.password
    );

    console.log("PASSWORD MATCH:", isMatch);


    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = createToken(
      existingUser._id,
      existingUser.email
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "User logged in successfully",
      data: {
        id: existingUser._id,
        name: existingUser.name,
        age: existingUser.age,
        email: existingUser.email,
        usage: existingUser.usage,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// LOGOUT
const logout = async (req, res) => {
  try {
    const token = req.token;
    const payload = req.tokenpayload;

    if (token && payload?.exp) {
      const currentTime = Math.floor(Date.now() / 1000);

      const remainingTime = payload.exp - currentTime;

      if (remainingTime > 0) {
        await redisClient.set(
          `blocklist:${token}`,
          "blocked",
          {
            EX: remainingTime,
          }
        );
      }
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "User logged out successfully",
    });

  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// PROFILE
const profile = async (req, res) => {
  try {
    return res.status(200).json({
      id: req.userdata._id,
      name: req.userdata.name,
      age: req.userdata.age,
      email: req.userdata.email,
      usage: req.userdata.usage,
    });

  } catch (error) {
    console.error("Profile error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// DELETE ACCOUNT
const deleteAccount = async (req, res) => {
  try {
    const userId = req.userdata._id;

    await msg.deleteMany({
      userId,
    });

    await chat.deleteMany({
      userId,
    });

    await user.deleteOne({
      _id: userId,
    });

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "Account deleted successfully",
    });

  } catch (error) {
    console.error("Delete account error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export {
  login,
  logout,
  signup,
  profile,
  deleteAccount,
};