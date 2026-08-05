import { ReactNode } from "react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";
import { LanguageToggle } from "@/components/LanguageToggle";


interface AuthLayoutProps {
  children: ReactNode;
  leftContent: ReactNode;
}

export const AuthLayout = ({ children, leftContent }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#F8FAFC]">
      {/* Left Side - Branding & Illustration */}
      <div className="relative hidden w-full flex-1 flex-col justify-between overflow-hidden lg:flex p-12 bg-white">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        
        <div className="relative z-10">
          <Link to="/" className="inline-block mb-12">
            <img src={logo} alt="La Dune" className="h-10" />
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {leftContent}
          </motion.div>
        </div>

        <div className="relative z-10 pt-12 border-t border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="Patient" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="text-yellow-400 text-sm">★</span>
              ))}
            </div>
          </div>
          <p className="text-sm font-medium text-slate-600">
            12,000+ Happy Patients <span className="text-slate-400 font-normal">trusted by thousands</span>
          </p>
        </div>
      </div>

      {/* Right Side - Auth Card */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8 lg:p-12 bg-[#F8FAFC]">
        <div className="w-full max-w-[460px]">
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/">
              <img src={logo} alt="La Dune" className="h-8" />
            </Link>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
          
          <div className="mt-8 text-center text-sm text-slate-500">
            <p>
              Need help? <Link to="/contact" className="text-primary font-medium hover:underline">Contact our clinic</Link>
            </p>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
