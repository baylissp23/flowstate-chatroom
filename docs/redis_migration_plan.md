# Redis Migration Task List

- [ ] Setup & Infrastructure
  - [ ] Install `redis` and `@socket.io/redis-adapter` dependencies in `backend/package.json`
  - [ ] Start a local Redis instance using Docker or local installation
- [ ] Initialize Redis Clients
  - [ ] Create `backend/src/redisClient.ts` to manage Redis connections
    * **How Redis Handles Connection:** Before performing operations, you must connect a client instance to the Redis server.
    ```typescript
    import { createClient } from "redis";
    export const redisClient = createClient({ url: "redis://localhost:6379" });
    redisClient.on("error", (err) => console.error("Redis Client Error", err));
    await redisClient.connect();
    ```
    * **Why this works:** The `redis` npm package provides `createClient` to manage the TCP socket connection and automatically queues commands until the connection is established.
    * **Why we did it this way:** Creating a single client instance and exporting it allows us to share a single connection pool across different store files.
    * **Alternatives:** You could use `ioredis`, another popular Node.js library. We use the official `redis` package because it matches modern TypeScript patterns well and is highly integrated with the Socket.io adapter.
  - [ ] Configure Socket.io to use the Redis adapter in `backend/src/index.ts`
- [ ] Migrate Chat Store
  - [ ] Rewrite `backend/src/chat/chatStore.ts` to utilize Redis lists (`rPush`, `lRange`, `del`) asynchronously
    * **How Redis Handles Lists:** An ordered collection of string elements. Perfect for chronological chat messages.
    ```typescript
    // Append a new message to the list
    const messageJSON = JSON.stringify({ sender: "Paul", text: "Hello!" });
    await redisClient.rPush("room:ABC:messages", messageJSON);

    // Retrieve all messages from start (0) to end (-1 means last item)
    const rawMessages = await redisClient.lRange("room:ABC:messages", 0, -1);
    const messages = rawMessages.map(msg => JSON.parse(msg));
    ```
    * **Why this works:** `rPush` appends elements to the right (end) of the list. `lRange` retrieves a sub-range of the list. Index `-1` represents the last item, making it easy to fetch the entire list.
    * **Why we did it this way:** Using a list preserves the exact chronological order of chat messages without requiring sorting logic. Serializing objects to JSON is standard since Redis stores string values.
    * **Alternatives:** You could store each chat message as an independent key, but that would make fetching history very slow and disjointed.
  - [ ] Update usages in `backend/src/chat/chatService.ts` and `backend/src/index.ts`
- [ ] Migrate Room Store
  - [ ] Rewrite `backend/src/room/roomStore.ts` to utilize Redis hashes (`hSet`, `hGetAll`, `hDel`)
    * **How Redis Handles Hashes:** Maps between string fields and string values. Perfect for representing objects (like Room metadata).
    ```typescript
    // Set field-value pairs in a hash
    await redisClient.hSet("room:ABC:meta", {
      current: "1500",
      phase: "focus",
      isPaused: "true"
    });

    // Retrieve all fields from the hash
    const meta = await redisClient.hGetAll("room:ABC:meta");
    console.log(meta.phase); // "focus"
    ```
    * **Why this works:** `hSet` writes key-value properties to a Redis Hash structure. `hGetAll` retrieves all properties as a Javascript object. Note that Redis Hash values must be strings, so boolean or number values get converted.
    * **Why we did it this way:** Hashes allow you to read or update specific fields (like toggling `isPaused`) without having to fetch, deserialize, and rewrite the entire room object, reducing race conditions.
    * **Alternatives:** You could store the entire room object as a single stringified JSON under a string key (`set("room:ABC", json)`), but it is harder to perform partial updates concurrently.
  - [ ] Make `roomStore` operations asynchronous
  - [ ] Refactor dependent functions in `backend/src/room/roomService.ts` and `backend/src/room/permissionService.ts`
- [ ] Timer Synchronization
  - [ ] Implement selected strategy (Timestamp-based or locking) in `timerService.ts`
  - [ ] Update frontend timer state listeners (if using Timestamp-based)
- [ ] Verification
  - [ ] Spin up dual server instances locally
  - [ ] Verify chat, joining, and timer state synchronization
