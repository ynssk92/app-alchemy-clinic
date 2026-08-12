import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Search, Phone, MessageSquare, Video, CalendarPlus,
  Cake, Droplet, VenetianMask, Mail, BookOpen, Activity, Heart,
  Thermometer, Wind, Weight, Filter, MoreVertical, CalendarDays, Pencil,
  ShieldCheck, ShieldAlert, MapPin, UserCheck, Save, X, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type ListRow = {
  key: string;
  id: string;              // route id (profile.id when registered, else intake.id)
  full_name: string;
  registered: boolean;
  created_at: string;
};

type PatientView = {
  routeId: string;
  profileId: string | null;   // present when registered
  intakeId: string | null;    // present when an intake record exists
  full_name: string;
  phone: string | null;
  email: string | null;       // best available email (intake > profile-less)
  dob: string | null;
  gender: string | null;
  blood_group: string | null;
  address_1: string | null;
  city: string | null;
  country: string | null;
  avatar_path: string | null; // storage path in `avatars` bucket
  registered_at: string | null; // profile.created_at when registered
  added_at: string;             // intake.created_at or profile.created_at
};

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

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const AdminPatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [list, setList] = useState<ListRow[]>([]);
  const [patient, setPatient] = useState<PatientView | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [appts, setAppts] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [apptSearch, setApptSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    full_name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    blood_group: "",
    address_1: "",
    city: "",
    country: "",
    status: "approved" as "pending" | "approved" | "rejected",
  });
  const [reloadTick, setReloadTick] = useState(0);
  const [notFound, setNotFound] = useState(false);

  // --- Sidebar list (merged intake + profiles) ---
  useEffect(() => {
    (async () => {
      const [{ data: intake }, { data: profiles }, { data: roles }] = await Promise.all([
        supabase.from("patient_intake")
          .select("id, user_id, first_name, last_name, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("profiles")
          .select("id, full_name, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const rolesByUser = new Map<string, Set<string>>();
      (roles || []).forEach((r: any) => {
        const s = rolesByUser.get(r.user_id) || new Set<string>();
        s.add(r.role);
        rolesByUser.set(r.user_id, s);
      });
      const isPatientOnly = (uid: string) => {
        const s = rolesByUser.get(uid);
        if (!s || !s.has("patient")) return false;
        if (s.has("admin") || s.has("assistant") || s.has("doctor")) return false;
        return true;
      };
      const intakeByUser = new Map<string, any>();
      const intakeRows: ListRow[] = (intake || []).map((i: any) => {
        if (i.user_id) intakeByUser.set(i.user_id, i);
        const name = [i.first_name, i.last_name].filter(Boolean).join(" ") || "Unnamed";
        return {
          key: `intake:${i.id}`,
          id: i.user_id || i.id, // prefer profile id when linked
          full_name: name,
          registered: !!i.user_id,
          created_at: i.created_at,
        };
      });
      const profileRows: ListRow[] = (profiles || [])
        .filter((p: any) => isPatientOnly(p.id) && !intakeByUser.has(p.id))
        .map((p: any) => ({
          key: `profile:${p.id}`,
          id: p.id,
          full_name: p.full_name || "Unnamed",
          registered: true,
          created_at: p.created_at,
        }));
      const merged = [...intakeRows, ...profileRows].sort(
        (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
      );
      setList(merged);
      if (!id && merged[0]) navigate(`/admin/patients/details/${merged[0].id}`, { replace: true });
    })();
  }, [id, navigate]);

  // --- Load a single patient: :id may be profile.id OR intake.id ---
  useEffect(() => {
    if (!id) return;
    (async () => {
      setNotFound(false);
      // 1) Try as profile — but only accept it if the account is patient-only
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, full_name, phone, created_at, avatar_url")
        .eq("id", id)
        .maybeSingle();
      let profileIsPatient = false;
      if (prof) {
        const { data: pr } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", id);
        const rs = new Set((pr || []).map((r: any) => r.role));
        profileIsPatient =
          rs.has("patient") && !rs.has("admin") && !rs.has("assistant") && !rs.has("doctor");
      }

      let intakeRow: any = null;
      let profileRow: any = profileIsPatient ? prof : null;

      if (profileIsPatient) {
        const { data } = await supabase
          .from("patient_intake")
          .select("*")
          .eq("user_id", id)
          .maybeSingle();
        intakeRow = data;
      } else {
        // 2) Fallback: treat :id as intake.id (not-registered patient)
        const { data } = await supabase
          .from("patient_intake")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        intakeRow = data;
        if (intakeRow?.user_id) {
          const { data: linked } = await supabase
            .from("profiles")
            .select("id, full_name, phone, created_at, avatar_url")
            .eq("id", intakeRow.user_id)
            .maybeSingle();
          // verify linked account is patient-only too
          const { data: lr } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", intakeRow.user_id);
          const lrs = new Set((lr || []).map((r: any) => r.role));
          if (lrs.has("patient") && !lrs.has("admin") && !lrs.has("assistant") && !lrs.has("doctor")) {
            profileRow = linked;
          }
        }
      }

      if (!profileRow && !intakeRow) {
        setPatient(null);
        setNotFound(true);
        setAppts([]);
        return;
      }

      const full_name =
        profileRow?.full_name ||
        [intakeRow?.first_name, intakeRow?.last_name].filter(Boolean).join(" ") ||
        "Unnamed patient";

      const avatarPath = profileRow?.avatar_url || intakeRow?.avatar_url || null;

      const view: PatientView = {
        routeId: id,
        profileId: profileRow?.id || null,
        intakeId: intakeRow?.id || null,
        full_name,
        phone: profileRow?.phone || intakeRow?.phone || null,
        email:
          intakeRow?.email && !intakeRow.email.endsWith("@placeholder.local")
            ? intakeRow.email
            : null,
        dob: intakeRow?.dob || null,
        gender: intakeRow?.gender || null,
        blood_group: intakeRow?.blood_group || null,
        address_1: intakeRow?.address_1 || null,
        city: intakeRow?.city || null,
        country: intakeRow?.country || null,
        avatar_path: avatarPath,
        registered_at: profileRow?.created_at || null,
        added_at: intakeRow?.created_at || profileRow?.created_at,
      };
      setPatient(view);

      setForm({
        first_name: intakeRow?.first_name || "",
        last_name: intakeRow?.last_name || "",
        full_name: view.full_name,
        email: view.email || "",
        phone: view.phone || "",
        dob: view.dob || "",
        gender: view.gender || "",
        blood_group: view.blood_group || "",
        address_1: view.address_1 || "",
        city: view.city || "",
        country: view.country || "",
        status: (profileRow?.status as any) || "approved",
      });

      // Avatar signed URL
      if (avatarPath) {
        const { data: signed } = await supabase.storage
          .from("avatars")
          .createSignedUrl(avatarPath, 3600);
        setAvatarUrl(signed?.signedUrl || null);
      } else {
        setAvatarUrl(null);
      }

      // Appointments (only exist for registered patients — keyed by profile.id)
      if (view.profileId) {
        const { data: a } = await supabase
          .from("appointments")
          .select("id, appointment_date, appointment_time, status, reason, doctors(full_name, specialty_id, specialties(name))")
          .eq("patient_id", view.profileId)
          .order("appointment_date", { ascending: false });
        setAppts(a || []);
      } else {
        setAppts([]);
      }
    })();
  }, [id, reloadTick]);

  const filteredList = useMemo(
    () => list.filter((p) => p.full_name.toLowerCase().includes(q.toLowerCase())),
    [list, q]
  );

  const initials = (patient?.full_name || "P")
    .split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  const patientCode = patient
    ? `#PT${(patient.profileId || patient.intakeId || "").slice(0, 4).toUpperCase()}`
    : "";
  const lastVisited = appts.find((a: any) => a.status === "completed")?.appointment_date;
  const registered = !!patient?.profileId;

  const filteredAppts = appts.filter((a: any) => {
    const s = apptSearch.toLowerCase();
    return !s ||
      (a.doctors?.full_name || "").toLowerCase().includes(s) ||
      (a.reason || "").toLowerCase().includes(s);
  });

  const handleSave = async () => {
    if (!patient) return;
    setSaving(true);
    try {
      // 1. Update Profile (if registered)
      if (patient.profileId) {
        const { error: pErr } = await supabase
          .from("profiles")
          .update({
            full_name: form.full_name.trim() || null,
            phone: form.phone.trim() || null,
            status: form.status,
          })
          .eq("id", patient.profileId);
        if (pErr) throw pErr;
      }

      // 2. Update/Insert Intake
      // Derive first/last from full name if we don't have them separately (mostly for registered profiles)
      let derivedFirst = form.first_name;
      let derivedLast = form.last_name;
      if (!derivedFirst || !derivedLast) {
        const parts = (form.full_name || "").trim().split(/\s+/);
        derivedFirst = derivedFirst || parts.shift() || "Patient";
        derivedLast = derivedLast || parts.join(" ") || "-";
      }

      const intakePayload: any = {
        first_name: derivedFirst,
        last_name: derivedLast,
        email: form.email || (patient.profileId ? `${patient.profileId}@placeholder.local` : "unknown@placeholder.local"),
        phone: form.phone || null,
        dob: form.dob || null,
        gender: form.gender || null,
        blood_group: form.blood_group || null,
        address_1: form.address_1 || null,
        city: form.city || null,
        country: form.country || null,
      };

      if (patient.intakeId) {
        const { error } = await supabase.from("patient_intake").update(intakePayload).eq("id", patient.intakeId);
        if (error) throw error;
      } else if (patient.profileId) {
        const { data: authUser } = await supabase.auth.getUser();
        const { error } = await supabase.from("patient_intake").insert({
          ...intakePayload,
          user_id: patient.profileId,
          created_by: authUser.user?.id ?? null,
        });
        if (error) throw error;
      }

      toast({ title: "Patient information updated successfully." });
      setIsEditing(false);
      setReloadTick((t) => t + 1);
    } catch (e: any) {
      toast({ title: "Unable to update patient information.", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar list */}
        <Card className="p-4 border-border h-fit">
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patients…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto">
            {filteredList.map((p) => {
              const active = p.id === id;
              return (
                <button
                  key={p.key}
                  onClick={() => navigate(`/admin/patients/details/${p.id}`)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between gap-2",
                    active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                >
                  <span className="truncate">{p.full_name}</span>
                  {!p.registered && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full border shrink-0",
                        active
                          ? "border-primary-foreground/40 text-primary-foreground"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      New
                    </span>
                  )}
                </button>
              );
            })}
            {filteredList.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No patients</p>
            )}
          </div>
        </Card>

        {/* Details */}
        <div className="space-y-6">
          {notFound ? (
            <Card className="p-10 border-border text-center text-muted-foreground">
              Patient not found.
            </Card>
          ) : patient ? (
            <>
              {/* Header banner card */}
              <Card className="relative overflow-hidden border-border">
                <div className="absolute inset-y-0 right-0 w-1/2 opacity-90 pointer-events-none"
                  style={{ background: "linear-gradient(120deg, transparent 0%, transparent 30%, hsl(var(--primary)/0.15) 55%, hsl(160 70% 55% / 0.25) 100%)" }} />
                <div className="relative p-6 flex items-start gap-5 flex-wrap">
                  <Avatar className="w-24 h-24 rounded-2xl border-2 border-background shadow-md">
                    {avatarUrl && <AvatarImage src={avatarUrl} className="object-cover" />}
                    <AvatarFallback className="rounded-2xl bg-primary/10 text-primary text-2xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-primary text-sm font-semibold">{patientCode}</div>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <h2 className="text-2xl font-bold text-foreground">{patient.full_name}</h2>
                      {registered ? (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-transparent gap-1">
                          <ShieldCheck className="w-3 h-3" /> Registered
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <ShieldAlert className="w-3 h-3" /> Not registered
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground">Phone :</span> {patient.phone || "—"}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground">Last Visited :</span>{" "}
                        {fmtDate(lastVisited)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex gap-2">
                      {!isEditing ? (
                        <>
                          <Button size="icon" variant="outline" className="rounded-full h-9 w-9" onClick={() => setIsEditing(true)} title="Edit patient"><Pencil className="w-4 h-4" /></Button>
                          <Button size="icon" variant="outline" className="rounded-full h-9 w-9"><Phone className="w-4 h-4" /></Button>
                          <Button size="icon" variant="outline" className="rounded-full h-9 w-9"><MessageSquare className="w-4 h-4" /></Button>
                          <Button size="icon" variant="outline" className="rounded-full h-9 w-9"><Video className="w-4 h-4" /></Button>
                        </>
                      ) : (
                        <>
                          <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-9 px-4 rounded-full">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving} className="rounded-full h-9 px-4 gap-2">
                            <X className="w-4 h-4" /> Cancel
                          </Button>
                        </>
                      )}
                    </div>
                    {!isEditing && (
                      <div className="flex gap-2">
                        <Button variant="outline" className="gap-2" onClick={() => setIsEditing(true)}>
                          <Pencil className="w-4 h-4" />Edit
                        </Button>
                        <Button asChild className="bg-gradient-primary text-primary-foreground gap-2">
                          <Link to="/booking"><CalendarPlus className="w-4 h-4" />Book Appointment</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Registration status */}
              <Card className="p-6 border-border">
                <h3 className="font-bold mb-5 flex items-center gap-2 text-primary">
                  <UserCheck className="w-4 h-4" /> Registration Status
                </h3>
                <div className="grid md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" /> Account status
                    </Label>
                    {!isEditing ? (
                      <div className="font-semibold flex items-center gap-2">
                        {registered ? (
                          <span className="text-emerald-600 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Registered</span>
                        ) : (
                          <span className="text-amber-600 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" /> Not registered</span>
                        )}
                      </div>
                    ) : (
                      <Select
                        value={form.status}
                        onValueChange={(v: any) => setForm(f => ({ ...f, status: v }))}
                        disabled={saving}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <InfoTile
                    icon={Mail}
                    label="Linked email"
                    value={patient.email || "—"}
                  />
                  <InfoTile
                    icon={CalendarDays}
                    label={registered ? "Signed up" : "Added on"}
                    value={fmtDate(registered ? patient.registered_at : patient.added_at)}
                  />
                  <InfoTile
                    icon={BookOpen}
                    label="Intake record"
                    value={patient.intakeId ? "On file" : "Not created"}
                  />
                  <InfoTile
                    icon={UserCheck}
                    label="Account ID"
                    value={patient.profileId ? patient.profileId.slice(0, 8) + "…" : "—"}
                  />
                  <InfoTile
                    icon={MapPin}
                    label="Location"
                    value={
                      [patient.city, patient.country].filter(Boolean).join(", ") || "—"
                    }
                  />
                </div>
                {!registered && (
                  <p className="mt-5 text-xs text-muted-foreground">
                    This patient was created by staff and has not signed up yet. Appointment
                    history and messaging will activate once they register with the email above.
                  </p>
                )}
              </Card>

              {/* About + Vital Signs */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 border-border">
                  <h3 className="font-bold mb-5 flex items-center gap-2 text-primary">
                    <BookOpen className="w-4 h-4" /> About
                  </h3>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                    {!isEditing ? (
                      <>
                        <InfoTile icon={Cake} label="DOB" value={fmtDate(patient.dob)} />
                        <InfoTile icon={Droplet} label="Blood Group" value={patient.blood_group || "—"} />
                        <InfoTile icon={VenetianMask} label="Gender" value={patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : "—"} />
                        <InfoTile icon={Mail} label="Email" value={patient.email || "—"} />
                        <InfoTile icon={MapPin} label="Address" value={patient.address_1 || "—"} />
                        <InfoTile icon={MapPin} label="City" value={patient.city || "—"} />
                      </>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">Full Name</Label>
                          <Input
                            className="h-9"
                            value={form.full_name}
                            onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                            disabled={saving}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">Email</Label>
                          <Input
                            className="h-9"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                            disabled={saving || registered}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">Phone</Label>
                          <Input
                            className="h-9"
                            value={form.phone}
                            onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                            disabled={saving}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">Date of Birth</Label>
                          <Input
                            className="h-9"
                            type="date"
                            value={form.dob}
                            onChange={(e) => setForm(f => ({ ...f, dob: e.target.value }))}
                            disabled={saving}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">Gender</Label>
                          <Select
                            value={form.gender}
                            onValueChange={(v) => setForm(f => ({ ...f, gender: v }))}
                            disabled={saving}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">Blood Group</Label>
                          <Select
                            value={form.blood_group}
                            onValueChange={(v) => setForm(f => ({ ...f, blood_group: v }))}
                            disabled={saving}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => (
                                <SelectItem key={g} value={g}>{g}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2 space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">Address</Label>
                          <Input
                            className="h-9"
                            value={form.address_1}
                            onChange={(e) => setForm(f => ({ ...f, address_1: e.target.value }))}
                            disabled={saving}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">City</Label>
                          <Input
                            className="h-9"
                            value={form.city}
                            onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                            disabled={saving}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">Country</Label>
                          <Input
                            className="h-9"
                            value={form.country}
                            onChange={(e) => setForm(f => ({ ...f, country: e.target.value }))}
                            disabled={saving}
                          />
                        </div>
                      </>
                    )}
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
                    {!registered ? (
                      <div className="py-10 text-center text-sm text-muted-foreground">
                        Appointments become available after the patient registers an account.
                      </div>
                    ) : (
                      <>
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
                                    {fmtDate(a.appointment_date)} - {a.appointment_time?.slice(0, 5)}
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
                      </>
                    )}
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
