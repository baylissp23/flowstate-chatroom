import { socket } from "@/client/client";
import Timer from "@/components/Timer";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/esm/Container";

function Home() {
  return (
    <>
      <Container fluid>
        <h1>Home</h1>
        <p className="text-muted lead">Your personal homepage</p>
      </Container>
      <Container fluid>
        <Button
          variant="primary"
          onClick={() => {
            socket.emit("send-ping");
          }}
        >
          Click me!
        </Button>
        <Timer />
      </Container>
    </>
  );
}

export default Home;
