import type { RoomState, RoomMember } from "../../../shared/types.js";

let roomState: Map<string, RoomState> = new Map();

export function getRoom(roomCode : string) : RoomState | undefined {
  const state = roomState.get(roomCode);
  if (!state) {
    return undefined;
  }
  return state;
}

export function setRoom(
  roomCode : string, 
  currentTimer : number, 
  maxTimer : number, 
  roomMembers : RoomMember[], 
  assignedDisplayName : string
) : void {
  roomState.set(roomCode,
    {
      current: currentTimer,
      max: maxTimer,
      roomMembers: roomMembers,
      assignedDisplayName: assignedDisplayName,
    }
  ) 
}

export function deleteRoom(roomCode : string) : void {
  roomState.delete(roomCode);
}

export function forEachRoom(callback: (room: RoomState, roomCode: string) => void): void {
  roomState.forEach((room, roomCode) => {
    callback(room, roomCode);
  });
}