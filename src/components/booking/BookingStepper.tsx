import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BookingStep {
  id: number;
  label: string;
}

interface BookingStepperProps {
  steps: BookingStep[];
  current: number;
  completed: number[];
}

export const BookingStepper = ({ steps, current, completed }: BookingStepperProps) => (
  <ol className="flex w-full items-center gap-2 overflow-x-auto" aria-label="Progression de la réservation">
    {steps.map((step, i) => {
      const isDone = completed.includes(step.id);
      const isActive = current === step.id;
      return (
        <li key={step.id} className="flex flex-1 min-w-fit items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 transition-all duration-250",
              isActive
                ? "border-primary/30 bg-primary/10 shadow-soft"
                : isDone
                ? "border-transparent bg-muted/70"
                : "border-border bg-card"
            )}
            aria-current={isActive ? "step" : undefined}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-250",
                isDone
                  ? "bg-stat-green text-white"
                  : isActive
                  ? "bg-gradient-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isDone ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : step.id}
            </span>
            <span
              className={cn(
                "whitespace-nowrap text-sm font-semibold",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <span
              aria-hidden="true"
              className={cn(
                "hidden h-px flex-1 rounded-full transition-colors duration-250 sm:block",
                isDone ? "bg-stat-green/50" : "bg-border"
              )}
            />
          )}
        </li>
      );
    })}
  </ol>
);

export default BookingStepper;
