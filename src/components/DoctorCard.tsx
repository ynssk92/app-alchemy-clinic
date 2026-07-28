import { useState } from "react";
import { Link } from "react-router-dom";
import { Award, ArrowRight, Calendar, Languages, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DoctorProfileDialog } from "@/components/DoctorProfileDialog";


export type DoctorCardData = {
  id: string;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  experience_years: number | null;
  specialties: { name: string } | null;
};

const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const LANGUAGES = [
  { flag: "🇫🇷", label: "Français" },
  { flag: "🇺🇸", label: "English" },
  { flag: "🇲🇦", label: "العربية" },
];

export const DoctorCard = ({ doctor }: { doctor: DoctorCardData }) => {
  const specialty = doctor.specialties?.name || "Praticien";
  const [profileOpen, setProfileOpen] = useState(false);



  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-large">
      {/* decorative glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl transition-opacity duration-300 group-hover:opacity-100 opacity-60" />

      {/* photo */}
      <div className="relative mx-auto mb-5">
        <div className="relative h-[140px] w-[140px] overflow-hidden rounded-full border-4 border-primary/20 ring-4 ring-primary/5 transition-colors duration-300 group-hover:border-primary/40">
          {doctor.avatar_url ? (
            <img
              src={doctor.avatar_url}
              alt={`Portrait de ${doctor.full_name}, ${specialty}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-primary text-3xl font-bold text-primary-foreground">
              {initialsOf(doctor.full_name)}
            </div>
          )}
        </div>
        <span className="absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-stat-green">
          <span className="h-2 w-2 rounded-full bg-card/80" />
        </span>
      </div>

      {/* identity */}
      <h3 className="text-2xl font-bold tracking-tight text-foreground">{doctor.full_name}</h3>
      <div className="mt-2 flex justify-center">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {specialty}
        </span>
      </div>

      {/* meta */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Award className="h-4 w-4 text-primary" />
          {doctor.experience_years ? `${doctor.experience_years} ans d'expérience` : "Praticien certifié"}
        </span>
      </div>


      {/* languages */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Languages className="h-4 w-4 text-muted-foreground" aria-hidden />
        {LANGUAGES.map((l) => (
          <span
            key={l.label}
            className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground"
          >
            {l.flag} {l.label}
          </span>
        ))}
      </div>

      {/* bio */}
      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {doctor.bio || `${specialty} à La Dune Clinique Dentaire, dédié à des soins précis et confortables.`}
      </p>

      {/* actions */}
      <div className="mt-auto pt-6">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="flex-1 rounded-xl bg-gradient-primary font-semibold shadow-soft">
            <Link to={`/booking?doctor=${doctor.id}`}>
              <Calendar className="h-4 w-4" />
              Prendre RDV
            </Link>
          </Button>
          <Button
            variant="outline"
            className="group/btn flex-1 rounded-xl font-semibold"
            onClick={() => setProfileOpen(true)}
            aria-label={`Voir le profil de ${doctor.full_name}`}
          >
            Voir le profil
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Button>

        </div>

        <div className="mt-3 flex items-center justify-center gap-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100">
          <a
            href={`/contact`}
            aria-label={`Contacter ${doctor.full_name} par email`}
            className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Mail className="h-4 w-4" />
          </a>
          <a
            href={`/contact`}
            aria-label={`Appeler le cabinet de ${doctor.full_name}`}
            className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Phone className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
};

export default DoctorCard;
