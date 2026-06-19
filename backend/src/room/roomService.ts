import { getRoom, deleteRoom, setRoom } from "./roomStore.js";
import type { RoomState, RoomMember, JoinRoomPayload, Rejoin, DuplicateName } from "../../../shared/types.js";
import type { Socket, Server } from "socket.io";
import { getUniqueDisplayName } from "./displayName.js";

const DISCONNECT_GRACE_MS = 3000;
const pendingDisconnects = new Map<string, ReturnType<typeof setTimeout>>()

function getDisconnectKey(roomCode : string, clientId: string) : string {
  return `${roomCode}:${clientId}`
}

function cancelPendingDisconnect(roomCode : string, clientId : string) {
  const key = getDisconnectKey(roomCode, clientId);
  const timeout = pendingDisconnects.get(key);

  if (timeout) {
    clearTimeout(timeout);
    pendingDisconnects.delete(key);
  }
}


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
        roomMembers: [{ clientId: clientId, displayName: displayName, permission: "admin" }],
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

export function rejoinRoomPath(roomData : RoomState, roomCode: string, clientId : string) : Rejoin | undefined {
  const existingMemberIndex = getMemberIndex(roomData.roomMembers, clientId);

  if (existingMemberIndex !== -1) {
    cancelPendingDisconnect(roomCode, clientId);

    const existingMember = roomData.roomMembers[existingMemberIndex];
    const rejoinedRoomState: RoomState = {
      ...roomData,
      assignedDisplayName: existingMember!.displayName,
    };
    
    return {
      roomState: rejoinedRoomState,
      displayName: existingMember?.displayName,
      permission: existingMember?.permission,
    }
  }
  return;
}

export function duplicateNamePath(roomData : RoomState, clientId : string, roomCode : string, displayName : string) : DuplicateName {
  const assignedDisplayName = getUniqueDisplayName(roomData.roomMembers, displayName);
  const updatedRoomMembers : RoomMember[] = [
    ...roomData.roomMembers,
    { clientId: clientId, displayName: assignedDisplayName, permission: "member" },
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

  const key = getDisconnectKey(roomCode, clientId);
  cancelPendingDisconnect(roomCode, clientId);

  const timeout = setTimeout(() => {
    pendingDisconnects.delete(key);
    removeAndBroadcast(roomCode, clientId, socket, io);
  }, DISCONNECT_GRACE_MS);

  pendingDisconnects.set(key, timeout);

}

export function leaveRoom(leaveInfo : JoinRoomPayload, socket : Socket, io : Server) {
  cancelPendingDisconnect(leaveInfo.roomCode, leaveInfo.clientId);
  removeAndBroadcast(leaveInfo.roomCode, leaveInfo.clientId, socket, io);
}