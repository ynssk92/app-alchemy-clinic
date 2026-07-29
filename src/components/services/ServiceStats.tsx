const STATS = [
  { value: "98%", label: "Satisfaction patients" },
  { value: "2500+", label: "Traitements réussis" },
  { value: "15+", label: "Années d'expérience" },
];

export const ServiceStats = () => (
  <div className="grid grid-cols-3 gap-3 rounded-[24px] border border-border/70 bg-muted/40 p-4 sm:gap-5 sm:p-6">
    {STATS.map((stat) => (
      <div key={stat.label} className="text-center">
        <div className="bg-gradient-primary bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl">
          {stat.value}
        </div>
        <p className="mt-1 text-[11px] font-medium leading-tight text-muted-foreground sm:text-xs">{stat.label}</p>
      </div>
    ))}
  </div>
);

export default ServiceStats;
