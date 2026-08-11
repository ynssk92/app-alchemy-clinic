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
  <article className="overflow-hidden rounded-3xl border border-border bg-card/80 p-4 shadow-large backdrop-blur-xl transition-all duration-[250ms] sm:rounded-[32px] sm:p-8 lg:p-10">
    <div className="grid items-stretch gap-6 sm:gap-8 lg:grid-cols-[55fr_45fr] lg:gap-10">
      <ServiceImage src={imageSrc} alt={name} name={name} />

      <div className="flex min-w-0 flex-col justify-center gap-5 sm:gap-6">
        {popular && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-[0_10px_24px_-14px_hsl(var(--primary)/0.8)] sm:gap-2 sm:px-3.5 sm:py-1.5 sm:text-xs">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
            Le plus demandé
          </span>
        )}

        <div className="min-w-0">
          <h2 className="text-[24px] font-bold leading-[1.15] tracking-tight text-foreground sm:text-[30px] lg:text-[34px]">
            {name}
          </h2>
          {description && (
            <p className="mt-2.5 line-clamp-4 text-[15px] leading-relaxed text-muted-foreground sm:mt-3 sm:line-clamp-3 sm:text-[17px]">
              {description}
            </p>
          )}
        </div>

        <ServiceFeatures items={features} />

        <ServiceStats />

        <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
          <Button
            asChild
            size="lg"
            className="group h-12 flex-1 rounded-xl bg-gradient-primary text-[15px] font-semibold text-primary-foreground shadow-[0_16px_40px_-18px_hsl(var(--primary)/0.9)] transition-all duration-[250ms] hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-16px_hsl(var(--primary)/0.95)] sm:rounded-2xl sm:text-base"
          >
            <Link to="/booking">
              <CalendarPlus className="mr-2 h-5 w-5" aria-hidden />
              Réserver une consultation
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="group h-12 flex-1 rounded-xl border-border text-[15px] font-semibold transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-primary/50 hover:bg-muted/60 sm:rounded-2xl sm:text-base"
          >
            <Link to="/expertise">
              En savoir plus
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-[250ms] group-hover:translate-x-1" aria-hidden />
            </Link>
          </Button>
        </div>

        <TrustBadges />
      </div>
    </div>
  </article>
);

export default ServiceCard;
