import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Award, Activity, Stethoscope, type LucideIcon } from "lucide-react";

type Stat = { icon: LucideIcon; value: number; suffix: string; label: string };

const STATS: Stat[] = [
  { icon: Users, value: 5000, suffix: "+", label: "Patients traités" },
  { icon: Award, value: 15, suffix: "+", label: "Ans d'expérience" },
  { icon: Activity, value: 98, suffix: "%", label: "Satisfaction patients" },
  { icon: Stethoscope, value: 12, suffix: "", label: "Spécialistes" },
];

const Counter = ({ to, suffix, run }: { to: number; suffix: string; run: boolean }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!run) return;
    let frame = 0;
    const total = 45;
    const id = window.setInterval(() => {
      frame += 1;
      const progress = 1 - Math.pow(1 - frame / total, 3);
      setValue(Math.round(to * progress));
      if (frame >= total) window.clearInterval(id);
    }, 20);
    return () => window.clearInterval(id);
  }, [run, to]);

  return (
    <span>
      {value.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
};

export const StatsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-16 md:py-24">
      <div ref={ref} className="mx-auto max-w-[1280px] px-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: i * 0.07 }}
              className="rounded-[28px] border border-border bg-card p-9 text-center shadow-soft transition-all duration-250 hover:-translate-y-1.5 hover:shadow-large"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <s.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-5 text-4xl font-bold tracking-tight text-foreground">
                <Counter to={s.value} suffix={s.suffix} run={inView} />
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
