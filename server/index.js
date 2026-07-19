require("dotenv").config();
const mongoose = require("mongoose")
const express = require("express");
const pinoHttp = require("pino-http")

const connectDB = require("./db")
const logger = require("./logger")
const errorHandler = require("./middleware/errorHandler")

const app = express();
const PORT = process.env.PORT || 5000;

app.use(pinoHttp({ logger }))

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

app.use(errorHandler)

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("Failed to connect to MongoDB", err.message)
    process.exit(1)
  })
