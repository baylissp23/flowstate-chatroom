# FlowState Chatroom for Collaborative Work Sessions

FlowState is progressing!

I have set up the fundamental client-server interactions, and the backend+frontend are now communicating with each other really well. You can now join a room (hosted locally of course, for now) and the Pomodoro timer is showed on the room view for everyone in the room.

## Tech Stack

- React + React Router
- Node.js
- Socket.io
- React Bootstrap

## Devlog

### V2 - Multi-Rooms (Current)

- Went from a single global broadcast of a simple timer in the backend to the frontend where it was displayed on the screen to private Socket.io rooms, all holding separate timers.
- React Router now handles lobby-to-room state transfers and other page routing.
- Digital Pomodoro timer is fully state-synced and even includes a nice progress-bar!

## History

<details>
<summary><b>Test App</b></summary>

The project is very barebones at the moment, with a simple client-server ping button and a countdown timer that is hosted server-side and outputted on the frontend. I will be developing this project over the next little while, so check back here for more updates!

## Intro

This project is planned to be an online co-working lounge where students, co-workers, or anyone wanting a motivating, collaborative work environment can get together and crunch their To-Do lists!

The chatroom will have a Pomodoro timer which will commence when someone in the room starts it for the first time. After the timer expires, a break will commence, and everyone in the room is free to grab a coffee, have a chat, and let off some steam before the next short session.

## More Details

For a more in-depth overview of what will go in to this project, check out the `/docs` directory in the repository to see the PRD and functional requirements documents which have been formulated by Google Gemini. These are subject to change as the project goes on.

</details>
