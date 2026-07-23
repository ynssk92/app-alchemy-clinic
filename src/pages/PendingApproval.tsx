import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, XCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PendingApproval() {
  const { user, signOut } = useAuth();
  const [status, setStatus] = useState<string>("pending");
  const [reason, setReason] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("status,status_reason")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setStatus((data as any).status);
          setReason((data as any).status_reason);
          if ((data as any).status === "approved") nav("/patient-dashboard", { replace: true });
        }
      });
  }, [user, nav]);

  const rejected = status === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 to-accent/5">
      <Card className="max-w-md w-full p-8 text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-primary/10">
          {rejected ? <XCircle className="w-8 h-8 text-destructive" /> : <Clock className="w-8 h-8 text-primary" />}
        </div>
        <h1 className="text-2xl font-bold">
          {rejected ? "Registration not approved" : "Awaiting approval"}
        </h1>
        <p className="text-muted-foreground">
          {rejected
            ? "Your account was not approved by our staff."
            : "Thanks for signing up! An admin will review your registration shortly. You'll be notified once approved."}
        </p>
        {reason && (
          <div className="text-sm p-3 rounded-md bg-muted text-left">
            <strong>Reason: </strong>{reason}
          </div>
        )}
        <Button variant="outline" className="w-full" onClick={async () => { await signOut(); nav("/auth"); }}>
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </Button>
      </Card>
    </div>
  );
}
