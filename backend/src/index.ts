import { Server } from "socket.io";
import type { JoinRoomPayload, RoomState } from "../../shared/types.js";

const io = new Server({ cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
} });

let roomState : Map<string, RoomState> = new Map();

setInterval(() => {
  roomState.forEach((timer, roomCode) => {
    if (timer.current !== 0) {
      timer.current -= 1;
      io.to(roomCode).emit("timer-tick", timer);
    } else {
      io.to(roomCode).emit("room-closed", "Time is up!");
      roomState.delete(roomCode);
    }
  });
}, 1000);

io.on("connection", (socket) => {
  console.log("Connection with client established: ", socket.id);

  socket.on("send-ping", () => {
    console.log("Socket pinged me!");
  })

  socket.on("join-room", (joinInfo : JoinRoomPayload) => {
    const displayName = joinInfo.displayName;
    const roomCode = joinInfo.roomCode;

    if (socket.rooms.has(roomCode)) {
      return;
    }

    if (!roomState.has(roomCode)) {
      roomState.set(roomCode, { current: 1500, max: 1500, roomMembers: [displayName], assignedDisplayName: displayName });
    } else {
      const roomData = roomState.get(roomCode);
      if (!roomData) {
        return;
      }
      const rm = roomData.roomMembers;

      if (roomData.roomMembers.includes(displayName)) {
        let count = 2
        let suffix = ` (${count})`;
        while (roomData.roomMembers.includes(displayName + suffix)) {
          count += 1;
          suffix = ` (${count})`;
        }
        const candidateName = displayName + suffix;
        rm.push(candidateName)
        roomState.set(roomCode, { 
          current: roomData.current, 
          max: roomData.max, 
          roomMembers: rm,
          assignedDisplayName: candidateName
        });
      } else {
        rm.push(displayName);
        roomState.set(roomCode, { 
          current: roomData.current, 
          max: roomData.max, 
          roomMembers: rm, 
          assignedDisplayName: displayName
        });
      }
      io.to(roomCode).emit("new-join", roomState.get(roomCode)!.roomMembers);
    }
    socket.join(roomCode);
    io.to(socket.id).emit("initial-info", roomState.get(roomCode)); 
  })

});

io.listen(3000);