# FlowState Chatroom for Collaborative Work Sessions

FlowState is a collaborative work-sessions platform that I am currently building bit-by-bit. It will (hopefully) be a space that enhances the motivation and accountability of daily work sessions.

## Tech Stack

- React + React Router
- Node.js
- Socket.io
- React Bootstrap

## Devlog

### V3 - Room Roster and Disconnects

I've done some work on making the rooms feel more collaborative by adding a "Room Roster". This shows everyone who is with you in the room by their display name. I had to update the `RoomState` type by adding an array of `roomMembers` and passing this through to the frontend on every `new-join` and `initial-info` event. This ensures the Room Roster updates dynamically each time a room records a new member.

Secondly, I've tightened up what happens when a user disconnects from a room. I added a clean way to leave by implementing a "Leave" button, which fires a simple `leave-room` event. The backend captures this event and calls the `removeAndBroadcast()` function, which is basically just logic I wrote for removing a socket from a room that I eventually broke out into a helper. Also, I ensure that refreshes don't cause duplicate display names to randomly show in the Room Roster, as well as handling messy disconnects (when a user just closes their browser tab).

**TLDR:**

- Added live Room Roster showing who is currently in each room
- Updated shared room state to track room members dynamically
- Added leave and disconnect cleanup so Room Rosters don't go stale
- Prevented refreshes breaking Room Roster with duplicate display names
- Made various changes to types (e.g. clientId generated and stored with room state)

### History

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
