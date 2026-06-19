import type { RoomState } from "../../../shared/types.js";
import { deleteRoom, forEachRoom, getRoom, setRoom } from "./roomStore.js";
import type { Server } from "socket.io";

export function tickEach(io : Server) : void {
  forEachRoom((timer, roomCode) => {
    if (!timer.isPaused) {
      if (timer.phase === "focus") {
        timer.current -= 1;
        io.to(roomCode).emit("timer-tick", timer);
      } else {
        timer.breakCurrent -= 1;
        io.to(roomCode).emit("timer-tick", timer);
      }
    }
    

    const newPhaseRoom = attemptPhaseChange(roomCode);
    if (!newPhaseRoom) {
      return;
    }

    setRoom(
      roomCode,
      newPhaseRoom.current,
      newPhaseRoom.max,
      newPhaseRoom.roomMembers,
      newPhaseRoom.assignedDisplayName,
      newPhaseRoom.breakCurrent,
      newPhaseRoom.breakMax,
      newPhaseRoom.phase,
      newPhaseRoom.isPaused,
    )
  });
}

export function attemptPhaseChange(roomCode : string) {
  const room = getRoom(roomCode);
  if (!room) {
    return;
  }

  let updatedRoom : RoomState;
  if (room.phase === "focus" && room.current <= 0) {
    updatedRoom = {
      ...room,
      current: 1500,
      phase: "break"
    }
  } else if (room.phase === "break" && room.breakCurrent <= 0) {
    updatedRoom = {
      ...room,
      breakCurrent: 300,
      phase: "focus"
    }
  } else {
    return;
  }
  
  return updatedRoom;
}