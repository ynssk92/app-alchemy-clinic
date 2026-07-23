import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MailCheck, RefreshCw, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { Seo } from "@/components/Seo";
import { LanguageToggle } from "@/components/LanguageToggle";

const VerifyEmail = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Poll for confirmation
  useEffect(() => {
    if (!user) return;
    const iv = setInterval(async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email_confirmed_at) {
        clearInterval(iv);
        toast.success("Email verified!");
        navigate("/patient-dashboard", { replace: true });
      }
    }, 4000);
    return () => clearInterval(iv);
  }, [user, navigate]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.email_confirmed_at) return <Navigate to="/patient-dashboard" replace />;

  const resend = async () => {
    if (!user.email || cooldown > 0) return;
    setBusy(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
      options: { emailRedirectTo: `${window.location.origin}/patient-dashboard` },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setCooldown(30);
    toast.success("Verification email sent. Check your inbox.");
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 z-10"><LanguageToggle variant="outline" /></div>
      <Seo title="Verify your email — HealthBook" description="Confirm your email address to activate your HealthBook account." path="/verify-email" />
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src={logo} alt="HealthBook Logo" className="h-12" />
        </Link>
        <Card className="p-8 border-border bg-card shadow-large text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <MailCheck className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Confirm your email</h1>
          <p className="text-muted-foreground mb-6">
            We sent a verification link to <span className="font-medium text-foreground">{user.email}</span>. Click the link to activate your account. This page updates automatically once you confirm.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={resend} disabled={busy || cooldown > 0}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {cooldown > 0 ? `Resend in ${cooldown}s` : busy ? "Sending..." : "Resend verification email"}
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />Sign out
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-6">Didn't get it? Check your spam folder.</p>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
