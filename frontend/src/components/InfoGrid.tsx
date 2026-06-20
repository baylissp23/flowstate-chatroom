import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import { BoxArrowInRight, Clock, Lock, CupHot } from "react-bootstrap-icons";

function InfoGrid() {
  return (
    <>
      <Row>
        <Col>
          <Card className="bento-card text-light shadow">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="bento-icon-box d-flex align-items-center justify-content-center">
                  <BoxArrowInRight size={22} className="text-primary" />
                </div>
                <span className="text-muted opacity-50 font-monospace">1</span>
              </div>
            </Card.Body>
            <Container fluid className="mb-4">
              <Card.Title className="fw-bold fs-4 mb-3">Join a room</Card.Title>
              <Card.Text
                className="text-secondary"
                style={{
                  fontSize: "1.05rem",
                  lineHeight: "1.6",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                Drop in to an active session with a room code to get going.
              </Card.Text>
            </Container>
          </Card>
        </Col>
        <Col>
          <Card className="bento-card text-light shadow">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="bento-icon-box d-flex align-items-center justify-content-center">
                  <Clock size={22} className="text-primary" />
                </div>
                <span className="text-muted opacity-50 font-monospace">2</span>
              </div>
            </Card.Body>
            <Container fluid className="mb-4">
              <Card.Title className="fw-bold fs-4 mb-3">
                Timer begins
              </Card.Title>
              <Card.Text
                className="text-secondary"
                style={{
                  fontSize: "1.05rem",
                  lineHeight: "1.6",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                A shared Pomodoro focus timer begins, synced for everyone in the
                room.
              </Card.Text>
            </Container>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <Card className="bento-card text-light shadow">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="bento-icon-box d-flex align-items-center justify-content-center">
                  <Lock size={22} className="text-primary" />
                </div>
                <span className="text-muted opacity-50 font-monospace">3</span>
              </div>
            </Card.Body>
            <Container fluid className="mb-4">
              <Card.Title className="fw-bold fs-4 mb-3">Chat locks</Card.Title>
              <Card.Text
                className="text-secondary"
                style={{
                  fontSize: "1.05rem",
                  lineHeight: "1.6",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                No messages, no distractions. Just focus until the session ends.
              </Card.Text>
            </Container>
          </Card>
        </Col>
        <Col>
          <Card className="bento-card text-light shadow">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="bento-icon-box d-flex align-items-center justify-content-center">
                  <CupHot size={22} className="text-primary" />
                </div>
                <span className="text-muted opacity-50 font-monospace">4</span>
              </div>
            </Card.Body>
            <Container fluid className="mb-4">
              <Card.Title className="fw-bold fs-4 mb-3">
                Break together
              </Card.Title>
              <Card.Text
                className="text-secondary"
                style={{
                  fontSize: "1.05rem",
                  lineHeight: "1.6",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                Chat unlocks for a 5 minute break. Wind down, check in, go
                again.
              </Card.Text>
            </Container>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default InfoGrid;
