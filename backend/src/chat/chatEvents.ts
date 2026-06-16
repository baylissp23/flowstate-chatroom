import type { Server } from "socket.io";
import type { ChatMessage } from "../../../shared/types.js";

export function broadcastMessage(io : Server, roomCode : string, message : ChatMessage) {
  io.to(roomCode).emit("new-message", message);
}