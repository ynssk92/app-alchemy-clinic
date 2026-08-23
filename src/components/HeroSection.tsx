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
              {hero.badge === "CLINIQUE LA DUNE DENTAIRE" ? "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            Redesign ONLY the Blog page UI.\n\nIMPORTANT:\n\nThis is a FRONTEND/UI-ONLY change.\n\nDO NOT modify:\n\n- Supabase\n\n- database tables\n\n- database schema\n\n- RLS policies\n\n- queries\n\n- mutations\n\n- API calls\n\n- authentication\n\n- permissions\n\n- blog data structure\n\n- create/edit/delete functionality\n\n- publish/unpublish logic\n\n- existing routes\n\nKeep ALL existing backend logic exactly as it is.\n\nThe only goal is to improve the visual design of the Blog management page.\n\n--------------------------------------------------\n\nCURRENT PROBLEM\n\n--------------------------------------------------\n\nThe current Blog page looks too empty and basic.\n\nArticles are displayed as a long horizontal row with excessive unused whitespace.\n\nRedesign it to look like a modern premium dental clinic CMS/dashboard.\n\n--------------------------------------------------\n\nNEW DESIGN\n\n--------------------------------------------------\n\n1. PAGE HEADER\n\nKeep:\n\nBlog\n\n\"Créez et gérez les articles publiés sur le site.\"\n\nBut improve the layout:\n\n- larger visual hierarchy\n\n- better spacing\n\n- premium typography\n\n- keep the \"Nouvel article\" button on the right\n\n- use the existing royal blue clinic visual identity\n\n--------------------------------------------------\n\n2. BLOG TOOLBAR\n\nAdd a clean toolbar below the header containing:\n\nSearch articles...\n\nFilter:\n\n- Tous\n\n- Publiés\n\n- Brouillons\n\nOptional sorting:\n\n- Plus récents\n\n- Plus anciens\n\nIMPORTANT:\n\nUse the existing article data/query.\n\nDo not create a new backend filtering system if client-side filtering can use the already loaded data.\n\n--------------------------------------------------\n\n3. ARTICLE LIST\n\nReplace the current oversized horizontal row with a modern card/grid layout.\n\nDesktop:\n\nUse 2 or 3 article cards per row depending on available width.\n\nEach article card should contain:\n\n- large cover image\n\n- Published/Draft status badge\n\n- article title\n\n- short excerpt\n\n- publication date\n\n- slug or metadata if already available\n\n- Edit button\n\n- Delete button\n\n- View/Preview button if existing functionality supports it\n\nCards should have:\n\n- rounded corners\n\n- subtle border\n\n- subtle shadow\n\n- clean white background\n\n- generous spacing\n\n- smooth hover effect\n\n- premium medical-clinic aesthetic\n\nDo not invent article information that does not exist.\n\nUse the existing article fields.\n\n--------------------------------------------------\n\n4. FEATURED ARTICLE\n\nIf there is only one article or one article is clearly the latest/published article, make the first card visually stronger.\n\nUse a larger featured card:\n\nLarge image on the left\n\nArticle information on the right\n\nThen display other articles below as regular cards.\n\nIf there are multiple articles, do not duplicate any article.\n\n--------------------------------------------------\n\n5. ARTICLE IMAGE\n\nMake the article image much larger than the current thumbnail.\n\nUse:\n\n- aspect ratio around 16:9\n\n- object-cover\n\n- rounded top corners\n\nDo not change or replace the stored image URL.\n\n--------------------------------------------------\n\n6. STATUS BADGES\n\nUse clear badges:\n\nPublished:\n\n\"Publié\"\n\nDraft:\n\n\"Brouillon\"\n\nKeep the existing status values and logic.\n\nDo not change how publication status is stored.\n\n--------------------------------------------------\n\n7. EMPTY STATE\n\nIf there are no articles, create a proper empty state:\n\n- blog/article icon\n\n- \"Aucun article\"\n\n- short helpful description\n\n- \"Nouvel article\" CTA\n\nDo not change the existing create-article functionality.\n\n--------------------------------------------------\n\n8. RESPONSIVE DESIGN\n\nDesktop:\n\n- 2–3 cards per row\n\nTablet:\n\n- 2 cards per row\n\nMobile:\n\n- 1 card per row\n\nMake sure the page uses the available width efficiently.\n\nRemove the huge unused white area visible in the current design.\n\n--------------------------------------------------\n\n9. EXISTING FUNCTIONALITY\n\nAll existing actions must continue working exactly as before:\n\n- Create article\n\n- Edit article\n\n- Delete article\n\n- Publish\n\n- Unpublish\n\n- Preview/view article\n\n- Existing article links\n\n- Existing image handling\n\nDo not rewrite the backend logic.\n\nDo not modify Supabase queries unless absolutely necessary for the UI to continue working.\n\n--------------------------------------------------\n\n10. VISUAL STYLE\n\nUse the existing clinic design language:\n\n- premium dental clinic\n\n- royal blue accents\n\n- white backgrounds\n\n- subtle blue/gray borders\n\n- clean typography\n\n- professional medical aesthetic\n\n- generous spacing\n\n- subtle shadows\n\n- modern rounded cards\n\nAvoid:\n\n- excessive gradients\n\n- excessive animations\n\n- oversized empty areas\n\n- overly colorful cards\n\n- generic SaaS-looking design\n\nThe final result should feel like a premium dental clinic administration dashboard.\n\n--------------------------------------------------\n\n11. STRICT BACKEND SAFETY\n\nThis task is UI ONLY.\n\nDo NOT:\n\n- create migrations\n\n- modify database\n\n- modify Supabase\n\n- modify RLS\n\n- modify auth\n\n- modify permissions\n\n- modify roles\n\n- modify API behavior\n\n- modify blog schema\n\nOnly modify the React components, styling, and frontend presentation necessary for the Blog page.\n\nBefore finishing, verify that all existing Blog functionality still works." : hero.badge}
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