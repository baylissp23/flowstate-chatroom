import { describe, it, expect } from "vitest";
import { getUniqueDisplayName } from "../src/room/displayName.js";
import type { RoomMember } from "../../shared/types.js";

describe("getUniqueDisplayName", () => {
  it("should return original name if no one else in room has it", () => {
    const currentMembers : RoomMember[] = [
        { clientId: "1", displayName: "Jeff", permission: "admin", roomCode: "ExampleRoom" },
        { clientId: "2", displayName: "Paul", permission: "member", roomCode: "ExampleRoom" },
        { clientId: "3", displayName: "Margaret", permission: "member", roomCode: "ExampleRoom" },
        { clientId: "4", displayName: "Gemima", permission: "member", roomCode: "ExampleRoom" },
    ];

    const result = getUniqueDisplayName(currentMembers, "Bob");

    expect(result).toBe("Bob");
  });

  it("should return original name with prefix (2) if one other person in the room has it", () => {
    const currentMembers : RoomMember[] = [
        { clientId: "1", displayName: "Jeff", permission: "admin", roomCode: "ExampleRoom" },
        { clientId: "2", displayName: "Paul", permission: "member", roomCode: "ExampleRoom" },
        { clientId: "3", displayName: "Margaret", permission: "member", roomCode: "ExampleRoom" },
        { clientId: "4", displayName: "Gemima", permission: "member", roomCode: "ExampleRoom" },
    ];

    const result = getUniqueDisplayName(currentMembers, "Paul");

    expect(result).toBe("Paul (2)");
  });

  it("should increment prefix if there is already prefixed version of the original name", () => {
    const currentMembers : RoomMember[] = [
        { clientId: "1", displayName: "Paul", permission: "admin", roomCode: "ExampleRoom" },
        { clientId: "2", displayName: "Paul (2)", permission: "member", roomCode: "ExampleRoom" },
        { clientId: "3", displayName: "Margaret", permission: "member", roomCode: "ExampleRoom" },
        { clientId: "4", displayName: "Gemima", permission: "member", roomCode: "ExampleRoom" },
    ];

    const result = getUniqueDisplayName(currentMembers, "Paul");

    expect(result).toBe("Paul (3)");

  })
})