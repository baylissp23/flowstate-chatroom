import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { socket } from "@/client/client";
import { useNavigate } from "react-router-dom";
import { getClientId } from "@/client/clientId";
import type {
  ChatMessage,
  Permission,
  Phase,
  RoomMember,
} from "../../../shared/types";
import Timer from "@/components/Timer";
import RoomRoster from "@/components/RoomRoster";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Chat from "./Chat";
import RoomSettings from "./RoomSettings";

function Room() {
  const params = useParams();
  const roomCode = params.roomCode;
  const ogDisplayName = useRef<string>(params.displayName);

  const [displayName, setDisplayName] = useState<string>("");
  const [timer, setTimer] = useState<number>(0);
  const [maxTimer, setMaxTimer] = useState<number>(1);
  const [breakTimer, setBreakTimer] = useState<number>(0);
  const [maxBreakTimer, setMaxBreakTimer] = useState<number>(1);
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [chatPhase, setChatPhase] = useState<Phase>("focus");
  const [permission, setPermission] = useState<Permission>("member");

  const navigate = useNavigate();

  useEffect(() => {
    socket.on("initial-messages", (messageData) => {
      if (!messageData) {
        return;
      }
      setInitialMessages(messageData);
    });

    socket.on("initial-info", (roomStateData) => {
      setTimer(roomStateData.roomState.current);
      setMaxTimer(roomStateData.roomState.max);
      setMaxBreakTimer(roomStateData.roomState.breakMax);
      setDisplayName(roomStateData.roomState.assignedDisplayName);
      setRoomMembers(roomStateData.roomState.roomMembers);
      setPermission(roomStateData.permission);
    });

    socket.on("timer-tick", (roomStateData) => {
      setTimer(roomStateData.current);
      setBreakTimer(roomStateData.breakCurrent);
      setChatPhase(roomStateData.phase);
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
      <div className="d-flex justify-content-between align-items-center">
        <h1>Room: {roomCode}</h1>
        <RoomSettings permission={permission} />
      </div>

      <p className="text-muted lead">
        Display Name: {displayName} ({permission})
      </p>
      <Container fluid>
        <Row>
          <Col>
            <Timer timer={timer} maxTime={maxTimer} />
            <Timer timer={breakTimer} maxTime={maxBreakTimer} />
          </Col>
          <Col>
            <RoomRoster roomMembers={roomMembers} thisUser={displayName} />
          </Col>
        </Row>
        <Chat
          displayName={displayName}
          initialMessages={initialMessages}
          key={`${roomCode}-${initialMessages.length}`}
          phase={chatPhase}
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
