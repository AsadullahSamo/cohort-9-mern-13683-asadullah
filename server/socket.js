let io = null;

function initSocket(ioInstance) {
  io = ioInstance;
}

function emitToUser(userId, event, payload) {
  if (io) {
    io.to(userId.toString()).emit(event, payload);
  }
}

module.exports = { initSocket, emitToUser };