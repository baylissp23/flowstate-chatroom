import Home from "@/components/Home";
import Join from "@/components/Join";
import Help from "@/components/Help";
import Container from "react-bootstrap/Container";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Container fluid>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join" element={<Join />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
