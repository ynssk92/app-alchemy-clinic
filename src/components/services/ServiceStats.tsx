const STATS = [
  { value: "98%", label: "Patient Satisfaction" },
  { value: "2500+", label: "Successful Treatments" },
  { value: "15+", label: "Years Experience" },
];

export const ServiceStats = () => (
  <div className="grid grid-cols-3 gap-4 rounded-3xl border border-slate-100 bg-slate-50/50 p-6 sm:p-8">
    {STATS.map((stat) => (
      <div key={stat.label} className="text-center group">
        <div className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] bg-clip-text text-2xl font-black tracking-tight text-transparent transition-transform duration-300 group-hover:scale-110 sm:text-3xl">
          {stat.value}
        </div>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
          {stat.label}
        </p>
      </div>
    ))}
  </div>
);

export default ServiceStats;
