import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { BoxArrowInRight } from "react-bootstrap-icons";
import { useAuthStore } from "@/store/useAuthStore";

function Join() {
  const { user } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || "");
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  return (
    <>
      <Card className="bento-card text-light shadow join-card mx-auto navbar-pulse">
        <Card.Body>
          <div className="p-md-2 text-center">
            <div className="bento-icon-box d-flex align-items-center justify-content-center mx-auto mb-4">
              <BoxArrowInRight size={24} className="text-primary" />
            </div>

            <h3 className="fw-bold">join a room</h3>
            <p
              className="text-secondary mb-4"
              style={{
                fontSize: "1.05rem",
                lineHeight: "1.6",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              enter your name and a room code to drop in
            </p>
          </div>
        </Card.Body>
        <div className="px-4 px-md-5">
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/join/${roomCode}/${displayName}`);
            }}
            className="text-start"
          >
            <Form.Group className="mb-3" controlId="displayNameEnter">
              <Form.Label className="text-secondary small">
                display name
              </Form.Label>
              <Form.Control
                key={user?.id || "guest"}
                type="text"
                placeholder="Enter display name..."
                name="displayName"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="enterRoomCode">
              <Form.Label className="text-secondary small">
                room code
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter room code..."
                name="roomCode"
                onChange={(e) => {
                  setRoomCode(e.target.value);
                }}
              />
            </Form.Group>
            <div className="d-flex justify-content-center mt-4">
              <Button
                variant="primary"
                type="submit"
                disabled={displayName === ""}
                className="w-75 py-3 fw-semibold"
              >
                Join Room
              </Button>
            </div>
          </Form>
        </div>

        <div className="text-center my-4 text-secondary">
          don't have a code? <Link to="/create">create a room instead</Link>
        </div>
      </Card>
    </>
  );
}

export default Join;
