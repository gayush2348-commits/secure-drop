import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import RefreshToken from "../models/RefreshToken.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

// Debug helper: elapsed time only; never logs passwords or tokens.
const logTiming = (label, startedAt) => {
  console.log(`[TIMING] ${label}: ${Date.now() - startedAt}ms`);
};

export const signup = async (req, res, next) => {
  const requestStarted = Date.now();

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let started = Date.now();
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });
    logTiming("signup: existing user lookup", started);

    if (existingUser) {
      logTiming("signup: total", requestStarted);

      return res.status(409).json({
        message: "User already exists",
      });
    }

    started = Date.now();
    const hashedPassword = await bcrypt.hash(password, 12);
    logTiming("signup: password hashing", started);

    started = Date.now();
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: true,
    });
    logTiming("signup: user creation", started);

    logTiming("signup: total", requestStarted);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logTiming("signup: error/total", requestStarted);
    next(error);
  }
};

export const login = async (req, res, next) => {
  const requestStarted = Date.now();

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let started = Date.now();
    const user = await User.findOne({
      email: normalizedEmail,
    });
    logTiming("login: user lookup", started);

    if (!user) {
      logTiming("login: total", requestStarted);

      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    started = Date.now();
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    logTiming("login: password comparison", started);

    if (!isPasswordCorrect) {
      logTiming("login: total", requestStarted);

      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Email verification temporarily disabled.
    started = Date.now();
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const decoded = jwt.decode(refreshToken);
    logTiming("login: token generation", started);

    started = Date.now();
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(decoded.exp * 1000),
    });
    logTiming("login: refresh token save", started);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logTiming("login: total", requestStarted);

    return res.status(200).json({
      message: "Login Successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logTiming("login: error/total", requestStarted);
    next(error);
  }
};

export const refreshAccessToken = async (req, res) => {
  const requestStarted = Date.now();
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    logTiming("refresh: missing cookie/total", requestStarted);

    return res.status(401).json({
      message: "Refresh token missing",
    });
  }

  try {
    let started = Date.now();

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    logTiming("refresh: jwt verify", started);

    started = Date.now();

    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      user: decoded.userId,
    });

    logTiming("refresh: token lookup", started);

    if (!storedToken) {
      logTiming("refresh: total", requestStarted);

      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    if (storedToken.expiresAt < new Date()) {
      started = Date.now();

      await RefreshToken.deleteOne({
        _id: storedToken._id,
      });

      logTiming("refresh: expired token delete", started);
      logTiming("refresh: total", requestStarted);

      return res.status(401).json({
        message: "Refresh token expired",
      });
    }

    started = Date.now();

    const user = await User.findById(decoded.userId);

    logTiming("refresh: user lookup", started);

    if (!user) {
      logTiming("refresh: total", requestStarted);

      return res.status(401).json({
        message: "User not found",
      });
    }

    started = Date.now();

    const newAccessToken = generateAccessToken(user);

    logTiming("refresh: access token generation", started);
    logTiming("refresh: total", requestStarted);

    return res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    logTiming("refresh: error/total", requestStarted);

    return res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await RefreshToken.deleteOne({
        token: refreshToken,
      });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    await RefreshToken.deleteMany({
      user: req.user.userId,
    });

    res.clearCookie("refreshToken");

    return res.status(200).json({
      message: "Logged out from all devices",
    });
  } catch (error) {
    next(error);
  }
};

// Email verification is no longer required for signup.
export const verifyEmail = async (req, res) => {
  return res.status(410).json({
    message: "Email verification is currently disabled.",
  });
};

// Password reset is temporarily disabled because email delivery
// is unavailable. Do not generate reset tokens without a delivery path.
export const forgotPassword = async (req, res) => {
  return res.status(503).json({
    message:
      "Password reset is temporarily unavailable. Please try again later.",
  });
};

// Disable the reset endpoint too, so an old or guessed token
// cannot be used while the feature is unavailable.
export const resetPassword = async (req, res) => {
  return res.status(503).json({
    message:
      "Password reset is temporarily unavailable. Please try again later.",
  });
};
