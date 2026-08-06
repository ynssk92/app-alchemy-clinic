import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

export const ProtectedRoute = ({
  children,
  adminOnly = false,
  staffOnly = false,
  doctorOnly = false,
  patientOnly = false,
}: {
  children: JSX.Element;
  adminOnly?: boolean;
  staffOnly?: boolean;
  doctorOnly?: boolean;
  patientOnly?: boolean;
}) => {
  const { user, role, isAdmin, isAssistant, isDoctor, isPatient, profileStatus, loading, getDashboardByRole } = useAuth();
  const location = useLocation();
  const toastShown = useRef(false);

  useEffect(() => {
    if (!loading && user && profileStatus && ["inactive", "blocked"].includes(profileStatus) && !toastShown.current) {
      toast.error(`Your account is ${profileStatus}. Please contact support.`, { id: 'status-error' });
      toastShown.current = true;
    }
  }, [loading, user, profileStatus]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-1 items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("[Auth] ProtectedRoute: No user, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Handle account status
  if (profileStatus === "inactive" || profileStatus === "blocked") {
    console.log("[Auth] ProtectedRoute: Inactive/blocked, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  // Wait for role to be loaded if user exists but role is null
  if (role === null) {
    console.log("[Auth] ProtectedRoute: No role yet, redirecting to /complete-profile");
    return <Navigate to="/complete-profile" replace />;
  }

  // Authorization checks
  const dashboard = getDashboardByRole(role);

  if (adminOnly && !isAdmin) {
    console.log("[Auth] ProtectedRoute: Admin access denied, redirecting to", dashboard);
    return <Navigate to={dashboard} replace />;
  }
  
  if (staffOnly && !isAdmin && !isAssistant && !isDoctor) {
    console.log("[Auth] ProtectedRoute: Staff access denied, redirecting to", dashboard);
    return <Navigate to={dashboard} replace />;
  }

  if (doctorOnly && !isDoctor) {
    console.log("[Auth] ProtectedRoute: Doctor access denied, redirecting to", dashboard);
    return <Navigate to={dashboard} replace />;
  }

  if (patientOnly && !isPatient) {
    console.log("[Auth] ProtectedRoute: Patient access denied, redirecting to", dashboard);
    return <Navigate to={dashboard} replace />;
  }

  return children;
};
