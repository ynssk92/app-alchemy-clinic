import { cn } from "@/lib/utils";

interface TimeSlotGridProps {
  slots: string[];
  selected: string;
  onSelect: (slot: string) => void;
  booked?: string[];
  unavailable?: string[];
}

export const TimeSlotGrid = ({ slots, selected, onSelect, booked = [], unavailable = [] }: TimeSlotGridProps) => (
  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" role="group" aria-label="Créneaux horaires disponibles">
    {slots.map((slot) => {
      const isBooked = booked.includes(slot);
      const isUnavailable = unavailable.includes(slot);
      const isDisabled = isBooked || isUnavailable;
      const isSelected = selected === slot;
      return (
        <button
          key={slot}
          type="button"
          disabled={isDisabled}
          aria-pressed={isSelected}
          aria-label={
            isBooked ? `${slot} — déjà réservé` : isUnavailable ? `${slot} — indisponible` : `Choisir ${slot}`
          }
          onClick={() => onSelect(slot)}
          className={cn(
            "h-12 rounded-full border text-sm font-semibold transition-all duration-250",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isSelected
              ? "border-transparent bg-gradient-primary text-primary-foreground shadow-medium"
              : isBooked
              ? "cursor-not-allowed border-destructive/40 bg-transparent text-destructive/70"
              : isUnavailable
              ? "cursor-not-allowed border-transparent bg-muted text-muted-foreground/60"
              : "border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-medium active:scale-[0.97]"
          )}
        >
          {slot}
        </button>
      );
    })}
  </div>
);

export default TimeSlotGrid;
