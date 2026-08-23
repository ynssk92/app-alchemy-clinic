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

Update the Patient Edit Profile functionality to also allow editing the patient's contact information shown in the "COORDONNÉES" section.

IMPORTANT:

This is an additive frontend + data persistence update.

Do NOT remove or break any existing Patient Profile fields or functionality.

Do NOT modify roles, permissions, authentication, RLS, or unrelated backend logic.

CURRENT UI:

The patient profile displays a "COORDONNÉES" card containing:

- Téléphone

- Email

- Adresse

- Ville

- Pays

When I click "Edit Profile", I want these fields to be editable and saved together with the rest of the patient profile.

REQUIRED FIELDS IN EDIT PROFILE:

1. Téléphone

   - Text/tel input

   - Load the existing phone number

   - Allow editing

   - Save the updated value

2. Email

   - Email input

   - Load the existing email

   - Allow editing

   - Validate basic email format

   - Save the updated value according to the existing application architecture

   - Do NOT break authentication or user account identity if the current email is linked to Supabase Auth.

   - If changing the authenticated account email requires a dedicated Supabase Auth email-update flow, use the appropriate existing auth mechanism instead of directly corrupting profile/user identity data.

3. Adresse

   - Text input or textarea

   - Load existing address

   - Allow editing

   - Save updated address

4. Ville

   - Text input or select

   - Load existing city

   - Allow editing

   - Save updated city

5. Pays

   - Country selector/input

   - Load existing country

   - Allow editing

   - Save updated country

FORM ORGANIZATION:

Keep the existing Edit Profile modal/page design and add a clearly separated section:

"COORDONNÉES"

with:

- Téléphone

- Email

- Adresse

- Ville

- Pays

Place it logically near the personal information section.

DATA INTEGRITY:

First inspect the existing database schema and current Patient Profile implementation.

Reuse existing columns if they already exist.

Do NOT create duplicate columns such as:

phone + telephone

city + ville

address + adresse

country + pays

If the required fields already exist under different column names, reuse the existing columns and map them correctly.

Only create a database migration for a missing field if absolutely necessary.

Do NOT modify unrelated tables or data.

SAVE BEHAVIOR:

When the user clicks "Save":

- Save all edited patient information together.

- Preserve all existing values that were not changed.

- Refresh the profile profile display after successful save.

- The "COORDONNÉES" card must immediately show the updated values.

- Show the existing success/error feedback mechanism.

EMPTY VALUES:

If a field is empty, display:

"Non renseigné"

in the profile card, as it currently does.

IMPORTANT UI REQUIREMENT:

The existing input focus bug must remain fixed.

Typing in:

- Email

- Phone

- Address

- City

- Country

must work continuously without losing focus after every character.

Do NOT introduce dynamic React keys or state resets that cause inputs to remount.

VERIFICATION:

Test:

1. Open a patient profile.

2. Click "Edit Profile".

3. Verify existing contact information is pre-filled.

4. Change phone.

5. Change email.

6. Change address.

7. Change city.

8. Change country.

9. Save.

10. Verify the "COORDONNÉES" card displays the new information.

11. Refresh the page and verify the information persists.

12. Verify existing medical/personal information is unchanged.

FINAL CONSTRAINT:

Do not redesign the entire patient profile.

Do not remove existing fields.

Do not modify the permission/role architecture.

Do not change unrelated backend functionality.

Only extend Edit Profile so the COORDONNÉES information can be edited and persisted safely.
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