import { Server } from "socket.io";

const io = new Server({ cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
} });

let roomTimers : Map<string, number>= new Map();

setInterval(() => {
  roomTimers.forEach((timer, roomCode) => {
    if (timer !== 0) {
      roomTimers.set(roomCode, timer - 1);
      io.to(roomCode).emit("timer-tick", timer - 1);
    } else {
      io.to(roomCode).emit("room-closed", "Time is up!");
      roomTimers.delete(roomCode);
    }
  });
}, 1000);

io.on("connection", (socket) => {
  console.log("Connection with client established: ", socket.id);

  socket.on("send-ping", () => {
    console.log("Socket pinged me!");
  })

  socket.on("join-room", (joinInfo) => {
    const displayName = joinInfo.displayName;
    const roomCode = joinInfo.roomCode;

    if (!roomTimers.has(roomCode)) {
      roomTimers.set(roomCode, 1500);
    }
    socket.join(roomCode);
    io.to(socket.id).emit("initial-timer", roomTimers.get(roomCode)); 
  })

});

io.listen(3000);