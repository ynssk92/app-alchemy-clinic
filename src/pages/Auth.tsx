import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthFeatureCard } from "@/components/auth/AuthFeatureCard";
import { AccountTypeSelector } from "@/components/auth/AccountTypeSelector";
import { motion, AnimatePresence } from "framer-motion";

const Auth = () => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [accountType, setAccountType] = useState<"patient" | "doctor">("patient");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
    dob: "",
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setBusy(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) toast.error(error.message);
      else {
        toast.success("Welcome back!");
        navigate(accountType === "doctor" ? "/admin" : "/patient-dashboard");
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { 
            full_name: formData.name,
            phone: formData.phone,
            role: accountType
          },
        },
      });
      if (error) toast.error(error.message);
      else {
        toast.success("Account created successfully!");
        navigate(accountType === "doctor" ? "/admin" : "/patient-dashboard");
      }
    }
    setBusy(false);
  };

  return (
    <AuthLayout
      leftContent={
        <div className="space-y-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Welcome to<br />La Dune Clinic
          </h1>
          <p className="text-lg text-slate-600 max-w-sm">
            Book appointments online, access your treatments, communicate securely with your clinic and manage your medical information anytime.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            <AuthFeatureCard icon="📅" title="Online Appointment" delay={0.1} />
            <AuthFeatureCard icon="🦷" title="Treatment Follow-up" delay={0.2} />
            <AuthFeatureCard icon="💬" title="Secure Messaging" delay={0.3} />
            <AuthFeatureCard icon="📄" title="Medical Documents" delay={0.4} />
          </div>
        </div>
      }
    >
      <div className="bg-white p-8 rounded-[28px] shadow-sm border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-slate-500">Sign in or create your account</p>
        </div>

        <AccountTypeSelector value={accountType} onChange={setAccountType} />

        <div className="flex bg-slate-100 p-1 rounded-full mb-8">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${mode === "login" ? "bg-white shadow-sm text-primary" : "text-slate-500"}`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${mode === "signup" ? "bg-white shadow-sm text-primary" : "text-slate-500"}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === "signup" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                <Input placeholder="First & Last Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <Input placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </motion.div>
            )}
          </AnimatePresence>

          <Input type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          <Input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
          
          {mode === "signup" && (
            <Input type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required />
          )}

          <Button type="submit" className="w-full h-[54px] rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:scale-[1.02] transition-transform" disabled={busy}>
            {busy ? "Processing..." : mode === "login" ? "Sign In" : "Create my account"}
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-[11px] text-slate-400 items-center">
          <p>✓ Secure authentication • Encrypted data • GDPR compliant</p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Auth;
