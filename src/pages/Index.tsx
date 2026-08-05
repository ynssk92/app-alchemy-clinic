import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Stethoscope,
  UserCheck,
  Ambulance,
  UserRound,
} from "lucide-react";
import { DoctorCard } from "@/components/DoctorCard";
import { supabase } from "@/integrations/supabase/client";
import { useAppSettings } from "@/hooks/useAppSettings";
import { Seo } from "@/components/Seo";
import { SiteHeader } from "@/components/SiteHeader";
import { HeroCta } from "@/components/HeroCta";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Gallery } from "@/components/Gallery";
import heroVideo from "@/assets/hero-bg.mp4.asset.json";
import esthetique from "@/assets/soin-esthetique.jpg";
import implant from "@/assets/soin-implant.jpg";
import ortho from "@/assets/soin-ortho.jpg";
import diagnostic from "@/assets/soin-diagnostic.jpg";
import visage from "@/assets/soin-visage.jpg";

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

const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const steps = [
  { icon: CalendarCheck, title: "Prenez rendez-vous", desc: "Choisissez la date et l'horaire qui vous conviennent, en ligne et en quelques secondes." },
  { icon: UserCheck, title: "Choisissez votre praticien", desc: "Sélectionnez le spécialiste adapté à votre besoin parmi notre équipe." },
  { icon: Stethoscope, title: "Confirmez la consultation", desc: "Recevez votre confirmation et vos rappels automatiques avant la séance." },
];

const departments = [
  {
    title: "Esthétique du Sourire",
    image: esthetique,
    lead: "Blanchiment, facettes & prothèses",
    items: ["Blanchiment dentaire", "Facettes céramique", "Couronnes & bridges"],
  },
  {
    title: "Implantologie",
    image: implant,
    lead: "Implants unitaires & complets",
    items: ["Implants unitaires", "All-on-4 / All-on-6", "Greffe osseuse"],
  },
  {
    title: "Orthodontie",
    image: ortho,
    lead: "Alignement invisible & classique",
    items: ["Gouttières transparentes", "Bagues céramique", "Suivi personnalisé"],
  },
];

const counters = [
  { value: "12k+", label: "Patients satisfaits" },
  { value: "9", label: "Spécialités" },
  { value: "15+", label: "Praticiens" },
  { value: "20", label: "Années d'expérience" },
];

