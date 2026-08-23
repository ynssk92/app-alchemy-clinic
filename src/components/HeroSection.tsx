import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { usePageContent } from "@/hooks/usePageContent";

const defaultHero = {
  badge: "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            Update the dashboard header where the current static \"Verified patient\" badge is displayed.\n\nGOAL:\nReplace the static \"Verified patient\" badge with a dynamic role badge that reflects the currently authenticated user's REAL role from the existing database authorization system.\n\nIMPORTANT:\n\nReuse the existing authentication system.\n\nReuse the existing user_roles architecture/table already present in the application.\n\nDo NOT create a new roles table.\n\nDo NOT create duplicate role logic.\n\nDo NOT hard-code the user's role.\n\nDo NOT assume that every authenticated user is a patient.\n\nThe displayed role must come from the authenticated user's actual database role.\n\nROLE MAPPING:\nDisplay the role using a clean, human-readable label:\n\nadmin → Admin\n\ndoctor → Doctor\n\nassistant → Assistant\n\npatient → Patient\n\nIf the existing application already has additional valid roles, inspect and reuse those roles instead of inventing new ones.\n\nDATA SYNCHRONIZATION:\n\nGet the currently authenticated user's ID from the existing auth state.\n\nResolve that user's role using the existing user_roles data/source.\n\nThe role badge must update automatically when the user's role changes.\n\nReuse the existing useAuth / role state if it already exposes the current user's role instead of making unnecessary duplicate queries.\n\nIf the existing auth hook does not expose the role, extend it minimally to expose the already-existing role data.\n\nDo not create a second independent role system.\n\nAvoid unnecessary database requests on every render.\n\nHandle loading gracefully while the role is being resolved.\n\nIf no role is available, display a neutral fallback such as User instead of incorrectly displaying Patient.\n\nSECURITY:\n\nThe badge is only a visual representation of the role.\n\nDo not use the displayed badge as an authorization mechanism.\n\nDo not weaken or bypass existing RLS or backend authorization.\n\nThe actual role must continue to be determined by the trusted backend/database authorization system.\n\nUI:\nKeep the current header design and styling.\nReplace:\n\n\"Verified patient\"\n\nwith the dynamic role badge.\n\nKeep the badge visually consistent with the existing header:\n\nsmall pill/badge\n\nsubtle icon\n\nclean typography\n\nprofessional clinic aesthetic\n\nOptionally use role-specific icons, but do not introduce excessive colors or redesign the entire header.\n\nIMPORTANT BACKEND/DATA SAFETY:\n\nDo NOT modify or delete existing users.\n\nDo NOT modify patient records.\n\nDo NOT modify appointments, medical records, prescriptions, billing, or other existing data.\n\nDo NOT recreate user_roles.\n\nDo NOT change authentication.\n\nDo NOT change RLS policies unless absolutely required for reading the already-authorized current user's role.\n\nDo NOT make destructive database changes.\n\nDo NOT add a new database table.\n\nBefore implementation, inspect the existing useAuth, user_roles, and current role-management implementation and integrate with the existing architecture.\n\nVERIFICATION:\nTest with multiple existing users having different roles.\n\nExpected behavior:\n\nAdmin account → badge says Admin\n\nDoctor account → badge says Doctor\n\nAssistant account → badge says Assistant\n\nPatient account → badge says Patient\n\nAlso verify that changing a user's role through the existing Admin Management functionality eventually updates the badge correctly without hardcoded values.\n\nKeep the rest of the dashboard header and all existing functionality unchanged.",
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
              {hero.badge}
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