import { getRoom, deleteRoom, setRoom } from "./roomStore.js";
import type { RoomState, RoomMember, JoinRoomPayload, Rejoin, DuplicateName } from "../../../shared/types.js";
import type { Socket, Server } from "socket.io";
import { getUniqueDisplayName } from "./displayName.js";

function getMemberIndex(roomMembers: RoomMember[], clientId: string) {
  return roomMembers.findIndex((member) => member.clientId === clientId);
}

export function removeAndBroadcast(roomCode : string, clientId : string, socket : Socket, io : Server) {
  const roomData = getRoom(roomCode);
  if (!roomData) {
    return;
  }

  const memberIndex = getMemberIndex(roomData.roomMembers, clientId);
  if (memberIndex === -1) {
    socket.leave(roomCode);
    return;
  }

  const updatedRoomMembers = roomData.roomMembers.filter(
    (member) => member.clientId !== clientId,
  );

  socket.leave(roomCode);

  if (updatedRoomMembers.length === 0) {
    deleteRoom(roomCode);
    return;
  }

  const updatedRoomState: RoomState = {
    ...roomData,
    roomMembers: updatedRoomMembers,
    assignedDisplayName: roomData.assignedDisplayName,
  };

  setRoom(
    roomCode, 
    updatedRoomState.current, 
    updatedRoomState.max, 
    updatedRoomState.roomMembers, 
    updatedRoomState.assignedDisplayName,
    updatedRoomState.breakCurrent,
    updatedRoomState.breakMax,
    updatedRoomState.phase
  );
  io.to(roomCode).emit("member-left", updatedRoomMembers);
}

export function emptyRoomPath(joinInfo : JoinRoomPayload, socket : Socket) : RoomState | undefined {
    const { displayName, roomCode, clientId } = joinInfo;
    
    if (socket.rooms.has(roomCode)) {
        return undefined;
    }
    
    const roomData = getRoom(roomCode);
    
    if (!roomData) {
      const initialRoomState: RoomState = {
        current: 1500,
        max: 1500,
        roomMembers: [{ clientId, displayName }],
        assignedDisplayName: displayName,
        breakCurrent: 300,
        breakMax: 300,
        phase: "focus"
      };
    
      setRoom(
        roomCode, 
        initialRoomState.current, 
        initialRoomState.max, 
        initialRoomState.roomMembers, 
        initialRoomState.assignedDisplayName,
        initialRoomState.breakCurrent,
        initialRoomState.breakMax,
        initialRoomState.phase
      );
      return initialRoomState;
    }
}

export function rejoinRoomPath(roomData : RoomState, clientId : string) : Rejoin | undefined {
  const existingMemberIndex = getMemberIndex(roomData.roomMembers, clientId);

  if (existingMemberIndex !== -1) {
    const existingMember = roomData.roomMembers[existingMemberIndex];
    const rejoinedRoomState: RoomState = {
      ...roomData,
      assignedDisplayName: existingMember!.displayName,
    };
    
    return {
      roomState: rejoinedRoomState,
      displayName: existingMember?.displayName,
    }
  }
  return;
}

export function duplicateNamePath(roomData : RoomState, clientId : string, roomCode : string, displayName : string) : DuplicateName {
  const assignedDisplayName = getUniqueDisplayName(roomData.roomMembers, displayName);
  const updatedRoomMembers = [
    ...roomData.roomMembers,
    { clientId, displayName: assignedDisplayName },
  ];
    
  const updatedRoomState: RoomState = {
    ...roomData,
    roomMembers: updatedRoomMembers,
    assignedDisplayName,
  };
    
  setRoom(
    roomCode, 
    updatedRoomState.current, 
    updatedRoomState.max, 
    updatedRoomState.roomMembers, 
    updatedRoomState.assignedDisplayName, 
    updatedRoomState.breakCurrent, 
    updatedRoomState.breakMax, 
    updatedRoomState.phase
  );

  return {
    assignedDisplayName: assignedDisplayName,
    updatedRoomMembers: updatedRoomMembers,
    updatedRoomState: updatedRoomState,
  }
}

export function disconnect(roomCode : string, clientId : string, socket : Socket, io : Server) : undefined | void {
  if (!roomCode || !clientId) {
      return;
  }
  removeAndBroadcast(roomCode, clientId, socket, io);
}

export function leaveRoom(leaveInfo : JoinRoomPayload, socket : Socket, io : Server) {
  removeAndBroadcast(leaveInfo.roomCode, leaveInfo.clientId, socket, io);
}