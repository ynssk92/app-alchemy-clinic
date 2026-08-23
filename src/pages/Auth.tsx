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
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  CalendarDays,
  MessageSquare
} from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [resetSentTo, setResetSentTo] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (!loading && user) {
      if (!user.email_confirmed_at) {
        navigate("/verify-email", { replace: true });
      } else {
        navigate(isAdmin ? "/admin" : "/patient-dashboard", { replace: true });
      }
    }
  }, [user, isAdmin, loading, navigate]);

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

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: `${window.location.origin}/auth/callback`,
    });
    if (result.error) {
      setBusy(false);
      return toast.error(result.error.message);
    }
    if (result.redirected) return;
    setBusy(false);
  };

  const handleCustomOAuth = async (provider: "facebook" | "twitter") => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
  };




  const features = [
    {
      icon: <CalendarDays className="w-5 h-5 text-primary" />,
      title: "Easy appointment booking",
      description: "Schedule your visits in just a few clicks."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-primary" />,
      title: "Secure medical information",
      description: "Your data is encrypted and strictly confidential."
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-primary" />,
      title: "Direct clinic communication",
      description: "Stay in touch with your dental experts."
    }
  ];

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC]">
      <Seo
        title="Sign In or Sign Up — HealthBook"
        description="Access your HealthBook account to book appointments, manage records, and track your care."
        path="/auth"
      />
      
      {/* Top right language toggle */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageToggle variant="outline" className="bg-white/80 backdrop-blur-sm border-slate-200" />
      </div>

      <div className="flex w-full">
        {/* LEFT SIDE - Welcome Area (Desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-white relative overflow-hidden border-r border-slate-100">
          {/* Subtle abstract background element */}
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/">
              <img src={logo} alt="La Dune Clinic Logo" className="h-10 w-auto" />
            </Link>
          </motion.div>

          <div className="max-w-md relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-4xl xl:text-5xl font-bold text-slate-900 leading-tight mb-6">
                Your care, <span className="text-primary italic">beautifully</span> connected.
              </h1>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                Book appointments, follow your treatments and securely manage your healthcare information from one simple platform.
              </p>
            </motion.div>

            <div className="space-y-6">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (idx * 0.1), duration: 0.5 }}
                  className="flex items-start gap-4"
                >
                  <div className="mt-1 w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                    <p className="text-sm text-slate-500">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-slate-400"
          >
            © {new Date().getFullYear()} La Dune Clinique Dentaire. All rights reserved.
          </motion.div>
        </div>

        {/* RIGHT SIDE - Auth Panel */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12">
            <Link to="/">
              <img src={logo} alt="La Dune Clinic Logo" className="h-10 w-auto" />
            </Link>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[440px]"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
              <p className="text-slate-500">Sign in to continue to your HealthBook account.</p>
            </div>

            <Card className="p-1 sm:p-2 border-slate-200 bg-white shadow-soft rounded-3xl overflow-hidden">
              <Tabs defaultValue="login" className="w-full">
                <div className="p-4 sm:p-6 pb-2">
                  <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100/50 rounded-2xl h-12">
                    <TabsTrigger 
                      value="login" 
                      className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-semibold transition-all"
                    >
                      Login
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup"
                      className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-semibold transition-all"
                    >
                      Create account
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-4 sm:p-8 pt-6">
                  <AnimatePresence mode="wait">
                    <TabsContent value="login" className="m-0 mt-0 focus-visible:ring-0">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex flex-col items-center py-6">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-14 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-2xl transition-all gap-4 shadow-sm"
                            onClick={() => handleOAuthLogin("google")}
                            disabled={busy}
                          >
                            <svg className="w-6 h-6" viewBox="0 0 48 48" aria-hidden="true">
                              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
                              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 7 29.6 5 24 5 16.3 5 9.6 9.3 6.3 14.7z"/>
                              <path fill="#4CAF50" d="M24 43c5.4 0 10.3-2 14-5.3l-6.5-5.3C29.4 34 26.8 35 24 35c-5.3 0-9.7-3.1-11.3-8l-6.6 5.1C9.4 38.7 16.1 43 24 43z"/>
                              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.4 4.4-4.5 5.7l6.5 5.3C41 35 43.5 30 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
                            </svg>
                            <span className="font-bold text-base sm:text-lg">Continue with Google</span>
                          </Button>
                        </div>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="signup" className="m-0 mt-0 focus-visible:ring-0">
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex flex-col items-center py-6">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-14 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-2xl transition-all gap-4 shadow-sm"
                            onClick={() => handleOAuthLogin("google")}
                            disabled={busy}
                          >
                            <svg className="w-6 h-6" viewBox="0 0 48 48" aria-hidden="true">
                              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
                              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 7 29.6 5 24 5 16.3 5 9.6 9.3 6.3 14.7z"/>
                              <path fill="#4CAF50" d="M24 43c5.4 0 10.3-2 14-5.3l-6.5-5.3C29.4 34 26.8 35 24 35c-5.3 0-9.7-3.1-11.3-8l-6.6 5.1C9.4 38.7 16.1 43 24 43z"/>
                              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.4 4.4-4.5 5.7l6.5 5.3C41 35 43.5 30 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
                            </svg>
                            <span className="font-bold text-base sm:text-lg">Continue with Google</span>
                          </Button>
                        </div>
                      </motion.div>
                        <form onSubmit={handleSignup} className="space-y-5">
                          <div className="space-y-2">
                            <Label htmlFor="signup-name" className="text-slate-700 font-medium ml-1">Full Name</Label>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input 
                                id="signup-name" 
                                placeholder="John Doe"
                                required
                                className="pl-11 h-12 bg-slate-50 border-slate-100 focus:bg-white focus:border-primary/50 transition-all rounded-xl"
                                value={signupData.name}
                                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })} 
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-email" className="text-slate-700 font-medium ml-1">Email Address</Label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input 
                                id="signup-email" 
                                type="email" 
                                placeholder="name@example.com"
                                required
                                className="pl-11 h-12 bg-slate-50 border-slate-100 focus:bg-white focus:border-primary/50 transition-all rounded-xl"
                                value={signupData.email}
                                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} 
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-password" className="text-slate-700 font-medium ml-1">Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input 
                                id="signup-password" 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Min. 6 characters"
                                required 
                                minLength={6}
                                className="pl-11 pr-11 h-12 bg-slate-50 border-slate-100 focus:bg-white focus:border-primary/50 transition-all rounded-xl"
                                value={signupData.password}
                                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} 
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <Button 
                            type="submit" 
                            className="w-full h-12 mt-4 text-base font-semibold rounded-xl bg-primary hover:bg-primary/95 shadow-md shadow-primary/20 transition-all active:scale-[0.98]" 
                            disabled={busy}
                          >
                            {busy ? "Creating account..." : "Create Account"}
                          </Button>

                          <p className="text-center text-xs text-slate-400 mt-6 px-4">
                            By creating an account, you agree to our <Link to="#" className="text-primary hover:underline">Terms of Service</Link> and <Link to="#" className="text-primary hover:underline">Privacy Policy</Link>.
                          </p>
                        </form>
                      </motion.div>
                    </TabsContent>
                  </AnimatePresence>
                </div>
              </Tabs>
            </Card>

            <div className="mt-8 text-center">
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors group">
                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back to website
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;