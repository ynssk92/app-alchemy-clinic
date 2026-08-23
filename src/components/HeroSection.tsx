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
              {hero.badge === "CLINIQUE LA DUNE DENTAIRE" ? "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            Yes, implement the automated end-to-end tests.\n\nIMPORTANT:\n\nThese tests are ONLY for verification and must NOT modify the application's production data, database structure, authentication system, RLS policies, roles, or permissions.\n\nThe tests must verify the existing role-based authorization system for:\n\n- Admin\n\n- Doctor\n\n- Assistant\n\n- Patient\n\nTest the following:\n\n1. PROTECTED ROUTES\n\nAdmin:\n\n- Can access all authorized admin routes.\n\nDoctor:\n\n- Can access routes allowed by the Doctor role permissions.\n\n- Cannot access routes/modules without Doctor permissions.\n\nAssistant:\n\n- Can access routes allowed by the Assistant role permissions.\n\n- Cannot access restricted routes.\n\nPatient:\n\n- Can access patient-facing routes.\n\n- Cannot access admin/staff routes.\n\n- Cannot access another patient's protected routes/data.\n\n2. SIDEBAR VISIBILITY\n\nVerify that the sidebar/navigation is dynamically based on the user's role permissions.\n\nAdmin:\n\n- All authorized modules visible.\n\nDoctor:\n\n- Only modules with Doctor `.view` permission visible.\n\nAssistant:\n\n- Only modules with Assistant `.view` permission visible.\n\nPatient:\n\n- Only patient-facing modules visible.\n\n3. PERMISSION GATING\n\nVerify that frontend permission checks correctly block unauthorized actions.\n\nExamples:\n\n- No `patients.edit` → Edit patient action is unavailable/blocked.\n\n- No `billing.view` → Billing is unavailable.\n\n- No admin permission → Admin Management is unavailable.\n\n4. DIRECT URL ACCESS\n\nDo NOT only test sidebar hiding.\n\nTest users manually navigating directly to protected URLs.\n\nExample:\n\nA Doctor without billing permission attempts to open `/billing`.\n\nExpected:\n\n- Access denied/redirect.\n\n- Protected billing data is not loaded.\n\n5. PATIENT ISOLATION\n\nVerify:\n\n- Patient A can access Patient A's data.\n\n- Patient A cannot access Patient B's data.\n\n- Patient cannot list all patients.\n\n- Patient cannot access admin/staff data.\n\n6. ROLE CHANGES\n\nVerify that changing:\n\nPatient → Doctor\n\ncauses the user to receive Doctor permissions.\n\nVerify that:\n\nDoctor → Assistant\n\ncauses the user to receive Assistant permissions.\n\n7. ROLE PERMISSION CHANGES\n\nBecause permissions are ROLE-BASED:\n\nIf Doctor permissions are changed, verify that the updated permission behavior applies to all Doctor users.\n\nDo NOT test or create per-user permission overrides.\n\n8. PRIVILEGE ESCALATION\n\nVerify that a normal user cannot:\n\n- become admin\n\n- modify their own role\n\n- modify role permissions\n\n- bypass protected routes\n\n- access protected data through unauthorized frontend actions\n\n9. TEST DATA SAFETY\n\nUse isolated test users/test data or a dedicated test environment where possible.\n\nDo NOT delete or modify real production users, patients, appointments, medical records, prescriptions, or invoices.\n\nDo NOT run destructive database commands.\n\nDo NOT change production RLS policies as part of the tests.\n\n10. TEST OUTPUT\n\nAfter creating the tests, provide:\n\n- test files created\n\n- scenarios covered\n\n- how the tests are run\n\n- which roles are tested\n\n- any scenarios that could not be automated\n\nDo not change application functionality just to make the tests pass.\n\nIf an existing security or permission implementation fails a test, report the failure instead of weakening the authorization logic." : hero.badge}
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