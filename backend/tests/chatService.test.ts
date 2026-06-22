import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { handleChatMessage } from "../src/chat/chatService.js";
import { addMessage, deleteChatHistory } from "../src/chat/chatStore.js";
import { setRoom } from "../src/room/roomStore.js";
import type { ChatMessage } from "../../shared/types.js";

const time = new Date();

describe("handleChatMessage", () => {
  afterEach(() => {
    deleteChatHistory("ABCD");
  })

  it("should return undefined when the specified room does not exist", () => {
    const result = handleChatMessage({ text: "Bogus Message" }, "FAKE_ROOM", "Bogus Sender")

    expect(result).toBeUndefined();
  });

  it("should return undefined when the room does exist but the message is just whitespace", () => {
    addMessage(time, "example message 1", "example sender 1", "ABCD");
    addMessage(time, "example message 2", "example sender 2", "ABCD");

    const result = handleChatMessage({ text: "        " }, "ABCD", "example sender 1");

    expect(result).toBeUndefined();
  });

  it("should return undefined when the room does exist but the message is more than 2000 characters", () => {
    addMessage(time, "example message 1", "example sender 1", "ABCD");
    addMessage(time, "example message 2", "example sender 2", "ABCD");

    const result = handleChatMessage({ text: "a".repeat(2001) }, "ABCD", "example sender 1");

    expect(result).toBeUndefined();
  });

  it("should return the ChatMessage being handled if validation of message passes", () => {
    setRoom("ABCD", 1500, 1500, [], "test", 300, 300, "focus", false);
    addMessage(time, "example message 1", "example sender 1", "ABCD");
    addMessage(time, "example message 2", "example sender 2", "ABCD");

    const resultUnformat = handleChatMessage({ text: "Hello World" }, "ABCD", "example sender 1");
    const expected = { id: 2, text: "Hello World", sender: "example sender 1" } as ChatMessage;

    const resultFormat = { id: resultUnformat!.id, text: resultUnformat!.text, sender: resultUnformat!.sender }

    expect(resultFormat).toEqual(expected);
  })
});