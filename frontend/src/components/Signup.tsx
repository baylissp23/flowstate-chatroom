import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { PersonPlus } from "react-bootstrap-icons";
import { supabaseClient } from "@/client/supabaseClient";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const validatePassword = (password: string): boolean => {
    const passwordRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSignup = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setSuccessMessage(null);

    if (!email || !password || !confirmPassword || !displayName) {
      setErr("Please fill in all fields.");
      return;
    }

    if (!validatePassword(password)) {
      setErr("Password must contain at least 8 characters, an uppercase, a lowercase, a number, and a symbol.");
      return;
    }

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName }
        }
      });

      if (error) {
        setErr(error.message);
        return;
      }

      if (data.session) {
        navigate("/");
        return;
      }

      setSuccessMessage("Check your inbox to verify your email!");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setDisplayName("");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "An unexpected error occured");
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card
        className="bento-card text-light shadow join-card mx-auto navbar-pulse mt-5"
        style={{ width: "500px" }}
      >

        <Card.Body>
          <div className="p-md-2 text-center">
            <div className="bento-icon-box d-flex align-items-center justify-content-center mx-auto mb-4">
              <PersonPlus size={24} className="text-primary" />
            </div>

            <h3 className="fw-bold">create account</h3>
            <p
              className="text-secondary mb-4"
              style={{
                fontSize: "1.05rem",
                lineHeight: "1.6",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              create an account to start your FlowState
            </p>

            {err && <Alert variant="danger">{err}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            <Form onSubmit={handleSignup} className="text-start px-3">
              <Form.Label className="text-secondary small">
                display name
              </Form.Label>
              <Form.Group className="mb-3" controlId="displayName">
                <Form.Control
                  type="text"
                  placeholder="enter display name..."
                  name="displayNameField"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isLoading}
                />
              </Form.Group>

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

              <Form.Label className="text-secondary small">
                confirm password
              </Form.Label>
              <Form.Group>
                <Form.Control
                  type="password"
                  placeholder="confirm your password..."
                  name="confirmPasswordField"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {isLoading ? "Signing up..." : "Sign up"}
                </Button>
              </div>
              <div className="text-center my-4 text-secondary">
                already have an account? <Link to="/login">login instead</Link>
              </div>
            </Form>
          </div>
        </Card.Body>

      </Card>
    </>
  );
}

export default Signup;
