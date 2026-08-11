import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase handles the session hydration automatically via onAuthStateChange
      // or getSession if it's already in the URL hash/query
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth callback error:", error);
        toast.error("Authentication failed: " + error.message);
        navigate("/auth");
        return;
      }

      if (session) {
        // Successfully authenticated or linked
        toast.success("Authentication successful!");
        navigate("/admin"); // Or wherever the user was headed
      } else {
        // No session found, maybe error or cancelled
        navigate("/auth");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground animate-pulse">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
