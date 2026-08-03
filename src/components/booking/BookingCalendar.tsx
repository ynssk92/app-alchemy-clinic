import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { DayContentProps } from "react-day-picker";

export type SlotAvailability = "many" | "few" | "none";

interface BookingCalendarProps {
  date?: Date;
  onSelect: (d?: Date) => void;
  disabled: (d: Date) => boolean;
  /** Purely presentational availability indicator for a given day. */
  getAvailability?: (d: Date) => SlotAvailability | undefined;
}

const dotClass: Record<SlotAvailability, string> = {
  many: "bg-emerald-500",
  few: "bg-amber-500",
  none: "bg-destructive",
};

const legend: { key: SlotAvailability; label: string }[] = [
  { key: "many", label: "Disponible" },
  { key: "few", label: "Peu de créneaux" },
  { key: "none", label: "Complet" },
];

export const BookingCalendar = ({ date, onSelect, disabled, getAvailability }: BookingCalendarProps) => {
  const DayContent = (props: DayContentProps) => {
    const status = getAvailability?.(props.date);
    const isDisabled = disabled(props.date);
    return (
      <span className="relative flex h-full w-full items-center justify-center">
        <span className="leading-none">{props.date.getDate()}</span>
        {status && !isDisabled ? (
          <span
            aria-hidden="true"
            className={cn(
              "absolute bottom-1.5 h-1.5 w-1.5 rounded-full transition-colors duration-200",
              dotClass[status]
            )}
          />
        ) : null}
      </span>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[480px]">
      <Calendar
        mode="single"
        selected={date}
        onSelect={onSelect}
        disabled={disabled}
        weekStartsOn={1}
        components={{ DayContent }}
        className={cn("pointer-events-auto w-full rounded-2xl border border-border bg-card p-3 sm:p-4")}
        classNames={{
          months: "w-full",
          month: "w-full space-y-4",
          caption: "relative flex items-center justify-center pt-1",
          caption_label: "text-base font-semibold capitalize sm:text-lg",
          nav_button:
            "h-9 w-9 rounded-xl border border-border bg-card hover:bg-muted transition-all duration-200",
          table: "w-full table-fixed border-collapse",
          head_row: "grid grid-cols-7",
          head_cell:
            "flex h-8 items-center justify-center text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs",
          row: "grid grid-cols-7 mt-1",
          cell: "flex items-center justify-center p-0",
          day: cn(
            "flex h-[42px] w-[42px] items-center justify-center rounded-2xl text-sm font-medium sm:h-12 sm:w-12 lg:h-14 lg:w-14 lg:text-base",
            "transition-all duration-200 ease-out hover:scale-105 hover:bg-primary/10 hover:shadow-soft",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          ),
          day_selected:
            "bg-gradient-primary text-primary-foreground shadow-medium hover:bg-gradient-primary hover:text-primary-foreground",
          day_today: "ring-2 ring-primary ring-inset text-foreground font-semibold",
          day_disabled:
            "opacity-40 hover:scale-100 hover:bg-transparent hover:shadow-none cursor-not-allowed",
          day_outside: "opacity-40",
        }}
      />

      <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
        {legend.map((l) => (
          <li key={l.key} className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <span className={cn("h-1.5 w-1.5 rounded-full", dotClass[l.key])} aria-hidden="true" />
            {l.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookingCalendar;
