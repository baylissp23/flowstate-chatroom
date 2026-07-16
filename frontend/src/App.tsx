import Home from "@/components/Home";
import Join from "@/components/Join";
import Help from "@/components/Help";
import Create from "@/components/Create";
import Room from "@/components/Room";
import Navigation from "@/components/Navigation";
import Signup from "@/components/Signup";
import Login from "@/components/Login";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<Join />} />
        <Route path="/help" element={<Help />} />
        <Route path="/create" element={<Create />} />
        <Route path="/join/:roomCode/:displayName" element={<Room />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
