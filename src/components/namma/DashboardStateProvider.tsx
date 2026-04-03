"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/authStore";
import type { Policy, Worker } from "@/lib/supabase/types";

type DashboardState = {
  worker: Worker | null;
  policy: Policy | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const Ctx = createContext<DashboardState | null>(null);

export function DashboardStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const workerId = useAuthStore((s) => s.workerId);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!workerId) {
      setWorker(null);
      setPolicy(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: w, error: wErr } = await supabase
        .from("workers")
        .select("*")
        .eq("id", workerId)
        .maybeSingle();
      if (wErr) throw wErr;
      setWorker(w as Worker);

      const { data: p, error: pErr } = await supabase
        .from("policies")
        .select("*")
        .eq("worker_id", workerId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (pErr) throw pErr;
      setPolicy(p as Policy | null);
    } catch (e) {
      console.error(e);
      setError("Could not load profile");
      setWorker(null);
      setPolicy(null);
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!workerId) return;
    const ch = supabase
      .channel(`worker-${workerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workers",
          filter: `id=eq.${workerId}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object") {
            setWorker(payload.new as Worker);
          }
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [workerId]);

  const value = useMemo(
    () => ({ worker, policy, loading, error, refresh }),
    [worker, policy, loading, error, refresh]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDashboardState() {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error("useDashboardState outside DashboardStateProvider");
  }
  return v;
}
