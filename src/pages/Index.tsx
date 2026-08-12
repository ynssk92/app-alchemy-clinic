import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  Phone,
  Ambulance,
  Clock,
  Stethoscope,
} from "lucide-react";
import { DoctorCard } from "@/components/DoctorCard";
import { BlogCard } from "@/components/blog/BlogCard";
import { supabase } from "@/integrations/supabase/client";
import { useAppSettings } from "@/hooks/useAppSettings";
import { usePageContent } from "@/hooks/usePageContent";
import { resolveImage } from "@/lib/pageContent";
import { Seo } from "@/components/Seo";
import { SiteHeader } from "@/components/SiteHeader";
import { TopHeader } from "@/components/TopHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroCta } from "@/components/HeroCta";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import heroVideo from "@/assets/hero-bg.mp4.asset.json";
import diagnostic from "@/assets/soin-diagnostic.jpg";
import visage from "@/assets/soin-visage.jpg";
import { ServiceTabs } from "@/components/services/ServiceTabs";
import { ServiceCard } from "@/components/services/ServiceCard";

interface Doctor {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  experience_years: number | null;
  specialties: { name: string } | null;
  rating?: number | null;
  clinics?: { name: string } | null;
  is_available?: boolean;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
}

const Index = () => {
  const { settings } = useAppSettings();
  useScrollReveal();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const { page, blocks, loading: contentLoading } = usePageContent("home");

  const departments = useMemo(() => blocks.filter(b => b.kind === "department"), [blocks]);
  const counters = useMemo(() => blocks.filter(b => b.kind === "stat"), [blocks]);
  const [activeDept, setActiveDept] = useState<string | null>(null);

  useEffect(() => {
    if (!activeDept && departments.length) setActiveDept(departments[0].id);
  }, [departments, activeDept]);

  useEffect(() => {
    supabase
      .from("doctors")
      .select("id, full_name, avatar_url, experience_years, specialties(name), rating, clinics(name), is_available")
      .eq("is_available", true)
      .order("full_name")
      .limit(3)
      .then(({ data }) => setDoctors((data as any) || []));

    supabase
      .from("blog_posts")
      .select("id,title,slug,excerpt,cover_image_url,published_at,created_at")
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(3)
      .then(({ data }) => setPosts((data as Post[]) || []));
  }, []);

  const currentDept = departments.find((d) => d.id === activeDept) || departments[0];

  return (
    <div className="relative flex min-h-screen w-full flex-1 flex-col overflow-x-hidden bg-background">
      <Seo
        title={page?.seo_title || "La Dune Clinique Dentaire — Rendez-vous en quelques secondes"}
        description={page?.seo_description || "Clinique dentaire moderne : esthétique du sourire, implantologie, orthodontie. Prenez rendez-vous en ligne avec nos praticiens en quelques secondes."}
        path="/"
      />

      <TopHeader />

      <SiteHeader />

      {/* Hero Section */}
      <section id="home" className="relative h-[90vh] min-h-[700px] overflow-hidden scroll-mt-20">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={heroVideo.url}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/20" />
        
        <div className="container relative mx-auto flex h-full items-center px-4">
          <div className="max-w-3xl">
            <div className="reveal mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                {page?.eyebrow || "Expertise Dentaire Premium"}
              </span>
            </div>
            
            <h1 className="reveal text-5xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl leading-[0.95] mb-8">
              {page?.heading || "Votre sourire,\nnotre signature."}
            </h1>
            
            <p className="reveal mb-10 max-w-xl text-lg text-slate-200 sm:text-xl leading-relaxed" style={{ transitionDelay: "100ms" }}>
              {page?.subheading || "Une technologie de pointe alliée à une approche humaine pour des soins d'exception."}
            </p>
            
            <HeroCta className="reveal" style={{ transitionDelay: "200ms" }} />
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-white">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="reveal reveal-left relative">
              <div className="relative z-10 aspect-[4/5] overflow-hidden rounded-[40px] shadow-large">
                <img src={diagnostic} alt="Clinic" className="h-full w-full object-cover" />
              </div>
              <div className="absolute -bottom-10 -right-10 z-20 aspect-square w-2/3 overflow-hidden rounded-[40px] border-[12px] border-white shadow-large hidden sm:block">
                <img src={visage} alt="Treatment" className="h-full w-full object-cover" />
              </div>
              {/* Decorative elements */}
              <div className="absolute -left-10 -top-10 -z-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
            </div>

            <div className="reveal reveal-right">
              <span className="text-xs font-bold uppercase tracking-widest text-primary/60">L'excellence au quotidien</span>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl leading-[1.1]">
                Une approche holistique de la santé dentaire.
              </h2>
              <div className="mt-8 text-lg leading-relaxed text-slate-500">
                {page?.intro || "Nous croyons que chaque sourire est unique. Notre clinique combine les dernières innovations technologiques avec un confort absolu pour transformer votre expérience dentaire."}
              </div>
              
              <div className="mt-10 grid grid-cols-2 gap-6">
                {[
                  "Technologies 3D",
                  "Confort Patient",
                  "Soins Indolores",
                  "Suivi Personnalisé"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-12 flex items-center gap-6">
                <Link to="/about">
                  <Button variant="outline" className="h-12 rounded-xl px-8 font-bold hover:bg-slate-50">
                    Découvrir notre histoire
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-100" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-slate-500">+2k patients satisfaits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services/Expertise Section */}
      <section className="bg-slate-50 py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Spécialités</span>
            <h2 className="mt-4 text-[40px] font-bold leading-tight tracking-tight text-slate-900 md:text-[52px]">
              Nos pôles d'expertise
            </h2>
            <p className="mt-6 text-lg text-slate-500">
              Des soins spécialisés prodigués par des experts passionnés, utilisant les équipements les plus performants du marché.
            </p>
          </div>

          {departments.length > 0 && (
            <div className="reveal">
              <ServiceTabs
                items={departments.map((d) => ({ id: d.id, label: d.title || "Soin" }))}
                activeId={activeDept || departments[0].id}
                onChange={setActiveDept}
              />
              <div key={activeDept} className="mt-12 animate-fade-in">
                <ServiceCard
                  name={currentDept?.title || ""}
                  description={currentDept?.body}
                  features={currentDept?.items || []}
                  imageSrc={resolveImage(currentDept?.image_url) || undefined}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Medical Team Section */}
      {doctors.length > 0 && (
        <section className="bg-white py-24 md:py-32">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Praticiens</span>
                <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                  Rencontrez nos experts
                </h2>
                <p className="mt-6 text-lg text-slate-500">
                  Une équipe pluridisciplinaire dédiée à votre santé bucco-dentaire, alliant expérience et formation continue.
                </p>
              </div>
              <Link to="/equipe" className="shrink-0">
                <Button variant="outline" className="h-12 rounded-xl px-8 font-bold group">
                  Voir toute l'équipe
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {doctors.map((d) => (
                <div key={d.id} className="reveal reveal-scale">
                  <DoctorCard doctor={d} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Counters/Stats Section */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {counters.map((c, i) => (
              <div key={c.id} className="reveal text-center" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="text-4xl font-extrabold text-white md:text-5xl lg:text-6xl">
                  {c.title}
                </div>
                <div className="mt-2 text-sm font-bold uppercase tracking-widest text-white/60">
                  {c.subtitle}
                </div>
              </div>
            ))}
            {counters.length === 0 && [
              { label: "Patients", value: "15k+" },
              { label: "Spécialistes", value: "12" },
              { label: "Années", value: "25+" },
              { label: "Sourires", value: "100%" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-extrabold text-white md:text-5xl">{stat.value}</div>
                <div className="mt-2 text-sm font-bold uppercase tracking-widest text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency/Trust Section */}
      <section className="py-24 md:py-32 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="reveal flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-soft border border-slate-100">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <Ambulance className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Urgences 24/7</h3>
              <p className="mt-4 text-slate-500">Un service dédié pour vos urgences dentaires, même sans rendez-vous préalable.</p>
              <a href={`tel:${settings.contact_phone}`} className="mt-6 text-sm font-extrabold text-primary hover:underline">
                APPELER MAINTENANT
              </a>
            </div>
            
            <div className="reveal flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-soft border border-slate-100" style={{ transitionDelay: "100ms" }}>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Horaires Flexibles</h3>
              <p className="mt-4 text-slate-500">Ouvert du lundi au samedi, de 8h à 20h, pour s'adapter à votre emploi du temps.</p>
              <Link to="/contact" className="mt-6 text-sm font-extrabold text-primary hover:underline">
                VOIR LE PLAN
              </Link>
            </div>

            <div className="reveal flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-soft border border-slate-100" style={{ transitionDelay: "200ms" }}>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                <Stethoscope className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Bilan Complet</h3>
              <p className="mt-4 text-slate-500">Diagnostic global incluant radiographie panoramique et plan de soins détaillé.</p>
              <Link to="/booking" className="mt-6 text-sm font-extrabold text-primary hover:underline">
                PRENDRE RDV
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      {posts.length > 0 && (
        <section className="bg-white py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Blog</span>
              <h2 className="mt-4 text-4xl font-bold text-slate-900">Derniers articles</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {posts.map((p, i) => (
                <BlogCard key={p.id} post={p} index={i} />
              ))}
            </div>
            <div className="mt-16 text-center">
              <Link to="/blog">
                <Button variant="ghost" className="font-bold text-slate-600 hover:text-primary transition-colors">
                  Lire tous les articles <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Global CTA Section */}
      <section className="relative overflow-hidden py-24 md:py-32 bg-slate-900">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary blur-[120px]" />
          <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-blue-400 blur-[120px]" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-6xl leading-[1.1]">
            Prêt à retrouver<br />votre plus beau sourire ?
          </h2>
          <p className="mt-8 mx-auto max-w-2xl text-lg text-slate-400">
            Rejoignez des milliers de patients qui ont déjà fait confiance à notre expertise pour leurs soins dentaires.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/booking">
              <Button size="lg" className="h-14 rounded-2xl px-10 text-lg font-bold shadow-large bg-primary hover:bg-primary/90">
                Prendre rendez-vous en ligne
              </Button>
            </Link>
            <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-3 text-white font-bold text-lg hover:text-primary transition-colors">
              <Phone className="h-5 w-5" />
              {settings.contact_phone}
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Index;
