import { getRoom, deleteRoom, setRoom } from "./roomStore.js";
import type { RoomState, RoomMember, JoinRoomPayload, Rejoin, DuplicateName, Permission } from "../../../shared/types.js";
import type { Socket, Server } from "socket.io";
import { getUniqueDisplayName } from "./displayName.js";
import { deleteChatHistory } from "../chat/chatStore.js";

const DISCONNECT_GRACE_MS = 3000;
const pendingDisconnects = new Map<string, ReturnType<typeof setTimeout>>()

function getDisconnectKey(roomCode: string, clientId: string): string {
  return `${roomCode}:${clientId}`
}

function cancelPendingDisconnect(roomCode: string, clientId: string) {
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

export async function removeAndBroadcast(roomCode: string, clientId: string, socket: Socket, io: Server) {
  const roomData = await getRoom(roomCode);
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
    await deleteRoom(roomCode);
    await deleteChatHistory(roomCode);
    return;
  }

  const updatedRoomState: RoomState = {
    ...roomData,
    roomMembers: updatedRoomMembers,
    assignedDisplayName: roomData.assignedDisplayName,
  };

  await setRoom(
    roomCode,
    updatedRoomState.current,
    updatedRoomState.max,
    updatedRoomState.roomMembers,
    updatedRoomState.assignedDisplayName,
    updatedRoomState.breakCurrent,
    updatedRoomState.breakMax,
    updatedRoomState.phase,
    updatedRoomState.isPaused,
    roomData.startTime
  );
  io.to(roomCode).emit("member-left", updatedRoomMembers);
}

export async function emptyRoomPath(joinInfo: JoinRoomPayload, socket: Socket): Promise<RoomState | undefined> {
  const { displayName, roomCode, clientId } = joinInfo;

  if (socket.rooms.has(roomCode)) {
    return;
  }

  const roomData = await getRoom(roomCode);

  if (!roomData) {
    const initialRoomState: RoomState = {
      current: 1500,
      max: 1500,
      roomMembers: [{ clientId: clientId, displayName: displayName, permission: "admin", roomCode: roomCode }],
      assignedDisplayName: displayName,
      breakCurrent: 300,
      breakMax: 300,
      phase: "focus",
      isPaused: true,
      startTime: 0
    };

    await setRoom(
      roomCode,
      initialRoomState.current,
      initialRoomState.max,
      initialRoomState.roomMembers,
      initialRoomState.assignedDisplayName,
      initialRoomState.breakCurrent,
      initialRoomState.breakMax,
      initialRoomState.phase,
      initialRoomState.isPaused,
      initialRoomState.startTime
    );
    return initialRoomState;
  }
}

export function rejoinRoomPath(roomData: RoomState, roomCode: string, clientId: string): Rejoin | undefined {
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

export async function duplicateNamePath(roomData: RoomState, clientId: string, roomCode: string, displayName: string): Promise<DuplicateName> {
  const assignedDisplayName = getUniqueDisplayName(roomData.roomMembers, displayName);
  const updatedRoomMembers: RoomMember[] = [
    ...roomData.roomMembers,
    { clientId: clientId, displayName: assignedDisplayName, permission: "member", roomCode: roomCode },
  ];

  const updatedRoomState: RoomState = {
    ...roomData,
    roomMembers: updatedRoomMembers,
    assignedDisplayName,
  };

  await setRoom(
    roomCode,
    updatedRoomState.current,
    updatedRoomState.max,
    updatedRoomState.roomMembers,
    updatedRoomState.assignedDisplayName,
    updatedRoomState.breakCurrent,
    updatedRoomState.breakMax,
    updatedRoomState.phase,
    updatedRoomState.isPaused,
    roomData.startTime
  );

  return {
    assignedDisplayName: assignedDisplayName,
    updatedRoomMembers: updatedRoomMembers,
    updatedRoomState: updatedRoomState,
  }
}

export function disconnect(roomCode: string, clientId: string, socket: Socket, io: Server): undefined | void {
  if (!roomCode || !clientId) {
    return;
  }

  const key = getDisconnectKey(roomCode, clientId);
  cancelPendingDisconnect(roomCode, clientId);

  const timeout = setTimeout(async () => {
    pendingDisconnects.delete(key);

    const activeSockets = await io.in(roomCode).fetchSockets();
    const hasRejoined = activeSockets.some((s) => s.data.clientId === clientId && s.id !== socket.id);
    if (hasRejoined) {
      return;
    }

    await removeAndBroadcast(roomCode, clientId, socket, io);
  }, DISCONNECT_GRACE_MS);

  pendingDisconnects.set(key, timeout);
}

export async function leaveRoom(leaveInfo: JoinRoomPayload, socket: Socket, io: Server) {
  cancelPendingDisconnect(leaveInfo.roomCode, leaveInfo.clientId);
  await removeAndBroadcast(leaveInfo.roomCode, leaveInfo.clientId, socket, io);
}

export async function setClientPermission(
  roomCode: string,
  clientId: string,
  permission: Permission,
  io: Server,
) {
  const roomSockets = await io.in(roomCode).fetchSockets();
  const targetSocket = roomSockets.find((socket) => socket.data.clientId === clientId);

  if (!targetSocket) {
    return;
  }

  targetSocket.data.permission = permission;
}

export async function setRoomMemberPermission(roomCode: string, clientId: string, permission: Permission): Promise<boolean> {
  const room = await getRoom(roomCode);

  if (!room) {
    return false;
  }

  const updatedRoomMembers = room.roomMembers.map((member) =>
    member.clientId === clientId
      ? { ...member, permission }
      : member,
  );

  await setRoom(
    roomCode,
    room.current,
    room.max,
    updatedRoomMembers,
    room.assignedDisplayName,
    room.breakCurrent,
    room.breakMax,
    room.phase,
    room.isPaused,
    room.startTime
  );

  return true;
}

