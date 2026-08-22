import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { usePageContent } from "@/hooks/usePageContent";

const defaultHero = {
  badge: "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            Redesign ONLY the visual design and user experience of the Patient List section shown when entering the Patients page.\n\nIMPORTANT — THIS IS A UI-ONLY CHANGE:\n\nDo NOT modify the backend.\n\nDo NOT modify the database schema.\n\nDo NOT create, delete, rename, or migrate any database tables.\n\nDo NOT modify existing patient records or any existing data.\n\nDo NOT modify authentication or authorization.\n\nDo NOT modify Supabase/Lovable Cloud configuration.\n\nDo NOT modify existing API calls, queries, hooks, server functions, or data-fetching logic.\n\nDo NOT change how patients are created, updated, deleted, searched, or loaded.\n\nReuse the exact existing patient data and existing functionality.\n\nOnly change the React components, styling, layout, spacing, and visual presentation of the Patient List.\n\nCURRENT PROBLEM:\nThe current patient list is visually too basic and narrow. It displays patients as a simple vertical list with a small avatar and name, which does not feel like a professional clinic management interface.\n\nNEW DESIGN DIRECTION:\nCreate a modern, clean, premium medical-clinic dashboard design for the Patient List.\n\nHEADER / SEARCH\n\nKeep the existing patient search functionality exactly as it is.\n\nRedesign the search bar to be larger, cleaner, and more polished.\n\nAdd a clear search icon.\n\nAdd a subtle placeholder such as \"Search patients...\"\n\nMake the search area visually separated from the patient results.\n\nIf existing filters are available, present them in a clean filter toolbar without changing their functionality.\n\nPATIENT LIST\nReplace the current plain vertical list with a professional patient management layout.\n\nPrefer a clean table/list layout on desktop:\n\nPatient avatar with initials\n\nFull patient name\n\nExisting relevant patient information if already available in the current data\n\nClear row spacing\n\nSubtle borders/dividers\n\nRounded corners\n\nExcellent readability\n\nHover state\n\nSelected/active state\n\nComfortable click/tap target\n\nDo NOT invent patient information that does not already exist in the application.\n\nPATIENT CARD / ROW\nEach patient should feel like a distinct item.\n\nUse:\n\nLarger avatar\n\nPatient full name with strong typography\n\nSecondary information only when it already exists\n\nConsistent spacing\n\nSubtle hover animation\n\nClear indication when a patient is selected\n\nA right-side action area only if existing patient actions already exist\n\nDESKTOP LAYOUT\nMake better use of the available screen width.\n\nThe patient list should no longer look like a narrow sidebar.\n\nUse a balanced layout with:\n\nPage title/header\n\nSearch/filter toolbar\n\nLarge patient results area\n\nProper margins and padding\n\nConsistent alignment\n\nMOBILE / RESPONSIVE\nMake the patient list responsive:\n\nOn smaller screens, convert rows into clean patient cards.\n\nKeep the search accessible.\n\nAvoid horizontal overflow.\n\nPreserve all existing patient interactions.\n\nVISUAL STYLE\nUse the existing clinic application's design language and colors.\n\nAim for:\n\nPremium dental/medical clinic dashboard\n\nClean\n\nMinimal\n\nProfessional\n\nModern\n\nCalm\n\nExcellent typography\n\nSubtle shadows\n\nRounded corners\n\nConsistent spacing\n\nNo excessive animations\n\nDo not introduce a completely different visual identity.\n\nEMPTY / LOADING / ERROR STATES\nImprove the visual presentation of existing:\n\nLoading state\n\nEmpty patient list\n\nNo search results\n\nError state\n\nDo not change their underlying logic.\n\nFUNCTIONALITY PRESERVATION\nEvery existing patient functionality must continue working exactly as before:\n\nSearch\n\nSelect patient\n\nOpen patient profile\n\nEdit patient\n\nDelete patient if currently available\n\nAny existing patient actions\n\nAny existing navigation\n\nExisting pagination/infinite scrolling if present\n\nDo not rewrite the data-fetching logic just to change the UI.\n\nBEFORE IMPLEMENTATION:\nInspect the existing Patients page and identify the exact component responsible for rendering the current patient list.\n\nModify only that UI/component and its styling where possible.\n\nIMPORTANT:\nThis task is strictly a frontend visual redesign.\nDo not touch backend, database, authentication, authorization, RLS, API contracts, or existing patient data.\n\nAfter implementation, confirm that:\n\nNo database changes were made.\n\nNo backend/server functions were changed.\n\nNo patient data was changed.\n\nExisting patient functionality remains intact.",
  primaryCTA: "Book an Appointment",
  primaryURL: "/booking",
  secondaryCTA: "Discover Our Care",
  secondaryURL: "/soins",
  floatingTitle: "Modern Technology",
  floatingSubtitle: "CLINIC EXPERTISE",
  overlayOpacity: 40,
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
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-6">
              {hero.badge}
            </span>
            <h1 className="text-[48px] md:text-[84px] font-bold tracking-tight text-white leading-[1.05] mb-8">
              {hero.heading}<br />
              <span className="text-white/60">{hero.highlight}</span>
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
