export interface RoomMember {
  clientId : string;
  displayName : string;
}

export interface RoomState {
  current : number;
  max : number;
  roomMembers : RoomMember[];
  assignedDisplayName : string;
}

export interface JoinRoomPayload {
    displayName : string;
    roomCode : string;
    clientId : string;
}