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
import { lovable } from "@/integrations/lovable";
import logo from "@/assets/logo.png";
import { Seo } from "@/components/Seo";
import { LanguageToggle } from "@/components/LanguageToggle";

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
      if (!user.email_confirmed_at) {
        navigate("/verify-email", { replace: true });
      } else {
        navigate(isAdmin ? "/admin" : "/patient-dashboard", { replace: true });
      }
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
    const { data, error } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/patient-dashboard`,
        data: { full_name: signupData.name },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (data.user && !data.user.email_confirmed_at) {
      toast.success("Account created! Check your email to verify.");
      navigate("/verify-email", { replace: true });
      return;
    }
    toast.success("Account created!");
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      return toast.error(result.error.message);
    }
    if (result.redirected) return;
    setBusy(false);
  };


  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 z-10"><LanguageToggle variant="outline" /></div>
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
          <div className="mb-6 space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogle}
              disabled={busy}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 7 29.6 5 24 5 16.3 5 9.6 9.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 43c5.4 0 10.3-2 14-5.3l-6.5-5.3C29.4 34 26.8 35 24 35c-5.3 0-9.7-3.1-11.3-8l-6.6 5.1C9.4 38.7 16.1 43 24 43z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.4 4.4-4.5 5.7l6.5 5.3C41 35 43.5 30 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
              </svg>
              Continue with Google
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>
          </div>

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
