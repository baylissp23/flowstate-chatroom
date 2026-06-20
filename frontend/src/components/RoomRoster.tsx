import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import type { RoomMember } from "../../../shared/types";

interface RoomRosterProps {
  roomMembers: RoomMember[];
  thisUser: string;
}

function RoomRoster({ roomMembers, thisUser }: RoomRosterProps) {
  function decideNameColour(member: string) {
    if (member === thisUser) {
      return "primary";
    }
    return "light";
  }

  return (
    <Card className="shadow bento-card overflow-hidden w-100 h-100">
      <Card.Header>Room Members:</Card.Header>
      <Card.Body>
        <ListGroup>
          {roomMembers.map((member) => {
            return (
              <ListGroup.Item variant={decideNameColour(member.displayName)}>
                {member.displayName}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}

export default RoomRoster;
