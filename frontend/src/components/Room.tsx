import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { socket } from "@/client/client";
import { useNavigate } from "react-router-dom";
import { getClientId } from "@/client/clientId";
import type { ChatMessage, RoomMember } from "../../../shared/types";
import Timer from "@/components/Timer";
import RoomRoster from "@/components/RoomRoster";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Chat from "./Chat";

function Room() {
  const params = useParams();
  const roomCode = params.roomCode;
  const ogDisplayName = useRef<string>(params.displayName);

  const [displayName, setDisplayName] = useState<string>("");
  const [timer, setTimer] = useState<number>(0);
  const [maxTimer, setMaxTimer] = useState<number>(1);
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    socket.on("initial-messages", (messageData) => {
      if (!messageData) {
        return;
      }
      setInitialMessages(messageData);
    });

    socket.on("initial-info", (roomStateData) => {
      setTimer(roomStateData.current);
      setMaxTimer(roomStateData.max);
      setDisplayName(roomStateData.assignedDisplayName);
      setRoomMembers(roomStateData.roomMembers);
    });

    socket.on("timer-tick", (roomStateData) => {
      setTimer(roomStateData.current);
    });

    socket.on("new-join", (roomMembersData) => {
      setRoomMembers(roomMembersData);
    });

    socket.on("member-left", (newRoomMembers) => {
      setRoomMembers(newRoomMembers);
    });

    socket.emit("join-room", {
      displayName: ogDisplayName.current,
      clientId: getClientId(),
      roomCode,
    });

    return () => {
      socket.off("initial-info");
      socket.off("timer-tick");
      socket.off("new-join");
      socket.off("member-left");
      socket.off("initial-messages");
    };
  }, [roomCode]);

  return (
    <>
      <h1>Room: {roomCode}</h1>
      <p className="text-muted lead">Display Name: {displayName}</p>
      <Container fluid>
        <Row>
          <Col>
            <Timer timer={timer} maxTime={maxTimer} />
          </Col>
          <Col>
            <RoomRoster roomMembers={roomMembers} thisUser={displayName} />
          </Col>
        </Row>
        <Chat
          displayName={displayName}
          initialMessages={initialMessages}
          key={`${roomCode}-${initialMessages.length}`}
        />
        <Button
          variant="danger"
          onClick={() => {
            socket.emit("leave-room", {
              displayName: displayName,
              roomCode: roomCode,
              clientId: getClientId(),
            });
            navigate("/");
          }}
          className="mb-4"
        >
          Leave
        </Button>
      </Container>
    </>
  );
}

export default Room;
