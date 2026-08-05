import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Search, 
  Home, 
  User, 
  Stethoscope, 
  Calendar, 
  Mail, 
  Phone,
  MessageCircle,
  FileText,
  HelpCircle,
  ShieldCheck,
  Activity,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Seo } from "@/components/Seo";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would redirect to a search results page
    console.log("Searching for:", searchQuery);
  };

  const quickLinks = [
    { label: "Home", path: "/", icon: Home },
    { label: "About Clinic", path: "/about", icon: ShieldCheck },
    { label: "Our Doctors", path: "/doctors", icon: Stethoscope },
    { label: "Services", path: "/soins", icon: Activity },
    { label: "Contact", path: "/contact", icon: Mail },
    { label: "Patient Portal", path: "/patient-dashboard", icon: User },
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#F8FAFF]">
      <Seo 
        title="404 - Page Not Found — La Dune"
        description="The page you are looking for doesn't exist. Return to La Dune Clinic home."
      />
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#3454D1]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/5 blur-[120px]" />
        
        {/* Floating Medical Icons */}
        <motion.div 
          animate={{ y: [0, -20, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[10%] text-[#3454D1]"
        >
          <Activity size={32} />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 20, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] left-[15%] text-[#3454D1]"
        >
          <Stethoscope size={40} />
        </motion.div>
        <motion.div 
          animate={{ y: [0, -15, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[25%] right-[12%] text-[#3454D1]"
        >
          <Plus size={28} />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 25, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[15%] right-[10%] text-[#3454D1]"
        >
          <Calendar size={36} />
        </motion.div>
      </div>

      <main className="container relative z-10 mx-auto max-w-[1100px] px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Side: Illustration */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center lg:justify-end"
          >
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              {/* Main Illustration Container */}
              <div className="w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] relative flex items-center justify-center">
                <div className="absolute inset-0 bg-[#3454D1]/5 rounded-full blur-3xl" />
                
                {/* Visual Representation of 404 / Healthcare */}
                <div className="relative bg-white p-8 rounded-[40px] shadow-large border border-slate-100 flex flex-col items-center gap-6">
                  <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center text-[#3454D1]">
                    <Search size={48} strokeWidth={1.5} />
                  </div>
                  <div className="space-y-3 w-full">
                    <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                    <div className="h-4 bg-slate-50 rounded-full w-1/2" />
                    <div className="h-4 bg-slate-100 rounded-full w-5/6" />
                  </div>
                  <div className="flex gap-2 w-full justify-center">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                        <FileText size={20} />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Floating Elements Around */}
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute top-0 right-0 p-4 bg-white rounded-2xl shadow-medium border border-slate-100 text-[#3454D1]"
                >
                  <Stethoscope size={32} />
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                  className="absolute bottom-10 left-0 p-4 bg-white rounded-2xl shadow-medium border border-slate-100 text-green-500"
                >
                  <Activity size={32} />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side: Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="text-center lg:text-left space-y-8"
          >
            <div className="space-y-4">
              <Badge className="bg-[#3454D1]/10 text-[#3454D1] hover:bg-[#3454D1]/15 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border-none">
                404 ERROR
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
                Oops! This page<br />doesn't exist.
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed max-w-md mx-auto lg:mx-0">
                The page you are looking for may have been moved, deleted or the URL may be incorrect.
              </p>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Button 
                onClick={() => navigate("/")}
                className="bg-[#3454D1] hover:bg-[#2A44A8] text-white px-8 h-14 rounded-2xl font-bold gap-2 shadow-lg shadow-blue-200 transition-all hover:-translate-y-1"
              >
                <ArrowLeft size={20} />
                Return Home
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(-1)}
                className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 px-8 h-14 rounded-2xl font-bold transition-all hover:-translate-y-1"
              >
                Go Back
              </Button>
              <Button 
                variant="ghost"
                onClick={() => navigate("/booking")}
                className="text-[#3454D1] hover:bg-blue-50 h-14 px-8 rounded-2xl font-bold transition-all"
              >
                Book Appointment
              </Button>
            </div>

            {/* Search Section */}
            <div className="pt-4 space-y-3">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-1">Can't find what you're looking for?</p>
              <form onSubmit={handleSearch} className="relative group max-w-md">
                <Input 
                  placeholder="Search across Doctors, Services, Blog..." 
                  className="h-14 pl-12 pr-4 rounded-2xl border-slate-200 focus:border-[#3454D1] focus:ring-[#3454D1]/10 transition-all bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3454D1] transition-colors" size={20} />
              </form>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-900 uppercase tracking-widest px-1">Popular Pages</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                {quickLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-100 text-sm font-semibold text-slate-600 hover:border-[#3454D1] hover:text-[#3454D1] hover:shadow-soft transition-all"
                  >
                    <link.icon size={16} className="opacity-70" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Help Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-white to-blue-50/50 border border-slate-100 shadow-soft max-w-md group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-[#3454D1] rounded-2xl group-hover:bg-[#3454D1] group-hover:text-white transition-colors duration-300">
                  <HelpCircle size={24} />
                </div>
                <div className="flex-1 space-y-3">
                  <h4 className="font-bold text-slate-900">Need help?</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Our support team is ready to assist you in finding the right information.</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-[#3454D1] font-bold hover:no-underline flex items-center gap-1 group/btn"
                    onClick={() => navigate("/contact")}
                  >
                    Contact Us
                    <motion.span 
                      animate={{ x: [0, 5, 0] }} 
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowLeft className="rotate-180" size={16} />
                    </motion.span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <footer className="mt-auto py-8 text-center border-t border-slate-100 w-full bg-white/50 backdrop-blur-sm">
        <div className="container px-6">
          <p className="text-sm font-medium text-slate-400">
            © {new Date().getFullYear()} La Dune Dental Clinic. Return safely to your destination.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;