# Implementation Plan: User Accounts, Authentication & Persistent Stats (Idea #5)

This document outlines the detailed architectural and implementation plan for adding user authentication and persistent user stats to FlowState using **Supabase** and our **Socket.io** backend.

---

## 1. Overview & Strategy

*   **Authentication Provider:** Supabase Auth. We will start with standard **Email/Password** authentication, designed to easily extend to **Google & Apple OAuth** later.
*   **Database:** Supabase PostgreSQL. This provides robust relational schema integrity for stats, streaks, and user-to-session mappings.
*   **Guest vs. Authenticated Dual Support:**
    *   **Authenticated Users:** Log in via Supabase, have persistent profiles, and gain access to lifetime analytics, leaderboards, and streaks.
    *   **Guest Users:** Can join rooms immediately with just a display name. Their session details remain transient, and no stats are recorded in the database.
*   **Backend Server Merger:** The backend will be refactored to share a single port (3000) for both Express HTTP routing (e.g., auth check endpoints) and Socket.io WebSocket connections.
*   **Token Protocol:** The frontend handles signup and login with the Supabase client, receives a JWT access token, and sends this token in the Socket.io handshake. The backend validates this token locally using the Supabase JWT Secret.
*   **Stat Logging:** When a focus session finishes, the Socket.io server (as the source of truth) updates the logged-in users' focus statistics in PostgreSQL, while ignoring guest connections.

---

## 2. System Architecture & Flow

```
┌────────────────┐      (1) Sign in / Auth       ┌────────────────┐
│   React App    │ ────────────────────────────> │  Supabase Auth │
│   (Frontend)   │ <──────────────────────────── │   (Identity)   │
└────────────────┘         JWT Access Token      └────────────────┘
        │
        │ (2) Connect with Socket
        │     & send JWT Token
        ▼
┌────────────────┐      (3) Verify JWT locally   ┌────────────────┐
│ Socket.io/Expr │ ────────────────────────────> │  Supabase DB   │
│   (Backend)    │ <──────────────────────────── │  (PostgreSQL)  │
└────────────────┘      (4) Save stats/milestones└────────────────┘
```

1.  **Authentication:** The frontend authenticates directly with Supabase Auth.
2.  **Socket Handshake:** The frontend establishes a Socket.io connection. If authenticated, it passes the JWT in the `auth` payload. If guest, `token` is omitted:
    ```javascript
    const socket = io("http://localhost:3000", {
      auth: {
        token: supabaseSession?.access_token || null
      }
    });
    ```
3.  **Local JWT Verification / Handshake Route:** The backend extracts the token.
    *   If present and valid, it decodes it using the project's Supabase `JWT_SECRET`, extracts the user's UUID, and sets `socket.data.userId` and `socket.data.isGuest = false`.
    *   If missing, it marks `socket.data.isGuest = true` and proceeds.
4.  **Authorized Event Handling:** Subsequent socket actions read `socket.data.isGuest` to decide whether to record statistics or allow access to personalized features.

---

## 3. Database Schema

We will configure PostgreSQL tables inside the `public` schema in our Supabase instance.

### A. Profiles / Stats Table (`public.user_stats`)
This table holds lifetime progress and current streaks, tied directly to the `auth.users` table managed by Supabase.

```sql
create table public.user_stats (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  avatar_url text,
  total_focus_minutes integer default 0 not null,
  completed_pomodoros integer default 0 not null,
  current_streak_days integer default 0 not null,
  last_active_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### B. Auto-Profile Creation Trigger
To ensure a `user_stats` profile row is created automatically whenever a new user registers:

```sql
-- Create a function to handle new user signups
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_stats (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'Focus Member'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function after any new signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 4. Backend Refactoring

### A. Unified Server (Express + Socket.io)
We will rewrite `backend/src/index.ts` to combine Express and Socket.io onto a single HTTP server:

```typescript
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// HTTP API Routes (for user metrics, profiles, health checks)
app.get("/api/profile/:userId", async (req, res) => { /* ... */ });

// Start combined server
httpServer.listen(3000, () => {
  console.log("Server listening on port 3000");
});
```

### B. Socket.io JWT Authentication Middleware
Create a middleware (`backend/src/middleware/authMiddleware.ts`) to authenticate connecting sockets locally using the Supabase `JWT_SECRET`:

```typescript
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

export const authenticateSocket = (socket: any, next: (err?: any) => void) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    // If no token is provided, we can either reject or treat them as a guest user
    socket.data.isGuest = true;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as { sub: string; email?: string };
    socket.data.userId = decoded.sub; // Decoded 'sub' is the Supabase auth.users UUID
    socket.data.isGuest = false;
    next();
  } catch (err) {
    return next(new Error("Authentication failed: invalid token"));
  }
};
```

---

## 5. Frontend Refactoring

### A. Client Configuration
Initialize the Supabase client on the client-side (`frontend/src/client/supabaseClient.ts`):

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### B. Authentication State Management (Zustand)
Update/extend our Zustand stores to maintain user profile and token details:

```typescript
import { create } from "zustand";
import { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null, token: string | null) => void;
  logout: () => Promise<void>;
}
```

---

## 6. Implementation Roadmap

### Phase 1: Supabase Setup
- [ ] Create a new Supabase Project.
- [ ] Set up the `user_stats` table in Postgres.
- [ ] Set up the trigger to copy user info from `auth.users` to `public.user_stats`.
- [ ] Gather `SUPABASE_JWT_SECRET`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`.

### Phase 2: Backend Core Integration
- [ ] Install packages: `jsonwebtoken` and dev-dependencies `@types/jsonwebtoken`.
- [ ] Refactor `backend/src/index.ts` to use a combined Express/Socket HTTP server.
- [ ] Write the Socket.io JWT authentication middleware.
- [ ] Implement database client logic in backend (using `@supabase/supabase-js` or direct PostgreSQL connection) to query and update user stats.

### Phase 3: Frontend Pages & Auth State
- [ ] Install `@supabase/supabase-js` in the frontend directory.
- [ ] Build `/login` and `/signup` views using Bootstrap.
- [ ] Create the Zustand authentication store to track sessions.
- [ ] Adjust the socket setup inside React to attach the JWT token in `auth.token`.

### Phase 4: Pomodoro Stats Logging & Dashboard
- [ ] Update `timerService.ts` to check if `socket.data.isGuest === false` before logging focus minutes to the Supabase database.
- [ ] Build a user profile dashboard `/profile` displaying:
  - Total Focus Minutes
  - Completed Pomodoros
  - Daily Streak
- [ ] Implement conditional rendering on `/profile`: if user is a guest, display a call-to-action banner (e.g., "Sign up now to track stats and compete on leaderboards!").
- [ ] Create a basic leaderboard component on the home/join screens showing only authenticated users.
