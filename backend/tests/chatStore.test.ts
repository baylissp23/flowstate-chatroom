import { getMessage, addMessage, getChatHistory, deleteChatHistory } from "../src/chat/chatStore.js";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

const time = new Date();

describe("getMessage", () => {

  beforeEach(() => {
    addMessage(time, "message example 1", "example sender 1", "ABCD")
  });

  afterEach(() => {
    deleteChatHistory("ABCD");
  });

  it("should return undefined if the chat room doesn't exist for the specified room code", () => {
    const result = getMessage(0, "EFGH");

    expect(result).toBeUndefined();
  });
  
  it("should return the message at the corresponding ID number and room code given if existing", () => {
    const result = getMessage(0, "ABCD");

    expect(result).toEqual({
      id: 0,
      time: time.toTimeString(),
      text: "message example 1",
      sender: "example sender 1",
    })
  })
});

describe("addMessage", () => {
  afterEach(() => {
    deleteChatHistory("ABCD");
    deleteChatHistory("ABCDEF");
  });

  it("should initialise room array if no corresponding chat room for room code and add the message", () => {
    addMessage(time, "example message 1", "example sender 1", "ABCD");

    const result = getMessage(0, "ABCD");

    expect(result).toEqual({
      id: 0,
      time: time.toTimeString(),
      text: "example message 1",
      sender: "example sender 1",
    });
  });

  it("should return the message being added to the chat store", () => {
    const result = addMessage(time, "example message 1", "example sender 1", "ABCD");

    expect(result).toEqual({
      id: 0,
      time: time.toTimeString(),
      text: "example message 1",
      sender: "example sender 1",
    });
  });

  it("should be able to add multiple messages to multiple chat rooms", () => {
    addMessage(time, "example message 1", "example sender 1", "ABCD");
    addMessage(time, "example message 2", "example sender 2", "ABCD");
    addMessage(time, "example message 3", "example sender 3", "ABCDEF");

    const result1 = getChatHistory("ABCD");
    const result2 = getChatHistory("ABCDEF");

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
    ])
  });

});

describe("getChatHistory", () => {
  it("should return undefined if a chat room doesn't exist for given room code", () => {
    const result = getChatHistory("FAKE_ROOM");

    expect(result).toBeUndefined();
  });

  it("should return an array of chat messages with the added messages if chat room exists for given room code", () => {
    addMessage(time, "example message 1", "example sender 1", "ABCD");
    addMessage(time, "example message 2", "example sender 2", "ABCD");

    const result = getChatHistory("ABCD");

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
  it("should return undefined if a chat room doesn't exist for a given room code", () => {
    const result = deleteChatHistory("FAKE_ROOM");

    expect(result).toBeUndefined();
  })

  it("should delete entire key value pair inside the chat history for given room code if it exists", () => {
    addMessage(time, "example message 1", "example sender 1", "ABCD");
    addMessage(time, "example message 2", "example sender 2", "ABCD");

    deleteChatHistory("ABCD");

    const result = getChatHistory("ABCD");

    expect(result).toBeUndefined();
  })
})