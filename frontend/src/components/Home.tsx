import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <Container fluid>
        <h1>Home</h1>
        <p className="text-muted lead">Your personal homepage</p>
        <Container>
          <Row>
            <Col>
              <Card className="me-2">
                <Card.Header>
                  <h2>Create a room:</h2>
                </Card.Header>
                <Card.Body>
                  Create your own room for your team members to join!
                </Card.Body>
                <Card.Footer>
                  <Link to="/create">
                    <Button variant="primary">Create</Button>
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
            <Col>
              <Card>
                <Card.Header>
                  <h2>Join an existing room:</h2>
                </Card.Header>
                <Card.Body>
                  Join an existing room made by one of your team members!
                </Card.Body>
                <Card.Footer>
                  <Link to="/join">
                    <Button variant="primary">Join</Button>
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  );
}

export default Home;
