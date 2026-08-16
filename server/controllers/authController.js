const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { signAccessToken, signRefreshToken } = require("../utils/tokens");

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
const SALT_ROUNDS = 12;

async function signup(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const user = await User.create({ email, password });

  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());
  user.refreshToken = await bcrypt.hash(refreshToken, SALT_ROUNDS);
  await user.save();

  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(201).json({ accessToken });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());
  user.refreshToken = await bcrypt.hash(refreshToken, SALT_ROUNDS);
  await user.save();

  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  res.json({ accessToken });
}

async function logout(req, res) {
  const token = req.cookies.refreshToken;

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(payload.sub).select("+refreshToken");

      if (user?.refreshToken && await bcrypt.compare(token, user.refreshToken)) {
        await User.updateOne(
          { _id: user._id, refreshToken: user.refreshToken },
          { $set: { refreshToken: null } },
        );
      }
    } catch {
      // Clear the client cookie without revoking any server-side session.
    }
  }

  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
  res.json({ message: "Logged out" });
}

async function refresh(req, res) {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "No refresh token" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }

  const user = await User.findById(payload.sub).select("+refreshToken");
  if (!user || !user.refreshToken) {
    return res.status(401).json({ error: "Invalid session" });
  }

  const matches = await bcrypt.compare(token, user.refreshToken);
  if (!matches) {
    return res.status(401).json({ error: "Invalid session" });
  }

  const accessToken = signAccessToken(user._id.toString());
  res.json({ accessToken });
}

module.exports = { signup, login, logout, refresh };