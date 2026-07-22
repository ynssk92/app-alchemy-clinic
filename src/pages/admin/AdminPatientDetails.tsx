import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft, Search, Phone, MessageSquare, Video, CalendarPlus,
  Cake, Droplet, VenetianMask, Mail, BookOpen, Activity, Heart,
  Thermometer, Wind, Weight, Filter, MoreVertical, CalendarDays, Pencil,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { EditPatientDialog } from "@/components/admin/EditPatientDialog";

type Row = { id: string; full_name: string | null; phone: string | null; created_at: string };

const InfoTile = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
      <Icon className="w-4 h-4" />
    </div>
    <div className="min-w-0">
      <div className="text-xs font-semibold text-foreground">{label}</div>
      <div className="text-sm text-muted-foreground truncate">{value}</div>
    </div>
  </div>
);

const VitalTile = ({
  icon: Icon, label, value, dot,
}: { icon: any; label: string; value: string; dot: "green" | "red" | "amber" | "muted" }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <div className="text-xs font-semibold text-foreground">{label}</div>
      <div className="text-sm text-muted-foreground flex items-center gap-1.5">
        <span className={cn(
          "w-1.5 h-1.5 rounded-full",
          dot === "green" && "bg-emerald-500",
          dot === "red" && "bg-destructive",
          dot === "amber" && "bg-amber-500",
          dot === "muted" && "bg-muted-foreground/40",
        )} />
        {value}
      </div>
    </div>
  </div>
);

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    upcoming: "bg-primary/10 text-primary",
    completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    cancelled: "bg-destructive/10 text-destructive",
  };
  const label: Record<string, string> = {
    upcoming: "Schedule",
    completed: "Checked Out",
    cancelled: "Cancelled",
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-md text-xs font-semibold", map[status] || "bg-muted text-muted-foreground")}>
      {label[status] || status}
    </span>
  );
};

const AdminPatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [appts, setAppts] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [apptSearch, setApptSearch] = useState("");
  const [intake, setIntake] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, phone, created_at")
        .order("created_at", { ascending: false });
      setList(data || []);
      if (!id && data?.[0]) navigate(`/admin/patients/details/${data[0].id}`, { replace: true });
    })();
  }, [id, navigate]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("id, full_name, phone, created_at, avatar_url")
        .eq("id", id)
        .maybeSingle();
      setSelected(p as any);
      if ((p as any)?.avatar_url) {
        const { data: signed } = await supabase.storage
          .from("avatars")
          .createSignedUrl((p as any).avatar_url, 3600);
        setAvatarUrl(signed?.signedUrl || null);
      } else {
        setAvatarUrl(null);
      }
      const { data: a } = await supabase
        .from("appointments")
        .select("id, appointment_date, appointment_time, status, reason, doctors(full_name, specialty_id, specialties(name))")
        .eq("patient_id", id)
        .order("appointment_date", { ascending: false });
      setAppts(a || []);
      const { data: intakeRow } = await supabase
        .from("patient_intake")
        .select("dob, gender, blood_group, email, address_1, city, country")
        .eq("user_id", id)
        .maybeSingle();
      setIntake(intakeRow);
    })();
  }, [id, reloadTick]);

  const filtered = list.filter((p) =>
    (p.full_name || "").toLowerCase().includes(q.toLowerCase())
  );

  const initials = (selected?.full_name || "P")
    .split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  const patientCode = selected ? `#PT${selected.id.slice(0, 4).toUpperCase()}` : "";
  const lastVisited = appts.find((a: any) => a.status === "completed")?.appointment_date;

  const filteredAppts = appts.filter((a: any) => {
    const s = apptSearch.toLowerCase();
    return !s ||
      (a.doctors?.full_name || "").toLowerCase().includes(s) ||
      (a.reason || "").toLowerCase().includes(s);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Link to="/admin/patients" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          Patients
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar list */}
        <Card className="p-4 border-border h-fit">
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patients…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/admin/patients/details/${p.id}`)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${
                  p.id === id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {p.full_name || "Unnamed"}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No patients</p>
            )}
          </div>
        </Card>

        {/* Details */}
        <div className="space-y-6">
          {selected ? (
            <>
              {/* Header banner card */}
              <Card className="relative overflow-hidden border-border">
                <div className="absolute inset-y-0 right-0 w-1/2 opacity-90 pointer-events-none"
                  style={{ background: "linear-gradient(120deg, transparent 0%, transparent 30%, hsl(var(--primary)/0.15) 55%, hsl(160 70% 55% / 0.25) 100%)" }} />
                <div className="relative p-6 flex items-start gap-5">
                  <Avatar className="w-24 h-24 rounded-2xl border-2 border-background shadow-md">
                    {avatarUrl && <AvatarImage src={avatarUrl} className="object-cover" />}
                    <AvatarFallback className="rounded-2xl bg-primary/10 text-primary text-2xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-primary text-sm font-semibold">{patientCode}</div>
                    <h2 className="text-2xl font-bold text-foreground mt-0.5">
                      {selected.full_name || "Unnamed patient"}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">—</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground">Phone :</span> {selected.phone || "—"}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground">Last Visited :</span>{" "}
                        {lastVisited ? new Date(lastVisited).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" className="rounded-full h-9 w-9" onClick={() => setEditOpen(true)} title="Edit patient"><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="outline" className="rounded-full h-9 w-9"><Phone className="w-4 h-4" /></Button>
                      <Button size="icon" variant="outline" className="rounded-full h-9 w-9"><MessageSquare className="w-4 h-4" /></Button>
                      <Button size="icon" variant="outline" className="rounded-full h-9 w-9"><Video className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="gap-2" onClick={() => setEditOpen(true)}>
                        <Pencil className="w-4 h-4" />Edit
                      </Button>
                      <Button asChild className="bg-gradient-primary text-primary-foreground gap-2">
                        <Link to="/booking"><CalendarPlus className="w-4 h-4" />Book Appointment</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* About + Vital Signs */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 border-border">
                  <h3 className="font-bold mb-5 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" /> About
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    <InfoTile icon={Cake} label="DOB" value={intake?.dob ? new Date(intake.dob).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"} />
                    <InfoTile icon={Droplet} label="Blood Group" value={intake?.blood_group || "—"} />
                    <InfoTile icon={VenetianMask} label="Gender" value={intake?.gender ? intake.gender.charAt(0).toUpperCase() + intake.gender.slice(1) : "—"} />
                    <InfoTile icon={Mail} label="Email" value={intake?.email && !intake.email.endsWith("@placeholder.local") ? intake.email : "—"} />
                  </div>
                </Card>

                <Card className="p-6 border-border">
                  <h3 className="font-bold mb-5 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" /> Vital Signs
                  </h3>
                  <div className="grid grid-cols-3 gap-5">
                    <VitalTile icon={Droplet} label="Blood Pressure" value="—" dot="muted" />
                    <VitalTile icon={Heart} label="Heart Rate" value="—" dot="muted" />
                    <VitalTile icon={Activity} label="SPO2" value="—" dot="muted" />
                    <VitalTile icon={Thermometer} label="Temperature" value="—" dot="muted" />
                    <VitalTile icon={Wind} label="Respiratory Rate" value="—" dot="muted" />
                    <VitalTile icon={Weight} label="Weight" value="—" dot="muted" />
                  </div>
                </Card>
              </div>

              {/* Appointments tab */}
              <Card className="border-border">
                <Tabs defaultValue="appointments">
                  <div className="border-b border-border px-6 pt-4">
                    <TabsList className="bg-transparent p-0 h-auto gap-6">
                      <TabsTrigger
                        value="appointments"
                        className="px-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold"
                      >
                        Appointments
                      </TabsTrigger>
                      <TabsTrigger
                        value="transactions"
                        className="px-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold"
                      >
                        Transactions
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="appointments" className="m-0 p-6 pt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative w-48">
                        <Input placeholder="Search" value={apptSearch} onChange={(e) => setApptSearch(e.target.value)} />
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Date range
                      </Button>
                      <div className="flex-1" />
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Filters
                      </Button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-left">
                            <th className="pb-3 font-bold">Date &amp; Time</th>
                            <th className="pb-3 font-bold">Doctor Name</th>
                            <th className="pb-3 font-bold">Mode</th>
                            <th className="pb-3 font-bold">Status</th>
                            <th className="pb-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAppts.map((a: any) => (
                            <tr key={a.id} className="border-b border-border last:border-0">
                              <td className="py-4 text-muted-foreground">
                                {new Date(a.appointment_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} -{" "}
                                {a.appointment_time?.slice(0, 5)}
                              </td>
                              <td className="py-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-9 h-9">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                      {(a.doctors?.full_name || "D").split(" ").map((s: string) => s[0]).slice(0, 2).join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-semibold">Dr. {a.doctors?.full_name || "—"}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {a.doctors?.specialties?.name || "General"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 text-muted-foreground">In-person</td>
                              <td className="py-4">{statusPill(a.status)}</td>
                              <td className="py-4">
                                <Button size="icon" variant="ghost" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                              </td>
                            </tr>
                          ))}
                          {filteredAppts.length === 0 && (
                            <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">No appointments</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="transactions" className="m-0 p-10 text-center text-muted-foreground">
                    No transactions on file.
                  </TabsContent>
                </Tabs>
              </Card>
            </>
          ) : (
            <Card className="p-10 border-border text-center text-muted-foreground">
              Select a patient from the list
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPatientDetails;
