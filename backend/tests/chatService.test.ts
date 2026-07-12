import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { handleChatMessage } from "../src/chat/chatService.js";
import { addMessage, deleteChatHistory } from "../src/chat/chatStore.js";
import { setRoom } from "../src/room/roomStore.js";
import type { ChatMessage } from "../../shared/types.js";

const time = new Date();

describe("handleChatMessage", () => {
  beforeEach(async () => {
    await deleteChatHistory("SERVICE_ABCD");
  });

  afterEach(async () => {
    await deleteChatHistory("SERVICE_ABCD");
  });

  it("should return undefined when the specified room does not exist", async () => {
    const result = await handleChatMessage({ text: "Bogus Message" }, "SERVICE_FAKE_ROOM", "Bogus Sender");

    expect(result).toBeUndefined();
  });

  it("should return undefined when the room does exist but the message is just whitespace", async () => {
    await addMessage(time, "example message 1", "example sender 1", "SERVICE_ABCD");
    await addMessage(time, "example message 2", "example sender 2", "SERVICE_ABCD");

    const result = await handleChatMessage({ text: "        " }, "SERVICE_ABCD", "example sender 1");

    expect(result).toBeUndefined();
  });

  it("should return undefined when the room does exist but the message is more than 2000 characters", async () => {
    await addMessage(time, "example message 1", "example sender 1", "SERVICE_ABCD");
    await addMessage(time, "example message 2", "example sender 2", "SERVICE_ABCD");

    const result = await handleChatMessage({ text: "a".repeat(2001) }, "SERVICE_ABCD", "example sender 1");

    expect(result).toBeUndefined();
  });

  it("should return the ChatMessage being handled if validation of message passes", async () => {
    setRoom("SERVICE_ABCD", 1500, 1500, [], "test", 300, 300, "focus", false);
    await addMessage(time, "example message 1", "example sender 1", "SERVICE_ABCD");
    await addMessage(time, "example message 2", "example sender 2", "SERVICE_ABCD");

    const resultUnformat = await handleChatMessage({ text: "Hello World" }, "SERVICE_ABCD", "example sender 1");
    const expected = { id: 2, text: "Hello World", sender: "example sender 1" } as ChatMessage;

    const resultFormat = { id: resultUnformat!.id, text: resultUnformat!.text, sender: resultUnformat!.sender };

    expect(resultFormat).toEqual(expected);
  });
});