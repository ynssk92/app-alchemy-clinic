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
              {`'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''

FINAL RBAC INTEGRATION AND SECURITY VERIFICATION

Now integrate the RBAC system across the application and verify that frontend visibility, routes, permissions, and backend RLS all agree.

IMPORTANT:

Do not redesign unrelated pages.
Do not delete or modify clinical data.
Do not create a second permission system.
Use the existing database authorization architecture.

1. useAuth

Audit src/hooks/useAuth.tsx. It must expose authoritative user, role, permissions, and isAdmin. Role must come from user_roles. Permissions must come from role_permissions + permissions. Do not use hardcoded role overrides. Do not let frontend state grant privileges. Refresh role/permissions correctly after login, logout, role change, permission change, and invitation claim.

2. ROUTE PROTECTION

Audit ProtectedRoute and permission-based route protection. Routes must verify permissions: Patients patients.view; Appointments appointments.view; Medical Records medical_records.view; Prescriptions prescriptions.view; Billing invoices.view; Reports reports.view; Users users.view; Role Management roles.manage; Admin Invitations admin_invites.create. Do not rely only on sidebar visibility. Unauthorized users must be redirected or blocked.

3. SIDEBAR

Sidebar items must be dynamically shown according to permissions. Keep Administration order: Users, Reports, Messages, Historique. Role Management / Roles & Permissions should only appear for users with the required admin permission. Do not show administrative modules to patients.

4. PATIENT ISOLATION

A patient must only see their own appointments, messages, profile, and medical information currently exposed to them. Do not allow Patient A to access Patient B data. RLS must enforce ownership; do not rely on frontend filtering.

5. STAFF ACCESS

Doctor and Assistant access must be controlled by has_permission(). A Doctor without patients.edit must not update patients, and an Assistant without medical_records.view must not read medical records directly through the backend. Frontend hiding is not enough.

6. ADMIN

Admin must retain full access to Users, Patients, Appointments, Medical Records, Prescriptions, Billing, Messages, Reports, Invitations, Role Management, Permissions, and Audit/History. Do not remove RLS; use existing secure admin functions.

7. INVITATION TEST

Test Admin invites test-doctor@example.com → Doctor and first Google login → Doctor; Admin invites test-assistant@example.com → Assistant and first Google login → Assistant; new Google user without invitation → Patient; existing Admin remains Admin. An invitation must never be overridden by the default patient role, and existing privileged roles must never be downgraded automatically.

8. SECURITY TESTS

Verify Patient insert into user_roles fails; Patient cannot update their own role to admin; Doctor cannot update their own role; Assistant cannot create an admin invitation unless explicitly granted; non-admin cannot modify role_permissions; Patient cannot read another patient's appointment or medical record; frontend manipulation cannot grant backend access.

9. LAST ADMIN

If only one Admin exists, demotion or deletion of that Admin must fail. The system must never reach zero administrators.

10. FINAL DATA SAFETY

Confirm no patients, appointments, medical records, prescriptions, invoices, messages, profiles, or authentication users were deleted. Existing data remains intact.

11. FINAL REPORT

After implementation, report: RBAC tables used; functions changed; RLS policies changed; frontend files changed; routes protected; sidebar permissions implemented; patient ownership protections verified; invitation flow verified; admin protections verified; tests performed; and confirmation that no clinical data was deleted or reset. If any test fails, do not hide the failure: explain exactly what failed and where.

Do not modify clinical data.`}
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