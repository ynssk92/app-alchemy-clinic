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
              {hero.badge === "CLINIQUE LA DUNE DENTAIRE" ? "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            Continue from the existing role-based permission system.\n\nIMPORTANT:\n\n- Permissions are ROLE-BASED.\n\n- Do NOT create user-specific permissions.\n\n- Reuse `user_roles`, `role_permissions`, and `has_permission()`.\n\n- Do not create another authorization system.\n\n- Do not modify or delete existing data.\n\n- Do not change Google authentication.\n\n1. ROLE BADGE\n\nThe dashboard header currently shows a static:\n\n\"Verified patient\"\n\nReplace it with the authenticated user's REAL role.\n\nDisplay:\n\nadmin → Admin\n\ndoctor → Doctor\n\nassistant → Assistant\n\npatient → Patient\n\nThe role must come from the existing trusted role state/database.\n\nDo not hard-code the current user's role.\n\nDo not infer the role from the URL.\n\nIf role is loading, show a neutral loading state.\n\nIf no role exists, show \"User\".\n\n2. SIDEBAR\n\nMake dashboard navigation permission-aware.\n\nUse the existing `has_permission()` logic.\n\nExamples:\n\nAdmin:\n\n- all modules\n\nDoctor:\n\n- only modules where doctor role has `.view`\n\nAssistant:\n\n- only modules where assistant role has `.view`\n\nPatient:\n\n- only patient-facing modules\n\nDo not use frontend hiding as the security mechanism.\n\n3. PROTECTED ROUTES\n\nUpdate the existing ProtectedRoute architecture to support permission checks.\n\nExamples:\n\nNo `patients.view`:\n\n→ deny Patients page.\n\nNo `billing.view`:\n\n→ deny Billing page.\n\nNo admin permission:\n\n→ deny Admin Management.\n\nWhen a user manually enters a protected URL:\n\n- show Access Denied\n\n- do not load protected data\n\n4. CENTRAL AUTHORIZATION\n\nUse one central authorization mechanism.\n\nReuse the existing `has_permission()` and auth state.\n\nDo not duplicate permission logic across individual pages.\n\nThe frontend role badge, sidebar and routes must all use the same trusted role/permission state.\n\n5. ROLE CHANGES\n\nWhen an admin changes a user's role:\n\n- update `user_roles`\n\n- refresh authorization state\n\n- update the role badge\n\n- update sidebar permissions\n\n- apply the new role's permissions\n\nExample:\n\nPatient → Doctor\n\n→ receives Doctor permissions.\n\nDoctor → Assistant\n\n→ receives Assistant permissions.\n\n6. SECURITY\n\nNever trust frontend role or permission values.\n\nDo not allow normal users to:\n\n- change their own role\n\n- grant themselves admin\n\n- modify role permissions\n\nBackend/RLS remains the authoritative security layer.\n\n7. DATA SAFETY\n\nDo not change:\n\n- patients\n\n- appointments\n\n- medical records\n\n- prescriptions\n\n- invoices\n\n- existing users\n\nDo not perform destructive migrations.\n\nKeep the existing clinic UI style and Google authentication unchanged." : hero.badge}
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