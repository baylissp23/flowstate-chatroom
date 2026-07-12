import type { RoomState } from "../../../shared/types.js";
import { forEachRoom, setRoom } from "./roomStore.js";
import type { Server } from "socket.io";

export async function tickEach(io: Server): Promise<void> {
  await forEachRoom(async (timer, roomCode) => {
    if (timer.isPaused) {
      return;
    }

    if (timer.phase === "focus") {
      timer.current -= 1;
    } else {
      timer.breakCurrent -= 1;
    }

    io.to(roomCode).emit("timer-tick", timer);

    const newPhaseRoom = attemptPhaseChange(timer);
    const roomToSave = newPhaseRoom || timer;

    await setRoom(
      roomCode,
      roomToSave.current,
      roomToSave.max,
      roomToSave.roomMembers,
      roomToSave.assignedDisplayName,
      roomToSave.breakCurrent,
      roomToSave.breakMax,
      roomToSave.phase,
      roomToSave.isPaused,
    );
  });
}

export function attemptPhaseChange(room: RoomState): RoomState | undefined {
  let updatedRoom: RoomState;
  if (room.phase === "focus" && room.current <= 0) {
    updatedRoom = {
      ...room,
      current: 1500,
      phase: "break"
    };
  } else if (room.phase === "break" && room.breakCurrent <= 0) {
    updatedRoom = {
      ...room,
      breakCurrent: 300,
      phase: "focus"
    };
  } else {
    return;
  }

  return updatedRoom;
}