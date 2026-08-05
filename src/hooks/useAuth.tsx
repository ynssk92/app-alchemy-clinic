import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "patient" | "doctor" | "admin" | "assistant" | null;

type AuthCtx = {
  user: User | null;
  session: Session | null;
  role: UserRole;
  isAdmin: boolean;
  isAssistant: boolean;
  isDoctor: boolean;
  isPatient: boolean;
  isStaff: boolean;
  roleText: string | null;
  profileStatus: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  role: null,
  isAdmin: false,
  isAssistant: false,
  isDoctor: false,
  isPatient: false,
  isStaff: false,
  roleText: null,
  profileStatus: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAssistant, setIsAssistant] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  const [isPatient, setIsPatient] = useState(false);
  const [profileStatus, setProfileStatus] = useState<"active" | "inactive" | "blocked" | "pending" | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRole = async (uid: string) => {
    try {
      const { data: prof, error: profError } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", uid)
        .maybeSingle();

      if (profError) throw profError;

      const userRole = prof?.role as UserRole;
      setRole(userRole);
      setIsAdmin(userRole === "admin");
      setIsAssistant(userRole === "assistant");
      setIsDoctor(userRole === "doctor");
      setIsPatient(userRole === "patient");
      setProfileStatus(prof?.status as any || null);
    } catch (error) {
      console.error("Error loading profile role:", error);
    }
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadRole(s.user.id), 0);
      } else {
        setRole(null);
        setRoleText(null);
        setIsAdmin(false);
        setIsAssistant(false);
        setIsDoctor(false);
        setIsPatient(false);
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
    <Ctx.Provider value={{ user, session, role, isAdmin, isAssistant, isDoctor, isPatient, isStaff: isAdmin || isAssistant || isDoctor, roleText, profileStatus, loading, signOut }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
