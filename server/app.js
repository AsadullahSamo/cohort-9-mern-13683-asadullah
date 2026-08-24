const mongoose = require("mongoose");
const express = require("express");
const pinoHttp = require("pino-http");
const cookieParser = require("cookie-parser");
const cors = require("cors");


const logger = require("./logger");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/health/db", async (req, res) => {
  const state = mongoose.connection.readyState;
  if (state === 1) {
    res.status(200).json({ status: "ok" });
  } else {
    res.status(500).json({ status: "error", message: "not connected" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use(errorHandler);

app.use((err, req, res, next) => {
  // Handle Mongoose CastError
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  
  // Handle other errors
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
});

module.exports = app;