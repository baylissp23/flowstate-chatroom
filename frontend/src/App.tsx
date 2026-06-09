import Home from "@/components/Home";
import Join from "@/components/Join";
import Help from "@/components/Help";
import Create from "@/components/Create";
import Room from "@/components/Room";
import Navigation from "@/components/Navigation";
import Container from "react-bootstrap/Container";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Navigation />
      <Container fluid>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join" element={<Join />} />
          <Route path="/help" element={<Help />} />
          <Route path="/create" element={<Create />} />
          <Route path="/join/:roomCode/:displayName" element={<Room />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
