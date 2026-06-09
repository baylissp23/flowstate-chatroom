import { io } from "socket.io-client";

export const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Client connected to server with socket id:", socket.id);
});

socket.on("disconnect", () => {
    console.log("Client disconnected from server with socket id:", socket.id);
});