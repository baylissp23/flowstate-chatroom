import type { ChatMessage, MessagePayload } from "../../../shared/types.js";
import { getRoom } from "../room/roomStore.js";
import { addMessage } from "./chatStore.js";

export async function handleChatMessage(message: MessagePayload, roomCode: string, sender: string): Promise<ChatMessage | undefined> {
  const exists = await validateRoomExists(roomCode);
  if (!exists) {
    return;
  } else if (!validateMessageText(message)) {
    return;
  } else {
    return await storeChatMessage(roomCode, message, sender);
  }
}

async function validateRoomExists(roomCode: string): Promise<boolean> {
  const room = await getRoom(roomCode);
  if (!room) {
    return false;
  }
  return true;
}

function validateMessageText(message: MessagePayload): boolean {
  const messageText = message.text;

  if (messageText.trim().length === 0) return false;
  if (messageText.length > 2000) return false;

  return true;
}

async function storeChatMessage(roomCode: string, message: MessagePayload, sender: string): Promise<ChatMessage | undefined> {
  const now = new Date();
  const newMessage = await addMessage(now, message.text, sender, roomCode);

  if (!newMessage) {
    return;
  }
  return newMessage;
}