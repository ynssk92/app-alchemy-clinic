import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isAssistant: boolean;
  isStaff: boolean;
  profileStatus: "pending" | "approved" | "rejected" | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  isAdmin: false,
  isAssistant: false,
  isStaff: false,
  profileStatus: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAssistant, setIsAssistant] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  const [profileStatus, setProfileStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRole = async (uid: string) => {
    const [{ data: roles }, { data: prof }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("profiles").select("status").eq("id", uid).maybeSingle(),
    ]);
    const list = (roles || []).map((r: any) => r.role);
    setIsAdmin(list.includes("admin"));
    setIsAssistant(list.includes("assistant"));
    setIsDoctor(list.includes("doctor"));
    setProfileStatus(((prof as any)?.status as any) ?? null);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadRole(s.user.id), 0);
      } else {
        setIsAdmin(false);
        setIsAssistant(false);
        setIsDoctor(false);
        setProfileStatus(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadRole(s.user.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider value={{ user, session, isAdmin, isAssistant, isStaff: isAdmin || isAssistant || isDoctor, profileStatus, loading, signOut }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
