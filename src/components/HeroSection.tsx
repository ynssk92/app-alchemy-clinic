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
              {hero.badge === "CLINIQUE LA DUNE DENTAIRE" ? "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            IMPORTANT CORRECTION TO THE PLAN:\n\nThe proposed claim_invitation_role logic must be adjusted.\n\nDo NOT simply do:\n\n\"If user already has any role → return it.\"\n\nThis can break invitation assignment because a new user may already have the default \"patient\" role before the invitation is processed.\n\nThe invitation must have priority over the default patient role.\n\nUse this exact role resolution logic:\n\n1. Get the authenticated user's verified email.\n\n2. Check existing user_roles.\n\n3. If the existing role is:\n   - admin\n   - doctor\n   - assistant\n\n   KEEP the existing role.\n   Never overwrite these roles automatically.\n\n4. If the existing role is \"patient\":\n   Check for a pending invitation matching the authenticated email.\n\n   If a pending invitation exists:\n      - replace patient with the invited role\n      - mark invitation as claimed\n      - associate invitation with auth user\n      - return the invited role\n\n   If no invitation exists:\n      - keep patient\n\n5. If the user has NO role:\n   Check for a pending invitation.\n\n   If invitation exists:\n      - assign invited role\n      - claim invitation\n      - return invited role\n\n   Otherwise:\n      - assign patient\n      - return patient\n\nIMPORTANT PRIORITY:\n\nExisting privileged role\n    >\nPending invitation\n    >\nDefault patient\n\nBut \"patient\" is only a default role and MUST NOT block a valid pending invitation.\n\nExamples:\n\nNEW USER + invitation Assistant\n→ Assistant\n\nNEW USER + no invitation\n→ Patient\n\nExisting Patient + pending invitation Assistant\n→ Assistant\n\nExisting Patient + no invitation\n→ Patient\n\nExisting Doctor + invitation Assistant\n→ Doctor\n\nExisting Admin + invitation Patient\n→ Admin\n\nExisting Assistant + invitation Doctor\n→ Assistant\n\nNever automatically overwrite an existing privileged role.\n\n--------------------------------------------------\nSECURITY DEFINER\n--------------------------------------------------\n\nFor claim_invitation_role():\n\nUse:\n\nSECURITY DEFINER\nSET search_path = public\n\nVerify:\n\nauth.uid() IS NOT NULL\n\nUse the authenticated user's verified email from auth.users.\n\nNormalize:\n\nLOWER(TRIM(email))\n\nMatch the invitation using normalized email.\n\nThe caller must NEVER be able to provide an arbitrary email or user_id to claim someone else's invitation.\n\nThe function itself must determine:\n\nuser_id = auth.uid()\nemail = authenticated user's verified email\n\nDo not trust these values from the frontend.\n\n--------------------------------------------------\nATOMICITY\n--------------------------------------------------\n\nThe role assignment and invitation claiming should happen atomically.\n\nIf assigning the role succeeds but claiming the invitation fails, do not leave the system in an inconsistent state.\n\nAvoid duplicate claims if the user refreshes the callback or the callback runs more than once.\n\nThe function should safely be idempotent.\n\n--------------------------------------------------\nAUTH CALLBACK\n--------------------------------------------------\n\nAuthCallback.tsx should call claim_invitation_role immediately after authentication.\n\nDo NOT create the default patient role before calling the RPC.\n\nDo NOT have another client-side function assign patient before the RPC.\n\nThe sequence must be:\n\nGoogle authentication\n→ AuthCallback\n→ claim_invitation_role()\n→ resolved role\n→ load permissions\n→ redirect\n\nRemove duplicate role assignment logic from AuthCallback/useAuth that could overwrite the RPC result.\n\n--------------------------------------------------\nINITIAL ADMIN\n--------------------------------------------------\n\nKeep the existing initial admin bootstrap only if necessary.\n\nIt must run only when the user has no privileged existing role.\n\nNever allow the default patient logic to overwrite:\n\nadmin\ndoctor\nassistant\n\n--------------------------------------------------\nVERIFICATION\n\nTest this exact case:\n\n1. Create invitation:\n\nmerchyns1@gmail.com → Assistant\n\n2. Make sure the account has no privileged role.\n\n3. Sign in with Google.\n\nExpected:\n\nuser_roles = assistant\ninvitation = claimed\npermissions = Assistant permissions\ndashboard = Assistant\n\nAlso test:\n\nexisting Patient + pending Assistant invitation\n→ Assistant\n\nexisting Admin + invitation Assistant\n→ Admin\n\nnew user + no invitation\n→ Patient\n\nexisting Doctor + no invitation\n→ Doctor\n\nNo existing privileged role should ever be downgraded automatically." : hero.badge}
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