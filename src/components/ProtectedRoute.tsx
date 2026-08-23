import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AccessDenied } from "@/pages/AccessDenied";

export const ProtectedRoute = ({
  children,
  adminOnly = false,
  staffOnly = false,
  requiredPermission,
}: {
  children: JSX.Element;
  adminOnly?: boolean;
  staffOnly?: boolean;
  requiredPermission?: string;
}) => {
  const { user, isAdmin, isStaff, permissions, loading } = useAuth();
  const location = useLocation();
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
  if (adminOnly && !isAdmin) return <AccessDenied />;
  if (staffOnly && !isStaff) return <AccessDenied />;
  
  if (requiredPermission && !permissions.includes(requiredPermission) && !isAdmin) {
    return <AccessDenied />;
  }
  return children;
};
