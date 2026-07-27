import { Link } from "react-router-dom";
import { ArrowRight, CalendarPlus, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroCtaProps {
  className?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryTo?: string;
  secondaryTo?: string;
}

const base =
  "group inline-flex h-[52px] w-full sm:w-auto items-center justify-center gap-2 rounded-2xl text-base font-semibold tracking-tight transition-all duration-[250ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none";

export const HeroCta = ({
  className,
  primaryLabel = "Prendre rendez-vous",
  secondaryLabel = "Nous contacter",
  primaryTo = "/booking",
  secondaryTo = "/contact",
}: HeroCtaProps) => {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-3 sm:gap-4", className)}>
      <Link
        to={primaryTo}
        aria-label={primaryLabel}
        className={cn(
          base,
          "px-7 bg-primary text-primary-foreground shadow-soft",
          "hover:brightness-95 hover:-translate-y-0.5 hover:shadow-large",
        )}
      >
        <CalendarPlus className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{primaryLabel}</span>
        <ArrowRight
          className="h-5 w-5 shrink-0 transition-transform duration-[250ms] ease-out group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>

      <Link
        to={secondaryTo}
        aria-label={secondaryLabel}
        className={cn(
          base,
          "px-7 border border-border bg-card/90 text-foreground backdrop-blur-sm",
          "hover:bg-muted/60 hover:border-primary hover:text-primary hover:shadow-medium",
        )}
      >
        <PhoneCall
          className="h-5 w-5 shrink-0 transition-transform duration-[250ms] ease-out group-hover:rotate-[5deg]"
          aria-hidden="true"
        />
        <span>{secondaryLabel}</span>
      </Link>
    </div>
  );
};

export default HeroCta;
