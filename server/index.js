require("dotenv").config();
const mongoose = require("mongoose")
const express = require("express");
const pinoHttp = require("pino-http")
const cookieParser = require("cookie-parser")

const connectDB = require("./db")
const logger = require("./logger")
const errorHandler = require("./middleware/errorHandler")

const authRoutes = require("./routes/auth")
const notesRoutes = require("./routes/notes")

const app = express();
const PORT = process.env.PORT || 5000;

app.use(pinoHttp({ logger }))
app.use(express.json())
app.use(cookieParser())

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

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use(errorHandler)

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error({ err }, "Failed to connect to MongoDB")
    process.exit(1)
  })
