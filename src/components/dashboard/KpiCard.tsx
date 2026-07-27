import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, Line, LineChart, ResponsiveContainer } from "recharts";

export type KpiCardProps = {
  label: string;
  value: number | string;
  subtitle?: string;
  delta?: string;
  up?: boolean;
  tint?: string;
  icon: LucideIcon;
  chart?: "area" | "bar" | "line";
  data?: { v: number }[];
};

export const KpiCard = ({
  label,
  value,
  subtitle,
  delta,
  up = true,
  tint = "stat-blue",
  icon: Icon,
  chart = "area",
  data = [],
}: KpiCardProps) => (
  <article className="group relative flex h-[130px] flex-col justify-between overflow-hidden rounded-[20px] border border-border bg-card px-5 pt-4 pb-0 shadow-[0_1px_2px_hsl(var(--foreground)/0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ background: `hsl(var(--${tint}) / 0.12)`, color: `hsl(var(--${tint}))` }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      {delta && (
        <span
          className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
            up ? "bg-positive/12 text-positive" : "bg-negative/12 text-negative"
          }`}
        >
          {up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
          {delta}
        </span>
      )}
    </div>

    <div className="relative z-10 pb-3">
      <div className="text-[28px] font-bold leading-none tracking-tight text-card-foreground">
        {value}
      </div>
      {subtitle && <div className="mt-1 text-[11px] text-muted-foreground">{subtitle}</div>}
    </div>

    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-11 opacity-70">
      <ResponsiveContainer width="100%" height="100%">
        {chart === "bar" ? (
          <BarChart data={data}>
            <Bar dataKey="v" fill={`hsl(var(--${tint}))`} radius={[2, 2, 0, 0]} />
          </BarChart>
        ) : chart === "line" ? (
          <LineChart data={data}>
            <Line type="monotone" dataKey="v" stroke={`hsl(var(--${tint}))`} strokeWidth={2} dot={false} />
          </LineChart>
        ) : (
          <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`kpi-${tint}-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`hsl(var(--${tint}))`} stopOpacity={0.35} />
                <stop offset="100%" stopColor={`hsl(var(--${tint}))`} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={`hsl(var(--${tint}))`}
              strokeWidth={2}
              fill={`url(#kpi-${tint}-${label})`}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  </article>
);

export default KpiCard;
