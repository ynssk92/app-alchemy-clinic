import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import heroVideoAsset from "@/assets/hero-bg-new.mp4.asset.json";

const HERO_VIDEO_URL = heroVideoAsset.url;

export const HeroSection = () => {
  const [videoError, setVideoError] = useState(false);

  return (
    <section className="relative w-full min-h-[650px] md:min-h-[750px] lg:min-h-[800px] flex items-center overflow-hidden">
      {/* Full-screen video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onError={() => setVideoError(true)}
        className={`absolute inset-0 h-full w-full object-cover -z-30 ${videoError ? "hidden" : ""}`}
      >
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>

      {/* Fallback background if video fails to load */}
      <div className="absolute inset-0 -z-[25] bg-gradient-to-br from-slate-900 via-[#0a1f44] to-slate-800" />

      {/* Subtle Premium Overlay */}
      <div 
        className="absolute inset-0 -z-20 bg-[rgba(5,20,55,0.30)]" 
      />
      
      {/* Gradient overlay for text readability - keeping it subtle but effective */}
      <div 
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[rgba(5,20,55,0.4)] via-transparent to-transparent" 
      />

      <div className="container mx-auto px-4 relative z-10 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 w-fit backdrop-blur-sm"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">
                La Dune Clinique Dentaire
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[0.95] drop-shadow-md"
            >
              Exceptional dental care.<br />
              <span className="text-white">A confident smile.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/85 leading-relaxed max-w-lg drop-shadow-sm"
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
              <Button asChild size="lg" variant="outline" className="h-14 rounded-full px-8 text-base bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50">
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
            className="relative hidden lg:flex items-center justify-center min-h-[400px]"
          >
            {/* Floating stats card */}
            <div className="absolute left-0 bottom-12 bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Clinic Expertise</p>
              <p className="text-2xl font-bold text-slate-900">Modern Technology</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
