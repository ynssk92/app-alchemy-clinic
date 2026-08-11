import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Home, 
  Calendar, 
  Search, 
  ChevronRight, 
  MessageSquare,
  Stethoscope,
  Activity,
  Heart,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const quickLinks = [
    { label: "Home", path: "/" },
    { label: "About Clinic", path: "/about" },
    { label: "Our Doctors", path: "/doctors" },
    { label: "Services", path: "/soins" },
    { label: "Contact", path: "/contact" },
    { label: "Patient Portal", path: "/dashboard" },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#F8FAFC]">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#3454D1]/5 to-transparent" />
      <div className="pointer-events-none absolute -left-24 top-1/4 h-[500px] w-[500px] rounded-full bg-[#3454D1]/5 blur-[120px] animate-pulse" />
      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px]" />
      
      {/* Floating Medical Icons Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <Stethoscope className="absolute top-20 left-[15%] w-12 h-12 rotate-12" />
        <Activity className="absolute bottom-40 left-[10%] w-16 h-16 -rotate-12" />
        <Heart className="absolute top-40 right-[15%] w-14 h-14 rotate-45" />
        <ShieldAlert className="absolute bottom-20 right-[20%] w-10 h-10 -rotate-6" />
      </div>

      <div className="container relative z-10 mx-auto max-w-[1100px] px-6 py-12">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          
          {/* Left Side: Illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full max-w-md"
            >
              {/* Modern Healthcare Illustration Placeholder */}
              <div className="aspect-square w-full rounded-[40px] bg-gradient-to-br from-[#3454D1] to-[#6366F1] shadow-large flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800')] opacity-20 mix-blend-overlay grayscale" />
                <div className="z-10 text-center text-white">
                  <div className="text-[12rem] font-black leading-none opacity-20 select-none">404</div>
                  <Stethoscope className="mx-auto h-32 w-32 mb-4" />
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-2xl bg-white shadow-medium flex items-center justify-center p-4">
                <Heart className="text-[#3454D1] h-10 w-10" />
              </div>
              <div className="absolute -top-6 -left-6 h-20 w-20 rounded-full bg-white shadow-medium flex items-center justify-center p-4">
                <Activity className="text-[#3454D1] h-8 w-8" />
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side: Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col space-y-8"
          >
            <div className="space-y-4">
              <Badge className="w-fit bg-[#3454D1]/10 text-[#3454D1] hover:bg-[#3454D1]/20 border-none px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
                404 ERROR
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                Oops! This page doesn't exist.
              </h1>
              <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                The page you are looking for may have been moved, deleted or the URL may be incorrect.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => navigate("/")}
                className="bg-[#3454D1] hover:bg-[#2844B0] text-white px-8 h-12 rounded-2xl shadow-medium transition-all hover:translate-y-[-2px]"
              >
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.history.back()}
                className="px-8 h-12 rounded-2xl border-slate-200 hover:bg-slate-50 transition-all"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button 
                variant="ghost"
                onClick={() => navigate("/appointment")}
                className="text-[#3454D1] hover:bg-[#3454D1]/5 px-8 h-12 rounded-2xl font-medium"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
                Popular Pages
              </h3>
              <div className="flex flex-wrap gap-2">
                {quickLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-sm font-medium text-slate-600 shadow-soft hover:shadow-medium hover:border-[#3454D1]/20 hover:text-[#3454D1] transition-all"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative max-w-md">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4" />
              </div>
              <Input 
                placeholder="Can't find what you're looking for? Search..." 
                className="pl-10 h-12 rounded-2xl border-slate-200 focus-visible:ring-[#3454D1] shadow-soft"
              />
            </div>

            <Card className="p-6 border-none shadow-medium bg-gradient-to-br from-white to-slate-50 rounded-[24px]">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#3454D1]/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="text-[#3454D1] h-6 w-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="font-semibold text-foreground">Need help?</h4>
                  <p className="text-sm text-muted-foreground">Our support team is ready to assist you.</p>
                </div>
                <Button 
                  onClick={() => navigate("/contact")}
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-slate-200 hover:border-[#3454D1]/30"
                >
                  Contact Us
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      <footer className="mt-auto py-8 text-center border-t border-slate-100 w-full bg-white/50 backdrop-blur-sm">
        <p className="text-sm text-muted-foreground font-medium">
          © {new Date().getFullYear()} La Dune Dental Clinic
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Return safely to your destination.
        </p>
      </footer>
    </div>
  );
};

export default NotFound;
