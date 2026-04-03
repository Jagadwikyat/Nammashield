import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";

interface AuthState {
  workerId: string | null;
  workerPhone: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarded: boolean;

  loginWithPhone: (phone: string) => Promise<void>;
  logout: () => void;
  rehydrate: () => Promise<void>;
  setOnboardingComplete: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  workerId: null,
  workerPhone: null,
  isAuthenticated: false,
  isLoading: true,
  isOnboarded: false,

  loginWithPhone: async (phone: string) => {
    set({ isLoading: true });
    try {
      // Check if worker already exists
      const { data: existing, error: fetchError } = await supabase
        .from("workers")
        .select("id, phone, is_onboarded")
        .eq("phone", phone)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let workerId: string;
      let onboarded = false;

      if (existing) {
        workerId = existing.id;
        onboarded = Boolean(existing.is_onboarded);
      } else {
        const { data: newWorker, error: insertError } = await supabase
          .from("workers")
          .insert({ phone })
          .select("id, is_onboarded")
          .single();

        if (insertError) throw insertError;
        workerId = newWorker.id;
        onboarded = Boolean(newWorker.is_onboarded);
      }

      localStorage.setItem("nammashield_worker_id", workerId);
      localStorage.setItem("nammashield_worker_phone", phone);

      set({
        workerId,
        workerPhone: phone,
        isAuthenticated: true,
        isLoading: false,
        isOnboarded: onboarded,
      });
    } catch (error) {
      console.error("Login failed:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("nammashield_worker_id");
    localStorage.removeItem("nammashield_worker_phone");
    set({
      workerId: null,
      workerPhone: null,
      isAuthenticated: false,
      isLoading: false,
      isOnboarded: false,
    });
  },

  setOnboardingComplete: () => set({ isOnboarded: true }),

  rehydrate: async () => {
    const savedId = localStorage.getItem("nammashield_worker_id");
    const savedPhone = localStorage.getItem("nammashield_worker_phone");

    if (savedId && savedPhone) {
      const { data, error } = await supabase
        .from("workers")
        .select("id, is_onboarded")
        .eq("id", savedId)
        .maybeSingle();

      if (data && !error) {
        set({
          workerId: savedId,
          workerPhone: savedPhone,
          isAuthenticated: true,
          isLoading: false,
          isOnboarded: Boolean(data.is_onboarded),
        });
        return;
      }

      localStorage.removeItem("nammashield_worker_id");
      localStorage.removeItem("nammashield_worker_phone");
    }

    set({ isLoading: false, isOnboarded: false });
  },
}));
