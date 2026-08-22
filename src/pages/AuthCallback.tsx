import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase handles the session hydration automatically
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          toast.error("Authentication failed: " + error.message);
          navigate("/auth");
          return;
        }

        if (session) {
          const user = session.user;

          // 1. Check if user has a role (admin/assistant)
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id);
          
          const roleList = (roles || []).map(r => r.role);
          const isStaff = roleList.includes("admin") || roleList.includes("assistant");

          if (isStaff) {
            toast.success("Welcome back!");
            navigate("/admin");
            return;
          }

          // 2. User is likely a patient. Check if profile exists.
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Profile check error:", profileError);
          }

          if (!profile) {
            // Create profile for new Google patient
            const { error: createError } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                email: user.email,
                status: "approved" // Default to approved for social auth if that's the policy
              });
            
            if (createError) {
              console.error("Profile creation error:", createError);
              toast.error("Failed to set up patient profile.");
            } else {
              toast.success("Account set up successfully!");
            }
          } else {
            toast.success("Welcome back!");
          }

          // Always redirect patients to patient-dashboard
          navigate("/patient-dashboard");
        } else {
          // No session found
          console.warn("No session found in callback");
          navigate("/auth");
        }
      } catch (err) {
        console.error("Unexpected error in auth callback:", err);
        toast.error("An unexpected error occurred during login.");
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
