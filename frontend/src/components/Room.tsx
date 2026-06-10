import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { socket } from "@/client/client";
import Timer from "@/components/Timer";
import RoomRoster from "@/components/RoomRoster";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function Room() {
  const params = useParams();
  const roomCode = params.roomCode;
  const ogDisplayName = useRef<string>(params.displayName);

  const [displayName, setDisplayName] = useState<string>("");
  const [timer, setTimer] = useState<number>(0);
  const [maxTimer, setMaxTimer] = useState<number>(1);
  const [roomMembers, setRoomMembers] = useState<string[]>([]);

  useEffect(() => {
    socket.emit("join-room", { displayName: ogDisplayName.current, roomCode });

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

    return () => {
      socket.off("initial-info");
      socket.off("timer-tick");
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
      </Container>
    </>
  );
}

export default Room;
