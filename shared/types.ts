export interface RoomMember {
  clientId : string;
  displayName : string;
}

export type Phase =
  | "focus"
  | "break"

export interface RoomState {
  current : number;
  max : number;
  roomMembers : RoomMember[];
  assignedDisplayName : string;
  breakCurrent : number;
  breakMax : number;
  phase: Phase;
}

export interface JoinRoomPayload {
  displayName : string;
  roomCode : string;
  clientId : string;
}

export interface Rejoin {
  roomState: RoomState;
  displayName: string | undefined;
}

export interface DuplicateName {
  assignedDisplayName: string;
  updatedRoomMembers: RoomMember[];
  updatedRoomState: RoomState;
}

export interface ChatMessage {
  id : number;
  time : string | undefined;
  text : string;
  sender : string | undefined;
}

export interface MessagePayload {
  text : string;
}
