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
              {hero.badge === "CLINIQUE LA DUNE DENTAIRE" ? "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            Before executing this plan, make the following security corrections.\n\n1. IMPORTANT: DO NOT grant broad SELECT access on `admin_invites` to `authenticated` users.\n\nThe current plan says:\n\n\"Ensure anon and authenticated roles have appropriate access to admin_invites (SELECT for discovery during auth)\"\n\nDo NOT implement broad SELECT access.\n\nUsers must NOT be able to query or enumerate all invitations.\n\nInstead, implement invitation verification through a secure backend/RPC/security-definer mechanism that only verifies the invitation associated with the currently authenticated user's email.\n\nThe client must never be able to read all rows from `admin_invites`.\n\nKeep RLS enabled.\n\n2. `admin_invites` INSERT\n\nOnly verified administrators must be able to create invitations.\n\nUse the existing trusted:\n\n`is_admin()`\n\nor equivalent secure permission check.\n\nDo NOT use a frontend role check as the security mechanism.\n\nDo NOT allow:\n\nauthenticated → INSERT\n\nunless the RLS policy independently verifies that the current user is an admin.\n\n3. INITIAL ADMIN\n\nThe intended initial administrator is:\n\n`youness.skiri@gmail.com`\n\nBecause this account is currently incorrectly assigned as `patient`, explicitly correct its existing `user_roles` record to:\n\nrole = `admin`\n\nDo this only for this exact account/user identity.\n\nDo not modify unrelated users.\n\nAfter this correction, ensure `AuthCallback.tsx` cannot overwrite this admin role with `patient` during future Google logins.\n\n4. IMPORTANT ROLE PRECEDENCE\n\nThe AuthCallback logic must follow this priority:\n\n- Existing valid admin role must NEVER be overwritten by the default patient role.\n- A valid invitation role must be applied when the invitation is verified.\n- Initial admin bootstrap applies only to the configured initial admin email.\n- A normal Google user without an invitation must receive the application's normal default role.\n- A user must never be promoted to admin merely because they logged in with Google.\n\n5. `thebirdagencyma@gmail.com`\n\nDo NOT assume this account should be admin.\n\nInspect its actual `user_roles` record and determine why it currently receives admin access.\n\nIf it has no legitimate admin role/invitation, correct the mismatch so its frontend role, `user_roles.role`, permissions, and backend authorization all agree.\n\nDo NOT hard-code this email as admin.\n\n6. ROLE SOURCE OF TRUTH\n\nKeep exactly one authoritative role source:\n\n`public.user_roles`\n\nReact:\n`useAuth`\n\nBackend:\n`has_role()` / `is_admin()` / `has_permission()`\n\nThe Users page, dashboard badge, sidebar, protected routes, and backend authorization must all derive from this same role state.\n\n7. SECURITY DEFINER\n\nFor all security-definer authorization functions, ensure:\n\n- `SECURITY DEFINER`\n- `SET search_path = public`\n\nand prevent privilege escalation/recursive RLS issues.\n\n8. DATA SAFETY\n\nDo not:\n- DROP tables\n- TRUNCATE tables\n- reset the database\n- recreate existing tables\n- delete clinical records\n- delete patients\n- delete appointments\n- delete medical records\n- delete prescriptions\n- delete invoices\n\nOnly correct the specific incorrect role assignment(s) if necessary.\n\n9. BEFORE EXECUTION\n\nShow the exact SQL/RLS changes and explain:\n\n- current `admin_invites` policies\n- new `admin_invites` policies\n- how invitation verification works without exposing all invitations\n- current role of `youness.skiri@gmail.com`\n- current role of `thebirdagencyma@gmail.com`\n- how AuthCallback will determine the final role\n\nDo not execute until these security points are incorporated." : hero.badge}
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