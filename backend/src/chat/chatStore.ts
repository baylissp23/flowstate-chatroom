import type { ChatMessage } from "../../../shared/types.js";
import { pubClient } from "../redisClient.js";

const getRedisKey = (roomCode: string) => `room:${roomCode}:messages`;

export async function getMessage(id: number, roomCode: string): Promise<ChatMessage | undefined> {
  const history = await getChatHistory(roomCode);
  if (!history) {
    return;
  }

  return history.find((msg) => msg.id === id);
}

export async function addMessage(time: Date, text: string, sender: string, roomCode: string): Promise<ChatMessage> {
  const key = getRedisKey(roomCode);
  const formattedTime = time.toTimeString();

  const id = await pubClient.lLen(key);

  const message: ChatMessage = {
    id: id,
    time: formattedTime,
    text: text,
    sender: sender
  }

  await pubClient.rPush(key, JSON.stringify(message));
  return message;
}

export async function getChatHistory(roomCode: string): Promise<ChatMessage[] | undefined> {
  const key = getRedisKey(roomCode);

  const exists = await pubClient.exists(key);
  if (exists === 0) {
    return;
  }

  const rawMessages = await pubClient.lRange(key, 0, -1);
  return rawMessages.map((msg) => JSON.parse(msg));
}

export async function deleteChatHistory(roomCode: string): Promise<void> {
  const key = getRedisKey(roomCode);
  await pubClient.del(key);
}