const Index = () => {
  const { settings } = useAppSettings();
  useScrollReveal();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

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

  return (
    <div className="relative flex min-h-screen w-full flex-1 flex-col overflow-x-hidden bg-background">
      <Seo
        title="La Dune Clinique Dentaire — Rendez-vous en quelques secondes"
        description="Clinique dentaire moderne : esthétique du sourire, implantologie, orthodontie. Prenez rendez-vous en ligne avec nos praticiens en quelques secondes."
        path="/"
      />

      {/* Top info bar */}
      <div className="hidden lg:block border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-end gap-10">
          {[
            { icon: Mail, label: "Email", value: settings.contact_email },
            { icon: Phone, label: "Téléphone", value: settings.contact_phone },
            { icon: Clock, label: "Horaires", value: `Lun - Sam : ${settings.hours_weekdays}` },

          ].map((it) => (
            <div key={it.label} className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <it.icon className="w-4 h-4 text-primary" />
              </span>
              <span className="leading-tight">
                <span className="block text-xs font-bold uppercase tracking-wide text-foreground">{it.label}</span>
                <span className="block text-sm text-muted-foreground">{it.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <SiteHeader />

      {/* Hero */}
      <section id="home" className="relative overflow-hidden scroll-mt-20">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={heroVideo.url}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-background/80" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="container mx-auto px-4 py-20 sm:py-24 md:py-32 relative">
          <div className="max-w-2xl mx-auto text-center sm:mx-0 sm:text-left">
            <span className="reveal inline-block text-xs font-bold tracking-[0.2em] uppercase text-primary mb-5 sm:mb-4">
              La Dune Clinique Dentaire
            </span>
            <h1 className="reveal text-5xl md:text-7xl font-bold text-foreground mb-5 sm:mb-6 leading-[1.05] text-balance" style={{ transitionDelay: "80ms" }}>
              Rencontrez nos{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">meilleurs praticiens</span>
            </h1>
            <p className="reveal text-lg md:text-xl text-muted-foreground mb-10 sm:mb-8 max-w-xl mx-auto sm:mx-0" style={{ transitionDelay: "160ms" }}>
              Une équipe experte, un plateau technique moderne et un parcours de soins pensé
              pour votre confort — réservez votre consultation en quelques secondes.
            </p>
            <HeroCta className="reveal" style={{ transitionDelay: "240ms" }} />

          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-14 items-center">
          <div className="reveal reveal-left relative">
            <img
              src={diagnostic}
              alt="Salle de soins de La Dune Clinique Dentaire"
              loading="lazy"
              className="w-4/5 rounded-2xl shadow-large object-cover aspect-[4/3]"
            />
            <img
              src={visage}
              alt="Praticienne de la clinique en consultation"
              loading="lazy"
              className="absolute bottom-[-2.5rem] right-0 w-1/2 rounded-2xl border-8 border-background shadow-large object-cover aspect-square"
            />
          </div>
          <div className="reveal reveal-right">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-primary mb-4">
              À propos
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
              Un lieu où l'excellence médicale rencontre le confort du patient.
            </h2>
            <p className="text-muted-foreground mb-8">
              De la première consultation au suivi post-traitement, nous combinons technologies
              de pointe et approche humaine pour offrir des soins dentaires précis, indolores
              et durables à toute la famille.
            </p>
            <ul className="grid sm:grid-cols-2 gap-3 mb-8">
              {["Urgences dentaires", "Diagnostic 3D", "Sédation douce", "Devis transparent"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/about">
              <Button variant="outline">En savoir plus</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-muted/40 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="reveal">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                Comment obtenir une consultation chez nous ?
              </h2>
              <p className="text-muted-foreground mb-6">
                Trois étapes simples, aucune attente au téléphone, une confirmation immédiate.
              </p>
              <Link to="/booking">
                <Button>Commencer</Button>
              </Link>
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <Card
                  key={s.title}
                  className="reveal reveal-scale p-6 bg-card border-border hover:shadow-medium hover:-translate-y-1 transition-all"
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                    <s.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">0{i + 1}</span>
                  <h3 className="text-lg font-bold text-card-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14 reveal">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-primary mb-3">
              Services
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Nos départements</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {departments.map((d, i) => (
              <Card
                key={d.title}
                className="reveal reveal-scale overflow-hidden border-border bg-card hover:shadow-large transition-all group"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="overflow-hidden">
                  <img
                    src={d.image}
                    alt={d.title}
                    loading="lazy"
                    className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-card-foreground mb-1">{d.title}</h3>
                  <p className="text-sm text-primary font-semibold mb-4">{d.lead}</p>
                  <ul className="space-y-2 mb-6">
                    {d.items.map((it) => (
                      <li key={it} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        {it}
                      </li>
                    ))}
                  </ul>
                  <Link to="/booking">
                    <Button variant="outline" size="sm" className="w-full">
                      Prendre rendez-vous
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency + hours */}
      <section className="py-16 bg-gradient-primary">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
          <Card className="reveal p-8 bg-card border-none shadow-large">
            <Ambulance className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-bold text-card-foreground mb-2">Urgence dentaire</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Douleur aiguë, dent cassée ou traumatisme ? Nous vous recevons en priorité.
            </p>
            <a
              href={`tel:${(settings.emergency_phone || settings.contact_phone).replace(/\s/g, "")}`}
              className="text-sm font-bold text-primary inline-flex items-center gap-1"
            >
              {settings.emergency_phone || settings.contact_phone} <ArrowRight className="w-4 h-4" />
            </a>
          </Card>
          <Card className="reveal p-8 bg-card border-none shadow-large" style={{ transitionDelay: "90ms" }}>
            <Clock className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-bold text-card-foreground mb-4">Horaires d'ouverture</h3>
            <ul className="space-y-2 text-sm">
              {[
                ["Lun - Ven", settings.hours_weekdays],
                ["Samedi", settings.hours_saturday],
                ["Dimanche", settings.hours_sunday],
              ].map(([d, h]) => (

                <li key={d} className="flex justify-between border-b border-border pb-2 last:border-0">
                  <span className="text-muted-foreground">{d}</span>
                  <span className="font-semibold text-card-foreground">{h}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="reveal p-8 bg-card border-none shadow-large" style={{ transitionDelay: "180ms" }}>
            <Stethoscope className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-bold text-card-foreground mb-2">Bilan complet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Radiographie panoramique, dépistage et plan de traitement détaillé en une séance.
            </p>
            <Link to="/soins" className="text-sm font-bold text-primary inline-flex items-center gap-1">
              Voir les soins <ArrowRight className="w-4 h-4" />
            </Link>
          </Card>
        </div>
      </section>

      {/* Doctors */}
      {doctors.length > 0 && (
        <section className="relative overflow-hidden bg-[#F8FAFC] py-24 md:py-32">
          {/* subtle blue radial gradients */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#2563EB]/5 blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-[#06B6D4]/5 blur-[120px]" />
          </div>

          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-[60px] reveal">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#2563EB]/20 bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#2563EB] shadow-sm mb-6">
                  <UserRound className="h-3.5 w-3.5" />
                  👨‍⚕️ OUR DOCTORS
                </span>
                <h2 className="text-[40px] font-bold leading-[1.1] tracking-tight text-[#111827] md:text-[52px]">
                  Meet Our Medical Experts
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-slate-500">
                  Our experienced specialists are committed to delivering personalized, high-quality healthcare with the latest medical technologies.
                </p>
              </div>
              <Link to="/equipe" className="shrink-0 mb-2">
                <Button variant="outline" className="h-12 rounded-xl px-8 font-bold border-[#E5E7EB] hover:bg-white hover:border-[#2563EB] hover:text-[#2563EB] transition-all">
                  Voir toute l'équipe <ArrowRight className="w-4 h-4 ml-2" />
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

      {/* Counters */}
      <section className="py-16 bg-muted/40 border-y border-border">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {counters.map((c, i) => (
            <div key={c.label} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {c.value}
              </div>
              <p className="text-sm text-muted-foreground mt-2">{c.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <Gallery />

      {/* Blog */}
      {posts.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14 reveal">
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-primary mb-3">
                Actualités
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Derniers articles</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {posts.map((p, i) => (
                <Card
                  key={p.id}
                  className="reveal reveal-scale overflow-hidden border-border bg-card hover:shadow-large transition-all"
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  {p.cover_image_url && (
                    <img src={p.cover_image_url} alt={p.title} loading="lazy" className="w-full aspect-[16/10] object-cover" />
                  )}
                  <div className="p-6">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {new Date(p.published_at || p.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <h3 className="text-lg font-bold text-card-foreground mt-2 mb-2 line-clamp-2">{p.title}</h3>
                    {p.excerpt && <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{p.excerpt}</p>}
                    <Link to={`/blog/${p.slug}`} className="text-sm font-bold text-primary inline-flex items-center gap-1">
                      Lire l'article <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section id="contact" className="py-20 bg-gradient-primary relative overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary-foreground rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary-foreground rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="reveal text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Prêt à retrouver un sourire éclatant ?
          </h2>
          <p className="reveal text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto" style={{ transitionDelay: "100ms" }}>
            Réservez votre consultation en ligne — confirmation immédiate et rappels automatiques.
          </p>
          <div className="reveal" style={{ transitionDelay: "180ms" }}>
            <Link to="/booking">
              <Button size="lg" variant="secondary" className="text-base px-8">
                Prendre rendez-vous
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} La Dune Clinique Dentaire. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default Index;
