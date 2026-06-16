import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { socket } from "@/client/client";
import { useEffect, useState } from "react";
import type { ChatMessage, MessagePayload } from "../../../shared/types";

interface ChatProps {
  key?: string;
  displayName: string;
  initialMessages: ChatMessage[];
}

function Chat({ displayName, initialMessages }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  useEffect(() => {
    const handleNewMessage = (message: ChatMessage) => {
      setMessages((currentMessages) => [...currentMessages, message]);
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, []);

  return (
    <Container
      fluid
      className="border border-dark border-2 rounded-3 mt-4 mb-2 bg-light"
    >
      <h1 className="mt-2">Chat</h1>
      <hr className="border border-dark opacity-25 mx-3 my-4"></hr>
      <Container fluid>
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
        }}
      >
        <InputGroup>
          <Form.Control
            placeholder="Enter chat here..."
            as="textarea"
            rows={3}
            className="mb-2"
            name="messageText"
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
