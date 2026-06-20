import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Join() {
  const [displayName, setDisplayName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  return (
    <>
      <Container fluid className="mt-5">
        <h1>Join a Room</h1>

        <Form
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/join/${roomCode}/${displayName}`);
          }}
        >
          <Form.Group className="mb-3" controlId="displayNameEnter">
            <Form.Label>Display Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter display name..."
              name="displayName"
              onChange={(e) => {
                setDisplayName(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="enterRoomCode">
            <Form.Label>Room Code</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter room code..."
              name="roomCode"
              onChange={(e) => {
                setRoomCode(e.target.value);
              }}
            />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={displayName === ""}>
            Join Room
          </Button>
        </Form>
      </Container>
    </>
  );
}

export default Join;
