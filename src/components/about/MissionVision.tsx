import { motion } from "framer-motion";
import { HeartHandshake, Sparkles } from "lucide-react";

interface MissionVisionProps {
  missionTitle?: string | null;
  missionBody?: string | null;
}

export const MissionVision = ({ missionTitle, missionBody }: MissionVisionProps) => (
  <section className="relative py-16 md:py-24">
    <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
    <div className="mx-auto grid max-w-[1280px] gap-8 px-4 md:grid-cols-2">
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="group relative overflow-hidden rounded-[28px] border border-primary/20 bg-gradient-primary p-9 text-primary-foreground shadow-large transition-all duration-250 hover:-translate-y-1.5 hover:scale-[1.01]"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary-foreground/10 blur-2xl" />
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/15">
          <HeartHandshake className="h-7 w-7" aria-hidden="true" />
        </span>
        <h3 className="mt-6 text-[22px] font-bold">{missionTitle || "Notre mission"}</h3>
        <p className="mt-3 whitespace-pre-line text-[17px] leading-relaxed opacity-90">
          {missionBody ||
            "Rendre les soins dentaires accessibles, transparents et humains — pour chaque sourire."}
        </p>
      </motion.article>

      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
        className="group relative overflow-hidden rounded-[28px] border border-border bg-card p-9 shadow-soft transition-all duration-250 hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-large"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/10 blur-2xl" />
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-7 w-7" aria-hidden="true" />
        </span>
        <h3 className="mt-6 text-[22px] font-bold text-foreground">Notre vision</h3>
        <p className="mt-3 text-[17px] leading-relaxed text-muted-foreground">
          Devenir la référence d'une dentisterie moderne au Maroc : technologie de pointe,
          protocoles rigoureux et une expérience patient sereine, du premier appel au dernier
          contrôle.
        </p>
      </motion.article>
    </div>
  </section>
);

export default MissionVision;
