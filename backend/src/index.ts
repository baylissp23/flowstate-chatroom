import { Server } from "socket.io";
import type { JoinRoomPayload } from "../../shared/types.js";
import { getRoom } from "./room/roomStore.js";
import { disconnect, duplicateNamePath, emptyRoomPath, rejoinRoomPath, leaveRoom } from "./room/roomService.js";
import { tickEach } from "./room/timerService.js";

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

setInterval(() => {
  tickEach(io)
}, 1000);

io.on("connection", (socket) => {
  console.log("Connection with client established: ", socket.id);

  socket.on("join-room", (joinInfo: JoinRoomPayload) => {
    const { displayName, roomCode, clientId } = joinInfo;

    // path if room is initially empty
    const initialRoomState = emptyRoomPath(joinInfo, socket);

    if (initialRoomState) {
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.clientId = clientId;
      socket.data.displayName = displayName;
      io.to(socket.id).emit("initial-info", initialRoomState);
      return;
    }
    // ---

    // path if socket is rejoining existing room
    const roomData = getRoom(roomCode)!;
    const rejoinedResult = rejoinRoomPath(roomData, clientId);

    if (rejoinedResult) {
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.clientId = clientId;
      socket.data.displayName = rejoinedResult.displayName;
      io.to(socket.id).emit("initial-info", rejoinedResult.roomState);
      return;
    }
    // ---
    
    // path that suffixes display name if taken, also emitting a new join
    const duplicateNameResult = duplicateNamePath(roomData, clientId, roomCode, displayName);
    socket.join(roomCode);
    socket.data.roomCode = roomCode;
    socket.data.clientId = clientId;
    socket.data.displayName = duplicateNameResult.assignedDisplayName;
    io.to(roomCode).emit("new-join", duplicateNameResult.updatedRoomMembers);
    io.to(socket.id).emit("initial-info", duplicateNameResult.updatedRoomState);
    return;
    // ---
  });

  socket.on("leave-room", (leaveInfo: JoinRoomPayload) => {
    leaveRoom(leaveInfo, socket, io);
  });

  socket.on("disconnecting", () => {
    const roomCode = socket.data.roomCode;
    const clientId = socket.data.clientId;

    disconnect(roomCode, clientId, socket, io);
  })
});

io.listen(3000);