import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Stethoscope,
  Ambulance,
  UserRound,
  Sparkles,
} from "lucide-react";
import { DoctorCard } from "@/components/DoctorCard";
import { BlogCard } from "@/components/blog/BlogCard";
import { supabase } from "@/integrations/supabase/client";
import { useAppSettings } from "@/hooks/useAppSettings";
import { usePageContent } from "@/hooks/usePageContent";
import { resolveIcon, resolveImage } from "@/lib/pageContent";
import { Seo } from "@/components/Seo";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroCta } from "@/components/HeroCta";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import heroVideo from "@/assets/hero-bg.mp4.asset.json";
import diagnostic from "@/assets/soin-diagnostic.jpg";
import visage from "@/assets/soin-visage.jpg";
import { ServiceTabs } from "@/components/services/ServiceTabs";
import { ServiceCard } from "@/components/services/ServiceCard";
import { motion } from "framer-motion";

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

  const steps = useMemo(() => blocks.filter(b => b.kind === "step"), [blocks]);
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

      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-2 flex items-center justify-end gap-6 text-sm">
           {[
            { icon: Mail, label: settings.contact_email },
            { icon: Phone, label: settings.contact_phone },
          ].map((it, i) => (
            <div key={i} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <it.icon className="w-3.5 h-3.5 text-primary" />
              <span>{it.label}</span>
            </div>
          ))}
        </div>
      </div>

      <SiteHeader />

      <section id="home" className="relative overflow-hidden scroll-mt-20">
        <video className="absolute inset-0 w-full h-full object-cover" src={heroVideo.url} autoPlay muted loop playsInline />
        <div className="absolute inset-0 bg-background/80" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="container mx-auto px-4 py-20 sm:py-24 md:py-32 relative">
          <div className="max-w-2xl mx-auto text-center sm:mx-0 sm:text-left">
            <span className="reveal inline-block text-xs font-bold tracking-[0.2em] uppercase text-primary mb-5">{page?.eyebrow || "La Dune Clinique Dentaire"}</span>
            <h1 className="reveal text-5xl md:text-7xl font-bold text-foreground mb-6 leading-[1.05]">{page?.heading || "Rencontrez nos meilleurs praticiens"}</h1>
            <p className="reveal text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto sm:mx-0">{page?.subheading || "Une équipe experte, un plateau technique moderne et un parcours de soins pensé pour votre confort."}</p>
            <HeroCta className="reveal" />
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-14 items-center">
          <div className="reveal relative">
            <img src={diagnostic} alt="Salle de soins" className="w-4/5 rounded-3xl shadow-large object-cover aspect-[4/3]" />
            <img src={visage} alt="Praticienne" className="absolute bottom-[-2.5rem] right-0 w-1/2 rounded-3xl border-8 border-background shadow-large object-cover aspect-square" />
          </div>
          <div className="reveal">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Un lieu d'excellence médicale.</h2>
            <div className="text-muted-foreground mb-8">{page?.intro}</div>
            <Link to="/about"><Button variant="outline" className="rounded-xl">À propos de nous</Button></Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14 reveal">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos spécialités</h2>
            <p className="text-muted-foreground">Une gamme de soins dentaires premium.</p>
          </div>
          {departments.length > 0 && (
            <div className="mt-10">
              <ServiceTabs
                items={departments.map((d) => ({ id: d.id, label: d.title || "Soin" }))}
                activeId={currentDept.id}
                onChange={setActiveDept}
              />
              <div className="mt-10 animate-fade-in">
                <ServiceCard
                  name={currentDept.title || ""}
                  description={currentDept.body}
                  features={currentDept.items || []}
                  imageSrc={resolveImage(currentDept.image_url) || undefined}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <span className="text-primary font-bold uppercase text-xs tracking-widest">Experts</span>
              <h2 className="text-4xl font-bold mt-2">Notre équipe médicale</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {doctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Dernières actualités</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {posts.map((p, i) => <BlogCard key={p.id} post={p} index={i} />)}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Index;
