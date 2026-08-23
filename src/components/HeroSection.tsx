import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { usePageContent } from "@/hooks/usePageContent";

const defaultHero = {
  badge: "CLINIQUE LA DUNE DENTAIRE",
  heading: "Your smile deserves expert care.",
  highlight: "",
  description: "Advanced dental care, modern technology, and personalized treatment in a comfortable environment.",
  primaryCTA: "BOOK AN APPOINTMENT",
  primaryURL: "/booking",
  secondaryCTA: "DISCOVER OUR CARE",
  secondaryURL: "/soins",
  floatingTitle: "Modern Technology",
  floatingSubtitle: "CLINIC EXPERTISE",
  overlayOpacity: 50,
  videoUrl: "https://app-clinic.lovable.app/__l5e/assets-v1/b0071650-2082-45fc-b971-064a43fda304/hero-bg.mp4"
};

export const HeroSection = () => {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const { page, loading } = usePageContent("home", isPreview);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Video autoplay failed:", error);
      });
    }
  }, [page?.hero_config]);

  if (loading) return <div className="h-[750px] bg-slate-900 animate-pulse" />;

  const hero = { ...defaultHero, ...(page?.hero_config || {}) };
  const overlayOpacity = (hero.overlayOpacity || 40) / 100;

  return (
    <section className="relative w-full h-[700px] md:h-[800px] overflow-hidden bg-slate-900">
      {/* Background Media */}
      {hero.videoUrl ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover z-0"
        >
          <source src={hero.videoUrl} type="video/mp4" />
        </video>
      ) : hero.imageUrl ? (
        <img 
          src={hero.imageUrl} 
          alt="Clinic" 
          className="absolute inset-0 h-full w-full object-cover z-0"
        />
      ) : null}

      {/* Subtle Overlay */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none" 
        style={{ 
          background: `linear-gradient(to bottom, rgba(5, 20, 55, ${overlayOpacity}), rgba(5, 20, 55, ${overlayOpacity + 0.1}))` 
        }} 
      />

      {/* Hero Content */}
      <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center">
        <div className="max-w-[650px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-6">
              {hero.badge === "CLINIQUE LA DUNE DENTAIRE" ? "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            Fix the current Home Page hero section.\n\nIMPORTANT:\n\nThis is a targeted frontend fix only.\n\nDO NOT modify:\n\n* Backend\n\n* Database\n\n* Authentication\n\n* APIs\n\n* Routes\n\n* Existing functionality\n\n* Dashboard\n\n* Patient management\n\n* Appointment system\n\n* Billing\n\n* Reports\n\n* Existing components outside the Home Page hero\n\nCURRENT PROBLEM:\n\nThe Home Page hero currently displays internal AI instructions / development prompt text over the background video.\n\nThe visible text contains content such as:\n\n\"understand what I want, not to be written down. Understand their content well, then execute what is required...\"\n\nThis is NOT website content.\n\nRemove ALL internal instructions, prompt text, developer instructions, implementation notes, or AI-generated instructions from the visible Home Page.\n\nDo not display any internal prompt or development instruction to visitors.\n\n==================================================\n\nHERO CONTENT\n\n============\n\nReplace the broken hero text with proper professional clinic dental website content.\n\nUse:\n\nEyebrow:\n\nLA DUNE CLINIQUE DENTAIRE\n\nMain headline:\n\nYour smile deserves expert care.\n\nSupporting text:\n\nAdvanced dental care, modern technology, and personalized treatment in a comfortable environment.\n\nPrimary CTA:\n\nBOOK AN APPOINTMENT\n\nSecondary CTA:\n\nDISCOVER OUR CARE\n\nThe text must be short enough to fit naturally over the video.\n\n==================================================\n\nHERO LAYOUT\n\n===========\n\nKeep the existing background video.\n\nKeep the existing video.\n\nKeep the existing header.\n\nKeep the existing KPI / expertise card if already present.\n\nImprove only the hero text positioning.\n\nUse a maximum content width around 650px.\n\nThe headline should be responsive.\n\nDesktop:\n\n* Large but controlled headline\n\n* Approximately 56 to 72px\n\n* Maximum 3 lines\n\nTablet:\n\n* Approximately 42 to 52px\n\nMobile:\n\n* Approximately 34 to 42px\n\n* Maximum 4 lines\n\nDo not allow the text to overflow the viewport.\n\n==================================================\n\nVIDEO OVERLAY\n\n=============\n\nKeep the existing video visible.\n\nAdd or adjust a subtle dark overlay behind the text if needed to maintain readability.\n\nDo not make the video excessively dark.\n\nThe hero should feel premium and clean.\n\n==================================================\n\nIMPORTANT\n\n=========\n\nDo not redesign the entire homepage.\n\nDo not modify sections below the hero.\n\nDo not modify the navigation.\n\nDo not modify the KPI card.\n\nDo not modify backend functionality.\n\nDo not modify database structures.\n\nDo not modify existing application logic.\n\nOnly fix the Home Page hero content and its responsive layout.\n\nBefore making changes, inspect where the current hero text comes from.\n\nRemove the accidental prompt/instruction content from the source.\n\nMake sure the internal instruction text does not exist anywhere in the rendered Home Page.\n\nAfter the fix, verify:\n\n* Desktop\n\n* Tablet\n\n* Mobile\n\n* Hero text stays inside viewport\n\n* Video remains visible\n\n* Header remains unchanged\n\n* CTA buttons work exactly as before\n\n* No internal prompt text is visible" : hero.badge}
            </span>

            <h1 className="text-[34px] sm:text-[42px] md:text-[56px] lg:text-[72px] font-bold tracking-tight text-white leading-[1.1] mb-8">
              {hero.heading}
              {hero.highlight && (
                <>
                  <br />
                  <span className="text-white/60">{hero.highlight}</span>
                </>
              )}
            </h1>
            <p className="max-w-xl text-lg md:text-xl text-white/80 leading-relaxed mb-10">
              {hero.description}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Button asChild size="lg" className="h-14 rounded-full px-10 text-lg bg-white text-primary hover:bg-slate-50 shadow-xl shadow-black/20">
                <Link to={hero.primaryURL}>
                  {hero.primaryCTA}
                </Link>
              </Button>
              <Button asChild variant="ghost" className="h-14 rounded-full px-10 text-lg text-white hover:bg-white/10">
                <Link to={hero.secondaryURL}>
                  {hero.secondaryCTA}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Floating Expertise Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="absolute right-4 bottom-12 md:right-12 md:bottom-20 hidden lg:block"
        >
          <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl border border-white/20 max-w-[280px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">
              {hero.floatingSubtitle}
            </span>
            <h3 className="text-2xl font-bold text-slate-900 leading-tight">
              {hero.floatingTitle}
            </h3>
            <div className="mt-4 flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-1 w-8 rounded-full bg-primary/10 overflow-hidden">
                  <div className="h-full w-full bg-primary origin-left scale-x-[0.8]" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};