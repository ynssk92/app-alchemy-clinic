import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Seo } from "@/components/Seo";
import logo from "@/assets/logo.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    // Supabase places the recovery tokens in the URL hash; the client parses them
    // and fires a PASSWORD_RECOVERY event once the session is ready.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirm) return toast.error("Passwords do not match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. Please sign in.");
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Seo title="Reset Password — HealthBook" description="Set a new password for your account." path="/reset-password" />
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <img src={logo} alt="Logo" className="h-12" />
        </div>
        <Card className="p-8 border-border bg-card shadow-large">
          <h1 className="text-2xl font-bold mb-6 text-center">Set a new password</h1>
          {!ready ? (
            <p className="text-sm text-muted-foreground text-center">
              Open this page from the reset link in your email. If you didn't request one, go back to sign in.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" required minLength={6}
                  value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input id="confirm-password" type="password" required minLength={6}
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={busy}>
                {busy ? "Updating..." : "Update password"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
