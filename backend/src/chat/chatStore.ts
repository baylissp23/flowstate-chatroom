import type { ChatMessage } from "../../../shared/types.js";

let chatHistory : Map<string, ChatMessage[]> = new Map();

export function getMessage(id : number, roomCode : string) : ChatMessage | undefined {
  const chatRoom = chatHistory.get(roomCode);
  if (!chatRoom) {
    return;
  }

  if (chatRoom.length === 0) {
    return {
      id: 99999, // id 99999 is No Chat Found error
      time: undefined,
      text: "No Chat Found",
      sender: undefined
    }
  }

  for (let i = 0; i < chatRoom.length; i++) {
    const currentMessage = chatRoom[i]!
    if (currentMessage.id === id) {
      return currentMessage
    }
  }

  return {
    id: 99999,
    time: undefined,
    text: "No Chat Found",
    sender: undefined
  }
}

export function addMessage(time : Date, text : string, sender: string, roomCode : string) : void {
  const formattedTime = time.toTimeString();
  const chatRoom = chatHistory.get(roomCode);

  if (!chatRoom) {
    return;
  }

  const id = chatRoom.length; // based on ChatMessage array chronological order

  chatRoom.push({
    id: id,
    time: formattedTime,
    text: text,
    sender: sender
  });

  chatHistory.set(roomCode, chatRoom);
}

export function getChatHistory(roomCode : string) : ChatMessage[] | undefined {
  const chatRoom = chatHistory.get(roomCode);
  if (!chatRoom) {
    return;
  }
  return chatRoom;
}