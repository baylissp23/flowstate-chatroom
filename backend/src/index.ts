import { Server } from "socket.io";

const io = new Server({ cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
} });

let countdownTime = 1500;
setInterval(() => {
    countdownTime -= 1;
    io.emit("timer-tick", countdownTime);
  }, 1000);

io.on("connection", (socket) => {
  console.log("Connection with client established: ", socket.id);

  socket.on("send-ping", () => {
    console.log("Socket pinged me!")
  })

});

io.listen(3000);