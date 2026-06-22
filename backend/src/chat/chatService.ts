import type { ChatMessage, MessagePayload } from "../../../shared/types.js";
import { getRoom } from "../room/roomStore.js";
import { addMessage } from "./chatStore.js";

export function handleChatMessage(message : MessagePayload, roomCode : string, sender : string) : ChatMessage | undefined {
  if (!validateRoomExists(roomCode)) {
    return;
  } else if (!validateMessageText(message)) {
    return;
  } else {
    return storeChatMessage(roomCode, message, sender);
  }
}

function validateRoomExists(roomCode : string) : boolean {
  if (!getRoom(roomCode)) {
    return false;
  }
  return true;
}

function validateMessageText(message : MessagePayload) : boolean {
  const messageText = message.text;
  
  if (messageText.trim().length === 0) return false;
  if (messageText.length > 2000) return false;

  return true;
}

function storeChatMessage(roomCode : string, message : MessagePayload, sender : string) : ChatMessage | undefined {
  const now = new Date();
  const newMessage = addMessage(now, message.text, sender, roomCode);

  if (!newMessage) {
    return;
  }
  return newMessage;
}