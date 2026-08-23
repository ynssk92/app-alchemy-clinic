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

          // 1. Check for invitations matching the email
          const userEmail = user.email?.toLowerCase();
          const { data: invite } = await supabase
            .from("admin_invites")
            .select("id, role")
            .eq("email", userEmail || "")
            .is("claimed_at", null)
            .maybeSingle();

          if (invite) {
            // Assign the invited role
            const { error: roleError } = await supabase
              .from("user_roles")
              .insert({ 
                user_id: user.id, 
                role: invite.role 
              });
            
            if (!roleError) {
              // Mark invite as used
              await supabase
                .from("admin_invites")
                .update({ claimed_at: new Date().toISOString(), claimed_by: user.id })
                .eq("id", invite.id);
              
              toast.success(`Role ${invite.role} assigned from invitation!`);
            }
          }

          // 2. Fetch all active roles for redirection logic
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id);
          
          const roleList = (roles || []).map(r => r.role);
          
          // Bootstrap fallback
          if (roleList.length === 0 && INITIAL_ADMIN_EMAILS.includes(userEmail || "")) {
            const { error: promoError } = await supabase
              .from("user_roles")
              .insert({ user_id: user.id, role: "admin" });
            
            if (!promoError) {
              roleList.push("admin");
            }
          }

          const isStaff = roleList.some(r => ["admin", "assistant", "doctor"].includes(r));

          if (isStaff) {
            toast.success("Welcome back!");
            navigate("/admin");
            return;
          }

          // 3. User is a patient. Ensure profile exists.
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
            
            // Auto-assign patient role if none exists
            if (!roleList.includes("patient")) {
              await supabase.from("user_roles").insert({ user_id: user.id, role: "patient" });
            }
            toast.success("Account set up successfully!");
          } else {
            toast.success("Welcome back!");
          }

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
