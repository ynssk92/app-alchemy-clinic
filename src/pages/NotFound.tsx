import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Home, Calendar, Phone, Search, FileText, Users, Briefcase, Info, MessageSquare, ShieldCheck, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const quickLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "About Clinic", path: "/about", icon: Info },
    { name: "Our Doctors", path: "/doctors", icon: Users },
    { name: "Services", path: "/services", icon: Briefcase },
    { name: "Contact", path: "/contact", icon: MessageSquare },
    { name: "Patient Portal", path: "/dashboard", icon: ShieldCheck },
  ];

  const medicalIcons = [
    { Icon: Stethoscope, top: "15%", left: "10%", delay: 0 },
    { Icon: FileText, top: "25%", left: "85%", delay: 1 },
    { Icon: ShieldCheck, top: "75%", left: "15%", delay: 2 },
    { Icon: Calendar, top: "80%", left: "80%", delay: 3 },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top,_#f8faff_0%,_#ffffff_100%)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {medicalIcons.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: [0.1, 0.2, 0.1], 
              y: [0, -20, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              delay: item.delay,
              ease: "easeInOut" 
            }}
            className="absolute hidden md:block text-primary/20"
            style={{ top: item.top, left: item.left }}
          >
            <item.Icon size={48} strokeWidth={1} />
          </motion.div>
        ))}
      </div>

      <div className="container relative z-10 max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Side: Illustration */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center items-center order-2 lg:order-1"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-white/40 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/50 flex items-center justify-center p-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
                <img 
                  src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop" 
                  alt="Medical Illustration"
                  className="w-full h-full object-cover rounded-2xl mix-blend-multiply opacity-80"
                />
                {/* Floating Elements overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="p-4 bg-white shadow-lg rounded-2xl border border-primary/10 absolute top-12 right-12"
                  >
                    <Search className="text-primary" size={24} />
                  </motion.div>
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], rotate: [0, -5, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                    className="p-4 bg-white shadow-lg rounded-2xl border border-primary/10 absolute bottom-12 left-12"
                  >
                    <FileText className="text-primary" size={24} />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side: Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex flex-col space-y-8 order-1 lg:order-2 text-center lg:text-left"
          >
            <div className="space-y-4">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
                404 ERROR
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                Oops! This page <br className="hidden md:block" />
                <span className="text-primary">doesn't exist.</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                The page you are looking for may have been moved, deleted or the URL may be incorrect.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Button 
                onClick={() => navigate("/")}
                className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 px-8 text-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
              >
                <ArrowLeft className="mr-2" size={20} />
                Return Home
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(-1)}
                className="border-slate-200 hover:bg-slate-50 rounded-2xl h-14 px-8 text-lg font-semibold transition-all"
              >
                Go Back
              </Button>
              <Button 
                variant="ghost"
                onClick={() => navigate("/appointment")}
                className="text-primary hover:bg-primary/5 rounded-2xl h-14 px-8 text-lg font-semibold transition-all"
              >
                <Calendar className="mr-2" size={20} />
                Book Appointment
              </Button>
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto lg:mx-0 w-full space-y-3">
              <p className="text-sm font-medium text-slate-400">Can't find what you're looking for?</p>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" size={20} />
                <Input 
                  placeholder="Search Doctors, Services, Blog..." 
                  className="pl-12 h-14 rounded-2xl border-slate-200 focus:border-primary/50 focus:ring-primary/20 bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Popular Pages</p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {quickLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => navigate(link.path)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 text-slate-600 text-sm font-medium transition-all hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <link.icon size={16} className="text-primary/60" />
                    {link.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Help Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-6 bg-primary/5 rounded-[24px] border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-6"
            >
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-slate-900">Need help?</h3>
                <p className="text-sm text-slate-600">Our support team is ready to assist you.</p>
              </div>
              <Button 
                onClick={() => navigate("/contact")}
                className="bg-white text-primary border border-primary/20 hover:bg-primary hover:text-white rounded-xl shadow-sm h-11 px-6 whitespace-nowrap"
              >
                <Phone className="mr-2" size={18} />
                Contact Us
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-slate-400 text-sm py-8 border-t border-slate-100 w-full max-w-4xl">
        <p>© {new Date().getFullYear()} La Dune Dental Clinic</p>
        <p className="mt-1">Return safely to your destination.</p>
      </footer>
    </div>
  );
};

export default NotFound;
