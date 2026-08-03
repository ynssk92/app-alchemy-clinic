import { motion } from "framer-motion";
import storyImg from "@/assets/about-story.jpg";

const TIMELINE = [
  { year: "2010", label: "Création de la clinique" },
  { year: "2015", label: "Dentisterie numérique" },
  { year: "2020", label: "Agrandissement de l'équipe" },
  { year: "2025", label: "Dentisterie assistée par IA" },
];

export const StorySection = ({ paragraphs }: { paragraphs: string[] }) => (
  <section className="relative py-16 md:py-24">
    <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-4 lg:grid-cols-2 lg:gap-16">
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative"
      >
        <div className="overflow-hidden rounded-[28px] border border-border shadow-large">
          <img
            src={storyImg}
            alt="L'équipe de La Dune accompagnant une patiente"
            loading="lazy"
            width={1200}
            height={900}
            className="h-[320px] w-full object-cover sm:h-[420px]"
          />
        </div>
        <div className="pointer-events-none absolute -bottom-10 -left-10 -z-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
      >
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[42px]">
          Qui sommes-<span className="bg-gradient-primary bg-clip-text text-transparent">nous</span> ?
        </h2>

        <div className="mt-5 space-y-4 text-[17px] leading-relaxed text-muted-foreground">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p>
              Depuis plus de quinze ans, La Dune Clinique Dentaire réunit des praticiens passionnés
              autour d'une même conviction : des soins précis, transparents et profondément humains.
            </p>
          )}
        </div>

        <ol className="mt-10 space-y-6 border-l border-border pl-6">
          {TIMELINE.map((t, i) => (
            <motion.li
              key={t.year}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: i * 0.08 }}
              className="relative"
            >
              <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-card bg-gradient-primary" />
              <p className="text-sm font-bold tracking-widest text-primary">{t.year}</p>
              <p className="text-[17px] font-medium text-foreground">{t.label}</p>
            </motion.li>
          ))}
        </ol>
      </motion.div>
    </div>
  </section>
);

export default StorySection;
