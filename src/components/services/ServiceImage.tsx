import { Activity, Clock } from "lucide-react";

interface ServiceImageProps {
  src?: string;
  alt: string;
  name: string;
  duration?: string;
  recovery?: string;
}

export const ServiceImage = ({ src, alt, name, duration = "45 – 60 min", recovery = "24 – 48 h" }: ServiceImageProps) => (
  <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-muted sm:aspect-[5/4] sm:rounded-[28px] lg:aspect-auto lg:h-[560px]">
    {src ? (
      <img
        src={src}
        alt={alt}
        width={1024}
        height={1024}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.06]"
      />
    ) : (
      <div className="h-full w-full bg-gradient-primary opacity-20" />
    )}

    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-foreground/85 via-foreground/40 to-transparent" />

    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-7">
      <h3 className="line-clamp-2 text-lg font-bold leading-tight text-background sm:text-xl lg:text-2xl">{name}</h3>
      <div className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-background/15 px-2.5 py-1 text-[11px] font-semibold text-background backdrop-blur-md sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm">
          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
          {duration}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-background/15 px-2.5 py-1 text-[11px] font-semibold text-background backdrop-blur-md sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm">
          <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
          Récupération {recovery}
        </span>
      </div>
    </div>
  </div>
);

export default ServiceImage;
