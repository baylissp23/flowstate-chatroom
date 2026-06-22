import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { deleteRoom, forEachRoom, getRoom, setRoom } from "../src/room/roomStore.js";

describe("getRoom & setRoom", () => {

  afterEach(() => {
    deleteRoom("ABCD");
  });

  it("should return undefined if room doesn't exist", () => {
    const result = getRoom("FAKE");

    expect(result).toBeUndefined();
  });

  it("should return the RoomState with passed roomCode if room exists", () => {
    setRoom(
      'ABCD',      
      1500,         
      1500,         
      [],           
      'Host',       
      300,          
      300,          
      'focus',      
      true          
    );

    const result = getRoom("ABCD");

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
  beforeEach(() => {
    setRoom(
      'ABCD',      
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

  it("should delete room with corresponding roomCode", () => {
    deleteRoom("ABCD");

    const result = getRoom("ABCD");

    expect(result).toBeUndefined();
  });
});

describe("forEachRoom", () => {
  afterEach(() => {
    deleteRoom("ROOM_A");
    deleteRoom("ROOM_B");
  })

  it("should execute callback for each room in the store", () => {
    setRoom('ROOM_A', 1500, 1500, [], 'Host A', 300, 300, 'focus', true);
    setRoom('ROOM_B', 1500, 1500, [], 'Host B', 300, 300, 'break', false);

    const testCallback = vi.fn();

    forEachRoom(testCallback);

    expect(testCallback).toHaveBeenCalledTimes(2);
  });

  it("should not execute the callback any times if no rooms in store", () => {
    const mockCallback = vi.fn();

    forEachRoom(mockCallback);

    expect(mockCallback).not.toHaveBeenCalled();
  })
});