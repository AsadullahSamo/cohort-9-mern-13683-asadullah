import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./src/api/apiConfig";

let socket: Socket | null = null;

export function connectSocket(token: string) {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function getSocket() {
  return socket;
}