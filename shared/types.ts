export interface RoomState {
  current: number;
  max: number;
  roomMembers: string[];
  assignedDisplayName: string;
}

export interface JoinRoomPayload {
    displayName: string;
    roomCode: string;
}