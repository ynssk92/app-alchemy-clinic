import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Building2, Star, Users, Award, CalendarHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/about-hero.jpg";

interface AboutHeroProps {
  eyebrow?: string | null;
  heading?: string | null;
  subheading?: string | null;
}

const float = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const },
  },
};

export const AboutHero = ({ eyebrow, heading, subheading }: AboutHeroProps) => (
  <section className="relative overflow-hidden">
    <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-hero opacity-50" />
    <div className="pointer-events-none absolute -left-32 -top-24 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
    <div className="pointer-events-none absolute -right-24 top-40 -z-10 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

    <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2 lg:gap-16 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
          <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
          {eyebrow || "À propos de notre clinique"}
        </span>

        <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[60px]">
          {heading || (
            <>
              Transformer les{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">sourires</span>,
              <br />
              changer des vies
            </>
          )}
        </h1>

        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
          {subheading ||
            "Une clinique dentaire pensée autour de vous : technologie de pointe, praticiens certifiés et un accompagnement profondément humain, à chaque étape de votre parcours de soins."}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-2xl bg-gradient-primary px-8 font-semibold shadow-soft transition-transform duration-250 hover:-translate-y-0.5">
            <Link to="/booking">
              <CalendarHeart className="h-4 w-4" />
              Prendre rendez-vous
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-2xl px-8 font-semibold">
            <Link to="/equipe">Rencontrer nos praticiens</Link>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
        className="relative mx-auto w-full max-w-xl"
      >
        <div className="overflow-hidden rounded-[28px] border border-border shadow-large">
          <img
            src={heroImg}
            alt="Intérieur lumineux de La Dune Clinique Dentaire"
            width={1200}
            height={1400}
            className="h-[340px] w-full object-cover sm:h-[440px] lg:h-[520px]"
          />
        </div>

        {/* floating cards */}
        <motion.div
          variants={float}
          animate="animate"
          className="absolute -left-3 top-8 flex items-center gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-large backdrop-blur sm:-left-8"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Star className="h-5 w-5 fill-primary text-primary" aria-hidden="true" />
          </span>
          <div className="text-left">
            <p className="text-base font-bold leading-none text-foreground">4.9</p>
            <p className="text-xs text-muted-foreground">Note patients</p>
          </div>
        </motion.div>

        <motion.div
          variants={float}
          animate="animate"
          transition={{ delay: 0.8 }}
          className="absolute -right-3 top-1/2 flex items-center gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-large backdrop-blur sm:-right-8"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <Users className="h-5 w-5 text-accent" aria-hidden="true" />
          </span>
          <div className="text-left">
            <p className="text-base font-bold leading-none text-foreground">5 000+</p>
            <p className="text-xs text-muted-foreground">Patients heureux</p>
          </div>
        </motion.div>

        <motion.div
          variants={float}
          animate="animate"
          transition={{ delay: 1.6 }}
          className="absolute -bottom-5 left-6 flex items-center gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-large backdrop-blur sm:left-10"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Award className="h-5 w-5 text-primary" aria-hidden="true" />
          </span>
          <div className="text-left">
            <p className="text-base font-bold leading-none text-foreground">15+ ans</p>
            <p className="text-xs text-muted-foreground">D'expérience</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default AboutHero;
