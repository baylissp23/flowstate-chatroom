import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { deleteRoom, forEachRoom, getRoom, setRoom } from "../src/room/roomStore.js";
import { pubClient } from "../src/redisClient.js";

describe("getRoom & setRoom", () => {

  afterEach(async () => {
    await deleteRoom("STORE_ABCD");
  });

  it("should return undefined if room doesn't exist", async () => {
    const result = await getRoom("STORE_FAKE");
    expect(result).toBeUndefined();
  });

  it("should return the RoomState with passed roomCode if room exists", async () => {
    await setRoom(
      'STORE_ABCD',      
      1500,         
      1500,         
      [],           
      'Host',       
      300,          
      300,          
      'focus',      
      true          
    );

    const result = await getRoom("STORE_ABCD");

    expect(result).toBeDefined();
    expect(result).toEqual({
      current: 1500,
      max: 1500,
      roomMembers: [],
      assignedDisplayName: "Host",
      breakCurrent: 300,
      breakMax: 300,
      phase: "focus",
      isPaused: true
    });
  });

});

describe("deleteRoom", () => {
  beforeEach(async () => {
    await deleteRoom("STORE_ABCD");
    await setRoom(
      'STORE_ABCD',      
      1500,         
      1500,         
      [],           
      'Host',       
      300,          
      300,          
      'focus',      
      true          
    );
  });

  afterEach(async () => {
    await deleteRoom("STORE_ABCD");
  });

  it("should delete room with corresponding roomCode", async () => {
    await deleteRoom("STORE_ABCD");

    const result = await getRoom("STORE_ABCD");
    expect(result).toBeUndefined();
  });
});

describe("forEachRoom", () => {
  beforeEach(async () => {
    await pubClient.del("active_rooms"); // Clear the registry so we start from 0 rooms
    await deleteRoom("STORE_ROOM_A");
    await deleteRoom("STORE_ROOM_B");
  });

  afterEach(async () => {
    await deleteRoom("STORE_ROOM_A");
    await deleteRoom("STORE_ROOM_B");
  });

  it("should execute callback for each room in the store", async () => {
    await setRoom('STORE_ROOM_A', 1500, 1500, [], 'Host A', 300, 300, 'focus', true);
    await setRoom('STORE_ROOM_B', 1500, 1500, [], 'Host B', 300, 300, 'break', false);

    const testCallback = vi.fn();

    await forEachRoom(testCallback);

    expect(testCallback).toHaveBeenCalledTimes(2);
  });

  it("should not execute the callback any times if no rooms in store", async () => {
    const mockCallback = vi.fn();

    await forEachRoom(mockCallback);

    expect(mockCallback).not.toHaveBeenCalled();
  });
});