const jwt = require("jsonwebtoken");

const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";

function signAccessToken(userId) {
  return jwt.sign({sub: userId}, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRY,
  });
}

function signRefreshToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY,
  });
}

module.exports = { signAccessToken, signRefreshToken };