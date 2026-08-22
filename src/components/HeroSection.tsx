import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { usePageContent } from "@/hooks/usePageContent";

const defaultHero = {
  badge: "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            IMPORTANT: Fix and configure Google OAuth authentication safely WITHOUT breaking or changing any existing application functionality, database structure, routes, roles, or UI.\n\nI need you to implement/fix the Google OAuth login flow for the existing application.\n\nGOALS:\n\n1. GOOGLE OAUTH CALLBACK\n\n- Make sure the route below exists and is correctly handled:\n\n  /~oauth/callback\n\n- If the route does not exist, create it safely.\n\n- The callback must correctly process the authentication session returned by Google/Supabase.\n\n- Do NOT create a duplicate authentication system.\n\n- Reuse the existing authentication provider, Supabase client, session handling, and auth utilities already present in the project.\n\n- Do not change existing email/password authentication.\n\n2. GOOGLE LOGIN\n\n- Make sure the existing \"Continue with Google\" / Google login button uses the correct OAuth flow.\n\n- Use the existing Supabase authentication configuration.\n\n- Do not hardcode secrets, client secrets, service-role keys, or sensitive credentials in frontend code.\n\n- Do not modify database tables or existing RLS policies unless absolutely required for the OAuth flow.\n\n- Do not remove or replace existing authentication logic.\n\n3. AFTER SUCCESSFUL LOGIN\n\nAfter Google authentication succeeds:\n\n- Detect the authenticated user's role using the existing application logic/profile data.\n\n- If the authenticated user is a patient, redirect directly to:\n\n  /patient-dashboard\n\n- Do NOT redirect the patient to /login, /profile, /auth, or another intermediate page.\n\n- Do NOT create redirect loops.\n\n- If the user is an admin, doctor, or another existing role, preserve the current role-based redirect behavior.\n\n- Do not change existing admin/doctor routing.\n\n4. NEW GOOGLE USERS\n\nIf a Google user authenticates successfully but does not yet have a patient profile:\n\n- Safely create/link the patient profile using the existing application logic.\n\n- Reuse the authenticated user's existing auth user ID.\n\n- Do not create duplicate patient records.\n\n- Do not overwrite an existing patient's information.\n\n- If an existing patient is already linked to the authenticated email/user, reuse that profile.\n\n- Then redirect the patient to /patient-dashboard.\n\n5. EXISTING USERS\n\n- Existing users must continue working exactly as before.\n\n- Existing email/password login must continue working.\n\n- Existing patient accounts must not be duplicated.\n\n- Existing appointments, invoices, doctors, services, messages, profiles, and all other application data must remain untouched.\n\n6. ROUTE PROTECTION\n\n- Make sure /patient-dashboard remains protected according to the existing authentication system.\n\n- An unauthenticated user should not be able to access the patient dashboard.\n\n- After successful Google authentication, the session must be available before redirecting to /patient-dashboard.\n\n- Avoid redirecting before the auth session has been fully established.\n\n7. CALLBACK HANDLING\n\nImplement the callback flow defensively:\n\n- Handle successful OAuth callback.\n\n- Handle missing/invalid OAuth session gracefully.\n\n- Handle OAuth errors gracefully.\n\n- Do not leave the user stuck on a blank page.\n\n- Prevent duplicate callback processing.\n\n- Prevent infinite redirects.\n\n8. IMPORTANT SAFETY RULES\n\nBefore modifying anything:\n\n- Inspect the existing authentication architecture.\n\n- Inspect the existing routes and route guards.\n\n- Inspect the existing Supabase auth/session utilities.\n\n- Inspect the existing patient profile creation/linking logic.\n\n- Inspect the current Google OAuth implementation if one already exists.\n\nThen make the SMALLEST possible changes required.\n\nDO NOT:\n\n- Rewrite the authentication system.\n\n- Replace Supabase.\n\n- Change the database schema unnecessarily.\n\n- Delete existing tables.\n\n- Delete existing RLS policies.\n\n- Change existing user roles.\n\n- Change existing dashboard functionality.\n\n- Change the UI unnecessarily.\n\n- Remove existing login methods.\n\n- Modify unrelated pages/components.\n\n- Reset or recreate the database.\n\n- Introduce mock authentication.\n\n- Hardcode credentials or secrets.\n\n9. VERIFICATION\n\nAfter implementation, verify all of these flows:\n\nA. Existing email/password patient login\n\n→ works normally\n\n→ redirects to /patient-dashboard\n\nB. Google login with an existing patient\n\n→ Google authentication succeeds\n\n→ existing patient is detected\n\n→ redirects to /patient-dashboard\n\nC. Google login with a new patient\n\n→ authentication succeeds\n\n→ patient profile is safely created/linked\n\n→ redirects to /patient-dashboard\n\nD. Admin login\n\n→ keeps existing admin redirect behavior\n\nE. Doctor login\n\n→ keeps existing doctor redirect behavior\n\nF. Unauthenticated access to /patient-dashboard\n\n→ remains protected\n\nG. Refreshing /patient-dashboard\n\n→ session remains valid\n\n→ no redirect loop\n\nH. OAuth callback\n\n→ /~oauth/callback works correctly\n\n→ no blank screen\n\n→ no infinite redirect\n\nFinally, run the project's build/type/lint checks and fix ONLY errors caused by this implementation.\n\nIMPORTANT:\n\nThis is a production application with existing data and functionality.\n\nPreserve everything that already works.\n\nMake the smallest safe change possible and do not touch unrelated backend or frontend functionality.",
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
