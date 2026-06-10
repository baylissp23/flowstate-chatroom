import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { socket } from "@/client/client";
import Timer from "@/components/Timer";
import Container from "react-bootstrap/Container";

function Room() {
  const params = useParams();
  const roomCode = params.roomCode;
  const ogDisplayName = useRef(params.displayName);
  const [displayName, setDisplayName] = useState("");

  const [timer, setTimer] = useState(0);
  const [maxTimer, setMaxTimer] = useState(1);

  useEffect(() => {
    socket.emit("join-room", { displayName: ogDisplayName.current, roomCode });

    socket.on("initial-info", (roomStateData) => {
      setTimer(roomStateData.current);
      setMaxTimer(roomStateData.max);
      setDisplayName(roomStateData.assignedDisplayName);
    });

    socket.on("timer-tick", (roomStateData) => {
      setTimer(roomStateData.current);
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
      <Container>
        <Timer timer={timer} maxTime={maxTimer} />
      </Container>
    </>
  );
}

export default Room;
