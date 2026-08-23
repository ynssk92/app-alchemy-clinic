import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Stethoscope, Calendar, Users, Building2, TrendingUp,
  Plus, CalendarCheck, Clock, Activity, MessageSquare, Zap,
  UserPlus, FileText, FlaskConical, Boxes, CircleDot, MoreHorizontal, FileStack, ShieldAlert
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import KpiCard from "@/components/dashboard/KpiCard";
import { WidgetCard, EmptyState } from "@/components/dashboard/WidgetCard";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Stats = {
  doctors: number; appts: number; patients: number;
  clinics: number; upcoming: number; messages: number;
};

const initials = (name?: string | null) =>
  (name || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const AdminOverview = () => {
  const { isAdmin } = useAuth();
  const { can } = usePermissions();
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<Stats>({
    doctors: 0, appts: 0, patients: 0, clinics: 0, upcoming: 0, messages: 0,
  });
  const [monthly, setMonthly] = useState<{ month: string; completed: number; ongoing: number; cancelled: number }[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [topDoctors, setTopDoctors] = useState<any[]>([]);
  const [topPatients, setTopPatients] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [upcomingAppts, setUpcomingAppts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [d, a, p, c, up, msg, allAppts, doctorsList] = await Promise.all([
        supabase.from("doctors").select("*", { count: "exact", head: true }),
        supabase.from("appointments").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("clinics").select("*", { count: "exact", head: true }),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "upcoming"),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }),
        supabase.from("appointments").select("appointment_date, status, doctor_id"),
        supabase.from("doctors").select("id, full_name, specialties(name)"),
      ]);

      setStats({
        doctors: d.count || 0, appts: a.count || 0, patients: p.count || 0,
        clinics: c.count || 0, upcoming: up.count || 0, messages: msg.count || 0,
      });

      // Aggregate monthly stats
      const buckets: Record<string, { completed: number; ongoing: number; cancelled: number }> = {};
      const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (11 - i));
        return format(d, "MMM");
      });
      months.forEach((m) => (buckets[m] = { completed: 0, ongoing: 0, cancelled: 0 }));
      (allAppts.data || []).forEach((r: any) => {
        const m = format(new Date(r.appointment_date), "MMM");
        if (!buckets[m]) return;
        if (r.status === "completed") buckets[m].completed++;
        else if (r.status === "cancelled") buckets[m].cancelled++;
        else buckets[m].ongoing++;
      });
      setMonthly(months.map((m) => ({ month: m, ...buckets[m] })));

      // Recent appointments
      const { data: rec } = await supabase
        .from("appointments")
        .select("id, appointment_date, appointment_time, status, reason, doctors(full_name)")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecent(rec || []);

      // Top doctors by booking count
      const counts: Record<string, number> = {};
      (allAppts.data || []).forEach((r: any) => {
        if (r.doctor_id) counts[r.doctor_id] = (counts[r.doctor_id] || 0) + 1;
      });
      const top = (doctorsList.data || [])
        .map((doc: any) => ({ ...doc, bookings: counts[doc.id] || 0 }))
        .sort((a: any, b: any) => b.bookings - a.bookings)
        .slice(0, 3);
      setTopDoctors(top);

      // Top 5 patients by appointment count
      const { data: allApptsWithPatient } = await supabase
        .from("appointments")
        .select("patient_id");
      const pCounts: Record<string, number> = {};
      (allApptsWithPatient || []).forEach((r: any) => {
        if (r.patient_id) pCounts[r.patient_id] = (pCounts[r.patient_id] || 0) + 1;
      });
      const topIds = Object.entries(pCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);
      if (topIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", topIds);
        setTopPatients(
          topIds.map((id) => {
            const p: any = profs?.find((x: any) => x.id === id);
            return { id, name: p?.full_name || "Patient", count: pCounts[id] };
          })
        );
      }

      // Recent contact messages
      const { data: msgs } = await supabase
        .from("contact_messages")
        .select("id, name, email, subject, created_at, status")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentMessages(msgs || []);

      // Upcoming appointments
      const { data: upc } = await supabase
        .from("appointments")
        .select("id, appointment_date, appointment_time, reason, status, doctors(full_name, specialties(name)), profiles(full_name)")
        .eq("status", "upcoming")
        .order("appointment_date", { ascending: true })
        .limit(6);
      setUpcomingAppts(upc || []);
    })();
  }, []);

  const spark = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({ v: Math.sin(i / 2) * 5 + 10 + Math.random() * 5 })),
    []
  );

  const growth = useMemo(
    () =>
      monthly.map((m) => ({
        month: m.month,
        total: m.completed + m.ongoing + m.cancelled,
      })),
    [monthly]
  );

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return t("dashboard.greeting.morning");
    if (h < 18) return t("dashboard.greeting.afternoon");
    return t("dashboard.greeting.evening");
  }, [t]);

  const kpis = [
    { label: t("nav.doctors"), value: stats.doctors, subtitle: t("dashboard.stats.activePractitioners"), delta: "+12%", up: true, tint: "stat-blue", icon: Stethoscope, chart: "area" as const },
    { label: t("nav.patients"), value: stats.patients, subtitle: t("dashboard.stats.registeredProfiles"), delta: "+25%", up: true, tint: "stat-violet", icon: Users, chart: "bar" as const },
    { label: t("nav.appointments"), value: stats.appts, subtitle: t("dashboard.stats.allTimeBookings"), delta: "+18%", up: true, tint: "stat-cyan", icon: Calendar, chart: "area" as const },
    { label: t("dashboard.stats.upcoming"), value: stats.upcoming, subtitle: t("dashboard.stats.scheduledAhead"), delta: "-4%", up: false, tint: "stat-green", icon: TrendingUp, chart: "line" as const },
  ];

  const quickActions = [
    { label: t("nav.createPatient"), to: "/admin/patients/create", icon: UserPlus, tint: "stat-blue", module: "patients", action: "create" },
    { label: t("nav.newAppointment"), to: "/admin/appointments/new", icon: CalendarCheck, tint: "stat-cyan", module: "appointments", action: "create" },
    { label: t("nav.newInvoice"), to: "/admin/billing/invoices", icon: FileText, tint: "stat-green", module: "billing", action: "create" },
    { label: t("nav.doctors"), to: "/admin/doctors", icon: Stethoscope, tint: "stat-violet", module: "doctors" },
    { label: t("nav.messages"), to: "/admin/messages", icon: MessageSquare, tint: "stat-amber", module: "messages" },
    { label: t("nav.websiteCms"), to: "/admin/pages", icon: FileStack, tint: "stat-blue", adminOnly: true },
  ];

  const activity = useMemo(() => {
    const items = [
      ...recent.map((a: any) => ({
        id: `a-${a.id}`,
        icon: Calendar,
        tint: a.status === "completed" ? "stat-green" : "stat-blue",
        title: `${a.reason || "General visit"} · ${a.status}`,
        meta: `${a.doctors?.full_name ? `Dr. ${a.doctors.full_name}` : "Unassigned"} · ${format(new Date(a.appointment_date), "MMM d")}`,
        at: new Date(a.appointment_date).getTime(),
      })),
      ...recentMessages.map((m: any) => ({
        id: `m-${m.id}`,
        icon: MessageSquare,
        tint: "stat-amber",
        title: m.subject || "New enquiry",
        meta: `${m.name} · ${format(new Date(m.created_at), "MMM d")}`,
        at: new Date(m.created_at).getTime(),
      })),
    ];
    return items.sort((x, y) => y.at - x.at).slice(0, 7);
  }, [recent, recentMessages]);

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-4 border-b border-border/70 bg-background/80 px-4 py-3 backdrop-blur-xl md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight text-foreground md:text-2xl">
            {greeting} 👋
          </h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="capitalize">{format(new Date(), "EEEE, MMMM d", { locale: i18n.language === 'fr' ? fr : undefined })}</span>
            <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-positive/12 px-2 py-0.5 font-semibold text-positive">
              <CircleDot className="h-3 w-3" /> {t("dashboard.status.clinicOpen")}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-9 rounded-xl text-xs font-semibold">
            <Link to="/admin/patients/create"><UserPlus className="mr-1.5 h-3.5 w-3.5" />{t("nav.createPatient")}</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="hidden h-9 rounded-xl text-xs font-semibold sm:inline-flex">
            <Link to="/admin/billing/invoices"><FileText className="mr-1.5 h-3.5 w-3.5" />{t("nav.invoices")}</Link>
          </Button>
          <Button asChild size="sm" className="h-9 rounded-xl bg-gradient-primary text-xs font-semibold">
            <Link to="/admin/appointments/new"><Plus className="mr-1.5 h-3.5 w-3.5" />{t("nav.appointments")}</Link>
          </Button>
        </div>
      </header>

      {/* ─── KPI row ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} data={spark} />
        ))}
      </div>

      {/* ─── Charts ─── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <WidgetCard
          className="lg:col-span-7"
          title={t("dashboard.charts.appointmentStats.title")}
          description={t("dashboard.charts.appointmentStats.desc")}
          icon={Activity}
          tint="stat-cyan"
          action={{ label: t("nav.appointments"), to: "/admin/appointments" }}
        >
          <div className="mb-4 grid grid-cols-3 gap-2">
            {[
              { label: t("common.completed", { defaultValue: "Completed" }), value: monthly.reduce((s, m) => s + m.completed, 0), color: "stat-cyan" },
              { label: t("common.ongoing", { defaultValue: "Ongoing" }), value: monthly.reduce((s, m) => s + m.ongoing, 0), color: "stat-blue" },
              { label: t("common.cancelled", { defaultValue: "Cancelled" }), value: monthly.reduce((s, m) => s + m.cancelled, 0), color: "stat-violet" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: `hsl(var(--${s.color}))` }} />
                  {s.label}
                </div>
                <div className="mt-0.5 text-lg font-bold leading-none">{s.value}</div>
              </div>
            ))}
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 4, right: 0, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                />
                <Bar stackId="a" dataKey="completed" fill="hsl(var(--stat-cyan))" />
                <Bar stackId="a" dataKey="ongoing" fill="hsl(var(--stat-blue))" />
                <Bar stackId="a" dataKey="cancelled" fill="hsl(var(--stat-violet))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </WidgetCard>

        <WidgetCard
          className="lg:col-span-5"
          title={t("dashboard.charts.activityGrowth.title", { defaultValue: "Activity Growth" })}
          description={t("dashboard.charts.activityGrowth.desc", { defaultValue: "Total bookings per month" })}
          icon={TrendingUp}
          tint="stat-green"
        >
          <div className="h-[292px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth} margin={{ top: 8, right: 0, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--stat-green))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--stat-green))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--stat-green))" strokeWidth={2.5} fill="url(#growthFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </WidgetCard>
      </div>

      {/* ─── Schedule / Activity / Quick actions ─── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Today's schedule timeline */}
        <WidgetCard
          className="lg:col-span-5"
          title={t("dashboard.schedule.title")}
          description={t("dashboard.schedule.desc")}
          icon={Clock}
          tint="stat-blue"
          action={{ label: t("nav.calendar"), to: "/admin/appointments/calendar" }}
        >
          {upcomingAppts.length === 0 ? (
            <EmptyState label={t("dashboard.schedule.empty")} />
          ) : (
            <ol className="relative space-y-3 pl-[62px]">
              <span className="absolute left-[54px] top-1 bottom-1 w-px bg-border" />
              {upcomingAppts.slice(0, 5).map((a: any) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[62px] top-0 w-[46px] text-right text-[11px] font-bold tabular-nums text-muted-foreground">
                    {(a.appointment_time || "").slice(0, 5)}
                  </span>
                  <span
                    className="absolute -left-[11px] top-1.5 h-2 w-2 rounded-full ring-4 ring-card"
                    style={{ background: "hsl(var(--stat-blue))" }}
                  />
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-transparent px-2.5 py-1.5 transition-colors hover:border-border hover:bg-muted/50">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold">{a.profiles?.full_name || "Patient"}</div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {a.reason || "Consultation"}
                      </div>
                    </div>
                    <Badge className="shrink-0 border-0 bg-positive/12 text-[10px] font-semibold capitalize text-positive">
                      {a.status || "upcoming"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </WidgetCard>

        {/* Recent activity */}
        <WidgetCard
          className="lg:col-span-4"
          title={t("dashboard.activity.title")}
          description={t("dashboard.activity.desc")}
          icon={Activity}
          tint="stat-violet"
        >
          {activity.length === 0 ? (
            <EmptyState label="No activity yet" />
          ) : (
            <ul className="space-y-2.5">
              {activity.map((it) => (
                <li key={it.id} className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `hsl(var(--${it.tint}) / 0.12)`, color: `hsl(var(--${it.tint}))` }}
                  >
                    <it.icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1 border-b border-border/60 pb-2.5 last:border-0 last:pb-0">
                    <div className="truncate text-[13px] font-medium capitalize">{it.title}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{it.meta}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>

        {/* Quick actions */}
        <WidgetCard
          className="lg:col-span-3"
          title={t("common.quickActions")}
          description={t("dashboard.actions.desc")}
          icon={Zap}
          tint="stat-amber"
        >
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((q: any) => {
              const hasPerm = isAdmin || (q.adminOnly ? false : (q.module ? can(q.module, q.action || "view") : true));
              if (!hasPerm) return null;
              
              return (
                <Link
                  key={q.label}
                  to={q.to}
                  className="flex flex-col items-start gap-2 rounded-xl border border-border bg-muted/30 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-soft"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: `hsl(var(--${q.tint}) / 0.12)`, color: `hsl(var(--${q.tint}))` }}
                  >
                    <q.icon className="h-4 w-4" />
                  </span>
                  <span className="text-[11px] font-semibold leading-tight">{q.label}</span>
                </Link>
              );
            })}
          </div>
        </WidgetCard>
      </div>

      {/* ─── Appointments / Doctors / Patients ─── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Compact appointment cards */}
        <WidgetCard
          className="lg:col-span-8"
          title={t("dashboard.appointments.upcomingTitle")}
          description={t("dashboard.appointments.upcomingDesc")}
          icon={CalendarCheck}
          tint="stat-cyan"
          action={{ label: t("common.view"), to: "/admin/appointments" }}
        >
          {upcomingAppts.length === 0 ? (
            <EmptyState label={t("dashboard.appointments.noUpcoming")} />
          ) : (
            <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
              {upcomingAppts.map((a: any, i: number) => {
                const tint = ["stat-blue", "stat-cyan", "stat-violet", "stat-green", "stat-amber", "stat-red"][i % 6];
                return (
                  <div
                    key={a.id}
                    className="group/appt flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                      style={{ background: `hsl(var(--${tint}) / 0.14)`, color: `hsl(var(--${tint}))` }}
                    >
                      {initials(a.doctors?.full_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-semibold">
                          Dr. {a.doctors?.full_name || "Unassigned"}
                        </span>
                        <Badge className="shrink-0 border-0 bg-positive/12 px-1.5 text-[9px] font-bold uppercase text-positive">
                          {a.status || "upcoming"}
                        </Badge>
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {a.doctors?.specialties?.name || "General"} · {a.profiles?.full_name || "Patient"}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(a.appointment_date), "MMM d")}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {(a.appointment_time || "").slice(0, 5)}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover/appt:opacity-100 focus:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem asChild><Link to="/admin/appointments">View</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link to="/admin/appointments">Edit</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link to="/admin/appointments/calendar">Calendar</Link></DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
        </WidgetCard>

        {/* Recent patients */}
        <WidgetCard
          className="lg:col-span-4"
          title={t("dashboard.appointments.topPatients")}
          description={t("dashboard.appointments.mostFrequent")}
          icon={Users}
          tint="stat-green"
          action={{ label: t("common.view"), to: "/admin/patients" }}
        >
          {topPatients.length === 0 ? (
            <EmptyState label={t("dashboard.appointments.empty")} />
          ) : (
            <ul className="space-y-2">
              {topPatients.map((p, i) => {
                const tint = ["stat-blue", "stat-cyan", "stat-violet", "stat-green", "stat-red"][i % 5];
                return (
                  <li key={p.id} className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted/60">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                      style={{ background: `hsl(var(--${tint}) / 0.14)`, color: `hsl(var(--${tint}))` }}
                    >
                      {initials(p.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">{t("dashboard.appointments.topPatients")}</div>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {p.count} appts
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </WidgetCard>
      </div>

      {/* ─── Doctors + Messages ─── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <WidgetCard
          className="lg:col-span-7"
          title={t("dashboard.appointments.popularDoctors")}
          description={t("dashboard.appointments.rankedBookings")}
          icon={Stethoscope}
          tint="stat-blue"
          action={{ label: t("common.view"), to: "/admin/doctors" }}
        >
          {topDoctors.length === 0 ? (
            <EmptyState label={t("dashboard.appointments.empty")} />
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {topDoctors.map((doc: any, i: number) => {
                const tint = ["stat-blue", "stat-cyan", "stat-violet"][i % 3];
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-2.5 rounded-xl border border-border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                      style={{ background: `hsl(var(--${tint}) / 0.14)`, color: `hsl(var(--${tint}))` }}
                    >
                      {initials(doc.full_name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold">Dr. {doc.full_name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {doc.specialties?.name || "Specialist"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold leading-none">{doc.bookings}</div>
                      <div className="text-[10px] text-muted-foreground">{t("dashboard.appointments.rankedBookings")}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </WidgetCard>

        <WidgetCard
          className="lg:col-span-5"
          title={t("dashboard.appointments.recentMessages")}
          description={t("dashboard.appointments.latestEnquiries")}
          icon={MessageSquare}
          tint="stat-amber"
          action={{ label: t("nav.messages"), to: "/admin/messages" }}
        >
          {recentMessages.length === 0 ? (
            <EmptyState label={t("dashboard.appointments.empty")} />
          ) : (
            <ul className="space-y-2">
              {recentMessages.map((m: any) => (
                <li key={m.id} className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted/60">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{ background: "hsl(var(--stat-amber) / 0.14)", color: "hsl(var(--stat-amber))" }}
                  >
                    {initials(m.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold">{m.subject || "New enquiry"}</div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {m.name} · {format(new Date(m.created_at), "MMM d", { locale: i18n.language === 'fr' ? fr : undefined })}
                    </div>
                  </div>
                  <Badge
                    className={
                      m.status === "unread"
                        ? "shrink-0 border-0 bg-stat-red/12 text-[10px] font-bold text-stat-red"
                        : "shrink-0 border-0 bg-positive/12 text-[10px] font-bold text-positive"
                    }
                  >
                    {m.status || "new"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>
      </div>
    </div>
  );
};

export default AdminOverview;
