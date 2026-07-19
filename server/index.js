require("dotenv").config();
const mongoose = require("mongoose")
const connectDB = require("./db")
const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/health/db", async (req, res) => {
  const state = mongoose.connection.readyState
  if (state === 1) {
    res.status(200).json({ status: "ok" });
  } else {
    res.status(500).json({ status: "error", message: "not connected" });
  }
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB", err.message)
    process.exit(1)
  })
