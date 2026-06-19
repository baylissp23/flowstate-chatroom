import type { Server, Socket } from "socket.io";
import type { AdminPromoteResult, RoomMember } from "../../../shared/types.js";
import { getRoom } from "./roomStore.js";
import { setClientPermission, setRoomMemberPermission } from "./roomService.js";

export async function tryAdminPromote(sourceSocket : Socket, targetClientId : string, roomCode : string, member : RoomMember, io : Server) : Promise<AdminPromoteResult | undefined> {
  if (!checkAllowedToPromote(sourceSocket)) {
    return;
  }

  const newAdmin = checkNewAdminCanPromote(roomCode, member);

  if (!newAdmin) {
    return;
  }

  setRoomMemberPermission(roomCode, targetClientId, "admin");
  await setClientPermission(roomCode, targetClientId, "admin", io);

  setRoomMemberPermission(roomCode, sourceSocket.data.clientId, "member");
  sourceSocket.data.permission = "member";

  const updatedRoom = getRoom(roomCode);
  if (!updatedRoom) {
    return { success: false };
  }

  return {
    success: true,
    updatedRoomMembers: updatedRoom.roomMembers
  };
}

function checkAllowedToPromote(socket : Socket) : boolean {
  if (socket.data.permission === "admin") {
    return true;
  }
  return false;
}

function checkNewAdminCanPromote(roomCode : string, member : RoomMember) : boolean {
  const room = getRoom(roomCode);

  if (!room) {
    return false;
  }

  const roomMembers = room.roomMembers;

  // check new admin is actually in the room
  function roomMemberFilter(mem : RoomMember) {
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