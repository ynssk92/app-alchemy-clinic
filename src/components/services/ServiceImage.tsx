import { Activity, Clock } from "lucide-react";

interface ServiceImageProps {
  src?: string;
  alt: string;
  name: string;
  duration?: string;
  recovery?: string;
}

export const ServiceImage = ({ src, alt, name, duration = "45 – 60 min", recovery = "24 – 48 h" }: ServiceImageProps) => (
  <div className="group relative h-[320px] overflow-hidden rounded-[28px] bg-muted sm:h-[420px] lg:h-[560px]">
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

    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-foreground/85 via-foreground/35 to-transparent" />

    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
      <h3 className="text-xl font-bold text-background sm:text-2xl">{name}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-1.5 text-xs font-semibold text-background backdrop-blur-md sm:text-sm">
          <Clock className="h-4 w-4" aria-hidden />
          {duration}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-1.5 text-xs font-semibold text-background backdrop-blur-md sm:text-sm">
          <Activity className="h-4 w-4" aria-hidden />
          Récupération {recovery}
        </span>
      </div>
    </div>
  </div>
);

export default ServiceImage;
