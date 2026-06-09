import { socket } from "@/client/client";
import { useState, useEffect } from "react";

function Timer() {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    socket.on("timer-tick", (serverTime) => {
      setTimer(serverTime);
    });
  }, []);

  return (
    <>
      <p>{timer}</p>
    </>
  );
}

export default Timer;
