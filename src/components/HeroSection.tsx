import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const HeroSection = () => {
  return (
    <section className="relative w-full pt-20 pb-32 overflow-hidden bg-white">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 rounded-bl-[100px] -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 w-fit"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                La Dune Clinique Dentaire
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[0.95]"
            >
              Exceptional dental care.<br />
              <span className="text-primary">A confident smile.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-lg"
            >
              Advanced dental expertise, modern technology and personalized care, all in one place.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Button asChild size="lg" className="h-14 rounded-full px-8 text-base bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                <Link to="/booking">
                  Book an Appointment
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 rounded-full px-8 text-base border-slate-200 hover:bg-slate-50">
                <Link to="/soins">
                  Discover Our Care
                </Link>
              </Button>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1629904853716-f0bc54fd6306?q=80&w=2000&auto=format&fit=crop" 
                alt="Dental Clinic" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating stats card */}
            <div className="absolute -left-8 bottom-12 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 hidden sm:block">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Clinic Expertise</p>
              <p className="text-2xl font-bold text-slate-900">Modern Technology</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
