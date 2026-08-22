import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { usePageContent } from "@/hooks/usePageContent";

const defaultHero = {
  badge: "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            Fix ONLY the doctor profile photo display in the \"Your Appointments\" section of the patient dashboard.\n\nIMPORTANT:\n\n- DO NOT modify, recreate, migrate, rename, or delete any database tables.\n\n- DO NOT modify existing database columns, relationships, RLS policies, authentication, appointments logic, or doctor creation logic.\n\n- DO NOT change how doctors are created or how profile photos are uploaded/stored.\n\n- DO NOT alter appointment data or existing dashboard functionality.\n\n- This is a targeted frontend/data-display fix only.\n\nCURRENT ISSUE:\n\nWhen an admin creates a doctor and uploads a profile photo, the photo correctly exists and is displayed in the Doctors management page. However, in the patient dashboard under \"Your Appointments\", appointment cards display only the doctor's initials (for example \"DS\", \"DI\", \"DA\", \"DH\") instead of the doctor's uploaded profile photo.\n\nEXPECTED BEHAVIOR:\n\nEach appointment card should display the actual profile photo of the doctor associated with that appointment.\n\nIMPLEMENTATION:\n\n1. Inspect the existing Doctors page and identify exactly which existing doctor field contains the profile photo URL/path.\n\n2. Inspect the existing appointment query and determine how the appointment is already linked to the doctor.\n\n3. Reuse the existing doctor relationship/data and existing photo field. Do NOT create a new field.\n\n4. When loading appointments, make sure the associated doctor's existing profile photo is available to the appointment card.\n\n5. In the appointment card:\n\n   - If the doctor has a valid profile photo URL, render the photo.\n\n   - If no photo exists or the URL is invalid, keep the current initials avatar as a fallback.\n\n6. Do not hardcode doctor names or image URLs.\n\n7. Do not create duplicate doctor records.\n\n8. Do not change the appointment database structure.\n\n9. Preserve all current appointment information:\n\n   - doctor name\n\n   - specialty\n\n   - appointment status\n\n   - date\n\n   - time\n\n   - existing styling\n\n10. Keep the current compact card design and simply replace the initials avatar with the doctor's real profile image when available.\n\n11. Make sure the image is properly cropped using object-fit: cover and remains visually clean inside the existing avatar container.\n\n12. Add a safe image fallback so a broken/missing image automatically returns to the doctor's initials.\n\n13. Verify that this works for ALL doctors dynamically, not only the doctors currently visible in the screenshot.\n\nIMPORTANT SAFETY RULE:\n\nBefore changing anything, inspect the existing schema, existing doctor data query, existing appointment query, and the Doctors page implementation. Reuse what already exists. Do not \"fix\" this by creating new database columns or changing the schema.\n\nAfter implementation, verify:\n\n- Create/add a doctor with a profile photo.\n\n- Confirm the photo appears in the Doctors page.\n\n- Create or use an appointment for that doctor.\n\n- Open the patient dashboard.\n\n- Confirm the same doctor's uploaded photo appears in \"Your Appointments\".\n\n- Confirm doctors without photos still show initials.\n\n- Confirm no existing appointment, patient, doctor, billing, authentication, or backend functionality is affected.\n\nOnly make the minimum changes necessary for this specific issue.",
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
