import type { RoomState } from "../../../shared/types.js";
import { forEachRoom, setRoom } from "./roomStore.js";
import type { Server } from "socket.io";

export async function tickEach(io: Server): Promise<void> {
  await forEachRoom(async (room, roomCode) => {
    if (room.isPaused) {
      return;
    }

    const elapsed = Math.floor((Date.now() - room.startTime) / 1000);
    const remaining = room.phase === "focus" ? room.current - elapsed : room.breakCurrent - elapsed;

    if (remaining <= 0) {
      const nextPhase = room.phase === "focus" ? "break" : "focus";
      const nextCurrent = 1500;
      const nextBreakCurrent = 300;

      const updatedRoom: RoomState = {
        ...room,
        current: nextCurrent,
        breakCurrent: nextBreakCurrent,
        phase: nextPhase,
        startTime: Date.now()
      };

      await setRoom(
        roomCode,
        updatedRoom.current,
        updatedRoom.max,
        updatedRoom.roomMembers,
        updatedRoom.assignedDisplayName,
        updatedRoom.breakCurrent,
        updatedRoom.breakMax,
        updatedRoom.phase,
        updatedRoom.isPaused,
        updatedRoom.startTime
      );

      io.to(roomCode).emit("timer-tick", updatedRoom);
    }
  });
}