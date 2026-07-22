import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { usePermissions, PermAction } from "@/hooks/usePermissions";
import { Card } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

/** Wrap a route to require permission on a module. */
export const PermissionRoute = ({
  module,
  action = "view",
  children,
}: {
  module: string;
  action?: PermAction;
  children: JSX.Element;
}) => {
  const { can, loading, isAdmin } = usePermissions();
  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (isAdmin || can(module, action)) return children;
  return <Navigate to="/admin" replace />;
};

/** Inline guard: render children only if the user has permission. */
export const Can = ({
  module,
  action = "view",
  fallback = null,
  children,
}: {
  module: string;
  action?: PermAction;
  fallback?: ReactNode;
  children: ReactNode;
}) => {
  const { can } = usePermissions();
  return <>{can(module, action) ? children : fallback}</>;
};

/** Full-page "no access" panel used inside admin routes. */
export const NoAccess = ({ module }: { module?: string }) => (
  <Card className="p-10 max-w-lg mx-auto text-center border-dashed">
    <ShieldAlert className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
    <h2 className="text-lg font-semibold">You don't have access</h2>
    <p className="text-sm text-muted-foreground mt-1">
      {module ? `You need permission to view "${module}".` : "Ask an administrator to grant you access."}
    </p>
  </Card>
);
