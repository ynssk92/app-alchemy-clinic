import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Stethoscope, Calendar, Users, Building2, TrendingUp, TrendingDown,
  Plus, CalendarCheck, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { format, subDays } from "date-fns";

type Stats = {
  doctors: number; appts: number; patients: number;
  clinics: number; upcoming: number; messages: number;
};

const AdminOverview = () => {
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
          .select("id, full_name, email")
          .in("id", topIds);
        setTopPatients(
          topIds.map((id) => {
            const p = profs?.find((x: any) => x.id === id);
            return { id, name: p?.full_name || p?.email || "Patient", count: pCounts[id] };
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
        .select("id, appointment_date, appointment_time, reason, doctors(full_name), profiles(full_name)")
        .eq("status", "upcoming")
        .order("appointment_date", { ascending: true })
        .limit(5);
      setUpcomingAppts(upc || []);
    })();
  }, []);

  const spark = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({ v: Math.sin(i / 2) * 5 + 10 + Math.random() * 5 })),
    []
  );

  const kpis = [
    {
      label: "Doctors", value: stats.doctors, delta: "+12%", up: true,
      color: "stat-blue", icon: Stethoscope, chart: "bar",
    },
    {
      label: "Patients", value: stats.patients, delta: "+25%", up: true,
      color: "stat-red", icon: Users, chart: "area",
    },
    {
      label: "Appointments", value: stats.appts, delta: "+18%", up: true,
      color: "stat-cyan", icon: Calendar, chart: "bar",
    },
    {
      label: "Upcoming", value: stats.upcoming, delta: "-4%", up: false,
      color: "stat-green", icon: TrendingUp, chart: "line",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Live snapshot of clinic operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/doctors"><CalendarCheck className="w-4 h-4 mr-2" />Schedule Availability</Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-primary">
            <Link to="/admin/appointments"><Plus className="w-4 h-4 mr-2" />New Appointment</Link>
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="relative overflow-hidden border-border p-5 hover:shadow-medium transition-all">
            <div
              className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10"
              style={{ background: `hsl(var(--${k.color}))` }}
            />
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: `hsl(var(--${k.color}) / 0.12)`, color: `hsl(var(--${k.color}))` }}
              >
                <k.icon className="w-5 h-5" />
              </div>
              <Badge
                className={
                  k.up
                    ? "bg-positive/15 text-positive hover:bg-positive/15 border-0"
                    : "bg-negative/15 text-negative hover:bg-negative/15 border-0"
                }
              >
                {k.up ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {k.delta}
              </Badge>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">{k.label}</div>
                <div className="text-3xl font-bold text-card-foreground tracking-tight">{k.value}</div>
                <div className="text-[10px] text-muted-foreground mt-1">in last 7 days</div>
              </div>
              <div className="w-24 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  {k.chart === "area" ? (
                    <AreaChart data={spark}>
                      <Area type="monotone" dataKey="v" stroke={`hsl(var(--${k.color}))`}
                        fill={`hsl(var(--${k.color}))`} fillOpacity={0.2} strokeWidth={2} />
                    </AreaChart>
                  ) : k.chart === "line" ? (
                    <LineChart data={spark}>
                      <Line type="monotone" dataKey="v" stroke={`hsl(var(--${k.color}))`} strokeWidth={2} dot={false} />
                    </LineChart>
                  ) : (
                    <BarChart data={spark}>
                      <Bar dataKey="v" fill={`hsl(var(--${k.color}))`} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">Appointment Statistics</h3>
              <p className="text-xs text-muted-foreground">Distribution across the past 12 months</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Completed", value: monthly.reduce((s, m) => s + m.completed, 0), color: "stat-cyan" },
              { label: "Ongoing", value: monthly.reduce((s, m) => s + m.ongoing, 0), color: "stat-blue" },
              { label: "Cancelled", value: monthly.reduce((s, m) => s + m.cancelled, 0), color: "stat-red" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full" style={{ background: `hsl(var(--${s.color}))` }} />
                  {s.label}
                </div>
                <div className="text-xl font-bold mt-1">{s.value}</div>
              </div>
            ))}
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend />
                <Bar stackId="a" dataKey="completed" fill="hsl(var(--stat-cyan))" radius={[0, 0, 0, 0]} />
                <Bar stackId="a" dataKey="ongoing" fill="hsl(var(--stat-blue))" />
                <Bar stackId="a" dataKey="cancelled" fill="hsl(var(--stat-violet))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Appointments sidebar */}
        <Card className="p-6 border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Appointments</h3>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/appointments">View All <ArrowUpRight className="w-3 h-3 ml-1" /></Link>
            </Button>
          </div>
          <div className="space-y-3">
            {recent.length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">No recent appointments</p>
            )}
            {recent.map((a: any, i: number) => {
              const tint = ["stat-blue", "stat-red", "stat-cyan", "stat-green", "stat-violet"][i % 5];
              return (
                <div key={a.id} className="rounded-xl border border-border p-3 flex items-center gap-3 hover:shadow-soft transition-all"
                  style={{ background: `hsl(var(--${tint}) / 0.05)` }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `hsl(var(--${tint}) / 0.15)`, color: `hsl(var(--${tint}))` }}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {a.reason || "General Visit"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {a.doctors?.full_name || "Doctor"} · {format(new Date(a.appointment_date), "MMM d")} · {a.appointment_time}
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize text-[10px]">{a.status}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Popular doctors */}
      <Card className="p-6 border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Popular Doctors</h3>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/doctors">View All <ArrowUpRight className="w-3 h-3 ml-1" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topDoctors.map((doc: any, i: number) => {
            const tint = ["stat-blue", "stat-cyan", "stat-violet"][i % 3];
            return (
              <div key={doc.id} className="rounded-xl border border-border p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-semibold"
                  style={{ background: `hsl(var(--${tint}) / 0.15)`, color: `hsl(var(--${tint}))` }}>
                  {doc.full_name?.split(" ").map((s: string) => s[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">Dr. {doc.full_name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {doc.specialties?.name || "Specialist"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{doc.bookings}</div>
                  <div className="text-[10px] text-muted-foreground">Bookings</div>
                </div>
              </div>
            );
          })}
          {topDoctors.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-3 py-8 text-center">No doctor bookings yet</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminOverview;
