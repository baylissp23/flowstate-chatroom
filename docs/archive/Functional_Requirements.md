# Functional Requirements Document (FRD)

**Project Name:** FlowState (Synchronized Co-Working Lounge)

---

## Epic 1: User Onboarding and Room Management

**Description:** The system must allow users to identify themselves, create distinct environments (Lounges), and join them to interact with others.

### User Story 1.1: Setting a Display Name

**As a** user
**I want** to enter a temporary display name
**So that** other users in the Lounge know who I am.

- **Acceptance Criteria:**
  - **Given** I navigate to the application's root URL, **When** the page loads, **Then** I am presented with an input field for a "Display Name".
  - **Given** the display name input is empty, **When** I attempt to proceed, **Then** the submit button is disabled or shows a validation error.
  - **Given** I have entered a valid string, **When** I click submit, **Then** my name is stored in local client state and I proceed to the room selection screen.

### User Story 1.2: Joining a Lounge

**As a** user
**I want** to enter a specific room name
**So that** I can join my friends in an isolated environment.

- **Acceptance Criteria:**
  - **Given** I am on the room selection screen, **When** I type a room name (e.g., "MathStudy") and click "Join", **Then** a socket connection is established and I emit a `join_room` event to the server.
  - **Given** I join a room successfully, **When** the server confirms, **Then** the UI navigates to the specific Lounge view.
  - **Given** I am the first person to join a uniquely named room, **When** the room is created on the server, **Then** I am assigned the "Admin" role for that room.
  - **Given** I join an existing room, **When** I connect, **Then** I receive the current `RoomState` from the server immediately (including existing users and current timer status).

---

## Epic 2: The Synchronized Timer (Server-Side)

**Description:** The core mechanic of the application. The timer must be globally synchronized and dictate the state of the room.

### User Story 2.1: Starting the Timer (Admin Only)

**As a** Room Admin
**I want** to click a "Start Focus" button
**So that** the Pomodoro session begins for everyone in the room.

- **Acceptance Criteria:**
  - **Given** I am an Admin, **When** I view the Lounge, **Then** I see the timer control buttons (Start/Stop).
  - **Given** I am a standard participant, **When** I view the Lounge, **Then** the timer control buttons are hidden or disabled.
  - **Given** the Admin clicks "Start Focus", **When** the event reaches the server, **Then** the server sets the room's `timerState` to `FOCUS` and begins the interval countdown from 25 minutes.

### User Story 2.2: Viewing the Timer

**As a** Lounge participant
**I want** to see the timer ticking down in real-time
**So that** I know exactly how much time is left in the current phase.

- **Acceptance Criteria:**
  - **Given** the server interval is running, **When** the server emits a `timer_tick` event, **Then** my frontend updates the displayed time format (MM:SS).
  - **Given** I join a room where a timer is already at 12:34, **When** my initial connection resolves, **Then** my screen immediately displays 12:34 without waiting for a full cycle.

---

## Epic 3: Focus Mode State Modifiers

**Description:** The dynamic UI changes that occur based on the server's timer state.

### User Story 3.1: Entering Focus Mode

**As a** Lounge participant
**I want** the chat interface to lock automatically when a focus session starts
**So that** I am not distracted by incoming messages.

- **Acceptance Criteria:**
  - **Given** the room is in an `IDLE` state, **When** the server broadcasts a `timerState` change to `FOCUS`, **Then** the chat input field becomes `disabled`.
  - **Given** the state is `FOCUS`, **When** the state change occurs, **Then** the UI applies a visual overlay or blur to the chat history area.
  - **Given** the state is `FOCUS`, **When** the state change occurs, **Then** a visual indicator (e.g., a "Focusing" badge) appears on the screen.

### User Story 3.2: Transitioning to Break Mode

**As a** Lounge participant
**I want** the chat to unlock automatically when the timer hits zero
**So that** I can socialize during the 5-minute break.

- **Acceptance Criteria:**
  - **Given** the server timer reaches `0`, **When** the server processes the tick, **Then** the server broadcasts a `timerState` change to `BREAK` and resets the interval to 5 minutes.
  - **Given** the client receives the `BREAK` state, **When** the frontend updates, **Then** the chat input becomes active again.
  - **Given** the client receives the `BREAK` state, **When** the frontend updates, **Then** the UI plays a soft notification chime alerting users the break has started.
