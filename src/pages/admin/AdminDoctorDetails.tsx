import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Search, Mail, Phone, Stethoscope, Building2, Star, CalendarClock, CalendarPlus, BookOpen, Award,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DoctorScheduleDialog from "@/components/admin/DoctorScheduleDialog";

type Row = {
  id: string; full_name: string; avatar_url: string | null;
  bio: string | null; experience_years: number | null; rating: number | null;
  is_available: boolean;
  specialties?: { name: string } | null; clinics?: { name: string } | null;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const AdminDoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [appts, setAppts] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("doctors")
        .select("id, full_name, avatar_url, bio, experience_years, rating, is_available, specialties(name), clinics(name)")
        .order("full_name");
      setList((data as any) || []);
      if (!id && data?.[0]) navigate(`/admin/doctors/details/${data[0].id}`, { replace: true });
    })();
  }, [id, navigate]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: d } = await supabase
        .from("doctors")
        .select("id, full_name, avatar_url, bio, experience_years, rating, is_available, specialties(name), clinics(name)")
        .eq("id", id).maybeSingle();
      setSelected(d as any);
      const [{ data: a }, { data: ap }] = await Promise.all([
        supabase.from("doctor_availability").select("*").eq("doctor_id", id).order("day_of_week").order("start_time"),
        supabase.from("appointments").select("id, appointment_date, appointment_time, status, reason, profiles(full_name)")
          .eq("doctor_id", id).order("appointment_date", { ascending: false }).limit(20),
      ]);
      setSlots((a as any) || []);
      setAppts((ap as any) || []);
    })();
  }, [id]);

  const filtered = list.filter((d) => (d.full_name || "").toLowerCase().includes(q.toLowerCase()));
  const initials = (selected?.full_name || "D").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Link to="/admin/doctors" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          Doctors
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <Card className="p-4 border-border h-fit">
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search doctors…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto">
            {filtered.map((d) => (
              <button
                key={d.id}
                onClick={() => navigate(`/admin/doctors/details/${d.id}`)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${
                  d.id === id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                Dr. {d.full_name}
              </button>
            ))}
            {filtered.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No doctors</p>}
          </div>
        </Card>

        <div className="space-y-6">
          {selected ? (
            <>
              <Card className="relative overflow-hidden border-border">
                <div className="absolute inset-y-0 right-0 w-1/2 opacity-90 pointer-events-none"
                  style={{ background: "linear-gradient(120deg, transparent 0%, transparent 30%, hsl(var(--primary)/0.15) 55%, hsl(160 70% 55% / 0.25) 100%)" }} />
                <div className="relative p-6 flex items-start gap-5">
                  <Avatar className="w-24 h-24 rounded-2xl border-2 border-background shadow-md">
                    {selected.avatar_url && <AvatarImage src={selected.avatar_url} className="object-cover" />}
                    <AvatarFallback className="rounded-2xl bg-primary/10 text-primary text-2xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-primary text-sm font-semibold">#DR{selected.id.slice(0, 4).toUpperCase()}</div>
                    <h2 className="text-2xl font-bold text-foreground mt-0.5">Dr. {selected.full_name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{selected.specialties?.name || "General"}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground">Clinic :</span> {selected.clinics?.name || "—"}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold text-foreground">Rating :</span> {selected.rating ?? "—"}
                      </span>
                      <Badge variant={selected.is_available ? "default" : "secondary"}>
                        {selected.is_available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => setScheduleOpen(true)}>
                      <CalendarClock className="w-4 h-4" />Schedule
                    </Button>
                    <Button asChild className="bg-gradient-primary text-primary-foreground gap-2">
                      <Link to={`/booking?doctor=${selected.id}`}><CalendarPlus className="w-4 h-4" />Book</Link>
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 border-border">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> About</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selected.bio || "No bio yet."}</p>
                  <div className="grid grid-cols-2 gap-4 mt-5">
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="font-semibold">Experience:</span> {selected.experience_years ?? 0} yrs
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Stethoscope className="w-4 h-4 text-primary" />
                      <span className="font-semibold">Specialty:</span> {selected.specialties?.name || "—"}
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-border">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><CalendarClock className="w-4 h-4 text-primary" /> Weekly availability</h3>
                  {slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hours configured.</p>
                  ) : (
                    <div className="space-y-2">
                      {slots.map((s: any) => (
                        <div key={s.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/40">
                          <span className="font-semibold">{DAYS[s.day_of_week]}</span>
                          <span className="text-muted-foreground">{s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              <Card className="p-6 border-border">
                <h3 className="font-bold mb-4">Recent appointments</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-3 font-bold">Date & Time</th>
                        <th className="pb-3 font-bold">Patient</th>
                        <th className="pb-3 font-bold">Reason</th>
                        <th className="pb-3 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appts.map((a: any) => (
                        <tr key={a.id} className="border-b border-border last:border-0">
                          <td className="py-3 text-muted-foreground">
                            {new Date(a.appointment_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} — {a.appointment_time?.slice(0, 5)}
                          </td>
                          <td className="py-3">{a.profiles?.full_name || "—"}</td>
                          <td className="py-3 text-muted-foreground">{a.reason || "—"}</td>
                          <td className="py-3"><Badge variant="outline">{a.status}</Badge></td>
                        </tr>
                      ))}
                      {appts.length === 0 && (
                        <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No appointments</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-10 border-border text-center text-muted-foreground">Select a doctor</Card>
          )}
        </div>
      </div>

      {scheduleOpen && selected && (
        <DoctorScheduleDialog
          doctorId={selected.id}
          doctorName={selected.full_name}
          onClose={() => setScheduleOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDoctorDetails;
