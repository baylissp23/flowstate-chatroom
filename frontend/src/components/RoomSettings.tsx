import Button from "react-bootstrap/Button";
import type { Permission } from "../../../shared/types";

interface RoomSettingsProps {
  permission: Permission;
}

function RoomSettings({ permission }: RoomSettingsProps) {
  const decideButtons = () => {
    if (permission === "admin") {
      return (
        <>
          <div>
            <span className="text-muted lead me-3">Admin Actions:</span>
            <Button variant="primary" className="mx-1">
              Start Focus
            </Button>
            <Button variant="warning" className="mx-1">
              Pause
            </Button>
            <Button variant="secondary" className="mx-1">
              Pass Admin
            </Button>
            <Button variant="danger" className="mx-1">
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
