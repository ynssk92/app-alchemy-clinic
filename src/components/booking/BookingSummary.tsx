import { ReactNode } from "react";
import { UserRound, Calendar, Clock, MapPin, ShieldCheck, Sparkles, ArrowRight, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrustBadge } from "./TrustBadge";

interface BookingSummaryProps {
  doctorName?: string;
  dateLabel?: string;
  timeLabel?: string;
  duration?: string;
  clinic?: string;
  cost?: string;
  insurance?: string;
  ready: boolean;
  busy: boolean;
  onSaveForLater: () => void;
}

const Row = ({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) => (
  <div className="flex items-start justify-between gap-3 py-3">
    <span className="flex items-center gap-2.5 text-sm text-muted-foreground">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-primary">{icon}</span>
      {label}
    </span>
    <span className="max-w-[55%] text-right text-sm font-semibold text-foreground">
      {value || <span className="font-normal text-muted-foreground/70">—</span>}
    </span>
  </div>
);

export const BookingSummary = ({
  doctorName,
  dateLabel,
  timeLabel,
  duration = "30 minutes",
  clinic = "La Dune Clinique Dentaire",
  cost = "Sur devis",
  insurance = "CNSS / AMO acceptée",
  ready,
  busy,
  onSaveForLater,
}: BookingSummaryProps) => (
  <div className="rounded-3xl border border-border bg-card p-8 shadow-soft transition-all duration-250 hover:shadow-medium">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-foreground">Récapitulatif</h2>
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          ready ? "bg-stat-green/10 text-stat-green" : "bg-muted text-muted-foreground"
        }`}
      >
        {ready ? "Prêt à confirmer" : "En cours"}
      </span>
    </div>

    <div className="mt-4 divide-y divide-border">
      <Row icon={<UserRound className="h-4 w-4" aria-hidden="true" />} label="Praticien" value={doctorName} />
      <Row icon={<Calendar className="h-4 w-4" aria-hidden="true" />} label="Date" value={dateLabel} />
      <Row icon={<Clock className="h-4 w-4" aria-hidden="true" />} label="Heure" value={timeLabel} />
      <Row icon={<Sparkles className="h-4 w-4" aria-hidden="true" />} label="Durée" value={duration} />
      <Row icon={<MapPin className="h-4 w-4" aria-hidden="true" />} label="Cabinet" value={clinic} />
      <Row icon={<BadgeCheck className="h-4 w-4" aria-hidden="true" />} label="Coût estimé" value={cost} />
      <Row icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />} label="Assurance" value={insurance} />
    </div>

    <div className="mt-6 space-y-3">
      <Button
        type="submit"
        disabled={busy}
        className="group h-14 w-full rounded-2xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-medium transition-all duration-250 hover:-translate-y-0.5 hover:shadow-large hover:brightness-105 active:scale-[0.98]"
      >
        {busy ? "Réservation..." : "Confirmer le rendez-vous"}
        <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-250 group-hover:translate-x-1" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onSaveForLater}
        className="h-12 w-full rounded-2xl font-semibold"
      >
        Enregistrer pour plus tard
      </Button>
    </div>

    <div className="mt-6 space-y-2">
      <TrustBadge icon={Sparkles} label="Confirmation instantanée" />
      <TrustBadge icon={ShieldCheck} label="Réservation sécurisée" />
      <TrustBadge icon={BadgeCheck} label="Annulation gratuite" />
    </div>
  </div>
);

export default BookingSummary;
