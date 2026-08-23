import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type ProfileStatus = Database["public"]["Enums"]["profile_status"];

// Bootstrap configuration for initial admins.
// IMPORTANT: These emails will only be promoted if they don't already have roles assigned.
const INITIAL_ADMIN_EMAILS = ["youness.skiri@gmail.com"];

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          toast.error("Authentication failed: " + error.message);
          navigate("/auth");
          return;
        }

        if (session) {
          const user = session.user;
          const userEmail = user.email?.toLowerCase().trim() || "";

          // 1. Process Role Assignment via Secure RPC
          // This RPC follows the exact logic:
          // Existing role? -> Keep it.
          // Pending Invite? -> Assign invited role & mark claimed.
          // No invite? -> Returns existing role or null.
          const { data: roleResult, error: rpcError } = await supabase.rpc("claim_invitation_role" as any);
          
          let currentRole: string | null = null;
          if (!rpcError && Array.isArray(roleResult) && roleResult.length > 0) {
            currentRole = (roleResult[0] as any).role;
          }

          // 2. Initial Admin Bootstrap Fallback
          // Only runs if the user has NO role after the invitation check
          if (!currentRole && INITIAL_ADMIN_EMAILS.includes(userEmail)) {
            const { error: promoError } = await supabase
              .from("user_roles")
              .insert({ user_id: user.id, role: "admin" });
            
            if (!promoError) {
              currentRole = "admin";
              toast.success("Initial administrator account activated.");
            }
          }

          // 3. Default Role: Patient
          // If still no role, assign Patient.
          if (!currentRole) {
            const { error: patientRoleError } = await supabase
              .from("user_roles")
              .insert({ user_id: user.id, role: "patient" });
            
            if (!patientRoleError) {
              currentRole = "patient";
            }
          }

          // 4. Ensure Profile exists
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

          if (!profile) {
            await supabase
              .from("profiles")
              .insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                phone: user.phone || null,
                avatar_url: user.user_metadata?.avatar_url || null,
                status: "approved" as ProfileStatus
              });
            toast.success("Account set up successfully!");
          } else {
            toast.success("Welcome back!");
          }

          // 5. Redirect based on role
          if (["admin", "assistant", "doctor"].includes(currentRole || "")) {
            navigate("/admin");
          } else {
            navigate("/patient-dashboard");
          }
        } else {
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