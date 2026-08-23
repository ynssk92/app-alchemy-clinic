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

REBUILD THE ADMIN ROLE MANAGEMENT INTERFACE

Now that the backend RBAC architecture has been audited/hardened, rebuild the Role Management page so that an ADMIN can manage roles and configure permissions safely.

IMPORTANT:

This is NOT a new authorization system.

Use the existing:

- user_roles
- permissions
- role_permissions
- has_role()
- is_admin()
- has_permission()
- useAuth()

Do not create duplicate tables or authorization logic.
Do not modify or delete clinical data.

1. ADMIN ONLY

Only authenticated ADMIN users may access this page. Non-admin users must be blocked by protected route and backend authorization/RLS. Do not rely only on hiding the sidebar item.

2. USER SEARCH

Allow Admin to search users by name and email. After selecting a user, show Name, Email, Current role, and Account status.

3. ROLE MANAGEMENT

Admin can select Admin, Doctor, Assistant, or Patient. Admin can change another user's role. The current logged-in Admin must NOT be able to modify their own role. When viewing themselves, show role and permissions as READ ONLY.

4. PERMISSION MANAGEMENT

Clearly separate ROLE and PERMISSIONS. For Doctor and Assistant, display a grouped permission matrix with clean checkboxes/toggles and a Save button for Patients, Appointments, Medical Records, Prescriptions, Billing, Messages, Reports, User Management, Role Management, Invitations, and Audit Logs.

5. ADMIN PERMISSIONS

Admin is FULL ACCESS. Do not require the Admin to manually enable every permission. Clearly indicate ADMIN / Full Access. Admin permissions must not accidentally be removed through normal permission editing.

6. DOCTOR

Doctor permissions are configurable by Admin and changes must be stored in role_permissions. Do not hardcode Doctor permissions in frontend code.

7. ASSISTANT

Assistant permissions are configurable by Admin and stored in role_permissions.

8. PATIENT

Patient permissions must remain restricted. Patients must never gain users.manage, roles.manage, permissions.manage, admin_invites, administrative reports, or unrestricted clinical data access. Patient RLS must continue enforcing ownership.

9. SAVE BEHAVIOR

Update role_permissions safely, do not create duplicate mappings or delete unrelated mappings, show success/error feedback, and refresh permissions after save. Update user_roles using the secure backend mechanism. Do not allow self-role modification or removing the last Admin.

10. UX

Make the page professional and clear using the existing clinic visual identity. Do not change unrelated pages.

11. SECURITY

Frontend controls are NOT the security boundary. All sensitive operations must still be protected by RLS, is_admin(), has_role(), and has_permission(). A malicious user must not be able to call Supabase directly and change their own role, another user's role, or role permissions unless authorized as Admin.

12. VERIFY

Test that Admin can manage another user and configure Doctor and Assistant permissions; Doctor, Assistant, and Patient cannot access role management; and Admin cannot accidentally remove their own Admin role.

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