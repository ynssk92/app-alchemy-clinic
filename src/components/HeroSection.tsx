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
              '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''

                                            Update the authentication UX with the following exact behavior.

IMPORTANT:
Do NOT modify the existing role, invitation, permission, RLS, or clinical-data architecture.

AUTHENTICATION RULES:

1. LOGIN

The Login tab must provide TWO authentication methods:

A) Continue with Google
B) Email + Password

Google should be the primary/prominent option.

Email + Password should remain available for users who have previously configured a password.

The Login UI should be:

[ Continue with Google ]

        OR

Email
Password
[ Sign in ]

Remove Facebook and X/Twitter completely.

2. CREATE ACCOUNT

The Create account tab should provide ONLY:

[ Continue with Google ]

Do NOT provide public email/password registration.

New users should create their account through Google.

3. PASSWORD FROM PROFILE

A user who is already authenticated must be able to set or change their password from their Profile / Account Settings.

Provide a secure section such as:

Security
──────────────
Password
[ Set password ] / [ Change password ]

If the user already has a password:
- allow changing it
- require the current password if the existing authentication architecture supports it
- otherwise use the secure Supabase password update flow

If the user has no password yet:
- allow setting a password

After a user successfully sets a password, they must be able to log in using:

their email + password

4. GOOGLE USERS

A Google-authenticated user can continue using Google login normally.

If they set a password from their Profile, they should then have BOTH options:

Google
OR
Email + Password

5. EXISTING USERS

Do not break existing accounts.

Do not reset existing passwords.

Do not change existing authentication providers.

Do not delete authentication identities.

6. INVITATION / ROLE SYSTEM

This change MUST NOT break the existing invitation flow.

Google:

Google authentication
→ AuthCallback
→ claim_invitation_role
→ resolve role
→ load permissions
→ correct dashboard

Email + Password:

Email/password authentication
→ existing auth callback / role resolution
→ claim_invitation_role if necessary
→ resolve role
→ load permissions
→ correct dashboard

The same role-resolution system must be used regardless of whether the user authenticated through Google or Email/Password.

Example:

Admin invitation:
merchyns1@gmail.com → Assistant

User signs in with Google:
→ Assistant

Later user sets a password.

User signs in with:
merchyns1@gmail.com + password

Result:
→ Assistant

The authentication method must NEVER change the user's role.

7. DEFAULT PATIENT

A new Google user with no invitation:
→ Patient

A user who has an invitation:
→ invited role

An existing privileged user:
→ preserve existing role.

8. SECURITY

Do NOT:
- weaken RLS
- modify user_roles security
- make passwords visible
- store passwords manually
- create a custom password table
- expose passwords in frontend state
- change admin permissions
- bypass Supabase Auth

Use Supabase Auth's native password functionality.

9. UI

Keep the authentication page clean and premium.

Login:

[ Google icon ] Continue with Google

──────── OR ────────

Email
Password
[ Sign in ]

Create account:

[ Google icon ] Continue with Google

No Facebook.
No X/Twitter.
No public email/password signup.

10. IMPORTANT

Inspect the existing authentication implementation first.

Reuse the existing Google OAuth and AuthCallback.

Do not create duplicate authentication logic.

Do not modify backend role/invitation logic unless required to support email/password authentication using the same existing role-resolution flow.
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