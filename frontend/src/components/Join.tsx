import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useState } from "react";
import { socket } from "@/client/client";

function Join() {
  const [displayName, setDisplayName] = useState("");

  return (
    <>
      <Container fluid>
        <h1>Join a Room</h1>

        <Form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const displayName = formData.get("displayName") as string;
            const roomCode = formData.get("roomCode") as string;

            socket.emit("join-room", {
              displayName: displayName,
              roomCode: roomCode,
            });
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
