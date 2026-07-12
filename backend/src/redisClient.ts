import { createClient } from "redis";

export const pubClient = createClient({ url: "redis://localhost:6379" });
export const subClient = pubClient.duplicate();

pubClient.on("error", (err) => console.error("Redis pubClient error", err));
subClient.on("error", (err) => console.error("Redis subClient error", err));

await Promise.all([
    pubClient.connect(),
    subClient.connect()
])