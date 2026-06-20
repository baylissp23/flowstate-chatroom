import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { socket } from "@/client/client";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage, MessagePayload, Phase } from "../../../shared/types";

interface ChatProps {
  key?: string;
  displayName: string;
  initialMessages: ChatMessage[];
  phase: Phase;
}

function Chat({ displayName, initialMessages, phase }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    const handleNewMessage = (message: ChatMessage) => {
      setMessages((currentMessages) => [...currentMessages, message]);
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, []);

  useEffect(() => {
    if (!shouldAutoScrollRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < 24;
  };

  const chatLocked = () => {
    if (phase === "focus") {
      return true;
    }
    return false;
  };

  return (
    <Container fluid className="border-0 rounded-4 bg-dark shadow">
      <h1>Chat</h1>
      <hr className="border opacity-100"></hr>
      <Container fluid>
        <div
          className="overflow-auto border-0"
          style={{ maxHeight: "30rem", minHeight: "30rem" }}
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {messages.map((message) => {
            return (
              <Card className="my-4" key={message.id}>
                <Card.Header>
                  {message.sender === displayName ? (
                    <span className="text-primary">{message.sender} (Me)</span>
                  ) : (
                    <span>{message.sender}</span>
                  )}
                  {" | "}
                  {message.time}
                </Card.Header>
                <Card.Body>{message.text}</Card.Body>
              </Card>
            );
          })}
        </div>
      </Container>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          const messageData = new FormData(e.currentTarget);
          const messageText = messageData.get("messageText");

          if (typeof messageText !== "string") {
            return;
          }

          const message: MessagePayload = {
            text: messageText,
          };

          socket.emit("send-message", message);
          (e.currentTarget as HTMLFormElement).reset();
        }}
      >
        <InputGroup>
          <Form.Control
            placeholder="Enter chat here..."
            as="textarea"
            rows={3}
            className="mb-2"
            name="messageText"
            disabled={chatLocked()}
          ></Form.Control>
          <Button type="submit" variant="primary" className="mx-2 mb-2">
            Send
          </Button>
        </InputGroup>
      </Form>
    </Container>
  );
}

export default Chat;
