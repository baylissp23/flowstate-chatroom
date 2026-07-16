import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import { supabaseClient } from "@/client/supabaseClient";

interface AuthStoreState {
  user: User | null;
  session: Session | null,
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;

  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>()((set) => ({
  user: null,
  session: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, user: session?.user || null }),
  setLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    await supabaseClient.auth.signOut();
    set({ user: null, session: null });
  }
}));
