import { supabaseClient } from "@/client/supabaseClient";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import { Shield, ShieldLock } from "react-bootstrap-icons";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);

    if (!email || !password) {
      setErr("Please fill in all the fields.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setErr(error.message);
        return;
      }

      navigate("/");
      setEmail("");
      setPassword("");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "An unexpected error occured");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Card
        className="bento-card text-light shadow join-card mx-auto navbar-pulse mt-5"
        style={{ width: "500px" }}
      >

        <Card.Body>
          <div className="p-md-2 text-center">
            <div className="bento-icon-box d-flex align-items-center justify-content-center mx-auto mb-4">
              <ShieldLock size={24} className="text-primary" />
            </div>

            <h3 className="fw-bold">login to your account</h3>
            <p
              className="text-secondary mb-4"
              style={{
                fontSize: "1.05rem",
                lineHeight: "1.6",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              login to continue your FlowState
            </p>

            {err && <Alert variant="danger">{err}</Alert>}

            <Form onSubmit={handleLogin} className="text-start px-3">
              <Form.Label className="text-secondary small">
                email
              </Form.Label>
              <Form.Group className="mb-3" controlId="email">
                <Form.Control
                  type="email"
                  placeholder="enter your email..."
                  name="emailField"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />

              </Form.Group>

              <Form.Label className="text-secondary small">
                password
              </Form.Label>

              <Form.Group className="mb-3" controlId="password">
                <Form.Control
                  type="password"
                  placeholder="enter a password..."
                  name="passwordField"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </Form.Group>

              <div className="d-flex justify-content-center mt-4">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading}
                  className="w-75 py-3 fw-semibold"
                >
                  {isLoading ? "Logging in..." : "Log in"}
                </Button>
              </div>
              <div className="text-center my-4 text-secondary">
                don't have an account? <Link to="/signup">sign up instead</Link>
              </div>
            </Form>
          </div>
        </Card.Body>

      </Card>
    </>
  );
}

export default Login;
