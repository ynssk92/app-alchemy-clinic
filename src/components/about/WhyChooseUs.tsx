import { motion } from "framer-motion";
import { Check } from "lucide-react";
import whyImg from "@/assets/about-why.jpg";

const ITEMS = [
  "Technologies de dernière génération",
  "Praticiens certifiés et spécialisés",
  "Plans de traitement personnalisés",
  "Parcours 100 % numérique",
  "Environnement confortable et apaisant",
  "Prise en charge des urgences",
];

export const WhyChooseUs = () => (
  <section className="relative py-16 md:py-24">
    <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-4 lg:grid-cols-2 lg:gap-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative order-last lg:order-first"
      >
        <div className="overflow-hidden rounded-[28px] border border-border shadow-large">
          <img
            src={whyImg}
            alt="Salle de soins équipée de technologies numériques"
            loading="lazy"
            width={1000}
            height={1000}
            className="h-[320px] w-full object-cover sm:h-[440px]"
          />
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 -z-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
      </motion.div>

      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[42px]">
          Pourquoi nous{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">choisir</span>
        </h2>
        <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
          Chaque détail de votre prise en charge est pensé pour allier précision clinique et confort.
        </p>

        <ul className="mt-8 space-y-4">
          {ITEMS.map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: i * 0.06 }}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft transition-all duration-250 hover:-translate-y-0.5 hover:shadow-medium"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground transition-transform duration-250 group-hover:scale-110">
                <Check className="h-4.5 w-4.5" strokeWidth={3} aria-hidden="true" />
              </span>
              <span className="text-[17px] font-medium text-foreground">{item}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
