import { Link } from "react-router-dom";
import { Award, Calendar, Languages, Mail, Phone, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DoctorCardData } from "@/components/DoctorCard";

const LANGUAGES = [
  { flag: "🇫🇷", label: "Français" },
  { flag: "🇺🇸", label: "English" },
  { flag: "🇲🇦", label: "العربية" },
];

const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

type Props = {
  doctor: DoctorCardData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const DoctorProfileDialog = ({ doctor, open, onOpenChange }: Props) => {
  const specialty = doctor.specialties?.name || "Praticien";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden rounded-3xl p-0">
        <div className="relative bg-gradient-hero px-6 pb-6 pt-8 text-center">
          <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-card shadow-soft">
            {doctor.avatar_url ? (
              <img
                src={doctor.avatar_url}
                alt={`Portrait de ${doctor.full_name}, ${specialty}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-primary text-2xl font-bold text-primary-foreground">
                {initialsOf(doctor.full_name)}
              </div>
            )}
          </div>
          <DialogHeader className="mt-4 space-y-2">
            <DialogTitle className="text-center text-2xl font-bold tracking-tight">
              {doctor.full_name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Profil détaillé de {doctor.full_name}
            </DialogDescription>
          </DialogHeader>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Stethoscope className="h-3.5 w-3.5" />
            {specialty}
          </span>
        </div>

        <div className="space-y-5 px-6 pb-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {doctor.bio ||
              `${specialty} à La Dune Clinique Dentaire, dédié à des soins précis et confortables.`}
          </p>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm">
            <Award className="h-4 w-4 shrink-0 text-primary" />
            <span className="text-muted-foreground">
              {doctor.experience_years
                ? `${doctor.experience_years} ans d'expérience`
                : "Praticien certifié"}
            </span>
          </div>

          <div>
            <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Languages className="h-3.5 w-3.5" />
              Langues parlées
            </h4>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <span
                  key={l.label}
                  className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  {l.flag} {l.label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="flex-1 rounded-xl bg-gradient-primary font-semibold shadow-soft">
              <Link to={`/booking?doctor=${doctor.id}`}>
                <Calendar className="h-4 w-4" />
                Prendre RDV
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 rounded-xl font-semibold">
              <Link to="/contact">
                <Mail className="h-4 w-4" />
                Écrire
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl font-semibold sm:w-auto">
              <Link to="/contact" aria-label={`Appeler le cabinet de ${doctor.full_name}`}>
                <Phone className="h-4 w-4" />
                <span className="sm:hidden">Appeler</span>
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorProfileDialog;
