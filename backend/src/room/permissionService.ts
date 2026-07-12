import type { Server, Socket } from "socket.io";
import type { AdminPromoteResult, Permission, RoomMember } from "../../../shared/types.js";
import { deleteRoom, getRoom, setRoom } from "./roomStore.js";
import { setClientPermission, setRoomMemberPermission } from "./roomService.js";

export async function tryAdminPromote(sourceSocket: Socket, targetClientId: string, roomCode: string, member: RoomMember, io: Server): Promise<AdminPromoteResult | undefined> {
  if (!checkAllowedToPromote(sourceSocket)) {
    return;
  }

  const newAdmin = await checkNewAdminCanPromote(roomCode, member);

  if (!newAdmin) {
    return;
  }

  await setRoomMemberPermission(roomCode, targetClientId, "admin");
  await setClientPermission(roomCode, targetClientId, "admin", io);

  await setRoomMemberPermission(roomCode, sourceSocket.data.clientId, "member");
  sourceSocket.data.permission = "member";

  const updatedRoom = await getRoom(roomCode);
  if (!updatedRoom) {
    return { success: false };
  }

  return {
    success: true,
    updatedRoomMembers: updatedRoom.roomMembers
  };
}

function checkAllowedToPromote(socket: Socket): boolean {
  if (socket.data.permission === "admin") {
    return true;
  }
  return false;
}

async function checkNewAdminCanPromote(roomCode: string, member: RoomMember): Promise<boolean> {
  const room = await getRoom(roomCode);

  if (!room) {
    return false;
  }

  const roomMembers = room.roomMembers;

  // check new admin is actually in the room
  function roomMemberFilter(mem: RoomMember) {
    return mem.clientId === member.clientId;
  }

  const memberToPromote = roomMembers.find(roomMemberFilter);

  if (!memberToPromote) {
    return false;
  }

  // check new admin isn't already an admin
  if (memberToPromote.permission === "member") {
    return true;
  } else {
    return false;
  }
}

export function canPauseTimer(socketPermission: Permission): boolean {
  if (socketPermission === "admin") {
    return true;
  }
  return false;
}

export async function pauseTimer(roomCode: string): Promise<boolean | "fail"> {
  const room = await getRoom(roomCode);

  if (!room) {
    return "fail";
  }

  if (room.isPaused === true) {
    await setRoom(
      roomCode,
      room.current,
      room.max,
      room.roomMembers,
      room.assignedDisplayName,
      room.breakCurrent,
      room.breakMax,
      room.phase,
      false, // set isPaused to false in room state
    );
    return false;
  }

  await setRoom(
    roomCode,
    room.current,
    room.max,
    room.roomMembers,
    room.assignedDisplayName,
    room.breakCurrent,
    room.breakMax,
    room.phase,
    true, // set isPaused to true in room state
  );
  return true;
}

export function canEndRoom(socketPermission: string): boolean {
  if (socketPermission === "admin") {
    return true;
  }
  return false;
}

export async function endRoom(roomCode: string) {
  const room = await getRoom(roomCode);

  if (!room) {
    return "fail";
  }

  await deleteRoom(roomCode);
}