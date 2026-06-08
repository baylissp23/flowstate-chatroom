import { socket } from "../client/client";
import Timer from "./components/Timer";

function App() {
  return (
    <>
      <div>
        <button
          className="bg-gray-400 border-2 border-black rounded-sm align-middle hover:bg-gray-500 p-4 focus:ring-2 focus:ring-red-600 focus:border-transparent"
          onClick={() => {
            socket.emit("send-ping");
          }}
        >
          Click me!
        </button>
        <Timer />
      </div>
    </>
  );
}

export default App;
