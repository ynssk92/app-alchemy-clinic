import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute = ({
  children,
  adminOnly = false,
}: {
  children: JSX.Element;
  adminOnly?: boolean;
}) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/patient-dashboard" replace />;
  return children;
};
