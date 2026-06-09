import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "@/client/client";

function Room() {
  const params = useParams();
  const roomCode = params.roomCode;
  const displayName = params.displayName;

  const [timer, setTimer] = useState(0);

  useEffect(() => {
    socket.emit("join-room", { displayName, roomCode });

    socket.on("initial-timer", (initialTimer) => {
      setTimer(initialTimer);
    });

    socket.on("timer-tick", (newTimer) => {
      setTimer(newTimer);
    });

    return () => {
      socket.off("initial-timer");
      socket.off("timer-tick");
    };
  }, [roomCode, displayName]);

  useEffect(() => {
    socket.on("timer-tick", (newTimer) => {
      setTimer(newTimer);
    });
  }, []);

  return (
    <>
      <h1>Room: {roomCode}</h1>
      <p className="text-muted lead">Display Name: {displayName}</p>
      <p>{timer}</p>
    </>
  );
}

export default Room;
