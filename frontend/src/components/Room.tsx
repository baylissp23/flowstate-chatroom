import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { socket } from "@/client/client";
import { useNavigate } from "react-router-dom";
import { getClientId } from "@/client/clientId";
import type {
  ChatMessage,
  EndRoomResult,
  PauseTimerResult,
  Permission,
  Phase,
  RoomMember,
} from "../../../shared/types";
import Timer from "@/components/Timer";
import RoomRoster from "@/components/RoomRoster";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Chat from "./Chat";
import RoomSettings from "./RoomSettings";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function Room() {
  const params = useParams();
  const roomCode = params.roomCode;
  const ogDisplayName = useRef<string>(params.displayName);

  const [displayName, setDisplayName] = useState<string>("");
  const [timer, setTimer] = useState<number>(0);
  const [timerPaused, setTimerPaused] = useState(true);
  const [breakTimer, setBreakTimer] = useState<number>(0);
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
      setDisplayName(roomStateData.roomState.assignedDisplayName);
      setRoomMembers(roomStateData.roomState.roomMembers);
      setPermission(roomStateData.permission);
    });

    socket.on("timer-tick", (roomStateData) => {
      setTimer(roomStateData.current);
      setBreakTimer(roomStateData.breakCurrent);
      setChatPhase(roomStateData.phase);
    });

    socket.on("new-admin-promotion", (newRoomMembers) => {
      setRoomMembers(newRoomMembers);

      const myClientId = getClientId();
      const myMember = newRoomMembers.find(
        (member: RoomMember) => member.clientId === myClientId,
      );

      if (myMember) {
        setPermission(myMember.permission);
      }
    });

    socket.on("new-pause-request", (pauseTimerResult: PauseTimerResult) => {
      if (!pauseTimerResult.success) {
        return;
      }
      setTimerPaused(pauseTimerResult.isPaused);
    });

    socket.on("room-ending", (roomEndResult: EndRoomResult) => {
      if (!roomEndResult.success) {
        return;
      }
      navigate("/");
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
      socket.off("new-admin-promotion");
      socket.off("room-ending");
      socket.off("new-pause-request");
    };
  }, [roomCode, navigate]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <h1>Room: {roomCode}</h1>
        <RoomSettings
          permission={permission}
          roomMembers={roomMembers}
          roomCode={roomCode!}
          timerIsPaused={timerPaused}
        />
      </div>

      <p className="text-muted lead">
        Display Name: {displayName} ({permission})
      </p>
      <Container fluid>
        <div className="d-flex flex-row justify-content-center align-items-center w-100 gap-3">
          <div className="w-100 flex-fill">
            <Timer timer={timer} />
          </div>
          <div className="w-100 flex-fill">
            <Timer timer={breakTimer} />
          </div>
        </div>

        <div className="my-4">
          <Row className="align-items-stretch">
            <Col xs={12} md={2} className="d-flex">
              <RoomRoster roomMembers={roomMembers} thisUser={displayName} />
            </Col>
            <Col xs={12} md={10} className="d-flex">
              <Chat
                displayName={displayName}
                initialMessages={initialMessages}
                key={`${roomCode}-${initialMessages.length}`}
                phase={chatPhase}
              />
            </Col>
          </Row>
        </div>

        <div className="d-flex justify-content-end">
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
        </div>
      </Container>
    </>
  );
}

export default Room;
