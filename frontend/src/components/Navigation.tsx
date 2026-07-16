import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import { NavLink, Link } from "react-router-dom";
import { Infinity as InfinityIcon } from "react-bootstrap-icons";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

function Navigation() {
  const { user, isLoading, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  }

  return (
    <Navbar expand="lg" className="bg-dark navbar-pill navbar-pulse">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <InfinityIcon className="me-2 text-primary" />
          FlowState
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/#join-card">
              Join
            </Nav.Link>
            <Nav.Link as={NavLink} to="/create">
              Create
            </Nav.Link>
            <Nav.Link as={NavLink} to="/help">
              Help
            </Nav.Link>
          </Nav>
          <Nav className="ms-auto me-2">
            {isLoading ? null :
              user ? <>
                <Nav.Link as={Link} to="/profile">
                  Profile
                </Nav.Link>
                <Nav.Link onClick={handleLogout} style={{ cursor: "pointer" }}>
                  Log Out
                </Nav.Link>
              </> : <>
                  <Nav.Link as={Link} to="/signup">
                    Sign Up
                  </Nav.Link>
                  <Nav.Link as={Link} to="/login">
                    Log In
                  </Nav.Link>
              </>
            }
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
