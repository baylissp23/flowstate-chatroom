import type { ChatMessage } from "../../../shared/types.js";
import { getRoom } from "../room/roomStore.js";
import { addMessage } from "./chatStore.js";

export function handleChatMessage(message : ChatMessage, roomCode : string) : string | undefined {
  if (!validateRoomExists(roomCode)) {
    return;
  } else if (!validateMessageText(message)) {
    return;
  } else {
    storeChatMessage(roomCode, message);
    return "success"
  }
}

function validateRoomExists(roomCode : string) : boolean {
  if (!getRoom(roomCode)) {
    return false;
  }
  return true;
}

function validateChatUnlocked() {
    // implement when chat locks are finished
    return;
}

function validateMessageText(message : ChatMessage) : boolean {
  const messageText = message.text;
  
  if (messageText.trim().length === 0) return false;
  if (messageText.length > 2000) return false;

  return true;
}

function storeChatMessage(roomCode : string, message : ChatMessage) : void {
  const now = new Date();
  addMessage(now, message.text, message.sender!, roomCode);
}