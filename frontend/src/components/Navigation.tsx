import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import { NavLink, Link } from "react-router-dom";

function Navigation() {
  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      className="mb-4 border-bottom border-primary shadow-sm"
    >
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          FlowState
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/join">
              Join
            </Nav.Link>
            <Nav.Link as={NavLink} to="/create">
              Create
            </Nav.Link>
            <Nav.Link as={NavLink} to="/help">
              Help
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
