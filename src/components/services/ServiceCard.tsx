import { Link } from "react-router-dom";
import { ArrowRight, CalendarPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceImage } from "./ServiceImage";
import { ServiceFeatures } from "./ServiceFeatures";
import { ServiceStats } from "./ServiceStats";
import { TrustBadges } from "./TrustBadges";

interface ServiceCardProps {
  name: string;
  description?: string | null;
  features: string[];
  imageSrc?: string;
  popular?: boolean;
}

export const ServiceCard = ({ name, description, features, imageSrc, popular = true }: ServiceCardProps) => (
  <article className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-medium transition-all duration-500 sm:p-10 lg:p-12">
    <div className="grid items-stretch gap-10 lg:grid-cols-[55fr_45fr] lg:gap-16">
      <ServiceImage src={imageSrc} alt={name} name={name} />

      <div className="flex min-w-0 flex-col justify-center space-y-8">
        <div className="space-y-4">
          {popular && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#2563EB] shadow-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Most Popular
            </span>
          )}

          <div className="space-y-4">
            <h2 className="text-[28px] font-bold leading-tight text-[#1E293B] sm:text-[32px] lg:text-[34px]">
              {name}
            </h2>
            {description && (
              <p className="line-clamp-3 text-[17px] leading-relaxed text-[#64748B]">
                {description}
              </p>
            )}
          </div>
        </div>

        <ServiceFeatures items={features} />

        <ServiceStats />

        <div className="flex flex-col gap-4 pt-2 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="group h-14 flex-1 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-[16px] font-bold text-white shadow-[0_12px_24px_-8px_rgba(37,99,235,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(37,99,235,0.5)] active:scale-[0.98]"
          >
            <Link to="/booking">
              <CalendarPlus className="mr-2 h-5 w-5" aria-hidden />
              Book Consultation
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="group h-14 flex-1 rounded-2xl border-slate-200 bg-white text-[16px] font-bold text-slate-700 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:bg-slate-50 active:scale-[0.98]"
          >
            <Link to="/expertise">
              Learn More
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <TrustBadges />
        </div>
      </div>
    </div>
  </article>
);

export default ServiceCard;
