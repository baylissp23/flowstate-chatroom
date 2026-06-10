import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "@/client/client";
import Timer from "@/components/Timer";
import Container from "react-bootstrap/Container";

function Room() {
  const params = useParams();
  const roomCode = params.roomCode;
  const displayName = params.displayName;

  const [timer, setTimer] = useState(0);
  const [maxTimer, setMaxTimer] = useState(1);

  useEffect(() => {
    socket.emit("join-room", { displayName, roomCode });

    socket.on("initial-info", (timerData) => {
      setTimer(timerData.current);
      setMaxTimer(timerData.max);
    });

    socket.on("timer-tick", (timerData) => {
      setTimer(timerData.current);
    });

    return () => {
      socket.off("initial-info");
      socket.off("timer-tick");
    };
  }, [roomCode, displayName]);

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
