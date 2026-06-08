# Product Requirements Document (PRD)

**Project Name:** FlowState (Synchronized Co-Working Lounge)
**Version:** 1.0.0

## 1. Overview & Vision

FlowState is a real-time, synchronized study and co-working application. Unlike standard chat applications, FlowState is designed to facilitate deep work through server-controlled state modifiers. Users join distinct "Lounges" (rooms) governed by a synchronized Pomodoro timer. When the timer is active, the entire room is forced into "Focus Mode," temporarily disabling distractions and enabling productivity tools (like a Lo-Fi player).

## 2. Target Audience

- Students forming remote study groups.
- Developers or freelancers participating in co-working sessions.
- Anyone seeking external accountability for focused productivity sprints.

## 3. Technical Stack

- **Frontend:** React (Vite), TypeScript, Tailwind CSS v4.
- **Backend:** Node.js, Express.
- **Real-Time Engine:** Socket.io.
- **State Management (Frontend):** React Context API or Zustand (recommended).
- **Storage (Optional for V1):** In-memory Map (for active rooms/users), MongoDB (for persistent user stats or room history).

## 4. Core System Architecture

### 4.1 Client-Server Communication

The application relies heavily on an event-driven WebSocket architecture rather than a standard REST API.

- The frontend emits action events (`join_room`, `send_message`, `start_timer`).
- The backend maintains the authoritative state and broadcasts update events (`timer_tick`, `room_state_update`, `receive_message`).

### 4.2 Server-Side Timer Mechanism

To prevent client-side desync due to lag or page refreshes, the countdown timer exists entirely on the Node backend.

- The backend initiates a `setInterval` for the specific room.
- Every 1000ms, the server broadcasts the remaining time to all clients in that specific Socket.io room.
- When a new user joins an active room, they immediately receive the current server time tick, ensuring instantaneous synchronization.

### 4.3 Room State Management

Each room holds a complex state object on the server:

```typescript
interface RoomState {
  id: string;
  adminId: string;
  users: User[];
  timerState: "IDLE" | "FOCUS" | "BREAK";
  remainingSeconds: number;
}
```

## 5. Key Features (V1)

1. **Lounge Creation & Joining:** Users can create a new named room or join an existing one. The creator becomes the Room Admin.
2. **Synchronized Pomodoro:** Admin controls the start/stop of the 25-minute focus timer and 5-minute break timer.
3. **Focus Mode:** When `timerState === 'FOCUS'`, the frontend dynamically reacts:
   - Chat input is disabled.
   - Incoming messages are hidden or muted.
   - A synchronized Lo-Fi audio stream becomes available/starts.
4. **Basic Text Chat:** Available only during `IDLE` or `BREAK` states.

## 6. Out of Scope (For V1)

- User authentication/passwords (users can just pick a display name per session).
- Video/Voice streaming (too complex for V1; focus on text and synchronized states).
- Persistent friend lists or direct messaging.
