import { Server } from "socket.io";
import type { ChatMessage, JoinRoomPayload, MessagePayload, RoomMember } from "../../shared/types.js";
import { getRoom } from "./room/roomStore.js";
import { disconnect, duplicateNamePath, emptyRoomPath, rejoinRoomPath, leaveRoom } from "./room/roomService.js";
import { tickEach } from "./room/timerService.js";
import { handleChatMessage } from "./chat/chatService.js";
import { broadcastMessage } from "./chat/chatEvents.js";
import { deleteChatHistory, getChatHistory } from "./chat/chatStore.js";
import { canEndRoom, canPauseTimer, endRoom, pauseTimer, tryAdminPromote } from "./room/permissionService.js";
import { pubClient, subClient } from "./redisClient.js";
import { createAdapter } from "@socket.io/redis-adapter";

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
  adapter: createAdapter(pubClient, subClient)
});

setInterval(() => {
  tickEach(io)
}, 1000);

io.on("connection", (socket) => {
  console.log("Connection with client established: ", socket.id);

  socket.on("join-room", async (joinInfo: JoinRoomPayload) => {
    const { displayName, roomCode, clientId } = joinInfo;

    // if socket is already in room, stop StrictMode from rejoining for no reason
    if (socket.rooms.has(roomCode)) {
      return;
    }

    // path if room is initially empty
    const initialRoomState = emptyRoomPath(joinInfo, socket);

    if (initialRoomState) {
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.clientId = clientId;
      socket.data.displayName = displayName;
      socket.data.permission = "admin";
      io.to(socket.id).emit("initial-info", { roomState: initialRoomState, permission: socket.data.permission });
      io.to(socket.id).emit("initial-messages", await getChatHistory(roomCode));
      console.log(`${displayName} joined an empty room`)
      return;
    }
    // ---

    // path if socket is rejoining existing room
    const roomData = getRoom(roomCode)!;
    const rejoinedResult = rejoinRoomPath(roomData, roomCode, clientId);

    if (rejoinedResult) {
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.clientId = clientId;
      socket.data.displayName = rejoinedResult.displayName;
      socket.data.permission = rejoinedResult.permission;
      io.to(socket.id).emit("initial-info", { roomState: rejoinedResult.roomState, permission: socket.data.permission });
      io.to(socket.id).emit("initial-messages", await getChatHistory(roomCode));
      console.log(`${displayName} rejoined a room`)
      return;
    }
    // ---

    // path that suffixes display name if taken, also emitting a new join
    const duplicateNameResult = duplicateNamePath(roomData, clientId, roomCode, displayName);
    socket.join(roomCode);
    socket.data.roomCode = roomCode;
    socket.data.clientId = clientId;
    socket.data.displayName = duplicateNameResult.assignedDisplayName;
    socket.data.permission = "member";
    io.to(roomCode).emit("new-join", duplicateNameResult.updatedRoomMembers);
    io.to(socket.id).emit("initial-messages", await getChatHistory(roomCode));
    io.to(socket.id).emit("initial-info", { roomState: duplicateNameResult.updatedRoomState, permission: socket.data.permission });
    console.log(`${socket.data.displayName} joined a room with suffix name`)
    return;
    // ---
  });

  socket.on("pass-admin", async (newAdminData: RoomMember) => {
    const promoteResult = await tryAdminPromote(socket, newAdminData.clientId, newAdminData.roomCode, newAdminData, io);

    if (!promoteResult || promoteResult.success === false) {
      return;
    }

    io.to(newAdminData.roomCode).emit("new-admin-promotion", promoteResult.updatedRoomMembers);
  });

  socket.on("pause-timer", (roomCode: string) => {
    const canPause = canPauseTimer(socket.data.permission);

    if (!canPause) {
      io.to(roomCode).emit("new-pause-request", { success: false });
      return;
    }

    const pauseResult = pauseTimer(roomCode);
    if (pauseResult === "fail") {
      io.to(roomCode).emit("new-pause-request", { success: false });
      return;
    }

    io.to(roomCode).emit("new-pause-request", {
      success: true,
      isPaused: pauseResult,
    })
  });

  socket.on("end-room", async (roomCode: string) => {
    const canEnd = canEndRoom(socket.data.permission);

    if (!canEnd) {
      io.to(roomCode).emit("room-ending", { success: false });
      return;
    }

    io.to(socket.data.roomCode).emit("room-ending", { success: true });
    io.in(socket.data.roomCode).socketsLeave(socket.data.roomCode);
    endRoom(socket.data.roomCode);
    await deleteChatHistory(socket.data.roomCode);
  });

  socket.on("leave-room", async (leaveInfo: JoinRoomPayload) => {
    leaveRoom(leaveInfo, socket, io);

    const room = getRoom(socket.data.roomCode);

    if (!room) {
      return;
    }

    if (room.roomMembers.length <= 0) {
      io.in(socket.data.roomCode).socketsLeave(socket.data.roomCode);
      await deleteChatHistory(socket.data.roomCode);
    }
  });

  socket.on("disconnecting", () => {
    const roomCode = socket.data.roomCode;
    const clientId = socket.data.clientId;

    disconnect(roomCode, clientId, socket, io);

    const room = getRoom(socket.data.roomCode);

    if (!room) {
      return;
    }

    if (room.roomMembers.length <= 0) {
      io.in(roomCode).socketsLeave(socket.data.roomCode);
    }
  });

  socket.on("send-message", async (message: MessagePayload) => {
    if (!socket.data.roomCode) {
      io.to(socket.id).emit("message-not-sent", "message not sent: socket is not in a room");
      return;
    }

    const chatMessage = await handleChatMessage(message, socket.data.roomCode, socket.data.displayName);

    if (chatMessage) {
      broadcastMessage(io, socket.data.roomCode, chatMessage)
    } else {
      io.to(socket.id).emit("message-not-sent", "message not sent: could not be validated");
    }
  });
});

io.listen(3000);