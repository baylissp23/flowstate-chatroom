# FlowState Chatroom for Collaborative Work Sessions

FlowState is a collaborative work-sessions platform that I am currently building bit-by-bit. It will (hopefully) be a space that enhances the motivation and accountability of daily work sessions.

## Tech Stack

- React + React Router
- Node.js
- Socket.io
- React Bootstrap

## Devlog

### V5 - Chat Locking/Unlocking

I have implemented the chat locking functionality when a room is in "focus" mode. This means that, when the Pomodoro focus timer is active, no one in the room can send any messages. Right now, this is only dealt with on the frontend, so there will be ways to circumvent the chat lock using Inspect in the browser, but I am looking at the best way to prevent this by using some validation in the backend. When the focus timer finishes, a break timer begins, and the chat is unlocked.

**Other Considerations:**

As I am getting closer to completing the MVP for FlowState, I have considered refactoring and totally redesigning the UI at some stage to be more characteristic of a focussed work platform. At the moment, the UI uses `react-bootstrap`, which has been great for rapid development. However, I don't like the opinionated cookie-cutter vibe of it as it doesn't really give off "this is a platform for focussed work".

Therefore, I will be re-doing the UI using `tailwindcss` once the MVP is complete, more specifically using the `shadcn` components library. I will aim for a minimalist and clean user interface to minimise distractions.

**TLDR:**

- Implemented chat locking/unlocking depending on timer phase
- Implemented dedicated break timer in rooms
- Considered UI refactor using `shadcn`.

### History

<details>

<summary><b>V4 - Room Chat</b></summary>

I'm getting closer to finishing the MVP for FlowState!

I've now got the foundations of the room chat working. I've done some testing on this – you can now open multiple tabs, join the same room, and chat to yourself from each of the tabs. Chat history is also available to anyone who joins a room late, or if a user refreshes the page, which I faced some challenges with. My solution was to just remount the chat component (using a dynamic key) whenever the number of messages changes in the frontend messages state, and also pull the message history from the backend using an `initial-messages` event which the socket captures from the server.

Messages themselves are validated in quite a robust fashion. Users can't send empty messages, or messages that just consist of whitespace. Before I deploy the app I will also be making sure there are no malicious injection threats with the chat function.

Furthermore, I also tried to keep the backend code for the chat function modular, by splitting logic into three modules: `chatService`, `chatStore`, and `chatEvents`. The service handles validation of chats, while the store holds the all the chat rooms privately and exports public functions to mutate them. Currently, `chatEvents` just emits a `new-message` event to the corresponding room so it can be rendered on the screen for all other users, but eventually this will house chat room locking functionality while the Pomodoro focus timer is active.

**TLDR:**

- Added live room-to-room chat
- Added chat history for late joiners
- Ensured chat refresh recovery
- Added sender highlighting so the user knows which messages they sent at a glance
- Empty and whitespace messages are rejected
- Still want to tighten security before deployment

</details>

<details>

<summary><b>V3 - Room Roster and Disconnects</b></summary>

I've done some work on making the rooms feel more collaborative by adding a "Room Roster". This shows everyone who is with you in the room by their display name. I had to update the `RoomState` type by adding an array of `roomMembers` and passing this through to the frontend on every `new-join` and `initial-info` event. This ensures the Room Roster updates dynamically each time a room records a new member.

Secondly, I've tightened up what happens when a user disconnects from a room. I added a clean way to leave by implementing a "Leave" button, which fires a simple `leave-room` event. The backend captures this event and calls the `removeAndBroadcast()` function, which is basically just logic I wrote for removing a socket from a room that I eventually broke out into a helper. Also, I ensure that refreshes don't cause duplicate display names to randomly show in the Room Roster, as well as handling messy disconnects (when a user just closes their browser tab).

**TLDR:**

- Added live Room Roster showing who is currently in each room
- Updated shared room state to track room members dynamically
- Added leave and disconnect cleanup so Room Rosters don't go stale
- Prevented refreshes breaking Room Roster with duplicate display names
- Made various changes to types (e.g. clientId generated and stored with room state)

</details>

<details>
<summary><b>V2 - Multi-Rooms</b></summary>

- Went from a single global broadcast of a simple timer in the backend to the frontend where it was displayed on the screen to private Socket.io rooms, all holding separate timers.
- React Router now handles lobby-to-room state transfers and other page routing.
- Digital Pomodoro timer is fully state-synced and even includes a nice progress-bar!

</details>

<details>
<summary><b>V1 - Test App</b></summary>

The project is very barebones at the moment, with a simple client-server ping button and a countdown timer that is hosted server-side and outputted on the frontend. I will be developing this project over the next little while, so check back here for more updates!

## Intro

This project is planned to be an online co-working lounge where students, co-workers, or anyone wanting a motivating, collaborative work environment can get together and crunch their To-Do lists!

The chatroom will have a Pomodoro timer which will commence when someone in the room starts it for the first time. After the timer expires, a break will commence, and everyone in the room is free to grab a coffee, have a chat, and let off some steam before the next short session.

## More Details

For a more in-depth overview of what will go in to this project, check out the `/docs` directory in the repository to see the PRD and functional requirements documents which have been formulated by Google Gemini. These are subject to change as the project goes on.

</details>
