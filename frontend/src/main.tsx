import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import "bootswatch/dist/litera/bootstrap.css";
import { supabaseClient } from "./client/supabaseClient";
import { useAuthStore } from "./store/useAuthStore";
import { socket } from "./client/client";

let isInitialized = false;

supabaseClient.auth.onAuthStateChange((event, session) => {
  useAuthStore.getState().setSession(session);
  socket.auth = { token: session?.access_token || null };

  if (!isInitialized) {
    isInitialized = true;
    useAuthStore.getState().setLoading(false);
    socket.connect();
  } else if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
    socket.disconnect().connect();
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
