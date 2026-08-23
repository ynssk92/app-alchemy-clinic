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
              {hero.badge === "CLINIQUE LA DUNE DENTAIRE" ? "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            Continue and harden the existing role-based authorization implementation.\n\nIMPORTANT:\n\n- Keep permissions ROLE-BASED.\n\n- Do NOT create user-specific permissions.\n\n- Reuse `role_permissions`.\n\n- Reuse `has_permission()`.\n\n- Do not create another auth system.\n\n- Do not delete or recreate existing data.\n\n- All migrations must be additive and non-destructive.\n\n1. BACKEND ENFORCEMENT\n\nPermissions must be enforced by Supabase RLS/backend, not only by React.\n\nA user without:\n\n`patients.view`\n\nmust not retrieve patient data through direct database/API calls.\n\nA user without:\n\n`patients.edit`\n\nmust not update patients.\n\nA user without:\n\n`billing.view`\n\nmust not retrieve invoices/billing data.\n\nUnauthorized SELECT/INSERT/UPDATE/DELETE operations must fail.\n\n2. PATIENT ISOLATION\n\nPatients can ONLY access their own data.\n\nA patient must NOT:\n\n- list all patients\n\n- search other patients\n\n- open another patient's profile\n\n- read another patient's medical records\n\n- read another patient's prescriptions\n\n- read another patient's appointments\n\n- read another patient's invoices\n\nUse the EXISTING database relationships to determine ownership.\n\nDo NOT assume every table has `uid`.\n\nInspect how:\n\nauth user → patient/profile → clinical records\n\nis currently connected.\n\nDo not invent a new relationship if an existing one already exists.\n\n3. STAFF ACCESS\n\nDoctors and assistants must receive access according to their ROLE permissions.\n\nExample:\n\nIf doctor role has:\n\n`patients.view`\n\nall doctors can view patients.\n\nIf doctor role does NOT have:\n\n`billing.view`\n\nall doctors must be denied billing access.\n\nChanging role permissions must affect all users of that role.\n\n4. ADMIN\n\nAdmins have full access.\n\nMultiple admins must continue to work.\n\nOnly admins can:\n\n- invite users\n\n- assign roles\n\n- modify role permissions\n\n- change user roles\n\nKeep the existing last-admin protection.\n\n5. PRIVILEGE ESCALATION\n\nVerify that normal users cannot:\n\n- modify their own `user_roles`\n\n- insert admin roles\n\n- modify `role_permissions`\n\n- bypass RLS\n\n- access protected data directly\n\n6. RLS SAFETY\n\nBefore changing RLS policies on:\n\n- patients\n\n- medical_records\n\n- prescriptions\n\n- appointments\n\n- invoices\n\ninspect the existing policies first.\n\nPreserve legitimate existing access.\n\nDo not blindly replace policies.\n\nCombine:\n\n- existing legitimate access\n\n- role permissions\n\n- patient ownership\n\nDo not accidentally break existing doctor/admin functionality.\n\n7. TESTING\n\nTest:\n\nADMIN:\n\nFull access.\n\nDOCTOR:\n\nOnly Doctor permissions.\n\nASSISTANT:\n\nOnly Assistant permissions.\n\nPATIENT:\n\nOnly own data.\n\nInvitation:\n\nAdmin selects role → invited user receives correct role.\n\nRole change:\n\nPatient → Doctor → receives Doctor permissions.\n\nRole permission change:\n\nChange Doctor permissions → ALL doctors receive the new permissions.\n\nPrivilege escalation:\n\nNormal user cannot become admin.\n\nDirect backend access:\n\nUnauthorized requests fail.\n\nPatient isolation:\n\nPatient A cannot access Patient B.\n\n8. DATA INTEGRITY\n\nConfirm:\n\n- existing users preserved\n\n- existing patients preserved\n\n- appointments preserved\n\n- medical records preserved\n\n- prescriptions preserved\n\n- invoices preserved\n\n- Google authentication preserved\n\nDo NOT:\n\n- DROP\n\n- TRUNCATE\n\n- RESET\n\n- delete existing records\n\n- recreate existing tables\n\nAt the end, provide a concise report of:\n\n- RLS changes\n\n- backend security changes\n\n- role changes\n\n- permission changes\n\n- invitation changes\n\n- frontend changes\n\n- confirmation that existing data was preserved.\n\nDo not execute destructive operations." : hero.badge}
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