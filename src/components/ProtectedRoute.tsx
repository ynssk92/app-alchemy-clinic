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
          <p className="text-sm font-medium text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Handle account status
  if (profileStatus === "inactive" || profileStatus === "blocked") {
    return <Navigate to="/auth" replace />;
  }

  // Wait for role to be loaded if user exists but role is null
  if (role === null) {
    return (
      <div className="flex min-h-screen w-full flex-1 items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Loading permissions...</p>
        </div>
      </div>
    );
  }

  // Authorization checks
  if (adminOnly && !isAdmin) {
    const dashboard = getDashboardByRole(role);
    if (location.pathname !== dashboard) {
      return <Navigate to={dashboard} replace />;
    }
  }
  
  if (staffOnly && !isAdmin && !isAssistant && !isDoctor) {
    const dashboard = getDashboardByRole(role);
    if (location.pathname !== dashboard) {
      return <Navigate to={dashboard} replace />;
    }
  }

  if (doctorOnly && !isDoctor) {
    const dashboard = getDashboardByRole(role);
    if (location.pathname !== dashboard) {
      return <Navigate to={dashboard} replace />;
    }
  }

  if (patientOnly && !isPatient) {
    const dashboard = getDashboardByRole(role);
    if (location.pathname !== dashboard) {
      return <Navigate to={dashboard} replace />;
    }
  }

  return children;
};
