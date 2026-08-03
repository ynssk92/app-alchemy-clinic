import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, Activity, Award } from "lucide-react";

const BADGES = [
  { icon: ShieldCheck, title: "Certifié ISO", body: "Qualité et traçabilité contrôlées." },
  { icon: Sparkles, title: "Dentisterie numérique", body: "Empreintes 3D et planification assistée." },
  { icon: Activity, title: "Stérilisation", body: "Protocoles hospitaliers à chaque soin." },
  { icon: Award, title: "Formation continue", body: "Praticiens formés en permanence." },
];

export const CertificationBadges = () => (
  <section className="relative py-16 md:py-24">
    <div className="mx-auto max-w-[1280px] px-4">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[42px]">
          Certifications &{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">technologies</span>
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {BADGES.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
            className="rounded-[28px] border border-border bg-card p-9 text-center shadow-soft transition-all duration-250 hover:-translate-y-1.5 hover:shadow-large"
          >
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <b.icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-[19px] font-bold text-foreground">{b.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CertificationBadges;
