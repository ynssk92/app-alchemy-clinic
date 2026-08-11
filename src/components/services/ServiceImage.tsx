import { Activity, Clock } from "lucide-react";

interface ServiceImageProps {
  src?: string;
  alt: string;
  name: string;
  duration?: string;
  recovery?: string;
}

const WIDTHS = [480, 768, 1024, 1440];

const buildSrcSet = (src?: string): string | undefined => {
  if (!src) return undefined;
  const renderable = src.includes("/storage/v1/") && src.startsWith("http");
  if (!renderable) return undefined;
  const base = src.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  return WIDTHS.map((w) => {
    const url = new URL(base);
    url.searchParams.set("width", String(w));
    url.searchParams.set("quality", "80");
    url.searchParams.set("resize", "cover");
    return `${url.toString()} ${w}w`;
  }).join(", ");
};

export const ServiceImage = ({ src, alt, name, duration = "45 – 60 min", recovery = "24 – 48 h" }: ServiceImageProps) => {
  const srcSet = buildSrcSet(src);

  return (
    <div className="group relative w-full overflow-hidden rounded-[28px] bg-slate-100 shadow-medium lg:h-[560px]">
      {src ? (
        <img
          src={src}
          srcSet={srcSet}
          sizes="(min-width: 1024px) 55vw, 100vw"
          alt={alt}
          width={1024}
          height={1024}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-white">
          <Activity className="h-20 w-20 text-blue-200" />
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
        <h3 className="line-clamp-2 text-2xl font-bold text-white sm:text-3xl">{name}</h3>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/30">
            <Clock className="h-4 w-4" aria-hidden />
            {duration}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/30">
            <Activity className="h-4 w-4" aria-hidden />
            Recovery {recovery}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceImage;
