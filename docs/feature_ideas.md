# FlowState Proposed Feature Ideas

This document outlines proposed feature additions for FlowState, ordered by collaborative and interactive impact.

---

## 1. Interactive Break Icebreakers (Idea #4)

### Description
To encourage active socializing during the 5-minute break when chat unlocks, the room transitions into a lightweight collaborative space.

### Core Mechanics
*   **Icebreaker of the Session**: The server selects a random icebreaker question when entering a break (e.g., "What's the best piece of advice you've ever received?").
*   **Collaborative Canvas**: A simple real-time whiteboard canvas appears where all members can doodle or add sticky notes.
*   **Mini Game**: A quick co-op clicker game or trivial challenge to let off steam.

### Architectural Considerations
*   These components are mounted only when `phase === "break"`.
*   Needs a Socket.io namespace or event channels specifically active during the break duration to broadcast canvas coordinates or inputs.
*   All break-related states must be garbage collected in the backend when transitioning back to `focus`.

---

## 2. Integrated Synchronized Lo-Fi Player (Idea #3)

### Description
An integrated ambient player that synchronizes audio playback across all participants in a room.

### Core Mechanics
*   **Station Selection**: Admins select from curated ambient tracks or Lo-Fi streams (e.g., Rain, Cafe Noise, Synthwave).
*   **State Sync**: The playback state (play, pause, track URI, elapsed time) is synchronized server-side.
*   **Auto-Fade**: The player fades audio in automatically during `focus` mode and switches to gentle notification tones or fades out when `break` mode starts.

### Architectural Considerations
*   Store the current playback track and the `startTime` in the Redis room metadata.
*   When a client joins, they pull the playback information and align their audio playback position using a library like Howler.js or standard Web Audio.
*   Note browser auto-play restrictions: the client must make at least one user gesture in the lounge before auto-playback can begin.

---

## 3. Group Milestones & Room Statistics (Idea #2)

### Description
A system to gamify collaborative work sessions, tracking the accumulated focus time of the entire room.

### Core Mechanics
*   **Accumulated Focus**: Display total "Focus Minutes" completed by all current and past members of the lounge during the session.
*   **Milestone Milestones**: Celebrate room milestones (e.g., "100 total focus minutes completed!") with screen-wide effects like confetti.
*   **Visual Badges**: Users receive temp badges next to their roster names based on consecutive Pomodoro rounds completed.

### Architectural Considerations
*   Store room-wide stats (e.g., total focus minutes) within the Redis room metadata hash.
*   Every time `tickEach` processes a successful transition from `focus` to `break`, increment the focus counters.

---

## 4. Shared Task Boards & Checklists (Idea #1)

### Description
Allowing users to declare their goals for the session, enhancing social accountability.

### Core Mechanics
*   **Personal Todo Lists**: Each member has a checklist inside the room panel showing what they're working on.
*   **Live Status update**: The room roster displays a badge next to each user representing their current primary task (e.g., "Alice: *Drafting PRD*") and progress status (e.g., `1/3 tasks done`).
*   **Celebration Events**: When someone checks off a task, a subtle visual ping notifies the roster.

### Architectural Considerations
*   Store task lists in a Redis Hash keyed by `roomCode:tasks:clientId`.
*   Emit Socket.io events (`add-task`, `toggle-task`, `delete-task`) to update list states.
*   Ensure cleanup logic deletes the task hash when a room is destroyed or empty.

---

## 5. User Accounts, Authentication & Persistent Stats (Idea #5)

### Description
Introduce persistent user accounts and authentication to allow users to save their session history, track individual focus stats over time, and build long-term gamified milestones.

### Core Mechanics
*   **Sign Up / Login**: Standard email/password or OAuth registration to identify returning users.
*   **User Dashboard**: A profile area showing individual lifetime focus hours, work streaks (daily/weekly), and completed task histories.
*   **Persistent Badges & Customization**: Unlocked visual theme modifiers or unique avatar borders that carry over from session to session.
*   **Leaderboards**: Daily or weekly leaderboards for the most focused users.

### Architectural Considerations
*   Requires a persistent transactional database (e.g., PostgreSQL or MongoDB) for user models and historical stats, keeping Redis dedicated to transient real-time state.
*   A new authentication layer utilizing JWTs. Passwords must be securely hashed (e.g., using `bcrypt`).
*   Socket.io handshake middleware to validate the JWT, binding authenticated user IDs directly to socket sessions instead of generic client IDs.
