import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar, Clock, Award, TrendingUp, LogOut, Activity, Stethoscope,
  HeartPulse, CircleDot, Search, User, Plus, ChevronRight, Flame, ArrowUpRight, ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import { Seo } from "@/components/Seo";
import { WidgetCard, EmptyState } from "@/components/dashboard/WidgetCard";
import { format, isToday, parseISO } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Appt = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  doctors: { full_name: string; avatar_url: string | null; specialties: { name: string } | null } | null;
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
    ? "bg-primary/10 text-primary ring-1 ring-primary/20"
    : status === "cancelled"
    ? "bg-negative/10 text-negative ring-1 ring-negative/20"
    : "bg-positive/10 text-positive ring-1 ring-positive/20";

const PatientDashboard = () => {
  const { user, isAdmin, isAssistant, isDoctor, signOut } = useAuth();
  const [appointments, setAppointments] = useState<Appt[]>([]);
  const [profileName, setProfileName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle()
      .then(async ({ data }) => {
        setProfileName(data?.full_name || user.email || "");
        if (data?.avatar_url) {
          const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(data.avatar_url, 3600);
          setAvatarUrl(signed?.signedUrl ?? null);
        } else {
          setAvatarUrl(null);
        }
      });
    supabase
      .from("appointments")
      .select("id, appointment_date, appointment_time, status, doctors(full_name, avatar_url, specialties(name))")
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
    <div className="relative flex min-h-screen w-full flex-1 flex-col overflow-x-hidden bg-background">
      <Seo
        title="Your Dashboard — HealthBook"
        description="Track your health score, upcoming appointments, and achievements in your HealthBook dashboard."
        path="/patient-dashboard"
      />

      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-[0.55]"
        style={{
          background:
            "radial-gradient(60% 100% at 15% 0%, hsl(var(--primary) / 0.16), transparent 70%), radial-gradient(50% 100% at 85% 0%, hsl(var(--stat-cyan) / 0.14), transparent 70%)",
        }}
      />

      {/* Top bar */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="La Dune Clinique Dentaire" className="h-8" />
          </Link>
          <div className="flex items-center gap-1.5">
            <Button asChild variant="ghost" size="sm" className="hidden h-9 rounded-full px-4 text-xs font-semibold sm:inline-flex">
              <Link to="/doctors">Find Doctors</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden h-9 rounded-full px-4 text-xs font-semibold sm:inline-flex">
              <Link to="/profile">Profile</Link>
            </Button>
            {isAdmin && (
              <Button asChild variant="secondary" size="sm" className="h-9 rounded-full px-4 text-xs font-semibold">
                <Link to="/admin">Admin Panel</Link>
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-9 rounded-full px-4 text-xs font-semibold" onClick={signOut}>
              <LogOut className="mr-1.5 h-3.5 w-3.5" />Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="container relative mx-auto space-y-5 px-4 py-6">
        {/* Hero header */}
        <header className="overflow-hidden rounded-[28px] border border-border/70 bg-card/80 p-6 shadow-[0_1px_2px_hsl(var(--foreground)/0.04)] backdrop-blur-sm md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative shrink-0">
                <span className="absolute -inset-1 rounded-[22px] bg-gradient-primary opacity-25 blur-md" />
                <Avatar className="relative h-14 w-14 rounded-[18px] ring-2 ring-card">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={profileName || "Profile photo"} className="object-cover" />}
                  <AvatarFallback className="rounded-[18px] bg-gradient-primary text-base font-bold text-primary-foreground">
                    {initials(profileName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {format(new Date(), "EEEE, MMMM d")}
                </p>
                <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-foreground md:text-[28px]">
                  {greeting}, {profileName?.split(" ")[0] || "there"}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-positive/10 px-2.5 py-1 text-[11px] font-semibold text-positive ring-1 ring-positive/20">
                    <CircleDot className="h-3 w-3" /> Clinic Open
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                    <ShieldCheck className="h-3 w-3" /> {isAdmin ? "Admin" : isDoctor ? "Doctor" : isAssistant ? "Assistant" : "Patient"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" size="sm" className="h-10 rounded-full px-4 text-xs font-semibold">
                <Link to="/profile"><User className="mr-1.5 h-3.5 w-3.5" />Edit Profile</Link>
              </Button>
              <Button asChild size="sm" className="h-10 rounded-full bg-gradient-primary px-5 text-xs font-semibold shadow-medium transition-transform hover:-translate-y-0.5">
                <Link to="/doctors"><Plus className="mr-1.5 h-3.5 w-3.5" />Book Appointment</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* KPI row */}
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <h2 className="sr-only">Health Overview</h2>
          {stats.map((s) => (
            <article
              key={s.label}
              className="group relative flex min-h-[142px] flex-col justify-between overflow-hidden rounded-[22px] border border-border/70 bg-card p-4 shadow-[0_1px_2px_hsl(var(--foreground)/0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-large"
            >
              <span
                aria-hidden
                className="absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: `hsl(var(--${s.tint}) / 0.35)` }}
              />
              <div className="relative flex items-start justify-between gap-2">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-inset"
                  style={{
                    background: `hsl(var(--${s.tint}) / 0.10)`,
                    color: `hsl(var(--${s.tint}))`,
                    boxShadow: `inset 0 0 0 1px hsl(var(--${s.tint}) / 0.18)`,
                  }}
                >
                  <s.icon className="h-4 w-4" />
                </span>
                {s.badge && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {s.badge}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="text-[30px] font-bold leading-none tracking-tight text-card-foreground">{s.value}</div>
                <div className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {s.label}
                </div>
                <div className="text-[11px] text-muted-foreground">{s.sub}</div>
                {s.progress !== undefined && <Progress value={s.progress} className="mt-2.5 h-1.5" />}
              </div>
            </article>
          ))}
        </section>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Appointments list */}
          <WidgetCard
            className="self-start rounded-[22px] lg:col-span-8"
            title="Your Appointments"
            description={`${appointments.length} total · ${upcoming} upcoming`}
            icon={Calendar}
            tint="stat-blue"
            action={{ label: "Book new", to: "/doctors" }}
          >
            {appointments.length === 0 ? (
              <div className="py-10 text-center">
                <p className="mb-3 text-sm text-muted-foreground">No appointments yet.</p>
                <Button asChild size="sm" className="rounded-full px-5"><Link to="/doctors">Find a Doctor</Link></Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-2">
                {appointments.map((a, i) => {
                  const tint = ["stat-blue", "stat-cyan", "stat-violet", "stat-green", "stat-amber", "stat-red"][i % 6];
                  return (
                    <div
                      key={a.id}
                      className="group/appt relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card px-3.5 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-medium"
                    >
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 w-[3px] opacity-70"
                        style={{ background: `hsl(var(--${tint}))` }}
                      />
                      <div 
                        className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold overflow-hidden"
                        style={{ background: `hsl(var(--${tint}) / 0.12)`, color: `hsl(var(--${tint}))` }}
                      >
                        {a.doctors?.avatar_url ? (
                          <img 
                            src={a.doctors.avatar_url} 
                            alt={a.doctors.full_name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.innerText = initials(a.doctors?.full_name);
                            }}
                          />
                        ) : (
                          initials(a.doctors?.full_name)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-[13px] font-semibold">
                            {a.doctors?.full_name || "Doctor"}
                          </span>
                          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${statusTone(a.status)}`}>
                            {a.status}
                          </span>
                        </div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          {a.doctors?.specialties?.name || "General consultation"}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />{format(parseISO(a.appointment_date), "MMM d, yyyy")}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />{(a.appointment_time || "").slice(0, 5)}
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/appt:opacity-100" />
                    </div>
                  );
                })}
              </div>
            )}
          </WidgetCard>

          {/* Right rail */}
          <div className="space-y-4 lg:col-span-4">
            <WidgetCard className="rounded-[22px]" title="Next Visit" description="Your closest appointment" icon={Clock} tint="stat-cyan">
              {!nextAppt ? (
                <EmptyState label="No upcoming visit scheduled" />
              ) : (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-5 text-primary-foreground shadow-medium">
                  <span aria-hidden className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-primary-foreground/10 blur-xl" />
                  <div className="relative text-[11px] font-semibold uppercase tracking-[0.16em] opacity-85">
                    {format(parseISO(nextAppt.appointment_date), "EEEE, MMM d")}
                  </div>
                  <div className="relative mt-1.5 text-[34px] font-bold leading-none tracking-tight">
                    {(nextAppt.appointment_time || "").slice(0, 5)}
                  </div>
                  <div className="relative mt-3 flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-full border border-white/20 overflow-hidden bg-white/10 flex items-center justify-center text-[10px] font-bold">
                      {nextAppt.doctors?.avatar_url ? (
                        <img 
                          src={nextAppt.doctors.avatar_url} 
                          alt={nextAppt.doctors.full_name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerText = initials(nextAppt.doctors?.full_name);
                          }}
                        />
                      ) : (
                        initials(nextAppt.doctors?.full_name)
                      )}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold leading-tight">{nextAppt.doctors?.full_name || "Doctor"}</div>
                      <div className="text-[11px] opacity-85">
                        {nextAppt.doctors?.specialties?.name || "General consultation"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </WidgetCard>

            <WidgetCard className="rounded-[22px]" title="Today's Schedule" description="Visits happening today" icon={Activity} tint="stat-violet">
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
                      <div className="absolute -left-[20px] top-[2px] h-6 w-6 rounded-full border border-border bg-card overflow-hidden flex items-center justify-center text-[8px] font-bold">
                        {a.doctors?.avatar_url ? (
                          <img 
                            src={a.doctors.avatar_url} 
                            alt={a.doctors.full_name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.innerText = initials(a.doctors?.full_name);
                            }}
                          />
                        ) : (
                          initials(a.doctors?.full_name)
                        )}
                      </div>
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

            <WidgetCard className="rounded-[22px]" title="Quick Actions" description="Get things done faster" icon={TrendingUp} tint="stat-amber">
              <div className="grid grid-cols-2 gap-2.5">
                {quickActions.map((q) => (
                  <Link
                    key={q.label}
                    to={q.to}
                    className="flex flex-col items-start gap-2.5 rounded-2xl border border-border/70 bg-muted/25 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-card hover:shadow-medium"
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: `hsl(var(--${q.tint}) / 0.12)`, color: `hsl(var(--${q.tint}))` }}
                    >
                      <q.icon className="h-4 w-4" />
                    </span>
                    <span className="text-[11px] font-semibold leading-tight">{q.label}</span>
                  </Link>
                ))}
              </div>
            </WidgetCard>

            <WidgetCard className="rounded-[22px]" title="Achievements" description="Keep your streak alive" icon={Award} tint="stat-green">
              <ul className="space-y-1.5">
                {[
                  { icon: Flame, label: "Consistency streak", meta: "3 visits in a row", tint: "stat-amber" },
                  { icon: HeartPulse, label: "Healthy smile", meta: "Checkup completed", tint: "stat-green" },
                  { icon: Award, label: "Level 2 patient", meta: "7 of 10 badges", tint: "stat-violet" },
                ].map((b) => (
                  <li key={b.label} className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
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
