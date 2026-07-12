import { getMessage, addMessage, getChatHistory, deleteChatHistory } from "../src/chat/chatStore.js";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

const time = new Date();

describe("getMessage", () => {

  beforeEach(async () => {
    await deleteChatHistory("STORE_ABCD");
    await addMessage(time, "message example 1", "example sender 1", "STORE_ABCD");
  });

  afterEach(async () => {
    await deleteChatHistory("STORE_ABCD");
  });

  it("should return undefined if the chat room doesn't exist for the specified room code", async () => {
    const result = await getMessage(0, "STORE_EFGH");

    expect(result).toBeUndefined();
  });
  
  it("should return the message at the corresponding ID number and room code given if existing", async () => {
    const result = await getMessage(0, "STORE_ABCD");

    expect(result).toEqual({
      id: 0,
      time: time.toTimeString(),
      text: "message example 1",
      sender: "example sender 1",
    });
  });
});

describe("addMessage", () => {
  beforeEach(async () => {
    await deleteChatHistory("STORE_ABCD");
    await deleteChatHistory("STORE_ABCDEF");
  });

  afterEach(async () => {
    await deleteChatHistory("STORE_ABCD");
    await deleteChatHistory("STORE_ABCDEF");
  });

  it("should initialise room array if no corresponding chat room for room code and add the message", async () => {
    await addMessage(time, "example message 1", "example sender 1", "STORE_ABCD");

    const result = await getMessage(0, "STORE_ABCD");

    expect(result).toEqual({
      id: 0,
      time: time.toTimeString(),
      text: "example message 1",
      sender: "example sender 1",
    });
  });

  it("should return the message being added to the chat store", async () => {
    const result = await addMessage(time, "example message 1", "example sender 1", "STORE_ABCD");

    expect(result).toEqual({
      id: 0,
      time: time.toTimeString(),
      text: "example message 1",
      sender: "example sender 1",
    });
  });

  it("should be able to add multiple messages to multiple chat rooms", async () => {
    await addMessage(time, "example message 1", "example sender 1", "STORE_ABCD");
    await addMessage(time, "example message 2", "example sender 2", "STORE_ABCD");
    await addMessage(time, "example message 3", "example sender 3", "STORE_ABCDEF");

    const result1 = await getChatHistory("STORE_ABCD");
    const result2 = await getChatHistory("STORE_ABCDEF");

    expect(result1).toEqual([
      {
        id: 0,
        time: time.toTimeString(),
        text: "example message 1",
        sender: "example sender 1",
      },
      {
        id: 1,
        time: time.toTimeString(),
        text: "example message 2",
        sender: "example sender 2",
      }
    ]);

    expect(result2).toEqual([
      {
        id: 0,
        time: time.toTimeString(),
        text: "example message 3",
        sender: "example sender 3",
      },
    ]);
  });

});

describe("getChatHistory", () => {
  beforeEach(async () => {
    await deleteChatHistory("STORE_ABCD");
  });

  afterEach(async () => {
    await deleteChatHistory("STORE_ABCD");
  });

  it("should return undefined if a chat room doesn't exist for given room code", async () => {
    const result = await getChatHistory("STORE_FAKE_ROOM");

    expect(result).toBeUndefined();
  });

  it("should return an array of chat messages with the added messages if chat room exists for given room code", async () => {
    await addMessage(time, "example message 1", "example sender 1", "STORE_ABCD");
    await addMessage(time, "example message 2", "example sender 2", "STORE_ABCD");

    const result = await getChatHistory("STORE_ABCD");

    expect(result).toEqual([
      {
        id: 0,
        time: time.toTimeString(),
        text: "example message 1",
        sender: "example sender 1",
      },
      {
        id: 1,
        time: time.toTimeString(),
        text: "example message 2",
        sender: "example sender 2",
      }
    ]);
  });

});

describe("deleteChatHistory", () => {
  beforeEach(async () => {
    await deleteChatHistory("STORE_ABCD");
  });

  afterEach(async () => {
    await deleteChatHistory("STORE_ABCD");
  });

  it("should return undefined if a chat room doesn't exist for a given room code", async () => {
    const result = await deleteChatHistory("STORE_FAKE_ROOM");

    expect(result).toBeUndefined();
  });

  it("should delete entire key value pair inside the chat history for given room code if it exists", async () => {
    await addMessage(time, "example message 1", "example sender 1", "STORE_ABCD");
    await addMessage(time, "example message 2", "example sender 2", "STORE_ABCD");

    await deleteChatHistory("STORE_ABCD");

    const result = await getChatHistory("STORE_ABCD");

    expect(result).toBeUndefined();
  });
});