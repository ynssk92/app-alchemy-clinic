import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type WidgetCardProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  tint?: string;
  action?: { label: string; to: string };
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
};

export const WidgetCard = ({
  title,
  description,
  icon: Icon,
  tint = "stat-blue",
  action,
  className,
  bodyClassName,
  children,
}: WidgetCardProps) => (
  <section
    className={cn(
      "group flex flex-col rounded-2xl border border-border bg-card",
      "shadow-[0_1px_2px_hsl(var(--foreground)/0.04)] transition-all duration-200",
      "hover:-translate-y-0.5 hover:shadow-medium",
      className
    )}
  >
    <header className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-3.5">
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon && (
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `hsl(var(--${tint}) / 0.12)`, color: `hsl(var(--${tint}))` }}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight text-card-foreground">{title}</h3>
          {description && (
            <p className="truncate text-[11px] leading-tight text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action && (
        <Link
          to={action.to}
          className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {action.label}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      )}
    </header>
    <div className={cn("flex-1 px-5 py-4", bodyClassName)}>{children}</div>
  </section>
);

export const EmptyState = ({ label }: { label: string }) => (
  <p className="py-6 text-center text-xs text-muted-foreground">{label}</p>
);

export default WidgetCard;
