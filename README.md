# FlowState Chatroom for Collaborative Work Sessions

FlowState is a collaborative work-sessions platform that I am currently building bit-by-bit. It will (hopefully) be a space that enhances the motivation and accountability of daily work sessions.

## Tech Stack

- React + React Router
- Node.js
- Socket.io
- React Bootstrap

## Devlog

### V8 - Redis Migration

Over the past week (but mostly this evening) I have been iteratively working on converting in-memory room states to a persistent Redis store to support scaling the application when it comes to deployment. This will allow me to run multiple server instances behind a load balancer, with each of these servers sharing the Redis store.

I also integrated the `socket.io` Redis adapter to distribute traffic across multiple server instances so the app is ready for scaling, and made sure all timer logic is completely stateless (other than reload grace periods for now).

Through using Google Gemini to conduct a security check over my code, I found there was a severe vulnerability in room admin actions. The vulnerability meant that an admin of Room A could spoof themselves as an admin of Room B and successfully carry out admin actions in Room B. I closed this vulnerability by verifying room codes sent by the client are checked to match the socket's authenticated room context.

**TLDR:**
- Migrated in-memory room metadata and chat logs to Redis Hashes and Lists.
- Added `@socket.io/redis-adapter` to support future multi-server load balancing.
- Shifted the timer from a database-ticking interval to a stateless client-side calculation using `startTime` timestamps.
- Secured socket actions against administrative cross-room spoofing.

### History

<details>

<summary><b>V7 - UI Rework and Bug Hunting</b></summary>

Today I did some work on making FlowState feel more like a collaborative productivity platform. While I was originally planning on using `tailwindcss` with the `shadcn` components library to do this, I decided to just fiddle around with Bootstrap a little bit. The UI now has a nice dark mode feel with blue accents. I used AI models quite a bit to help me through creating complicated CSS, like text gradients, breathing borders, and the floating pill navbar, since I have little knowledge of creating custom styles. There is still some work to do (especially with keeping the app responsive on smaller screens), but overall, the app looks a lot nicer and much more cohesive!

I also did a little bug hunting, and I've collated together a list of bugs that I will be fixing over the next little while:

- ~~When an admin user ends a room and someone else joins a new room with the same room code as the deleted room, the timer will not start correctly.~~
- Chat function can be hacked with a simple Inspect, allowing users to chat without break phase. This has been unintentionally useful when I want to test things related to the chat, but I will be fixing this before deployment.
- ~~"Start" and "Pause" states on the related admin action button sometimes get swapped.~~

There are probably more bugs I have missed, and I will be hunting for more while I continue to develop FlowState to ensure the platform is as robust as possible before deployment.

**TLDR:**

- UI rework completed with Bootstrap (originally planned to use tailwind); new dark-charcoal + blue theme
- Found new bugs that need to be fixed
- Continually working on finding other bugs in the application, staying vigilant!

</details>

<details>

<summary><b>V6 - Admin Permissions and MVP Complete!</b></summary>

Today finally marks the completion of the initial Minimum Viable Product I set out for FlowState. I implemented some of my original plans a bit differently than I expected to, but overall, FlowState is now at stage where it has some proper utility.

I did some work on adding "Admin" and "Member" roles to rooms. All actions that admins have access to are validated in the backend to stop users forging socket events to change their permissions to admin. Rooms now begin with the timer paused. As an admin, you can start the room timer, pause it, pass admin status to a different member, or end the room.

I also implemented a brief fix – I noticed that when an admin user refreshes their page, they lose admin status, which means no one in the room is an admin anymore. I fixed this by adding a grace period of `3000ms`, so that users stick around in the room for a short time and can grab their permissions back if they perform a refresh.

Hacking the chat field by simply changing the `textarea`'s `disabled` field is still a known issue which I need to get around to fixing.

Another known issue: if the room admin leaves, it is not currently passed to a new user.

**TLDR:**

- Added "admin" and "member" permissions to rooms
- Added admin actions allowing admins to start and pause the timer, pass admin status, and end rooms
- Fixed admin status being lost when you refresh a room
- Hacking the chat field with a simple Inspect is still a known issue
- Admin status not being automatically passed on when admin leaves is a known issue
- MVP complete!

</details>

<details>

<summary><b>V5 - Chat Locking/Unlocking</b></summary>

I have implemented the chat locking functionality when a room is in "focus" mode. This means that, when the Pomodoro focus timer is active, no one in the room can send any messages. Right now, this is only dealt with on the frontend, so there will be ways to circumvent the chat lock using Inspect in the browser, but I am looking at the best way to prevent this by using some validation in the backend. When the focus timer finishes, a break timer begins, and the chat is unlocked.

**Other Considerations:**

As I am getting closer to completing the MVP for FlowState, I have considered refactoring and totally redesigning the UI at some stage to be more characteristic of a focussed work platform. At the moment, the UI uses `react-bootstrap`, which has been great for rapid development. However, I don't like the opinionated cookie-cutter vibe of it as it doesn't really give off "this is a platform for focussed work".

Therefore, I will be re-doing the UI using `tailwindcss` once the MVP is complete, more specifically using the `shadcn` components library. I will aim for a minimalist and clean user interface to minimise distractions.

**TLDR:**

- Implemented chat locking/unlocking depending on timer phase
- Implemented dedicated break timer in rooms
- Considered UI refactor using `shadcn`.

</details>

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
