const mongoose = require("mongoose");

/**
 * @returns {Promise<typeof mongoose>}
 */
async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  try {
    return await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    const context = { uri: process.env.MONGODB_URI, nodeEnv: process.env.NODE_ENV };
    error.context = context;
    throw error;
  }
}

module.exports = connectDB;