import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { usePageContent } from "@/hooks/usePageContent";

const defaultHero = {
  badge: "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            FIX GLOBAL ADMIN SEARCH — PATIENT NAME SEARCH IS NOT WORKING\n\nIMPORTANT:\n\nThe global Admin Panel search is currently NOT finding existing patients.\n\nREAL EXAMPLE:\n\nThere is an existing patient in the database:\n\nFirst name: Rabie\n\nLast name: Kenzi\n\nBut when I search:\n\n\"Rabie Kenzi\"\n\n→ NO RESULT\n\nWhen I search:\n\n\"Rabie\"\n\n→ NO RESULT\n\nWhen I search:\n\n\"Kenzi\"\n\n→ NO RESULT\n\nThis means the current global search is not correctly querying the\n\npatient name fields.\n\nDO NOT just change the UI.\n\nFIX THE ACTUAL SEARCH QUERY / DATA SEARCH LOGIC.\n\n==================================================\n\nSTEP 1 — INSPECT THE REAL DATABASE SCHEMA\n\n==================================================\n\nBefore changing code, inspect the existing patient table and determine\n\nEXACTLY how the patient's name is stored.\n\nIt may be:\n\nfirst_name + last_name\n\nor:\n\nfull_name\n\nor another existing structure.\n\nDO NOT assume the column names.\n\nUse the actual schema currently used by the application.\n\nFor the existing patient:\n\nRabie Kenzi\n\nthe search must be able to find the patient using:\n\nRabie\n\nKenzi\n\nRabie Kenzi\n\nrabie\n\nkenzi\n\nRABIE\n\nKENZI\n\nSearch must be case-insensitive.\n\n==================================================\n\nSTEP 2 — FIX PATIENT SEARCH\n\n==================================================\n\nThe global search must query the REAL patient data.\n\nIf the database stores:\n\nfirst_name\n\nlast_name\n\nthen support:\n\nfirst_name ILIKE '%search%'\n\nOR\n\nlast_name ILIKE '%search%'\n\nFor a full name search such as:\n\n\"Rabie Kenzi\"\n\nthe search must also correctly match the combination of\n\nfirst_name + last_name.\n\nDo NOT only search one column.\n\nDo NOT only search email.\n\nDo NOT only search patient ID.\n\nDo NOT rely on data already loaded on the current page.\n\nSearch the actual database.\n\n==================================================\n\nSTEP 3 — HANDLE MULTI-WORD SEARCH\n\n==================================================\n\nIf the user enters:\n\nRabie Kenzi\n\nthe search should intelligently handle the two words.\n\nIt should be able to find:\n\nfirst_name = Rabie\n\nlast_name = Kenzi\n\nThe order should preferably also work:\n\nKenzi Rabie\n\nDo not require the user to type the exact database string.\n\n==================================================\n\nSTEP 4 — SEARCH OTHER PATIENT FIELDS\n\n==================================================\n\nAt minimum, patient search must support:\n\n- First name\n\n- Last name\n\n- Full name\n\n- Email\n\n- Phone\n\n- Patient ID\n\nIf the patient table already contains:\n\n- CIN\n\n- passport number\n\n- nationality\n\n- city\n\ninclude them in search as well.\n\nDo NOT create duplicate columns.\n\n==================================================\n\nSTEP 5 — DEBUG THE CURRENT IMPLEMENTATION\n\n==================================================\n\nInspect the current global search implementation.\n\nFind out why:\n\nRabie\n\nKenzi\n\nRabie Kenzi\n\nreturn zero results even though the patient exists.\n\nCheck for:\n\n- wrong table name\n\n- wrong column names\n\n- wrong query\n\n- incorrect Supabase `.or()` syntax\n\n- incorrect filtering\n\n- searching only loaded records\n\n- case-sensitive matching\n\n- searching the wrong field\n\n- frontend filtering after incomplete data fetch\n\n- incorrect relationship/query\n\n- permission/RLS issue\n\nFix the actual root cause.\n\nDo NOT hide the problem with hardcoded data.\n\n==================================================\n\nSTEP 6 — RLS / SECURITY\n\n==================================================\n\nDo NOT disable or weaken RLS.\n\nDo NOT use a service-role key in the frontend.\n\nThe search must respect the currently authenticated user's permissions.\n\nIf the admin can already see the patient in the Patients page,\n\nthe global search should be able to find the same patient.\n\n==================================================\n\nSTEP 7 — SEARCH RESULT\n\n==================================================\n\nWhen searching:\n\nRabie\n\nshow:\n\nPATIENTS\n\nRabie Kenzi\n\n[existing phone/email if available]\n\nWhen searching:\n\nKenzi\n\nshow:\n\nPATIENTS\n\nRabie Kenzi\n\n[existing phone/email if available]\n\nWhen searching:\n\nRabie Kenzi\n\nshow:\n\nPATIENTS\n\nRabie Kenzi\n\nClicking the result must open the EXISTING patient profile/details page.\n\nDo not create a new patient page or new route.\n\n==================================================\n\nSTEP 8 — NO MOCK DATA\n\n==================================================\n\nDO NOT hardcode:\n\nRabie Kenzi\n\nThis name is only a TEST CASE.\n\nThe implementation must work for ALL existing patients.\n\nFor example:\n\nMohamed Lakhsassi\n\nMalika Baakil\n\nKhalil Skiri\n\nYouness Skiri\n\nRabie Kenzi\n\nand any future patients added to the database.\n\n==================================================\n\nSTEP 9 — PERFORMANCE\n\n==================================================\n\nUse a small debounce around 250–350ms.\n\nDo not query the database on every single keystroke.\n\nStart searching after at least 2 characters.\n\nUse efficient database queries.\n\nDo not download the entire patient table to the browser.\n\n==================================================\n\nSTEP 10 — IMPORTANT BACKEND SAFETY\n\n==================================================\n\nDO NOT:\n\n- delete tables\n\n- drop columns\n\n- rename columns\n\n- recreate the patients table\n\n- modify existing patient records\n\n- modify appointments\n\n- modify invoices\n\n- modify doctors\n\n- modify authentication\n\n- modify RLS unnecessarily\n\n- modify unrelated functionality\n\nOnly fix the search implementation and, if absolutely necessary,\n\nmake a SAFE additive database change such as a search index/function.\n\nNo destructive migration.\n\n==================================================\n\nFINAL TEST — MUST PASS\n\n==================================================\n\nAfter fixing the implementation, manually verify:\n\nSearch:\n\n\"Rabie\"\n\n→ Rabie Kenzi appears\n\nSearch:\n\n\"Kenzi\"\n\n→ Rabie Kenzi appears\n\nSearch:\n\n\"Rabie Kenzi\"\n\n→ Rabie Kenzi appears\n\nSearch:\n\n\"rabie kenzi\"\n\n→ Rabie Kenzi appears\n\nSearch:\n\n\"RABIE\"\n\n→ Rabie Kenzi appears\n\nSearch:\n\n\"Kenz\"\n\n→ Rabie Kenzi appears\n\nSearch using the patient's phone\n\n→ Rabie Kenzi appears\n\nSearch using the patient's email\n\n→ Rabie Kenzi appears\n\nClick Rabie Kenzi\n\n→ existing patient profile opens correctly.\n\nThen test at least 3 other existing patients to make sure the\n\nimplementation is generic and not hardcoded.\n\nIMPORTANT:\n\nDo not tell me the search is fixed unless these test cases actually\n\nreturn the existing database record.\n\nThis is a REAL DATA SEARCH FIX, not a UI redesign.\n\nPreserve the rest of the application exactly as it is.",
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
