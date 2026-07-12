import type { RoomState, RoomMember, Phase } from "../../../shared/types.js";
import { pubClient } from "../redisClient.js";

const getRedisKey = (roomCode: string) => `room:${roomCode}:meta`;
const ACTIVE_ROOMS_KEY = "active_rooms";

export async function getRoom(roomCode: string): Promise<RoomState | undefined> {
  const key = getRedisKey(roomCode);
  const data = await pubClient.hGetAll(key);

  if (!data || Object.keys(data).length === 0) {
    return;
  }

  return {
    current: Number(data.current),
    max: Number(data.max),
    roomMembers: JSON.parse(data.roomMembers!),
    assignedDisplayName: data.assignedDisplayName!,
    breakCurrent: Number(data.breakCurrent),
    breakMax: Number(data.breakMax),
    phase: data.phase as Phase,
    isPaused: data.isPaused === "true",
    startTime: Number(data.startTime)
  }
}

export async function setRoom(
  roomCode: string,
  currentTimer: number,
  maxTimer: number,
  roomMembers: RoomMember[],
  assignedDisplayName: string,
  breakCurrent: number,
  breakMax: number,
  phase: Phase,
  isPaused: boolean,
  startTime: number
): Promise<void> {
  const key = getRedisKey(roomCode);

  await Promise.all([
    pubClient.hSet(key, {
      current: String(currentTimer),
      max: String(maxTimer),
      roomMembers: JSON.stringify(roomMembers),
      assignedDisplayName: assignedDisplayName,
      breakCurrent: String(breakCurrent),
      breakMax: String(breakMax),
      phase: phase,
      isPaused: String(isPaused),
      startTime: String(startTime)
    }),
    pubClient.sAdd(ACTIVE_ROOMS_KEY, roomCode)
  ])
}

export async function deleteRoom(roomCode: string): Promise<void> {
  const key = getRedisKey(roomCode);

  await Promise.all([
    pubClient.del(key),
    pubClient.sRem(ACTIVE_ROOMS_KEY, roomCode)
  ])
}

export async function forEachRoom(callback: (room: RoomState, roomCode: string) => Promise<void> | void): Promise<void> {
  const roomCodes = await pubClient.sMembers(ACTIVE_ROOMS_KEY);

  for (const roomCode of roomCodes) {
    const room = await getRoom(roomCode);
    if (room) {
      await callback(room, roomCode);
    }
  }
}