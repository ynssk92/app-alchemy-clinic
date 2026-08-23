import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
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
  ShieldCheck, ShieldAlert, MapPin, UserCheck, Save, X, Loader2,
  Receipt, Eye, FileText, Plus, AlertCircle, Pill, StethoscopeIcon, HistoryIcon, ShieldPlus,
  FolderOpen, ScrollText, Info
} from "lucide-react";
import { AddAllergyDialog, AddMedicationDialog } from "@/components/admin/AddMedicalRecordDialogs";
import MedicalArchive from "@/components/admin/MedicalArchive";
import PrescriptionList from "@/components/admin/PrescriptionList";
import { formatMoney } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { EditPatientDialog } from "@/components/admin/EditPatientDialog";

type ListRow = {
  key: string;
  id: string;              // route id (profile.id when registered, else intake.id)
  full_name: string;
  registered: boolean;
  created_at: string;
};

type PatientView = {
  routeId: string;
  profileId: string | null;
  intakeId: string | null;
  full_name: string;
  phone: string | null;
  email: string | null;
  nationality: string | null;
  identity_document_type: string | null;
  identity_document_number: string | null;
  dob: string | null;
  gender: string | null;
  blood_group: string | null;
  address_1: string | null;
  city: string | null;
  country: string | null;
  avatar_path: string | null;
  registered_at: string | null;
  added_at: string;
  // New fields
  patient_type: "adult" | "minor";
  languages: string[];
  profession: string | null;
  family_situation: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  insurance_name: string | null;
  insurance_number: string | null;
  insurance_policy: string | null;
  insurance_status: string | null;
  insurance_notes: string | null;
  rhesus: string | null;
  allergies: string | null;
  chronic_diseases: string | null;
  current_medications: string | null;
  medical_history: string | null;
  family_history: string | null;
  surgical_history: string | null;
  previous_hospitalizations: string | null;
  // Pediatric
  birth_type?: string | null;
  birth_weight?: number | null;
  birth_height?: number | null;
  apgar_score?: string | null;
  breastfeeding?: string | null;
  birth_complications?: string | null;
  psychomotor_development?: string | null;
  development_notes?: string | null;
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
    // Invoice statuses
    paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    partially_paid: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    pending: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    cancelled_invoice: "bg-destructive/10 text-destructive",
    draft: "bg-muted text-muted-foreground",
  };
  const label: Record<string, string> = {
    upcoming: "Schedule",
    completed: "Checked Out",
    cancelled: "Cancelled",
    paid: "Paid",
    partially_paid: "Partial",
    pending: "Pending",
    cancelled_invoice: "Cancelled",
    draft: "Draft",
  };
  const statusKey = status === 'cancelled' && map[status] ? status : (status === 'cancelled' ? 'cancelled_invoice' : status);
  return (
    <span className={cn("px-2.5 py-1 rounded-md text-xs font-semibold", map[statusKey] || "bg-muted text-muted-foreground")}>
      {label[statusKey] || status}
    </span>
  );
};

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "Non renseigné";

const getAge = (dob?: string | null) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
};

const ValueDisplay = ({ label, value, icon: Icon, mono }: { label: string; value?: string | null; icon?: any; mono?: boolean }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </p>
    <p className={cn(
      "text-sm font-medium text-slate-700",
      mono && "font-mono tracking-wider",
      !value && "text-slate-400 italic font-normal"
    )}>
      {value || "Non renseigné"}
    </p>
  </div>
);

const AdminPatientDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [list, setList] = useState<ListRow[]>([]);
  const [patient, setPatient] = useState<PatientView | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [appts, setAppts] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [apptSearch, setApptSearch] = useState("");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [invoiceError, setInvoiceError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [medicalData, setMedicalData] = useState<{
    allergies: any[];
    medications: any[];
    history: any[];
    surgeries: any[];
    chronic: any[];
    family: any[];
    vaccines: any[];
    hospitalizations: any[];
  }>({
    allergies: [],
    medications: [],
    history: [],
    surgeries: [],
    chronic: [],
    family: [],
    vaccines: [],
    hospitalizations: [],
  });

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    full_name: "",
    email: "",
    phone: "",
    nationality: "",
    identity_document_type: "",
    identity_document_number: "",
    dob: "",
    gender: "",
    blood_group: "",
    address_1: "",
    city: "",
    country: "",
    status: "approved" as "pending" | "approved" | "rejected",
    // New fields
    patient_type: "adult" as "adult" | "minor",
    languages: [] as string[],
    profession: "",
    family_situation: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
    insurance_name: "",
    insurance_number: "",
    insurance_policy: "",
    insurance_status: "",
    insurance_notes: "",
    rhesus: "",
    allergies: "",
    chronic_diseases: "",
    current_medications: "",
    medical_history: "",
    family_history: "",
    surgical_history: "",
    previous_hospitalizations: "",
    birth_type: "",
    birth_weight: "" as string | number,
    birth_height: "" as string | number,
    apgar_score: "",
    breastfeeding: "",
    birth_complications: "",
    psychomotor_development: "",
    development_notes: "",
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
  const loadPatient = useCallback(async () => {
    if (!id) return;
    setNotFound(false);
    
    // Load appointments for this patient
    const { data: appointmentData } = await supabase
      .from("appointments")
      .select("id, appointment_date, appointment_time, status, reason, doctors(full_name), services(name, duration, price)")
      .eq("patient_id", id)
      .order("appointment_date", { ascending: false });
    setAppts(appointmentData || []);

    // Load invoices for this patient
    setLoadingInvoices(true);
    const { data: invoiceData, error: invErr } = await supabase
      .from("invoices")
      .select("id, invoice_number, total, paid, due, status, issue_date")
      .eq("patient_id", id)
      .order("created_at", { ascending: false });
    
    if (invErr) {
      setInvoiceError(true);
    } else {
      setInvoices(invoiceData || []);
    }
    setLoadingInvoices(false);

    // 1) Try as profile
    const { data: prof } = await supabase
      .from("profiles")
      .select(`
        id, full_name, phone, created_at, avatar_url, nationality, 
        identity_document_type, identity_document_number,
        patient_type, languages, profession, family_situation,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
        insurance_name, insurance_number, insurance_policy, insurance_status, insurance_notes,
        rhesus
      `)
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
      nationality: profileRow?.nationality || intakeRow?.nationality || null,
      identity_document_type: profileRow?.identity_document_type || intakeRow?.identity_document_type || null,
      identity_document_number: profileRow?.identity_document_number || intakeRow?.identity_document_number || null,
      dob: intakeRow?.dob || null,
      gender: intakeRow?.gender || null,
      blood_group: intakeRow?.blood_group || null,
      address_1: intakeRow?.address_1 || null,
      city: intakeRow?.city || null,
      country: intakeRow?.country || null,
      avatar_path: avatarPath,
      registered_at: profileRow?.created_at || null,
      added_at: intakeRow?.created_at || profileRow?.created_at,
      // New fields
      patient_type: profileRow?.patient_type || intakeRow?.patient_type || "adult",
      languages: profileRow?.languages || intakeRow?.languages || [],
      profession: profileRow?.profession || intakeRow?.profession || null,
      family_situation: profileRow?.family_situation || intakeRow?.family_situation || null,
      emergency_contact_name: profileRow?.emergency_contact_name || intakeRow?.emergency_contact_name || null,
      emergency_contact_phone: profileRow?.emergency_contact_phone || intakeRow?.emergency_contact_phone || null,
      emergency_contact_relation: profileRow?.emergency_contact_relation || intakeRow?.emergency_contact_relation || null,
      insurance_name: profileRow?.insurance_name || intakeRow?.insurance_name || null,
      insurance_number: profileRow?.insurance_number || intakeRow?.insurance_number || null,
      insurance_policy: profileRow?.insurance_policy || intakeRow?.insurance_policy || null,
      insurance_status: profileRow?.insurance_status || intakeRow?.insurance_status || null,
      insurance_notes: profileRow?.insurance_notes || intakeRow?.insurance_notes || null,
      rhesus: profileRow?.rhesus || intakeRow?.rhesus || null,
      allergies: intakeRow?.allergies || null,
      chronic_diseases: intakeRow?.chronic_diseases || null,
      current_medications: intakeRow?.current_medications || null,
      medical_history: intakeRow?.medical_history || null,
      family_history: intakeRow?.family_history || null,
      surgical_history: intakeRow?.surgical_history || null,
      previous_hospitalizations: intakeRow?.previous_hospitalizations || null,
      birth_type: intakeRow?.birth_type,
      birth_weight: intakeRow?.birth_weight,
      birth_height: intakeRow?.birth_height,
      apgar_score: intakeRow?.apgar_score,
      breastfeeding: intakeRow?.breastfeeding,
      birth_complications: intakeRow?.birth_complications,
      psychomotor_development: intakeRow?.psychomotor_development,
      development_notes: intakeRow?.development_notes,
    };
    setPatient(view);

    setForm({
      first_name: intakeRow?.first_name || "",
      last_name: intakeRow?.last_name || "",
      full_name: view.full_name,
      email: view.email || "",
      phone: view.phone || "",
      nationality: view.nationality || "",
      identity_document_type: view.identity_document_type || "",
      identity_document_number: view.identity_document_number || "",
      dob: view.dob || "",
      gender: view.gender || "",
      blood_group: view.blood_group || "",
      address_1: view.address_1 || "",
      city: view.city || "",
      country: view.country || "",
      status: (profileRow?.status as any) || "approved",
      patient_type: view.patient_type,
      languages: view.languages,
      profession: view.profession || "",
      family_situation: view.family_situation || "",
      emergency_contact_name: view.emergency_contact_name || "",
      emergency_contact_phone: view.emergency_contact_phone || "",
      emergency_contact_relation: view.emergency_contact_relation || "",
      insurance_name: view.insurance_name || "",
      insurance_number: view.insurance_number || "",
      insurance_policy: view.insurance_policy || "",
      insurance_status: view.insurance_status || "",
      insurance_notes: view.insurance_notes || "",
      rhesus: view.rhesus || "",
      allergies: view.allergies || "",
      chronic_diseases: view.chronic_diseases || "",
      current_medications: view.current_medications || "",
      medical_history: view.medical_history || "",
      family_history: view.family_history || "",
      surgical_history: view.surgical_history || "",
      previous_hospitalizations: view.previous_hospitalizations || "",
      birth_type: view.birth_type || "",
      birth_weight: view.birth_weight || "",
      birth_height: view.birth_height || "",
      apgar_score: view.apgar_score || "",
      breastfeeding: view.breastfeeding || "",
      birth_complications: view.birth_complications || "",
      psychomotor_development: view.psychomotor_development || "",
      development_notes: view.development_notes || "",
    });
  }, [id, toast]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  return (
    <div className="flex h-full w-full gap-6">
      {/* Sidebar List */}
      <div className="w-80 border-r bg-white p-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
           <div className="relative flex-1">
             <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <Input placeholder="Search patients..." className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} />
           </div>
        </div>
        <div className="space-y-1">
          {list.filter(p => p.full_name.toLowerCase().includes(q.toLowerCase())).map(p => (
            <Link 
              key={p.key} 
              to={`/admin/patients/details/${p.id}`}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg text-sm transition-colors",
                id === p.id ? "bg-primary/5 text-primary font-semibold" : "hover:bg-slate-50 text-slate-700"
              )}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10 text-[10px]">{p.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              {p.full_name}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {patient && (
          <div className="space-y-8 max-w-6xl mx-auto pb-10 px-4">
            {/* 1. PATIENT PROFILE HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-8">
                <Avatar className="w-28 h-28 border-4 border-white shadow-2xl ring-1 ring-slate-100 rounded-[36px]">
                  <AvatarImage src={patient.avatar_path || ""} className="object-cover" />
                  <AvatarFallback className="bg-primary text-white text-4xl font-black">
                    {patient.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{patient.full_name}</h1>
                    {patient.registered_at && (
                      <Badge className="bg-emerald-50 text-[10px] text-emerald-600 border-emerald-100 uppercase tracking-widest font-bold px-3 py-1 rounded-full">
                        Patient Enregistré
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-semibold tracking-tight">
                    <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary/60" /> ID: {patient.profileId?.slice(0, 8) || patient.intakeId?.slice(0, 8)}</span>
                    <span className="flex items-center gap-2"><Cake className="w-4 h-4 text-primary/60" /> {fmtDate(patient.dob)} ({getAge(patient.dob)} ans)</span>
                    <span className="flex items-center gap-2 capitalize"><UserCheck className="w-4 h-4 text-primary/60" /> {patient.gender || "Non renseigné"}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm font-bold uppercase text-[10px] tracking-[0.2em] h-12 px-8 rounded-2xl transition-all"
                >
                  <Pencil className="w-4 h-4 mr-2 text-primary" />
                  Modifier le profil
                </Button>
                <Button 
                  onClick={() => navigate(`/admin/appointments/new?patientId=${patient.profileId || id}`)}
                  className="bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 font-bold uppercase text-[10px] tracking-[0.2em] h-12 px-8 rounded-2xl transition-all"
                >
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Nouveau RDV
                </Button>
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-6 border-none shadow-sm bg-white ring-1 ring-slate-100 space-y-4 rounded-[24px]">
                <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                  <Droplet className="w-4 h-4" />
                  Groupe Sanguin
                </div>
                <p className="text-3xl font-black text-slate-900">{patient.blood_group || "—"}{patient.rhesus || ""}</p>
              </Card>
              <Card className="p-6 border-none shadow-sm bg-white ring-1 ring-slate-100 space-y-4 rounded-[24px]">
                <div className="flex items-center gap-2 text-rose-500 font-bold text-[10px] uppercase tracking-widest">
                  <AlertCircle className="w-4 h-4" />
                  Allergies
                </div>
                <p className="text-3xl font-black text-slate-900">{patient.allergies ? "Détectées" : "Aucune"}</p>
              </Card>
              <Card className="p-6 border-none shadow-sm bg-white ring-1 ring-slate-100 space-y-4 rounded-[24px]">
                <div className="flex items-center gap-2 text-amber-500 font-bold text-[10px] uppercase tracking-widest">
                  <Activity className="w-4 h-4" />
                  Condition
                </div>
                <p className="text-3xl font-black text-slate-900">Stable</p>
              </Card>
              <Card className="p-6 border-none shadow-sm bg-white ring-1 ring-slate-100 space-y-4 rounded-[24px]">
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4" />
                  Assurance
                </div>
                <p className="text-lg font-black text-slate-900 truncate pr-2">{patient.insurance_name || "Self-Pay"}</p>
              </Card>
            </div>

            <Tabs defaultValue="medical" className="w-full">
              <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 gap-8">
                <TabsTrigger
                  value="medical"
                  className="px-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none font-bold uppercase text-[11px] tracking-wider transition-all"
                >
                  Medical Profile
                </TabsTrigger>
                <TabsTrigger
                  value="archive"
                  className="px-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none font-bold uppercase text-[11px] tracking-wider transition-all"
                >
                  Medical Archive
                </TabsTrigger>
                <TabsTrigger
                  value="prescriptions"
                  className="px-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none font-bold uppercase text-[11px] tracking-wider transition-all"
                >
                  Prescriptions
                </TabsTrigger>
                <TabsTrigger
                  value="appointments"
                  className="px-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none font-bold uppercase text-[11px] tracking-wider transition-all"
                >
                  Rendez-vous
                </TabsTrigger>
                <TabsTrigger
                  value="billing"
                  className="px-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none font-bold uppercase text-[11px] tracking-wider transition-all"
                >
                  Facturation
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="medical" className="mt-6 space-y-6 animate-in fade-in-50 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 2. IDENTITÉ */}
                  <Card className="p-8 border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-[24px]">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                        <VenetianMask className="w-5 h-5 text-primary" />
                        Identité
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                      <ValueDisplay label="Type de document" value={patient.identity_document_type} />
                      <ValueDisplay label="Numéro du document" value={patient.identity_document_number} mono />
                      <ValueDisplay label="Date de naissance" value={fmtDate(patient.dob)} />
                      <ValueDisplay label="Genre" value={patient.gender} />
                      <ValueDisplay label="Nationalité" value={patient.nationality} colSpan={2} />
                    </div>
                  </Card>

                  {/* 3. CONTACT */}
                  <Card className="p-8 border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-[24px]">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Coordonnées
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                      <ValueDisplay label="Téléphone" value={patient.phone} icon={Phone} />
                      <ValueDisplay label="Email" value={patient.email} icon={Mail} />
                      <div className="sm:col-span-2">
                        <ValueDisplay label="Adresse" value={patient.address_1} />
                      </div>
                      <ValueDisplay label="Ville" value={patient.city} />
                      <ValueDisplay label="Pays" value={patient.country} />
                    </div>
                  </Card>

                  {/* 4. ASSURANCE & COUVERTURE */}
                  <Card className="p-8 border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-[24px]">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        Assurance & Couverture
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                      <ValueDisplay label="Organisme / Assurance" value={patient.insurance_name} />
                      <ValueDisplay label="Numéro d'adhérent / contrat" value={patient.insurance_number} mono />
                      {patient.insurance_notes && (
                        <div className="sm:col-span-2">
                          <ValueDisplay label="Notes éventuelles" value={patient.insurance_notes} />
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* 5. INFORMATIONS MÉDICALES */}
                  <Card className="p-8 border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-[24px]">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Informations médicales
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                      <ValueDisplay label="Groupe sanguin" value={patient.blood_group ? `${patient.blood_group}${patient.rhesus || ""}` : null} />
                      <ValueDisplay label="Allergies" value={patient.allergies} />
                      <ValueDisplay label="Maladies chroniques" value={patient.chronic_diseases} />
                      <ValueDisplay label="Médicaments actuels" value={patient.current_medications} />
                      <div className="sm:col-span-2">
                        <ValueDisplay label="Antécédents chirurgicaux" value={patient.surgical_history} />
                      </div>
                      <div className="sm:col-span-2">
                        <ValueDisplay label="Condition / état général" value="Stable" />
                      </div>
                    </div>
                  </Card>

                  {/* 6. EMERGENCY CONTACT */}
                  {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
                    <Card className="p-8 border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-[24px] md:col-span-2">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5 text-rose-500" />
                          Contact d'urgence
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
                        <ValueDisplay label="Nom" value={patient.emergency_contact_name} />
                        <ValueDisplay label="Relation" value={patient.emergency_contact_relation} />
                        <ValueDisplay label="Téléphone" value={patient.emergency_contact_phone} icon={Phone} />
                      </div>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="archive" className="mt-6 animate-in fade-in-50 duration-300">
                <MedicalArchive patientId={patient.profileId || patient.intakeId || ""} />
              </TabsContent>

              <TabsContent value="prescriptions" className="mt-6 animate-in fade-in-50 duration-300">
                <PrescriptionList patientId={patient.profileId || patient.intakeId || ""} />
              </TabsContent>

              <TabsContent value="appointments" className="mt-6 animate-in fade-in-50 duration-300">
                <Card className="p-6 border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-primary" />
                      Appointment History
                    </h3>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/admin/appointments/new?patientId=${patient.profileId || id}`)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Appointment
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {appts.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
                        No appointments found for this patient.
                      </div>
                    ) : (
                      appts.map((appt) => (
                        <div key={appt.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                              <CalendarDays className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{appt.services?.name || appt.reason || "Consultation"}</p>
                              <p className="text-xs text-slate-500">
                                {fmtDate(appt.appointment_date)} at {appt.appointment_time?.slice(0, 5)} • Dr. {appt.doctors?.full_name || "Staff"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {statusPill(appt.status)}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="mt-6 animate-in fade-in-50 duration-300">
                <div className="space-y-6">
                  {/* Financial Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 bg-slate-900 text-white border-none shadow-md">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Billed</p>
                      <h4 className="text-2xl font-bold">{formatMoney(invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0))}</h4>
                    </Card>
                    <Card className="p-4 bg-emerald-600 text-white border-none shadow-md">
                      <p className="text-[10px] font-bold text-emerald-100/60 uppercase tracking-wider mb-1">Total Paid</p>
                      <h4 className="text-2xl font-bold">{formatMoney(invoices.reduce((sum, inv) => sum + Number(inv.paid || 0), 0))}</h4>
                    </Card>
                    <Card className="p-4 bg-amber-500 text-white border-none shadow-md">
                      <p className="text-[10px] font-bold text-amber-100/60 uppercase tracking-wider mb-1">Remaining Due</p>
                      <h4 className="text-2xl font-bold">{formatMoney(invoices.reduce((sum, inv) => sum + Number(inv.due || 0), 0))}</h4>
                    </Card>
                  </div>

                  <Card className="p-6 border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-primary" />
                        Billing History
                      </h3>
                      <Button 
                        size="sm" 
                        className="bg-primary text-white"
                        onClick={() => navigate(`/admin/billing/invoices/new?patientId=${patient.profileId || id}`)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Invoice
                      </Button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-y border-slate-100">
                          <tr className="text-left text-slate-500">
                            <th className="p-3 font-semibold uppercase text-[10px] tracking-wider">Invoice #</th>
                            <th className="p-3 font-semibold uppercase text-[10px] tracking-wider">Date</th>
                            <th className="p-3 font-semibold uppercase text-[10px] tracking-wider text-right">Amount</th>
                            <th className="p-3 font-semibold uppercase text-[10px] tracking-wider">Status</th>
                            <th className="p-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {loadingInvoices ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                              </td>
                            </tr>
                          ) : invoices.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-12 text-center text-muted-foreground">
                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                No billing records found.
                              </td>
                            </tr>
                          ) : (
                            invoices.map((inv) => (
                              <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 font-bold text-primary">
                                  <Link to={`/admin/billing/invoices/${inv.id}`} className="hover:underline">
                                    {inv.invoice_number}
                                  </Link>
                                </td>
                                <td className="p-3 text-slate-600">{fmtDate(inv.issue_date)}</td>
                                <td className="p-3 text-right font-semibold text-slate-900">{formatMoney(inv.total)}</td>
                                <td className="p-3">{statusPill(inv.status)}</td>
                                <td className="p-3 text-right">
                                  <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-400">
                                    <Link to={`/admin/billing/invoices/${inv.id}`}>
                                      <Eye className="w-4 h-4" />
                                    </Link>
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
            <EditPatientDialog
              open={isEditing}
              onOpenChange={setIsEditing}
              profileId={patient.profileId}
              intakeId={patient.intakeId}
              onSaved={loadPatient}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminPatientDetails;
