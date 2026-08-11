import { Award, ShieldCheck, Smile } from "lucide-react";

const BADGES = [
  { icon: Award, label: "Certified Specialists" },
  { icon: ShieldCheck, label: "Modern Equipment" },
  { icon: Smile, label: "Same-Day Consultation" },
];

export const TrustBadges = () => (
  <div className="flex flex-wrap items-center gap-3">
    {BADGES.map(({ icon: Icon, label }) => (
      <div
        key={label}
        className="group flex items-center gap-2 transition-colors hover:text-[#2563EB]"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-all duration-300">
          <Icon className="h-3 w-3" aria-hidden />
        </div>
        <span className="text-[12px] font-bold text-slate-500 group-hover:text-slate-700 transition-colors">
          {label}
        </span>
      </div>
    ))}
  </div>
);

export default TrustBadges;
