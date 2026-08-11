import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      // Check for error in URL (e.g., if user cancels or provider fails)
      const params = new URLSearchParams(location.search);
      const error = params.get("error");
      const errorDescription = params.get("error_description");

      if (error) {
        console.error("Auth error:", error, errorDescription);
        toast.error(errorDescription || "Authentication failed");
        navigate("/auth", { replace: true });
        return;
      }

      // Supabase automatically handles the hash/query codes if we wrap this
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        toast.error(sessionError.message);
        navigate("/auth", { replace: true });
        return;
      }

      if (session) {
        toast.success("Successfully authenticated!");
        navigate("/patient-dashboard", { replace: true });
      } else {
        // If no session but no error, maybe it's still processing or was a refresh
        navigate("/auth", { replace: true });
      }
    };

    handleCallback();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-slate-700">Completing sign in...</h2>
        <p className="text-slate-500">Please wait while we redirect you.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
