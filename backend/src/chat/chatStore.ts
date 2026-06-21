import type { ChatMessage } from "../../../shared/types.js";

let chatHistory : Map<string, ChatMessage[]> = new Map();

export function getMessage(id : number, roomCode : string) : ChatMessage | undefined {
  const chatRoom = chatHistory.get(roomCode);
  if (!chatRoom) {
    return;
  }

  if (chatRoom.length === 0) {
    return;
  }

  for (let i = 0; i < chatRoom.length; i++) {
    const currentMessage = chatRoom[i]!
    if (currentMessage.id === id) {
      return currentMessage
    }
  }

  return;
}

export function addMessage(time : Date, text : string, sender: string, roomCode : string) : ChatMessage {
  const formattedTime = time.toTimeString();
  let chatRoom = chatHistory.get(roomCode);

  if (!chatRoom) {
    chatRoom = [];
  }

  const id = chatRoom.length; // based on ChatMessage array chronological order

  const message = {
    id: id,
    time: formattedTime,
    text: text,
    sender: sender
  }

  chatRoom.push(message);

  chatHistory.set(roomCode, chatRoom);
  return message;
}

export function getChatHistory(roomCode : string) : ChatMessage[] | undefined {
  const chatRoom = chatHistory.get(roomCode);
  if (!chatRoom) {
    return;
  }
  return chatRoom;
}

export function deleteChatHistory(roomCode : string) {
  const chatRoom = chatHistory.get(roomCode);

  if (!chatRoom) {
    return;
  }

  chatHistory.delete(roomCode);
}