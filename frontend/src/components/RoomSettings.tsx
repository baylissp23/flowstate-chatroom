import Button from "react-bootstrap/Button";
import type { Permission, RoomMember } from "../../../shared/types";
import { socket } from "@/client/client";
import PassAdmin from "./PassAdmin";

interface RoomSettingsProps {
  permission: Permission;
  roomMembers: RoomMember[];
  roomCode: string;
  timerIsPaused: boolean;
}

function RoomSettings({
  permission,
  roomMembers,
  roomCode,
  timerIsPaused,
}: RoomSettingsProps) {
  const decideButtons = () => {
    if (permission === "admin") {
      return (
        <>
          <div>
            <span className="text-muted lead me-3">Admin Actions:</span>
            <Button
              variant="warning"
              className="mx-1"
              onClick={() => {
                socket.emit("pause-timer", roomCode);
              }}
            >
              {timerIsPaused ? "Start" : "Pause"}
            </Button>
            <PassAdmin roomMembers={roomMembers} />
            <Button
              variant="danger"
              className="mx-1"
              onClick={() => {
                socket.emit("end-room");
              }}
            >
              End Room
            </Button>
          </div>
        </>
      );
    } else {
      return (
        <p className="text-muted lead">
          As a member, you cannot access admin actions.
        </p>
      );
    }
  };

  return <>{decideButtons()}</>;
}

export default RoomSettings;
