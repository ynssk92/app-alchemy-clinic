import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { usePageContent } from "@/hooks/usePageContent";

const defaultHero = {
  badge: "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            STRICT SCOPE — DO NOT MODIFY UNREQUESTED PAGES OR DISPLAY INTERNAL INSTRUCTIONS\n\nYou must follow these rules for every future change in this application.\n\n1. NEVER RENDER MY PROMPTS OR INTERNAL INSTRUCTIONS\n\nCRITICAL:\n\nAny instruction, prompt, requirement, technical description, implementation note, system instruction, or text that I provide to you is INTERNAL DEVELOPMENT INSTRUCTION.\n\nNEVER render, display, inject, hardcode, or expose this text anywhere in the application's visible UI.\n\nThe current homepage contains a serious issue where a long technical prompt/instruction is being displayed visibly inside the Hero section.\n\nFind the source of this text and REMOVE it completely from the rendered UI.\n\nThe following type of content must NEVER appear on the website:\n\nTechnical prompts\n\nDevelopment instructions\n\nAI instructions\n\nImplementation notes\n\nDebug messages\n\nInternal requirements\n\nCode comments rendered as UI\n\nLovable instructions\n\nAuthentication implementation instructions\n\nAny text that was only intended to instruct the AI/developer\n\nOnly actual website content intended for visitors may be rendered.\n\n2. STRICT MODIFICATION SCOPE\n\nFrom now on, when I ask you to modify something:\n\nONLY modify the exact page, section, component, style, functionality, or file explicitly mentioned in my request.\n\nDO NOT modify unrelated pages or components.\n\nFor example:\n\nIf I say:\n\n\"Modify the Patient Dashboard sidebar.\"\n\nThen ONLY work on the Patient Dashboard sidebar.\n\nDo NOT modify:\n\nLanding page\n\nHero section\n\nHeader\n\nFooter\n\nLogin\n\nAuthentication\n\nPatient profile\n\nDoctor dashboard\n\nAdmin dashboard\n\nDatabase\n\nRoutes\n\nExisting content\n\nOther components\n\nunless I explicitly ask you to modify them.\n\n3. DO NOT \"IMPROVE\" OTHER PARTS AUTOMATICALLY\n\nDo NOT make additional improvements, redesigns, refactors, cleanups, optimizations, or visual changes that were not explicitly requested.\n\nDo not assume that something should be changed because you think it would be better.\n\nThe requested change is the ONLY change you should make.\n\nPreserve everything else exactly as it currently works.\n\n4. PRESERVE EXISTING FUNCTIONALITY\n\nUnless explicitly requested, DO NOT change:\n\nAuthentication\n\nGoogle OAuth\n\nLogin behavior\n\nLogout behavior\n\nRole-based routing\n\nPatient dashboard routing\n\nDoctor routing\n\nAdmin routing\n\nSupabase configuration\n\nDatabase schema\n\nDatabase tables\n\nExisting records\n\nRLS policies\n\nAPI logic\n\nExisting CRUD operations\n\nExisting forms\n\nExisting business logic\n\nExisting routes\n\nDo not rewrite existing systems just to implement a UI change.\n\n5. PRESERVE EXISTING DESIGN\n\nIf the requested modification is functional, do not redesign the page.\n\nIf the requested modification is visual, change ONLY the visual area explicitly mentioned.\n\nDo not change:\n\nTypography globally\n\nGlobal colors\n\nGlobal spacing\n\nHeader\n\nFooter\n\nNavigation\n\nOther sections\n\nOther pages\n\nunless explicitly requested.\n\n6. INSPECT BEFORE MODIFYING\n\nBefore making changes:\n\nIdentify the exact component/page responsible for the requested feature.\n\nIdentify where its data comes from.\n\nIdentify the minimum files/components that need modification.\n\nCheck whether the requested behavior already exists.\n\nMake the smallest possible change.\n\nDo NOT rewrite entire files when a small targeted modification is sufficient.\n\n7. HOMEPAGE / LANDING PAGE PROTECTION\n\nThe Landing Page is protected by default.\n\nDo NOT modify the Landing Page unless I explicitly say something like:\n\n\"Modify the landing page.\"\n\nIf I ask you to modify another part of the application, the Landing Page must remain untouched.\n\nThe Hero section must remain untouched unless I explicitly request a Hero modification.\n\n8. REMOVE THE CURRENT ACCIDENTAL TEXT\n\nInspect the current Landing Page / Hero section and find the source of the large technical text currently displayed on the page.\n\nIt starts with content similar to:\n\n\"USING THE EXISTING APPLICATION LOGIC...\"\n\nThis is NOT website content.\n\nRemove it from the rendered UI completely.\n\nDo not replace it with another technical instruction.\n\nThe Hero should display only the intended website content.\n\nAlso check for:\n\naccidental <p> elements\n\nhardcoded prompt strings\n\ndebug variables\n\ndevelopment text\n\ninstruction strings\n\nduplicated content\n\naccidentally rendered props\n\naccidental {prompt} / {instructions} rendering\n\ndevelopment-only content that is incorrectly visible\n\n9. DO NOT BREAK THE EXISTING HERO\n\nWhen removing the accidental technical text:\n\nDO NOT redesign the Hero.\n\nDO NOT change the existing Hero layout.\n\nDO NOT change the background image/video.\n\nDO NOT change the typography.\n\nDO NOT change buttons.\n\nDO NOT change animations.\n\nDO NOT change the existing marketing copy.\n\nOnly remove the accidental internal technical text.\n\n10. VERIFY AFTER IMPLEMENTATION\n\nAfter making the change:\n\nVerify that no internal prompt/instruction text is visible anywhere.\n\nVerify that the Landing Page still renders correctly.\n\nVerify that the Hero layout remains unchanged.\n\nVerify that no unrelated pages were modified.\n\nVerify that existing authentication and routing still work.\n\nVerify that there are no console errors caused by the change.\n\nVerify that no internal development instructions are exposed to users.\n\nIMPORTANT:\n\nThe application is a production application.\n\nTreat every unrequested part of the application as READ-ONLY.\n\nOnly modify what I explicitly request.\n\nIf a change is ambiguous, DO NOT make additional changes outside the requested scope.",
  heading: "Exceptional dental care.",
  highlight: "A confident smile.",
  description: "Advanced dental expertise, modern technology and personalized care, all in one place.",
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
