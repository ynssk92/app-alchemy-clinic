import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const REVIEWS = [
  {
    name: "Salma B.",
    treatment: "Implant dentaire",
    quote:
      "Une équipe rassurante et un suivi impeccable. Tout m'a été expliqué avant chaque étape — je n'ai jamais été aussi sereine chez un dentiste.",
  },
  {
    name: "Youssef A.",
    treatment: "Orthodontie invisible",
    quote:
      "Prise de rendez-vous simple, cabinet très moderne et un résultat au-delà de mes attentes en huit mois seulement.",
  },
];

const initials = (n: string) => n.split(" ").map((s) => s[0]).join("").toUpperCase();

export const TestimonialsPreview = () => (
  <section className="relative py-16 md:py-24">
    <div className="pointer-events-none absolute -left-24 top-24 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
    <div className="mx-auto max-w-[1280px] px-4">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[42px]">
          La confiance de nos{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">patients</span>
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {REVIEWS.map((r, i) => (
          <motion.figure
            key={r.name}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.25, delay: i * 0.08 }}
            className="relative overflow-hidden rounded-[28px] border border-border bg-card p-9 shadow-soft transition-all duration-250 hover:-translate-y-1.5 hover:shadow-large"
          >
            <Quote className="absolute right-8 top-8 h-10 w-10 text-primary/10" aria-hidden="true" />
            <div className="flex gap-1" aria-label="Note 5 sur 5">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
              ))}
            </div>
            <blockquote className="mt-5 text-[17px] leading-relaxed text-foreground">
              “{r.quote}”
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
                {initials(r.name)}
              </span>
              <span>
                <span className="block text-[15px] font-semibold text-foreground">{r.name}</span>
                <span className="block text-sm text-muted-foreground">{r.treatment}</span>
              </span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsPreview;
