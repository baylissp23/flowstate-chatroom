import { socket } from "@/client/client";
import Timer from "@/components/Timer";
import Button from "react-bootstrap/Button";

function Home() {
  return (
    <>
      <div>
        <Button
          variant="primary"
          onClick={() => {
            socket.emit("send-ping");
          }}
        >
          Click me!
        </Button>
        <Timer />
      </div>
    </>
  );
}

export default Home;
