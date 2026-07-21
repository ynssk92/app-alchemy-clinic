import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import { Seo } from "@/components/Seo";

const Auth = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [resetSentTo, setResetSentTo] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const sendResetEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return error;
  };

  const handleForgot = async () => {
    if (!loginData.email) return toast.error("Enter your email above, then click Forgot password.");
    setBusy(true);
    const error = await sendResetEmail(loginData.email);
    setBusy(false);
    if (error) return toast.error(error.message);
    setResetSentTo(loginData.email);
    setResendCooldown(30);
    toast.success("Password reset email sent. Check your inbox.");
  };

  const handleResend = async () => {
    if (!resetSentTo || resendCooldown > 0) return;
    setBusy(true);
    const error = await sendResetEmail(resetSentTo);
    setBusy(false);
    if (error) return toast.error(error.message);
    setResendCooldown(30);
    toast.success("Reset email sent again. Check your inbox (and spam).");
  };
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!loading && user) {
      navigate(isAdmin ? "/admin" : "/patient-dashboard", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in!");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/patient-dashboard`,
        data: { full_name: signupData.name },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created! You're signed in.");
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Seo
        title="Sign In or Sign Up — HealthBook"
        description="Access your HealthBook account to book appointments, manage records, and track your care."
        path="/auth"
      />
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src={logo} alt="HealthBook Logo" className="h-12" />
        </Link>

        <h1 className="text-3xl font-bold text-center text-foreground mb-6">Sign in to HealthBook</h1>

        <Card className="p-8 border-border bg-card shadow-large">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
                </div>
                <Button type="submit" className="w-full mt-6" disabled={busy}>
                  {busy ? "Signing in..." : "Login"}
                </Button>
                <button type="button" onClick={handleForgot}
                  className="w-full text-sm text-primary hover:underline mt-2">
                  Forgot password?
                </button>
                {resetSentTo && (
                  <div className="mt-3 rounded-md border border-border bg-muted/40 p-3 text-sm">
                    <p className="text-muted-foreground">
                      Reset link sent to <span className="font-medium text-foreground">{resetSentTo}</span>. Didn't get it? Check spam or resend.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResend}
                      disabled={busy || resendCooldown > 0}
                      className="mt-2"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend reset email"}
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input id="signup-name" required
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" required
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password (min 6 chars)</Label>
                  <Input id="signup-password" type="password" required minLength={6}
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} />
                </div>
                <Button type="submit" className="w-full mt-6" disabled={busy}>
                  {busy ? "Creating..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
