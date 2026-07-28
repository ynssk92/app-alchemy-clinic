import { PageShell } from "@/components/PageShell";
import { ExpertiseCard } from "@/components/ExpertiseCard";
import { Cpu, Microscope, ScanLine, Zap, ShieldCheck, Sparkles, Activity } from "lucide-react";

const items = [
  {
    icon: ScanLine,
    title: "Imagerie 3D",
    text: "Scanner cône beam pour un diagnostic précis.",
    features: ["Haute précision", "Faible irradiation", "Diagnostic rapide"],
  },
  {
    icon: Cpu,
    title: "CFAO Numérique",
    text: "Prothèses conçues et usinées sur place.",
    features: ["Empreinte optique", "Usinage en clinique", "Pose en 1 séance"],
  },
  {
    icon: Microscope,
    title: "Microscopie",
    text: "Endodontie assistée pour un traitement minutieux.",
    features: ["Vision x25", "Gestes conservateurs", "Taux de succès élevé"],
  },
  {
    icon: Zap,
    title: "Laser dentaire",
    text: "Interventions douces et cicatrisation rapide.",
    features: ["Sans douleur", "Peu de saignement", "Récupération rapide"],
  },
];

const stats = [
  { icon: Sparkles, label: "15+ technologies" },
  { icon: ShieldCheck, label: "Certifié ISO" },
  { icon: Activity, label: "Équipements dernière génération" },
];

const Expertise = () => (
  <PageShell
    title="Expertise — La Dune Clinique Dentaire"
    description="Technologies de pointe et savoir-faire clinique au service de votre sourire."
    path="/expertise"
    heading="Une expertise à la pointe"
    hideHero
  >
    <section className="relative -mx-4 overflow-hidden px-4">
      {/* soft gradient background + blur shapes */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-hero opacity-70" />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />

      <div className="relative mx-auto max-w-[1280px] py-20 md:py-[140px]">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              <Zap className="h-3.5 w-3.5" /> Technologie avancée
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl">
              Équipements médicaux{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">de pointe</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Nous investissons dans les meilleures technologies et la formation continue pour offrir
              des soins d'exception, précis et confortables.
            </p>
          </div>

          <ul className="flex flex-col gap-3 lg:min-w-[240px]">
            {stats.map((s) => (
              <li
                key={s.label}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-4 py-3 text-sm font-medium text-foreground shadow-soft backdrop-blur"
              >
                <s.icon className="h-4 w-4 text-primary" />
                {s.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
          {items.map((i) => (
            <ExpertiseCard key={i.title} {...i} />
          ))}
        </div>
      </div>
    </section>
  </PageShell>
);

export default Expertise;
