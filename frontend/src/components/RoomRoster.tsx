import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";

interface RoomRosterProps {
  roomMembers: string[];
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
    <Card>
      <Card.Header>Room Members:</Card.Header>
      <Card.Body>
        <ListGroup>
          {roomMembers.map((member) => {
            return (
              <ListGroup.Item variant={decideNameColour(member)}>
                {member}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}

export default RoomRoster;
