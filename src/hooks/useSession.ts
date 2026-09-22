import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface SessionState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  emailVerified: boolean;
}

/** Client-side session state for header affordances and action gating. */
export function useSession(): SessionState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const user = session?.user ?? null;
  return {
    session,
    user,
    loading,
    emailVerified: Boolean(user?.email_confirmed_at || user?.confirmed_at || user?.phone_confirmed_at),
  };
}
