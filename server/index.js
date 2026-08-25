require("dotenv").config();

if (!process.env.CLIENT_URL) {
  throw new Error("CLIENT_URL must be configured");
}

const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./db");
const logger = require("./logger");
const { initSocket } = require("./socket");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Not authorized"));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    socket.userId = payload.sub;
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  socket.join(socket.userId);
});

initSocket(io);

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error({ err }, "Failed to connect to MongoDB");
    process.exit(1);
  });