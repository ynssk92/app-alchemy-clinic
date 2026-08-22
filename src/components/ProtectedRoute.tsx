import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute = ({
  children,
  adminOnly = false,
  staffOnly = false,
}: {
  children: JSX.Element;
  adminOnly?: boolean;
  staffOnly?: boolean;
}) => {
  const { user, isAdmin, isAssistant, isStaff, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-1 items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!user.email_confirmed_at && !(user as any).confirmed_at) {
    return <Navigate to="/verify-email" replace />;
  }
  if (adminOnly && !isAdmin) return <Navigate to="/patient-dashboard" replace />;
  if (staffOnly && !isStaff) return <Navigate to="/patient-dashboard" replace />;
  return children;
};
