import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthFeatureCard } from "@/components/auth/AuthFeatureCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  Phone, 
  User, 
  Calendar, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck, 
  LockIcon,
  Search
} from "lucide-react";
import { Seo } from "@/components/Seo";
import logo from "@/assets/logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
    dob: "",
  });

  const redirectToDashboard = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    const status = profile?.status as string | undefined;
    if (status === "blocked" || status === "inactive" || status === "pending") {
      await supabase.auth.signOut();
      throw new Error(`Your account is ${status}. Please contact support.`);
    }

    if (profile?.role === "admin" || profile?.role === "doctor" || profile?.role === "assistant") {
      navigate("/admin", { replace: true });
      return;
    }
    navigate("/patient-dashboard", { replace: true });
  };

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active || !data.user) return;
      try {
        await redirectToDashboard(data.user.id);
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : "Unable to open your dashboard");
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup") {
      if (formData.password !== formData.confirmPassword) {
        return toast.error("Passwords do not match");
      }
      if (formData.password.length < 6) {
        return toast.error("Password must be at least 6 characters");
      }
    }
    
    setBusy(true);

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        
        toast.success(`Welcome back!`);
        await redirectToDashboard(data.user.id);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { 
              full_name: `${formData.firstName} ${formData.lastName}`.trim(),
              phone: formData.phone,
              gender: formData.gender,
              dob: formData.dob,
              role: "patient"
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        
        if (data.user && !data.user.email_confirmed_at) {
          toast.success("Account created! Check your email to verify.");
          navigate("/verify-email");
        } else {
          toast.success("Account created successfully!");
          if (data.user) await redirectToDashboard(data.user.id);
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth`,
    });
    if (result.error) {
      setBusy(false);
      return toast.error(result.error.message);
    }
    if (result.redirected) return;
    setBusy(false);
  };

  const handleForgot = async () => {
    if (!formData.email) return toast.error("Please enter your email address first.");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password reset email sent. Check your inbox.");
  };

  return (
    <AuthLayout
      leftContent={
        <div className="space-y-10">
          <div className="space-y-4">
            <h1 className="text-[42px] font-bold leading-tight tracking-tight text-slate-900">
              Welcome to<br />La Dune Clinic
            </h1>
            <p className="text-lg text-slate-600 max-w-sm leading-relaxed">
              Book appointments online, access your treatments, communicate securely with your clinic and manage your medical information anytime.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            <AuthFeatureCard icon="📅" title="Online Appointment" delay={0.1} />
            <AuthFeatureCard icon="🦷" title="Treatment Follow-up" delay={0.2} />
            <AuthFeatureCard icon="💬" title="Secure Messaging" delay={0.3} />
            <AuthFeatureCard icon="📄" title="Medical Documents" delay={0.4} />
          </div>
        </div>
      }
    >
      <Seo
        title={mode === "login" ? "Login — La Dune" : "Register — La Dune"}
        description="Access your La Dune account to manage your health and bookings."
        path="/auth"
      />
      
      <div className="bg-white p-8 sm:p-10 rounded-[28px] shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Logo" className="h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
          <p className="text-slate-500 mt-1">{mode === "login" ? "Sign in to continue" : "Sign up to join our clinic"}</p>
        </div>

        <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-[14px] transition-all duration-300 ${mode === "login" ? "bg-white shadow-md text-primary" : "text-slate-400 hover:text-slate-600"}`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-[14px] transition-all duration-300 ${mode === "signup" ? "bg-white shadow-md text-primary" : "text-slate-400 hover:text-slate-600"}`}
          >
            Register
          </button>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-[52px] rounded-2xl border-slate-200 hover:bg-slate-50 font-semibold gap-3 mb-6"
          onClick={handleGoogle}
          disabled={busy}
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 7 29.6 5 24 5 16.3 5 9.6 9.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 43c5.4 0 10.3-2 14-5.3l-6.5-5.3C29.4 34 26.8 35 24 35c-5.3 0-9.7-3.1-11.3-8l-6.6 5.1C9.4 38.7 16.1 43 24 43z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.4 4.4-4.5 5.7l6.5 5.3C41 35 43.5 30 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
          </svg>
          Continue with Google
        </Button>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
          <div className="relative flex justify-center text-[10px] font-bold tracking-widest uppercase">
            <span className="bg-white px-4 text-slate-400">OR CONTINUE WITH EMAIL</span>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <AnimatePresence mode="wait">
            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-4"
              >
                <AuthInput 
                  label="First Name" 
                  placeholder="John" 
                  icon={User}
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  required
                />
                <AuthInput 
                  label="Last Name" 
                  placeholder="Doe" 
                  icon={User}
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AuthInput 
            label="Email" 
            type="email" 
            placeholder="john@example.com" 
            icon={Mail}
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            required
          />

          <AnimatePresence mode="wait">
            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-5"
              >
                <AuthInput 
                  label="Phone Number" 
                  type="tel" 
                  placeholder="+33 6 12 34 56 78" 
                  icon={Phone}
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 ml-1">Gender</label>
                    <select
                      className="flex h-[52px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
                      value={formData.gender}
                      onChange={e => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <AuthInput 
                    label="Date of Birth" 
                    type="date" 
                    icon={Calendar}
                    value={formData.dob}
                    onChange={e => setFormData({...formData, dob: e.target.value})}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <AuthInput 
              label="Password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              icon={Lock}
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {mode === "signup" && (
            <AuthInput 
              label="Confirm Password" 
              type="password" 
              placeholder="••••••••" 
              icon={CheckCircle2}
              value={formData.confirmPassword}
              onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          )}

          {mode === "login" && (
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" className="rounded-md border-slate-300" />
                <label htmlFor="remember" className="text-xs font-medium text-slate-500 cursor-pointer">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={handleForgot}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          {mode === "signup" && (
            <div className="flex items-start space-x-2 px-1">
              <Checkbox id="terms" className="mt-0.5 rounded-md border-slate-300" required />
              <label htmlFor="terms" className="text-xs leading-relaxed text-slate-500 cursor-pointer">
                I accept the <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> and agree to the storage of my medical information.
              </label>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-[54px] rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 transform hover:-translate-y-0.5" 
            disabled={busy}
          >
            {busy ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              mode === "login" ? "Sign In" : "Create my account"
            )}
          </Button>
        </form>

        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
            <span>Secure authentication</span>
          </div>
          <div className="flex items-center gap-1.5">
            <LockIcon className="h-3.5 w-3.5 text-green-500" />
            <span>Encrypted data</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            <span>GDPR compliant</span>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Auth;
