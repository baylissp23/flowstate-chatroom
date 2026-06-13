import type { RoomMember } from "../../../shared/types.js";

export function getUniqueDisplayName(roomMembers: RoomMember[], displayName: string) {
  if (!roomMembers.some((member) => member.displayName === displayName)) {
    return displayName;
  }

  let count = 2;
  let candidateName = `${displayName} (${count})`;

  while (roomMembers.some((member) => member.displayName === candidateName)) {
    count += 1;
    candidateName = `${displayName} (${count})`;
  }

  return candidateName;
}