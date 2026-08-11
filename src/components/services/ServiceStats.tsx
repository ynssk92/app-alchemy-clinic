const STATS = [
  { value: "98%", label: "Satisfaction patients" },
  { value: "2500+", label: "Traitements réussis" },
  { value: "15+", label: "Années d'expérience" },
];

export const ServiceStats = () => (
  <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border/70 bg-muted/40 p-3 xs:gap-3 sm:gap-5 sm:rounded-[24px] sm:p-6">
    {STATS.map((stat) => (
      <div key={stat.label} className="min-w-0 text-center">
        <div className="bg-gradient-primary bg-clip-text text-xl font-extrabold leading-none tracking-tight text-transparent xs:text-2xl sm:text-3xl">
          {stat.value}
        </div>
        <p className="mt-1.5 text-[10px] font-medium leading-tight text-muted-foreground xs:text-[11px] sm:text-xs">
          {stat.label}
        </p>
      </div>
    ))}
  </div>
);

export default ServiceStats;
