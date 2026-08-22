import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { usePageContent } from "@/hooks/usePageContent";

const defaultHero = {
  badge: "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            /*\nGLOBAL ADMIN PANEL SEARCH — FUNCTIONAL FIX\n\nIMPORTANT:\nImplement a REAL global search for the Admin Panel search bar.\n\nThe current search bar does not return results when searching for\nexisting patients or other application data.\n\nI want the search bar to actually search the application's existing data\nand display matching results while typing.\n\n==================================================\nCORE REQUIREMENT\n==================================================\n\nWhen the admin types something in the top search bar:\n\nExample:\n\n\"mohamed\"\n\nThe application must search the EXISTING database/application data and\nshow matching results immediately.\n\nExample result:\n\nPATIENTS\nMohamed Lakhsassi\n0668985632\nmohamed@email.com\n\nThe search must NOT use mock data.\n\nIt must use the real existing application data.\n\n==================================================\nWHAT SHOULD BE SEARCHABLE\n==================================================\n\nAt minimum search across:\n\nPATIENTS\n- First name\n- Last name\n- Full name\n- Email\n- Phone\n- Patient ID\n- CIN / passport number if available\n- City if available\n\nDOCTORS\n- Doctor name\n- Email if available\n- Phone if available\n- Specialty\n\nAPPOINTMENTS\n- Patient name\n- Doctor name\n- Appointment reference\n- Appointment status\n- Appointment date\n\nINVOICES\n- Invoice number\n- Patient name\n- Invoice status\n\nSERVICES\n- Service name\n- Service code\n- Category\n\nIf other major searchable entities already exist in the application,\ninclude them as well where appropriate.\n\n==================================================\nSEARCH BEHAVIOR\n==================================================\n\nSearch should work as the user types.\n\nExample:\n\nUser types:\n\nm\n\n→ show matching results\n\nUser types:\n\nmo\n\n→ refine results\n\nUser types:\n\nmohamed\n\n→ show Mohamed Lakhsassi and any other matching records\n\nUser types:\n\n0668\n\n→ find patients matching that phone number\n\nUser types:\n\ndermatologist\n\n→ show matching doctors/services/appointments where applicable\n\nThe search should be case-insensitive.\n\nThese should all work:\n\nMohamed\nmohamed\nMOHAMED\n\n==================================================\nSEARCH RESULTS UI\n==================================================\n\nDisplay results in a clean dropdown below the search bar.\n\nOrganize results by category:\n\nPATIENTS\n--------------------------------\n👤 Mohamed Lakhsassi\n    0668985632\n\n👤 Mohamed ...\n    ...\n\nDOCTORS\n--------------------------------\n🩺 Dr. Imad Bakir\n    Dermatologist\n\nAPPOINTMENTS\n--------------------------------\n📅 Mohamed Lakhsassi\n    30 September 2026 · 09:30\n\nINVOICES\n--------------------------------\n🧾 INV-2026-000123\n    Mohamed Lakhsassi\n\nOnly show categories that actually contain results.\n\n==================================================\nCLICK BEHAVIOR\n==================================================\n\nClicking a result must navigate to the EXISTING relevant page.\n\nPatient result:\n→ open the existing patient profile/details page.\n\nDoctor result:\n→ open the existing doctor profile/details page.\n\nAppointment result:\n→ open the existing appointment/details page.\n\nInvoice result:\n→ open the existing invoice/details page.\n\nDo NOT create new routes if existing routes already exist.\n\nReuse the existing navigation and routing system.\n\n==================================================\nNO RESULTS\n==================================================\n\nIf the user searches for something that does not exist:\n\nShow:\n\nNo results found\n\n\"No patients, doctors, appointments or invoices match your search.\"\n\nDo not show an empty dropdown.\n\n==================================================\nEMPTY SEARCH\n==================================================\n\nWhen the search field is empty:\n\nDo not perform unnecessary database queries.\n\nOptionally show recent searches or useful shortcuts ONLY if the\napplication already has such functionality.\n\nDo not create unnecessary new database structures.\n\n==================================================\nPERFORMANCE\n==================================================\n\nIMPORTANT:\n\nDo NOT download the entire database into the browser just to search.\n\nUse efficient database queries against the existing tables.\n\nImplement debounced search:\n\n~250–350ms debounce while typing.\n\nAvoid sending a database request for every single keystroke.\n\nOnly search after the user has entered at least 1–2 characters.\n\nUse the existing Supabase/database client and existing authentication.\n\n==================================================\nSECURITY\n==================================================\n\nThe global search must respect the CURRENT user's permissions.\n\nAn admin should only receive data that the current authenticated user\nis already authorized to access.\n\nDo NOT bypass RLS.\n\nDo NOT expose protected patient information to unauthorized users.\n\nDo NOT use service-role keys in frontend code.\n\nDo NOT weaken existing RLS policies just to make search work.\n\n==================================================\nIMPORTANT BACKEND SAFETY\n==================================================\n\nBefore changing anything:\n\n1. Inspect the existing database schema.\n2. Inspect existing patient/doctor/appointment/invoice queries.\n3. Inspect existing routes.\n4. Inspect existing search components/hooks.\n5. Reuse existing queries and data structures where possible.\n\nDo NOT break existing functionality.\n\nDo NOT:\n- delete tables\n- rename tables\n- drop columns\n- recreate tables\n- change patient relationships\n- change appointment relationships\n- change invoice relationships\n- change authentication\n- change roles\n- remove RLS\n- modify unrelated pages\n\nIf a database search function/index is genuinely required for performance,\ncreate it using a SAFE additive migration only.\n\nDo not make destructive database changes.\n\n==================================================\nSEARCH BAR\n==================================================\n\nKeep the current search bar design and position.\n\nImprove it only as necessary to support the functionality.\n\nPlaceholder:\n\n\"Search patients, doctors, appointments...\"\n\nWhen focused:\n- show results dropdown\n- subtle shadow\n- clean white background\n- professional clinic UI\n\n==================================================\nKEYBOARD SUPPORT\n==================================================\n\nSupport:\n\nArrow Up\nArrow Down\nEnter\nEscape\n\nEnter:\n→ open selected result\n\nEscape:\n→ close search results\n\n==================================================\nFINAL TESTING\n==================================================\n\nAfter implementation test all of these:\n\n1. Search an existing patient's first name.\n2. Search an existing patient's last name.\n3. Search full patient name.\n4. Search patient phone number.\n5. Search patient email.\n6. Search doctor name.\n7. Search specialty.\n8. Search appointment reference.\n9. Search invoice number.\n10. Search with uppercase letters.\n11. Search with lowercase letters.\n12. Search with partial text.\n13. Search for a nonexistent value.\n14. Click a patient result.\n15. Click a doctor result.\n16. Click an appointment result.\n17. Click an invoice result.\n18. Verify unauthorized data is NOT exposed.\n19. Verify existing pages still work.\n20. Verify no existing database records were modified.\n\n==================================================\nCRITICAL\n==================================================\n\nThis is NOT a visual-only change.\n\nThe search must actually work with the REAL application data.\n\nDo not fake the results.\n\nDo not hardcode patient names.\n\nDo not create mock search results.\n\nUse the existing database and existing authenticated access.\n\nMake this a safe, surgical implementation without breaking\nthe rest of the application.\n*/",
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
