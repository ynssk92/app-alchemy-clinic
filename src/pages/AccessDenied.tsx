import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AccessDenied = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have the necessary permissions to access this page. 
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/patient-dashboard" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto bg-gradient-primary text-primary-foreground">
            <Link to="/">
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;