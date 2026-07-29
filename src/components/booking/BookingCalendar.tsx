import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface BookingCalendarProps {
  date?: Date;
  onSelect: (d?: Date) => void;
  disabled: (d: Date) => boolean;
}

export const BookingCalendar = ({ date, onSelect, disabled }: BookingCalendarProps) => (
  <Calendar
    mode="single"
    selected={date}
    onSelect={onSelect}
    disabled={disabled}
    className={cn("pointer-events-auto w-full rounded-2xl border border-border bg-card p-4")}
    classNames={{
      months: "w-full",
      month: "w-full space-y-4",
      caption_label: "text-base font-semibold",
      nav_button:
        "h-9 w-9 rounded-xl border border-border bg-card hover:bg-muted transition-all duration-250",
      table: "w-full border-collapse",
      head_row: "flex w-full justify-between",
      head_cell: "flex-1 text-center text-xs font-semibold uppercase text-muted-foreground",
      row: "flex w-full justify-between mt-1.5",
      cell: "flex-1 text-center p-0.5",
      day: cn(
        "mx-auto flex h-11 w-11 items-center justify-center rounded-xl text-sm font-medium",
        "transition-all duration-250 hover:-translate-y-0.5 hover:bg-primary/10 hover:shadow-soft",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      ),
      day_selected:
        "bg-gradient-primary text-primary-foreground shadow-medium hover:bg-gradient-primary hover:text-primary-foreground",
      day_today: "ring-1 ring-primary/40 text-primary font-bold",
      day_disabled: "text-muted-foreground/40 line-through hover:translate-y-0 hover:bg-transparent hover:shadow-none",
      day_outside: "text-muted-foreground/40",
    }}
  />
);

export default BookingCalendar;
