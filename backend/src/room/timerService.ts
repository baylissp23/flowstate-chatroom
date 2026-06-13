import type { RoomState } from "../../../shared/types.js";
import { deleteRoom, forEachRoom } from "./roomStore.js";
import type { Server } from "socket.io";

export function tickEach(io : Server) : void {
  forEachRoom((timer, roomCode) => {
    if (timer.current !== 0) {
      timer.current -= 1;
      io.to(roomCode).emit("timer-tick", timer);
    } else {
      io.to(roomCode).emit("room-closed", "Time is up!");
      deleteRoom(roomCode);
    }
  });
}