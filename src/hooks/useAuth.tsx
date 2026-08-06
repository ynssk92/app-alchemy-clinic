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
        return "/admin/dashboard";
      case "doctor":
        return "/doctor/dashboard";
      case "assistant":
        return "/admin";
      case "patient":
        return "/dashboard";
      default:
        return "/auth";
    }
  }, []);

  const loadRole = async (uid: string) => {
    try {
      console.log("[Auth] Fetching profile for user:", uid);
      const { data: prof, error: profError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();

      if (profError) throw profError;

      if (!prof) {
        console.warn("[Auth] No profile found for user:", uid);
        setRole(null);
        setProfileStatus(null);
        return { userRole: null, status: null };
      }

      const userRole = (prof as any)?.role as UserRole;
      const status = (prof as any)?.status;
      
      console.log("[Auth] Profile loaded. Role detected:", userRole);
      
      setRole(userRole);
      setRoleText((prof as any)?.role || null);
      setIsAdmin(userRole === "admin");
      setIsAssistant(userRole === "assistant");
      setIsDoctor(userRole === "doctor");
      setIsPatient(userRole === "patient");
      setProfileStatus(status || null);
      
      return { userRole, status };
    } catch (error) {
      console.error("[Auth] Error loading profile role:", error);
      return { userRole: null, status: null };
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      console.log("[Auth] Initializing...");
      const { data: { session: s } } = await supabase.auth.getSession();
      
      if (!mounted) return;

      if (s) {
        console.log("[Auth] Session found");
        setSession(s);
        setUser(s.user);
        console.log("[Auth] User loaded");
        await loadRole(s.user.id);
      } else {
        console.log("[Auth] No session found");
      }
      
      setLoading(false);
      console.log("[Auth] Initialized");
    };

    initialize();

    const { data: sub } = supabase.auth.onAuthStateChange(async (evt, s) => {
      console.log("[Auth] State change:", evt);
      if (!mounted) return;

      if (evt === "SIGNED_IN" && s?.user) {
        setLoading(true);
        setSession(s);
        setUser(s.user);
        console.log("[Auth] Signed in. Fetching profile...");
        
        const { userRole, status } = await loadRole(s.user.id);
        
        if (status === "blocked" || status === "inactive") {
          toast.error(`Your account is ${status}. Please contact support.`);
          await supabase.auth.signOut();
        } else if (userRole) {
          const dash = getDashboardByRole(userRole);
          const roleName = userRole.charAt(0).toUpperCase() + userRole.slice(1);
          console.log("[Auth] Redirecting to:", dash);
          toast.success(`Welcome back! Redirecting to your ${roleName} Dashboard.`, {
            id: 'auth-success'
          });
        }
        setLoading(false);
      } else if (evt === "SIGNED_OUT") {
        console.log("[Auth] Signed out. Clearing state...");
        setSession(null);
        setUser(null);
        setRole(null);
        setRoleText(null);
        setIsAdmin(false);
        setIsAssistant(false);
        setIsDoctor(false);
        setIsPatient(false);
        setProfileStatus(null);
        setLoading(false);
        
        // Clear local storage for extra safety as requested
        localStorage.clear();
      } else {
        setSession(s);
        setUser(s?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [getDashboardByRole]);

  const signOut = async () => {
    console.log("[Auth] Sign out requested");
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
