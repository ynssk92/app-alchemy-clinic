import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CalendarHeart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AboutCTA = () => (
  <section className="relative py-16 md:py-24">
    <div className="mx-auto max-w-[1280px] px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[28px] bg-gradient-primary p-10 text-center text-primary-foreground shadow-large sm:p-16"
      >
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
        <motion.span
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute right-12 top-10 hidden h-16 w-16 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur sm:block"
        />

        <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl lg:text-[42px]">
          Prêt à commencer votre parcours sourire ?
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-[17px] leading-relaxed opacity-90">
          Réservez une première consultation ou faites connaissance avec les praticiens qui vous
          accompagneront.
        </p>

        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="rounded-2xl px-8 font-semibold shadow-soft transition-transform duration-250 hover:-translate-y-0.5"
          >
            <Link to="/booking">
              <CalendarHeart className="h-4 w-4" />
              Prendre rendez-vous
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-2xl border-primary-foreground/40 bg-transparent px-8 font-semibold text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link to="/equipe">
              <Users className="h-4 w-4" />
              Nos praticiens
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default AboutCTA;
