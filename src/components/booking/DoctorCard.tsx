import { Star, BadgeCheck, MapPin, Clock, Languages, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface BookingDoctor {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  experience_years?: number | null;
  rating?: number | null;
  specialty?: string | null;
  clinic?: string | null;
}

interface DoctorCardProps {
  doctor?: BookingDoctor;
  nextAvailable?: string;
}

const initials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase();

export const DoctorCard = ({ doctor, nextAvailable }: DoctorCardProps) => {
  if (!doctor) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <UserRound className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">Aucun praticien sélectionné</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Choisissez un praticien pour voir son profil et ses disponibilités.
        </p>
      </div>
    );
  }

  const rating = doctor.rating ?? 4.9;

  return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-soft transition-all duration-250 hover:-translate-y-1 hover:shadow-medium">
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 ring-4 ring-primary/10">
          <AvatarImage src={doctor.avatar_url || undefined} alt={`Photo de ${doctor.full_name}`} />
          <AvatarFallback className="bg-gradient-primary text-xl font-bold text-primary-foreground">
            {initials(doctor.full_name)}
          </AvatarFallback>
        </Avatar>
        <h3 className="mt-4 text-xl font-semibold text-foreground">{doctor.full_name}</h3>
        {doctor.specialty && (
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {doctor.specialty}
          </span>
        )}
        <div className="mt-3 flex items-center gap-1.5" aria-label={`Note ${rating} sur 5`}>
          <span className="flex" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </span>
          <span className="text-sm font-semibold text-foreground">{Number(rating).toFixed(1)}</span>
        </div>
      </div>

      <dl className="mt-7 space-y-4 border-t border-border pt-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Clock className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <dt className="text-sm font-semibold text-foreground">Expérience</dt>
            <dd className="text-sm text-muted-foreground">
              {doctor.experience_years ? `${doctor.experience_years} ans de pratique` : "Praticien confirmé"}
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Languages className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <dt className="text-sm font-semibold text-foreground">Langues</dt>
            <dd className="text-sm text-muted-foreground">Français · Arabe · Anglais</dd>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MapPin className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <dt className="text-sm font-semibold text-foreground">Cabinet</dt>
            <dd className="text-sm text-muted-foreground">{doctor.clinic || "La Dune Clinique Dentaire"}</dd>
          </div>
        </div>
      </dl>

      {nextAvailable && (
        <div className="mt-6 flex items-center gap-2 rounded-2xl bg-stat-green/10 px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-stat-green" aria-hidden="true" />
          <span className="text-sm font-medium text-foreground">Prochaine dispo : {nextAvailable}</span>
        </div>
      )}
    </div>
  );
};

export default DoctorCard;
