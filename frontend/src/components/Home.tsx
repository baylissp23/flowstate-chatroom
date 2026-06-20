import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useLocation, Link } from "react-router-dom";
import InfoGrid from "./InfoGrid";
import { Infinity as InfinityIcon } from "react-bootstrap-icons";
import HomeFooter from "./HomeFooter";
import Join from "./Join";
import { useRef, useEffect } from "react";

function Home() {
  const joinRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#join-card") {
      joinRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [location.hash]);

  return (
    <>
      <main className="py-5 mt-5">
        <Container fluid className="text-light px-4 px-lg-5">
          <Row className="align-items-center">
            <Col lg={6} className="mb-3 mb-lg-0">
              <div className="badge border border-secondary text-secondary mb-3 rounded-pill px-3 py-2">
                Home
              </div>
              <h1 className="display-3 fw-bold mb-4">
                Find your <span className="text-gradient-blue">FlowState</span>
                <span className="text-primary">
                  <InfinityIcon className="mx-1" />
                </span>
              </h1>
              <p
                className="lead text-secondary mb-5"
                style={{ maxWidth: "48rem" }}
              >
                Create a room for your team, or join an existing session. Focus
                together, wherever you are.
              </p>
              <div className="d-flex gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="px-4"
                  onClick={() => {
                    joinRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                >
                  Join a Room
                </Button>
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

      <hr className="border"></hr>

      <section className="py-5" id="join-card">
        <Container fluid className="text-light px-4 px-lg-5 text-center">
          <div className="d-flex justify-content-center mt-4" ref={joinRef}>
            <Join />
          </div>
        </Container>
      </section>

      <HomeFooter />
    </>
  );
}

export default Home;
