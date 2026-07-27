import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar, Clock, Award, TrendingUp, LogOut, Activity, Stethoscope,
  HeartPulse, CircleDot, Search, User, Plus, ChevronRight, Flame,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import { Seo } from "@/components/Seo";
import { WidgetCard, EmptyState } from "@/components/dashboard/WidgetCard";
import { format, isToday, parseISO } from "date-fns";

type Appt = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  doctors: { full_name: string; specialties: { name: string } | null } | null;
};

const initials = (name?: string | null) =>
  (name || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const statusTone = (status: string) =>
  status === "upcoming"
    ? "bg-primary/12 text-primary"
    : status === "cancelled"
    ? "bg-negative/12 text-negative"
    : "bg-positive/12 text-positive";

const PatientDashboard = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [appointments, setAppointments] = useState<Appt[]>([]);
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
      .then(({ data }) => setProfileName(data?.full_name || user.email || ""));
    supabase
      .from("appointments")
      .select("id, appointment_date, appointment_time, status, doctors(full_name, specialties(name))")
      .order("appointment_date", { ascending: true })
      .then(({ data }) => setAppointments((data as any) || []));
  }, [user]);

  const upcoming = appointments.filter((a) => a.status === "upcoming").length;
  const completed = appointments.filter((a) => a.status === "completed").length;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const todays = useMemo(
    () => appointments.filter((a) => { try { return isToday(parseISO(a.appointment_date)); } catch { return false; } }),
    [appointments]
  );

  const nextAppt = useMemo(
    () => appointments.find((a) => a.status === "upcoming") || null,
    [appointments]
  );

  const stats = [
    { label: "Health Score", value: "85%", sub: "Excellent condition", tint: "stat-green", icon: HeartPulse, progress: 85, badge: "Excellent" },
    { label: "Upcoming", value: upcoming, sub: "Scheduled visits", tint: "stat-blue", icon: Calendar, badge: "Active" },
    { label: "Completed", value: completed, sub: "Visits this year", tint: "stat-cyan", icon: Activity },
    { label: "Achievements", value: "7", sub: "7 of 10 unlocked", tint: "stat-amber", icon: Award, progress: 70 },
  ];

  const quickActions = [
    { label: "Find a Doctor", to: "/doctors", icon: Search, tint: "stat-blue" },
    { label: "Book Visit", to: "/booking", icon: Plus, tint: "stat-cyan" },
    { label: "My Profile", to: "/profile", icon: User, tint: "stat-violet" },
    { label: "Our Team", to: "/equipe", icon: Stethoscope, tint: "stat-green" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <Seo
        title="Your Dashboard — HealthBook"
        description="Track your health score, upcoming appointments, and achievements in your HealthBook dashboard."
        path="/patient-dashboard"
      />

      {/* Sticky top bar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-2.5">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="La Dune Clinique Dentaire" className="h-8" />
          </Link>
          <div className="flex items-center gap-1.5">
            <Button asChild variant="ghost" size="sm" className="hidden h-9 rounded-xl text-xs font-semibold sm:inline-flex">
              <Link to="/doctors">Find Doctors</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden h-9 rounded-xl text-xs font-semibold sm:inline-flex">
              <Link to="/profile">Profile</Link>
            </Button>
            {isAdmin && (
              <Button asChild variant="secondary" size="sm" className="h-9 rounded-xl text-xs font-semibold">
                <Link to="/admin">Admin Panel</Link>
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs font-semibold" onClick={signOut}>
              <LogOut className="mr-1.5 h-3.5 w-3.5" />Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto space-y-4 px-4 py-5">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-sm font-bold text-primary-foreground">
              {initials(profileName)}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight text-foreground md:text-2xl">
                {greeting}, {profileName?.split(" ")[0] || "there"} 👋
              </h1>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span>{format(new Date(), "EEEE, MMMM d")}</span>
                <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-positive/12 px-2 py-0.5 font-semibold text-positive">
                  <CircleDot className="h-3 w-3" /> Clinic Open
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm" className="h-9 rounded-xl text-xs font-semibold">
              <Link to="/profile"><User className="mr-1.5 h-3.5 w-3.5" />Edit Profile</Link>
            </Button>
            <Button asChild size="sm" className="h-9 rounded-xl bg-gradient-primary text-xs font-semibold">
              <Link to="/doctors"><Plus className="mr-1.5 h-3.5 w-3.5" />Book Appointment</Link>
            </Button>
          </div>
        </header>

        {/* KPI row */}
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <h2 className="sr-only">Health Overview</h2>
          {stats.map((s) => (
            <article
              key={s.label}
              className="group flex min-h-[130px] flex-col justify-between rounded-[20px] border border-border bg-card p-4 shadow-[0_1px_2px_hsl(var(--foreground)/0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: `hsl(var(--${s.tint}) / 0.12)`, color: `hsl(var(--${s.tint}))` }}
                >
                  <s.icon className="h-4 w-4" />
                </span>
                {s.badge && (
                  <Badge className="border-0 bg-muted text-[10px] font-bold text-muted-foreground">{s.badge}</Badge>
                )}
              </div>
              <div>
                <div className="text-[26px] font-bold leading-none tracking-tight text-card-foreground">{s.value}</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </div>
                <div className="text-[11px] text-muted-foreground">{s.sub}</div>
                {s.progress !== undefined && <Progress value={s.progress} className="mt-2 h-1.5" />}
              </div>
            </article>
          ))}
        </section>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Appointments list */}
          <WidgetCard
            className="self-start lg:col-span-8"
            title="Your Appointments"
            description={`${appointments.length} total · ${upcoming} upcoming`}
            icon={Calendar}
            tint="stat-blue"
            action={{ label: "Book new", to: "/doctors" }}
          >
            {appointments.length === 0 ? (
              <div className="py-8 text-center">
                <p className="mb-3 text-sm text-muted-foreground">No appointments yet.</p>
                <Button asChild size="sm" className="rounded-xl"><Link to="/doctors">Find a Doctor</Link></Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                {appointments.map((a, i) => {
                  const tint = ["stat-blue", "stat-cyan", "stat-violet", "stat-green", "stat-amber", "stat-red"][i % 6];
                  return (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                        style={{ background: `hsl(var(--${tint}) / 0.14)`, color: `hsl(var(--${tint}))` }}
                      >
                        {initials(a.doctors?.full_name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-[13px] font-semibold">
                            {a.doctors?.full_name || "Doctor"}
                          </span>
                          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${statusTone(a.status)}`}>
                            {a.status}
                          </span>
                        </div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          {a.doctors?.specialties?.name || "General consultation"}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />{format(parseISO(a.appointment_date), "MMM d, yyyy")}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />{(a.appointment_time || "").slice(0, 5)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </WidgetCard>

          {/* Right rail */}
          <div className="space-y-4 lg:col-span-4">
            <WidgetCard title="Next Visit" description="Your closest appointment" icon={Clock} tint="stat-cyan">
              {!nextAppt ? (
                <EmptyState label="No upcoming visit scheduled" />
              ) : (
                <div className="rounded-xl bg-gradient-primary p-4 text-primary-foreground">
                  <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
                    {format(parseISO(nextAppt.appointment_date), "EEEE, MMM d")}
                  </div>
                  <div className="mt-1 text-2xl font-bold leading-none">
                    {(nextAppt.appointment_time || "").slice(0, 5)}
                  </div>
                  <div className="mt-2 text-[13px] font-semibold">{nextAppt.doctors?.full_name || "Doctor"}</div>
                  <div className="text-[11px] opacity-80">
                    {nextAppt.doctors?.specialties?.name || "General consultation"}
                  </div>
                </div>
              )}
            </WidgetCard>

            <WidgetCard title="Today's Schedule" description="Visits happening today" icon={Activity} tint="stat-violet">
              {todays.length === 0 ? (
                <EmptyState label="Nothing scheduled today" />
              ) : (
                <ol className="relative space-y-2.5 pl-[58px]">
                  <span className="absolute left-[50px] top-1 bottom-1 w-px bg-border" />
                  {todays.map((a) => (
                    <li key={a.id} className="relative">
                      <span className="absolute -left-[58px] top-0 w-[42px] text-right text-[11px] font-bold tabular-nums text-muted-foreground">
                        {(a.appointment_time || "").slice(0, 5)}
                      </span>
                      <span className="absolute -left-[11px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-card" />
                      <div className="min-w-0 rounded-lg px-2 py-1 transition-colors hover:bg-muted/60">
                        <div className="truncate text-[13px] font-semibold">{a.doctors?.full_name || "Doctor"}</div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          {a.doctors?.specialties?.name || "Consultation"}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </WidgetCard>

            <WidgetCard title="Quick Actions" description="Get things done faster" icon={TrendingUp} tint="stat-amber">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((q) => (
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
                ))}
              </div>
            </WidgetCard>

            <WidgetCard title="Achievements" description="Keep your streak alive" icon={Award} tint="stat-green">
              <ul className="space-y-2">
                {[
                  { icon: Flame, label: "Consistency streak", meta: "3 visits in a row", tint: "stat-amber" },
                  { icon: HeartPulse, label: "Healthy smile", meta: "Checkup completed", tint: "stat-green" },
                  { icon: Award, label: "Level 2 patient", meta: "7 of 10 badges", tint: "stat-violet" },
                ].map((b) => (
                  <li key={b.label} className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted/60">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `hsl(var(--${b.tint}) / 0.12)`, color: `hsl(var(--${b.tint}))` }}
                    >
                      <b.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold">{b.label}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{b.meta}</div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </li>
                ))}
              </ul>
            </WidgetCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
