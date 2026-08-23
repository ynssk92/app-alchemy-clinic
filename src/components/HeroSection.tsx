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
              {hero.badge === "CLINIQUE LA DUNE DENTAIRE" ? "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            Fix the Role Verification Tool security and redesign its purpose.\n\nIMPORTANT:\nThe current Role Verification Tool is insecure because a normal user can access it and attempt to switch their own role.\n\nThis MUST NOT be allowed.\n\nThe authorization rule must be:\n\nONLY an authorized ADMIN with the appropriate user/role management permission can access and use Role Verification.\n\nDoctors, Assistants, and Patients must NOT have access to this tool.\n\n--------------------------------------------------\n1. ACCESS CONTROL\n--------------------------------------------------\n\nRestrict the entire Role Verification Tool to administrators who have the appropriate role-management permission.\n\nUse the existing backend authorization system:\n\n- user_roles\n- role_permissions\n- has_role()\n- is_admin()\n- has_permission()\n\nDo NOT rely only on hiding the page from the sidebar.\n\nIf a non-admin manually opens the Role Verification URL:\n\n→ deny access\n→ show Access Denied\n→ do not load the tool's protected data\n→ do not allow any role modification\n\nThe backend must enforce the same restriction.\n\n--------------------------------------------------\n2. NEVER ALLOW SELF ROLE ESCALATION\n--------------------------------------------------\n\nA user must NEVER be able to change their own role.\n\nEspecially:\n\nPatient → Admin\nPatient → Doctor\nPatient → Assistant\n\nDoctor → Admin\n\nAssistant → Admin\n\nmust all be impossible for the user themselves.\n\nDo NOT solve this only in React.\n\nThe database/RLS must reject unauthorized `user_roles` modifications.\n\n--------------------------------------------------\n3. ROLE VERIFICATION PURPOSE\n--------------------------------------------------\n\nThe current UI shows:\n\nCURRENT USER\nthebirdagencyma@gmail.com\n\nACTIVE ROLE\nPatient\n\nand then buttons:\n\nAdmin\nDoctor\nAssistant\nPatient\n\nThis design encourages users to change their own role.\n\nReplace this behavior.\n\nThe tool should be an ADMIN-ONLY role management/testing interface.\n\nAn authorized admin should first select/search for a USER.\n\nExample:\n\nUser:\nthebirdagencyma@gmail.com\n\nCurrent Role:\nPatient\n\nThen show:\n\nChange Role\n\n[ Admin ] [ Doctor ] [ Assistant ] [ Patient ]\n\nThe selected role applies to the SELECTED USER, not automatically to the currently logged-in administrator.\n\n--------------------------------------------------\n4. ADMIN-ONLY ROLE MANAGEMENT\n--------------------------------------------------\n\nAn authorized admin can:\n\n- search users\n- view current role\n- change another user's role\n- view the permissions inherited from that role\n\nExample:\n\nUser:\npatient@example.com\n\nCurrent Role:\nPatient\n\nChange to:\nDoctor\n\nAfter confirmation:\n\nuser_roles.role = doctor\n\nThe user then inherits all permissions configured for the Doctor role.\n\n--------------------------------------------------\n5. CONFIRMATION\n--------------------------------------------------\n\nBefore changing a role, show a confirmation dialog:\n\nChange role?\n\nUser:\npatient@example.com\n\nCurrent:\nPatient\n\nNew:\nDoctor\n\n[Cancel] [Confirm]\n\nDo not change anything until the admin confirms.\n\n--------------------------------------------------\n6. SELF-MODIFICATION PROTECTION\n--------------------------------------------------\n\nEven an admin should not be able to accidentally remove their own admin role through this interface.\n\nPrevent:\n\nAdmin → Patient\nAdmin → Doctor\nAdmin → Assistant\n\nfor the currently authenticated administrator unless there is an explicit, safe multi-admin workflow.\n\nThe system must always preserve at least one administrator.\n\nKeep the existing last-admin protection.\n\n--------------------------------------------------\n7. BACKEND SECURITY\n--------------------------------------------------\n\nCreate/use a secure backend mechanism for role changes.\n\nThe operation must verify:\n\n1. authenticated user exists\n2. authenticated user is an authorized admin\n3. target user is different from the current user\n4. requested role is one of:\n   - admin\n   - doctor\n   - assistant\n   - patient\n5. last-admin protection is respected\n\nDo NOT allow the client to directly bypass authorization by calling:\n\nsupabase.from('user_roles').insert(...)\n\nor:\n\nsupabase.from('user_roles').update(...)\n\nfrom an unauthorized account.\n\nUnauthorized attempts must fail through RLS/backend enforcement.\n\n--------------------------------------------------\n8. ROLE VERIFICATION TOOL VISIBILITY\n--------------------------------------------------\n\nSidebar/navigation:\n\nAdmin with required permission:\n→ show Role Verification / Role Management.\n\nDoctor:\n→ hide.\n\nAssistant:\n→ hide.\n\nPatient:\n→ hide.\n\nDirect URL access:\n\nDoctor → Access Denied\nAssistant → Access Denied\nPatient → Access Denied\n\nOnly authorized admin → access granted.\n\n--------------------------------------------------\n9. ACTIVE PERMISSIONS\n--------------------------------------------------\n\nKeep the Active Permissions section, but make it read-only.\n\nIt should display the permissions inherited by the SELECTED user's current role.\n\nExample:\n\nSelected User:\nDr. Ahmed\n\nRole:\nDoctor\n\nActive Permissions:\npatients.view\npatients.edit\nappointments.view\nappointments.edit\nmedical_records.view\nmedical_records.edit\nprescriptions.view\nprescriptions.edit\n\nDo NOT allow users to edit individual permissions here.\n\nPermissions remain ROLE-BASED.\n\n--------------------------------------------------\n10. DO NOT CREATE PER-USER PERMISSIONS\n--------------------------------------------------\n\nDo NOT create:\n\nuser_permissions\n\nDo NOT create per-user permission overrides.\n\nThe system remains:\n\nuser\n→ role\n→ role_permissions\n→ effective permissions\n\nChanging Doctor role permissions affects all Doctors.\n\n--------------------------------------------------\n11. ROLE MANAGEMENT VS TESTING\n\nIf the existing page was originally intended only as a development/testing tool, preserve its useful verification functionality but make it accessible only to authorized administrators.\n\nDo not expose a production self-role-switcher.\n\nThe final UI should clearly communicate:\n\n\"Role Management\"\n\nor:\n\n\"Role Verification\"\n\nand make it clear that the administrator is managing a SELECTED USER.\n\n--------------------------------------------------\n12. SECURITY TESTS\n\nVerify:\n\nPATIENT:\n- cannot see Role Verification in sidebar\n- cannot open the route directly\n- cannot modify user_roles\n- cannot make themselves admin\n\nDOCTOR:\n- cannot access Role Verification\n- cannot change their role\n- cannot promote themselves\n\nASSISTANT:\n- cannot access Role Verification\n- cannot change their role\n\nADMIN:\n- can access Role Verification\n- can select another user\n- can change that user's role\n- can view that user's inherited permissions\n\nSELF-PROTECTION:\n- admin cannot accidentally remove the final administrator\n- admin cannot demote themselves through this tool\n\nBACKEND:\n- unauthorized user_roles modifications fail\n- frontend hiding is NOT the only protection\n\n--------------------------------------------------\n13. DATA SAFETY\n\nDo NOT:\n\n- DROP tables\n- TRUNCATE data\n- delete users\n- delete patients\n- delete appointments\n- delete medical records\n- delete prescriptions\n- delete invoices\n- reset the database\n- recreate existing tables\n\nOnly modify role records when an authorized administrator explicitly changes a user's role.\n\nPreserve all existing data and functionality.\n\n--------------------------------------------------\n14. IMPORTANT\n\nDo NOT weaken existing RLS to make the current error disappear.\n\nThe current error:\n\n\"Failed to switch role: new row violates row-level security policy for table user_roles\"\n\nis actually evidence that unauthorized role modification is being blocked.\n\nDo NOT remove that protection.\n\nInstead, redesign the UI and backend flow so that ONLY authorized administrators can perform legitimate role changes.\n\nBefore implementing database changes, show the proposed RLS/backend changes and explain how self-role escalation will be prevented." : hero.badge}
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