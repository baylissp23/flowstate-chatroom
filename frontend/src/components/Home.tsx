import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";
import InfoGrid from "./InfoGrid";
import { Infinity as InfinityIcon } from "react-bootstrap-icons";
import HomeFooter from "./HomeFooter";

function Home() {
  return (
    <>
      <div
        className="d-flex flex-column text-light"
        style={{ minHeight: "calc(100dvh - 68px)" }}
      >
        <main className="flex-grow-1 d-flex align-items-center py-2">
          <Container fluid className="text-light px-4 px-lg-5">
            <Row className="align-items-center">
              <Col lg={6} className="mb-3 mb-lg-0">
                <div className="badge border border-secondary text-secondary mb-3 rounded-pill px-3 py-2">
                  Home
                </div>
                <h1 className="display-3 fw-bold mb-4">
                  Find your{" "}
                  <span className="text-gradient-blue">FlowState</span>
                  <span className="text-primary">
                    <InfinityIcon className="mx-1" />
                  </span>
                </h1>
                <p
                  className="lead text-secondary mb-5"
                  style={{ maxWidth: "48rem" }}
                >
                  Create a room for your team, or join an existing session.
                  Focus together, wherever you are.
                </p>
                <div className="d-flex gap-3">
                  <Link to="/join">
                    <Button variant="primary" size="lg" className="px-4">
                      Join a Room
                    </Button>
                  </Link>
                  <Link to="/create">
                    <Button variant="secondary" size="lg" className="px-4">
                      Create New
                    </Button>
                  </Link>
                </div>
              </Col>

              <Col lg={6}>
                <div className="mockup-container">
                  <InfoGrid />
                </div>
              </Col>
            </Row>
          </Container>
        </main>

        <HomeFooter />
      </div>
    </>
  );
}

export default Home;
