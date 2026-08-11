import { CheckCircle2 } from "lucide-react";

interface ServiceFeaturesProps {
  items: string[];
}

export const ServiceFeatures = ({ items }: ServiceFeaturesProps) => {
  if (!items.length) return null;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3.5 transition-all duration-300 hover:border-blue-200 hover:bg-white hover:shadow-soft"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB] transition-colors group-hover:bg-[#2563EB] group-hover:text-white">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
          </div>
          <span className="text-[15px] font-semibold text-slate-700 transition-colors group-hover:text-[#1E293B]">{item}</span>
        </li>
      ))}
    </ul>
  );
};

export default ServiceFeatures;
