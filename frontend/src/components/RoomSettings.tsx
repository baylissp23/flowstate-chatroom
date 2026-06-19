import Button from "react-bootstrap/Button";
import type { Permission, RoomMember } from "../../../shared/types";
import { socket } from "@/client/client";
import PassAdmin from "./PassAdmin";

interface RoomSettingsProps {
  permission: Permission;
  roomMembers: RoomMember[];
}

function RoomSettings({ permission, roomMembers }: RoomSettingsProps) {
  const decideButtons = () => {
    if (permission === "admin") {
      return (
        <>
          <div>
            <span className="text-muted lead me-3">Admin Actions:</span>
            <Button
              variant="primary"
              className="mx-1"
              onClick={() => {
                socket.emit("start-focus");
              }}
            >
              Start Focus
            </Button>
            <Button
              variant="warning"
              className="mx-1"
              onClick={() => {
                socket.emit("pause-timer");
              }}
            >
              Pause
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
