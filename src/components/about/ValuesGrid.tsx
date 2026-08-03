import { motion } from "framer-motion";
import { HeartHandshake, Sparkles, ShieldCheck, Award, Smile, Activity, type LucideIcon } from "lucide-react";
import { resolveIcon } from "@/lib/pageContent";

export type ValueItem = { id: string; title: string | null; body: string | null; icon: string | null };

const FALLBACK: { title: string; body: string; icon: LucideIcon }[] = [
  { title: "Bienveillance", body: "Une écoute attentive à chaque étape.", icon: HeartHandshake },
  { title: "Innovation", body: "Des technologies numériques au service de la précision.", icon: Sparkles },
  { title: "Intégrité", body: "Des devis clairs et des recommandations honnêtes.", icon: ShieldCheck },
  { title: "Excellence", body: "Des standards cliniques rigoureux.", icon: Award },
  { title: "Sécurité", body: "Stérilisation et protocoles contrôlés en continu.", icon: Activity },
  { title: "Transparence", body: "Vous comprenez chaque geste, chaque tarif.", icon: Smile },
];

export const ValuesGrid = ({ values }: { values: ValueItem[] }) => {
  const cms = values.map((v) => ({
    key: v.id,
    title: v.title || "",
    body: v.body || "",
    Icon: resolveIcon(v.icon),
  }));

  const extras = FALLBACK.filter(
    (f) => !cms.some((c) => c.title.toLowerCase() === f.title.toLowerCase())
  )
    .slice(0, Math.max(0, 6 - cms.length))
    .map((f) => ({ key: f.title, title: f.title, body: f.body, Icon: f.icon }));

  const items = [...cms, ...extras];

  return (
    <section className="relative py-16 md:py-24">
      <div className="pointer-events-none absolute -right-24 top-20 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="mx-auto max-w-[1280px] px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Nos valeurs
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[42px]">
            Ce qui guide chacun de nos{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">gestes</span>
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((v, i) => (
            <motion.article
              key={v.key}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.25, delay: (i % 3) * 0.07 }}
              className="group relative overflow-hidden rounded-[28px] border border-border bg-card p-9 shadow-soft transition-all duration-250 hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-large"
            >
              <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-primary/10 opacity-60 blur-3xl transition-opacity duration-250 group-hover:opacity-100" />
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
                <v.Icon className="h-7 w-7" aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-[22px] font-bold text-foreground">{v.title}</h3>
              <p className="mt-2 whitespace-pre-line text-[17px] leading-relaxed text-muted-foreground">
                {v.body}
              </p>
              <div className="mt-6 h-1 w-12 rounded-full bg-gradient-primary transition-all duration-250 group-hover:w-24" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesGrid;
