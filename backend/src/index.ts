import { Server } from "socket.io";
import type { JoinRoomPayload, RoomMember, RoomState } from "../../shared/types.js";
import type { Socket } from "socket.io";

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let roomState: Map<string, RoomState> = new Map();

function getMemberIndex(roomMembers: RoomMember[], clientId: string) {
  return roomMembers.findIndex((member) => member.clientId === clientId);
}

function getUniqueDisplayName(roomMembers: RoomMember[], displayName: string) {
  if (!roomMembers.some((member) => member.displayName === displayName)) {
    return displayName;
  }

  let count = 2;
  let candidateName = `${displayName} (${count})`;

  while (roomMembers.some((member) => member.displayName === candidateName)) {
    count += 1;
    candidateName = `${displayName} (${count})`;
  }

  return candidateName;
}

function removeAndBroadcast(roomCode : string, clientId : string, socket : Socket) {
  const roomData = roomState.get(roomCode);
  if (!roomData) {
    return;
  }

  const memberIndex = getMemberIndex(roomData.roomMembers, clientId);
  if (memberIndex === -1) {
    socket.leave(roomCode);
    return;
  }

  const updatedRoomMembers = roomData.roomMembers.filter(
    (member) => member.clientId !== clientId,
  );

  socket.leave(roomCode);

  if (updatedRoomMembers.length === 0) {
    roomState.delete(roomCode);
    return;
  }

  const updatedRoomState: RoomState = {
    ...roomData,
    roomMembers: updatedRoomMembers,
    assignedDisplayName: roomData.assignedDisplayName,
  };

  roomState.set(roomCode, updatedRoomState);
  io.to(roomCode).emit("member-left", updatedRoomMembers);
}

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
  });

  socket.on("join-room", (joinInfo: JoinRoomPayload) => {
    const { displayName, roomCode, clientId } = joinInfo;

    if (socket.rooms.has(roomCode)) {
      return;
    }

    const roomData = roomState.get(roomCode);

    if (!roomData) {
      const initialRoomState: RoomState = {
        current: 1500,
        max: 1500,
        roomMembers: [{ clientId, displayName }],
        assignedDisplayName: displayName,
      };

      roomState.set(roomCode, initialRoomState);
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.clientId = clientId;
      socket.data.displayName = displayName;
      io.to(socket.id).emit("initial-info", initialRoomState);
      return;
    }

    const existingMemberIndex = getMemberIndex(roomData.roomMembers, clientId);

    if (existingMemberIndex !== -1) {
      const existingMember = roomData.roomMembers[existingMemberIndex];
      const rejoinedRoomState: RoomState = {
        ...roomData,
        assignedDisplayName: existingMember!.displayName,
      };

      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.clientId = clientId;
      socket.data.displayName = existingMember!.displayName;
      io.to(socket.id).emit("initial-info", rejoinedRoomState);
      return;
    }

    const assignedDisplayName = getUniqueDisplayName(roomData.roomMembers, displayName);
    const updatedRoomMembers = [
      ...roomData.roomMembers,
      { clientId, displayName: assignedDisplayName },
    ];

    const updatedRoomState: RoomState = {
      ...roomData,
      roomMembers: updatedRoomMembers,
      assignedDisplayName,
    };

    roomState.set(roomCode, updatedRoomState);
    socket.join(roomCode);
    socket.data.roomCode = roomCode;
    socket.data.clientId = clientId;
    socket.data.displayName = assignedDisplayName;
    io.to(roomCode).emit("new-join", updatedRoomMembers);
    io.to(socket.id).emit("initial-info", updatedRoomState);
  });

  socket.on("leave-room", (leaveInfo: JoinRoomPayload) => {
    removeAndBroadcast(leaveInfo.roomCode, leaveInfo.clientId, socket);
  });

  socket.on("disconnecting", () => {
    const roomCode = socket.data.roomCode;
    const clientId = socket.data.clientId;

    if (!roomCode || !clientId) {
      return;
    }
    removeAndBroadcast(roomCode, clientId, socket);
  })
});

io.listen(3000);