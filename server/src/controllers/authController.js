import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function createToken(userId) {
  return jwt.sign({}, process.env.JWT_SECRET, {
    subject: userId.toString(),
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function userResponse(user) {
  return { id: user.id, name: user.name, email: user.email };
}

export const register = asyncHandler(async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ message: "Provide a valid JSON object." });
  }
  const { name, email, password } = req.body;
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    return res.status(400).json({ message: "Provide a valid email address." });
  }
  if (name.trim().length < 2 || name.trim().length > 60) {
    return res.status(400).json({ message: "Name must be between 2 and 60 characters." });
  }
  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).json({ message: "Password must be at least 8 characters and no more than 72 bytes." });
  }

  const user = await User.create({ name: name.trim(), email: normalizedEmail, password });
  res.status(201).json({ token: createToken(user.id), user: userResponse(user) });
});

export const login = asyncHandler(async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ message: "Provide a valid JSON object." });
  }
  const { email, password } = req.body;
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Email and password are required." });
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    return res.status(401).json({ message: "Invalid email or password." });
  }
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.json({ token: createToken(user.id), user: userResponse(user) });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({ user: userResponse(req.user) });
});
