import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  getDashboardByRole: (role: UserRole) => string;
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
  getDashboardByRole: () => "/auth",
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAssistant, setIsAssistant] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  const [isPatient, setIsPatient] = useState(false);
  const [roleText, setRoleText] = useState<string | null>(null);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getDashboardByRole = useCallback((r: UserRole) => {
    switch (r) {
      case "admin":
      case "doctor":
      case "assistant":
        return "/admin";
      case "patient":
        return "/patient-dashboard";
      default:
        return "/auth";
    }
  }, []);

  const loadRole = async (uid: string) => {
    try {
      const { data: prof, error: profError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();

      if (profError) throw profError;

      const userRole = (prof as any)?.role as UserRole;
      const status = (prof as any)?.status;
      
      setRole(userRole);
      setRoleText((prof as any)?.role || null);
      setIsAdmin(userRole === "admin");
      setIsAssistant(userRole === "assistant");
      setIsDoctor(userRole === "doctor");
      setIsPatient(userRole === "patient");
      setProfileStatus(status || null);
      
      return { userRole, status };
    } catch (error) {
      console.error("Error loading profile role:", error);
      return { userRole: null, status: null };
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(s);
      setUser(s?.user ?? null);
      
      if (s?.user) {
        await loadRole(s.user.id);
      }
      
      setLoading(false);
    };

    initialize();

    const { data: sub } = supabase.auth.onAuthStateChange(async (evt, s) => {
      if (!mounted) return;

      setSession(s);
      setUser(s?.user ?? null);

      if (evt === "SIGNED_IN" && s?.user) {
        setLoading(true);
        const { userRole, status } = await loadRole(s.user.id);
        
        if (status === "blocked" || status === "inactive") {
          toast.error(`Your account is ${status}. Please contact support.`);
          await supabase.auth.signOut();
        } else if (userRole) {
          const dash = getDashboardByRole(userRole);
          const roleName = userRole.charAt(0).toUpperCase() + userRole.slice(1);
          toast.success(`Welcome back! Redirecting to your ${roleName} Dashboard.`, {
            id: 'auth-success' // Prevent duplicate toasts
          });
        }
        setLoading(false);
      } else if (evt === "SIGNED_OUT") {
        setRole(null);
        setRoleText(null);
        setIsAdmin(false);
        setIsAssistant(false);
        setIsDoctor(false);
        setIsPatient(false);
        setProfileStatus(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [getDashboardByRole]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider value={{ 
      user, 
      session, 
      role, 
      isAdmin, 
      isAssistant, 
      isDoctor, 
      isPatient, 
      isStaff: isAdmin || isAssistant || isDoctor, 
      roleText, 
      profileStatus, 
      loading, 
      signOut,
      getDashboardByRole
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
