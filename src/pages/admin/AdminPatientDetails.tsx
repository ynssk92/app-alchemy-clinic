import { useEffect, useMemo, useState } from "react";
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
  Receipt, Eye, FileText, Plus, AlertCircle, Pill, StethoscopeIcon, HistoryIcon, ShieldPlus
} from "lucide-react";
import { AddAllergyDialog, AddMedicationDialog } from "@/components/admin/AddMedicalRecordDialogs";
import { formatMoney } from "@/lib/currency";
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
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

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
  useEffect(() => {
    if (!id) return;
    (async () => {
      setNotFound(false);
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

      // Load Medical Records V2
      const pId = profileRow?.id || intakeRow?.user_id;
      if (pId) {
        const [
          { data: allergies },
          { data: medications },
          { data: history },
          { data: surgeries },
          { data: chronic },
          { data: family },
          { data: vaccines },
          { data: hospitalizations },
        ] = await Promise.all([
          supabase.from("patient_allergies_v2").select("*").eq("patient_id", pId),
          supabase.from("patient_medications_v2").select("*").eq("patient_id", pId),
          supabase.from("patient_medical_history_v2").select("*").eq("patient_id", pId),
          supabase.from("patient_surgeries").select("*").eq("patient_id", pId),
          supabase.from("patient_chronic_diseases").select("*").eq("patient_id", pId),
          supabase.from("patient_family_history").select("*").eq("patient_id", pId),
          supabase.from("patient_vaccinations").select("*").eq("patient_id", pId),
          supabase.from("patient_hospitalizations_v2").select("*").eq("patient_id", pId),
        ]);

        setMedicalData({
          allergies: allergies || [],
          medications: medications || [],
          history: history || [],
          surgeries: surgeries || [],
          chronic: chronic || [],
          family: family || [],
          vaccines: vaccines || [],
          hospitalizations: hospitalizations || [],
        });
      }

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

        // Fetch Invoices
        setLoadingInvoices(true);
        setInvoiceError(false);
        try {
          const { data: invs, error: invErr } = await supabase
            .from("invoices")
            .select(`
              id, 
              invoice_number, 
              issue_date, 
              status, 
              total, 
              paid, 
              due,
              appointment_id,
              doctors (full_name)
            `)
            .eq("patient_id", view.profileId)
            .order("issue_date", { ascending: false });
          
          if (invErr) throw invErr;
          setInvoices(invs || []);
        } catch (err) {
          console.error("Error loading transactions:", err);
          setInvoiceError(true);
        } finally {
          setLoadingInvoices(false);
        }
      } else {
        setAppts([]);
        setInvoices([]);
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
            nationality: form.nationality.trim() || null,
            identity_document_type: form.identity_document_type || null,
            identity_document_number: form.identity_document_number.trim() || null,
            status: form.status,
            patient_type: form.patient_type,
            languages: form.languages,
            profession: form.profession.trim() || null,
            family_situation: form.family_situation.trim() || null,
            emergency_contact_name: form.emergency_contact_name.trim() || null,
            emergency_contact_phone: form.emergency_contact_phone.trim() || null,
            emergency_contact_relation: form.emergency_contact_relation.trim() || null,
            insurance_name: form.insurance_name.trim() || null,
            insurance_number: form.insurance_number.trim() || null,
            insurance_policy: form.insurance_policy.trim() || null,
            insurance_status: form.insurance_status.trim() || null,
            insurance_notes: form.insurance_notes.trim() || null,
            rhesus: form.rhesus.trim() || null,
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
        nationality: form.nationality || null,
        identity_document_type: form.identity_document_type || null,
        identity_document_number: form.identity_document_number || null,
        dob: form.dob || null,
        gender: form.gender || null,
        blood_group: form.blood_group || null,
        address_1: form.address_1 || null,
        city: form.city || null,
        country: form.country || null,
        patient_type: form.patient_type,
        languages: form.languages,
        profession: form.profession.trim() || null,
        family_situation: form.family_situation.trim() || null,
        emergency_contact_name: form.emergency_contact_name.trim() || null,
        emergency_contact_phone: form.emergency_contact_phone.trim() || null,
        emergency_contact_relation: form.emergency_contact_relation.trim() || null,
        insurance_name: form.insurance_name.trim() || null,
        insurance_number: form.insurance_number.trim() || null,
        insurance_policy: form.insurance_policy.trim() || null,
        insurance_status: form.insurance_status.trim() || null,
        insurance_notes: form.insurance_notes.trim() || null,
        rhesus: form.rhesus.trim() || null,
        allergies: form.allergies.trim() || null,
        chronic_diseases: form.chronic_diseases.trim() || null,
        current_medications: form.current_medications.trim() || null,
        medical_history: form.medical_history.trim() || null,
        family_history: form.family_history.trim() || null,
        surgical_history: form.surgical_history.trim() || null,
        previous_hospitalizations: form.previous_hospitalizations.trim() || null,
        birth_type: form.birth_type.trim() || null,
        birth_weight: form.birth_weight || null,
        birth_height: form.birth_height || null,
        apgar_score: form.apgar_score.trim() || null,
        breastfeeding: form.breastfeeding.trim() || null,
        birth_complications: form.birth_complications.trim() || null,
        psychomotor_development: form.psychomotor_development.trim() || null,
        development_notes: form.development_notes.trim() || null,
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
          {t("nav.patients")}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar list */}
        <Card className="p-4 border-border h-fit">
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("patients.list.searchPlaceholder", { defaultValue: "Search patients…" })} value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
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
                      {t("common.new", { defaultValue: "New" })}
                    </span>
                  )}
                </button>
              );
            })}
            {filteredList.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">{t("dashboard.appointments.empty")}</p>
            )}
          </div>
        </Card>

        {/* Details */}
        <div className="space-y-6">
          {notFound ? (
            <Card className="p-10 border-border text-center text-muted-foreground">
              {t("patients.list.empty")}
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
                          <ShieldCheck className="w-3 h-3" /> {t("patients.list.registered")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <ShieldAlert className="w-3 h-3" /> {t("patients.list.notRegistered")}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground">{t("auth.phoneNumber")} :</span> {patient.phone || "—"}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground">{t("dashboard.appointments.upcomingTitle")} :</span>{" "}
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
                            {t("common.save")}
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving} className="rounded-full h-9 px-4 gap-2">
                            <X className="w-4 h-4" /> {t("common.cancel")}
                          </Button>
                        </>
                      )}
                    </div>
                    {!isEditing && (
                      <div className="flex gap-2">
                        <Button variant="outline" className="gap-2" onClick={() => setIsEditing(true)}>
                          <Pencil className="w-4 h-4" />{t("common.edit")}
                        </Button>
                        <Button asChild className="bg-gradient-primary text-primary-foreground gap-2">
                          <Link to="/booking"><CalendarPlus className="w-4 h-4" />{t("nav.newAppointment")}</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Registration status */}
              <Card className="p-6 border-border">
                <h3 className="font-bold mb-5 flex items-center gap-2 text-primary">
                  <UserCheck className="w-4 h-4" /> {t("patients.details.registrationStatus", { defaultValue: "Registration Status" })}
                </h3>
                <div className="grid md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" /> {t("patients.details.accountStatus", { defaultValue: "Account status" })}
                    </Label>
                    {!isEditing ? (
                      <div className="font-semibold flex items-center gap-2">
                        {registered ? (
                          <span className="text-emerald-600 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> {t("patients.list.registered")}</span>
                        ) : (
                          <span className="text-amber-600 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" /> {t("patients.list.notRegistered")}</span>
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
                          <SelectItem value="pending">{t("common.pending")}</SelectItem>
                          <SelectItem value="approved">{t("common.approved", { defaultValue: "Approved" })}</SelectItem>
                          <SelectItem value="rejected">{t("common.rejected", { defaultValue: "Rejected" })}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <InfoTile
                    icon={Mail}
                    label={t("auth.email")}
                    value={patient.email || "—"}
                  />
                  <InfoTile
                    icon={CalendarDays}
                    label={registered ? t("patients.details.signedUp", { defaultValue: "Signed up" }) : t("patients.details.addedOn", { defaultValue: "Added on" })}
                    value={fmtDate(registered ? patient.registered_at : patient.added_at)}
                  />
                  <InfoTile
                    icon={BookOpen}
                    label={t("patients.details.intakeRecord", { defaultValue: "Intake record" })}
                    value={patient.intakeId ? t("common.onFile", { defaultValue: "On file" }) : t("common.notCreated", { defaultValue: "Not created" })}
                  />
                  <InfoTile
                    icon={UserCheck}
                    label={t("patients.details.accountId", { defaultValue: "Account ID" })}
                    value={patient.profileId ? patient.profileId.slice(0, 8) + "…" : "—"}
                  />
                  <InfoTile
                    icon={MapPin}
                    label={t("patients.details.location", { defaultValue: "Location" })}
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
                    <BookOpen className="w-4 h-4" /> {t("patients.details.about", { defaultValue: "About" })}
                  </h3>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                    {!isEditing ? (
                      <>
                        <InfoTile icon={Cake} label={t("auth.dob")} value={fmtDate(patient.dob)} />
                        <InfoTile icon={Droplet} label={t("auth.bloodGroup")} value={patient.blood_group || "—"} />
                        <InfoTile icon={VenetianMask} label={t("auth.gender")} value={patient.gender ? t(`auth.genderOptions.${patient.gender}`) : "—"} />
                        <InfoTile icon={Mail} label={t("auth.email")} value={patient.email || "—"} />
                        <InfoTile icon={MapPin} label={t("auth.address")} value={patient.address_1 || "—"} />
                        <InfoTile icon={MapPin} label={t("auth.city")} value={patient.city || "—"} />
                      </>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">{t("auth.fullName")}</Label>
                          <Input
                            className="h-9"
                            value={form.full_name}
                            onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                            disabled={saving}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">{t("auth.email")}</Label>
                          <Input
                            className="h-9"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                            disabled={saving || registered}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">{t("auth.phoneNumber")}</Label>
                          <Input
                            className="h-9"
                            value={form.phone}
                            onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                            disabled={saving}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">{t("auth.dob")}</Label>
                          <Input
                            className="h-9"
                            type="date"
                            value={form.dob}
                            onChange={(e) => setForm(f => ({ ...f, dob: e.target.value }))}
                            disabled={saving}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">{t("auth.gender")}</Label>
                          <Select
                            value={form.gender}
                            onValueChange={(v) => setForm(f => ({ ...f, gender: v }))}
                            disabled={saving}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder={t("common.select")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">{t("auth.genderOptions.male")}</SelectItem>
                              <SelectItem value="female">{t("auth.genderOptions.female")}</SelectItem>
                              <SelectItem value="other">{t("auth.genderOptions.other")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">{t("auth.bloodGroup")}</Label>
                          <Select
                            value={form.blood_group}
                            onValueChange={(v) => setForm(f => ({ ...f, blood_group: v }))}
                            disabled={saving}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder={t("common.select")} />
                            </SelectTrigger>
                            <SelectContent>
                              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => (
                                <SelectItem key={g} value={g}>{g}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2 space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">{t("auth.address")}</Label>
                          <Input
                            className="h-9"
                            value={form.address_1}
                            onChange={(e) => setForm(f => ({ ...f, address_1: e.target.value }))}
                            disabled={saving}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">{t("auth.city")}</Label>
                          <Input
                            className="h-9"
                            value={form.city}
                            onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                            disabled={saving}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">{t("auth.country")}</Label>
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
                    <BookOpen className="w-4 h-4 text-primary" /> {t("patients.details.vitalSigns", { defaultValue: "Vital Signs" })}
                  </h3>
                  <div className="grid grid-cols-3 gap-5">
                    <VitalTile icon={Droplet} label={t("patients.details.vitals.bloodPressure", { defaultValue: "Blood Pressure" })} value="—" dot="muted" />
                    <VitalTile icon={Heart} label={t("patients.details.vitals.heartRate", { defaultValue: "Heart Rate" })} value="—" dot="muted" />
                    <VitalTile icon={Activity} label={t("patients.details.vitals.spo2", { defaultValue: "SPO2" })} value="—" dot="muted" />
                    <VitalTile icon={Thermometer} label={t("patients.details.vitals.temperature", { defaultValue: "Temperature" })} value="—" dot="muted" />
                    <VitalTile icon={Wind} label={t("patients.details.vitals.respiratoryRate", { defaultValue: "Respiratory Rate" })} value="—" dot="muted" />
                    <VitalTile icon={Weight} label={t("patients.details.vitals.weight", { defaultValue: "Weight" })} value="—" dot="muted" />
                  </div>
                </Card>
              </div>

              {/* CRM Tabs */}
              <Card className="border-border shadow-sm">
                <Tabs defaultValue="appointments" className="w-full">
                  <div className="border-b border-border px-6 pt-2">
                    <TabsList className="bg-transparent p-0 h-auto gap-8 flex flex-wrap">
                      <TabsTrigger
                        value="medical"
                        className="px-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none font-bold uppercase text-[11px] tracking-wider transition-all"
                      >
                        {t("patients.details.tabs.medical", { defaultValue: "Medical Profile" })}
                      </TabsTrigger>
                      <TabsTrigger
                        value="insurance"
                        className="px-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none font-bold uppercase text-[11px] tracking-wider transition-all"
                      >
                        {t("patients.details.tabs.insurance", { defaultValue: "Insurance" })}
                      </TabsTrigger>
                      {patient.patient_type === "minor" && (
                        <TabsTrigger
                          value="pediatrics"
                          className="px-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none font-bold uppercase text-[11px] tracking-wider transition-all"
                        >
                          {t("patients.details.tabs.pediatrics", { defaultValue: "Pediatrics" })}
                        </TabsTrigger>
                      )}
                      <TabsTrigger
                        value="appointments"
                        className="px-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none font-bold uppercase text-[11px] tracking-wider transition-all"
                      >
                        {t("nav.appointments")}
                      </TabsTrigger>
                      <TabsTrigger
                        value="transactions"
                        className="px-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none font-bold uppercase text-[11px] tracking-wider transition-all"
                      >
                        {t("nav.billing")}
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="medical" className="m-0 p-8 pt-6">
                    <div className="space-y-10">
                      {/* Action Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">Medical Records</h3>
                          <p className="text-sm text-muted-foreground">Complete clinical history and current status</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="gap-2" onClick={() => setActiveDialog("allergy")}>
                            <AlertCircle className="w-4 h-4" /> Add Allergy
                          </Button>
                          <Button size="sm" className="gap-2" onClick={() => setActiveDialog("medication")}>
                            <Pencil className="w-4 h-4" /> Add Medication
                          </Button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          {/* Allergies Section */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2 border-border">
                              <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-red-500" /> Allergies
                              </h4>
                              <Badge variant="outline" className="text-[10px]">{medicalData.allergies.length}</Badge>
                            </div>
                            <div className="space-y-3">
                              {medicalData.allergies.length > 0 ? (
                                medicalData.allergies.map((a) => (
                                  <div key={a.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-start">
                                    <div>
                                      <div className="font-bold text-sm text-slate-900">{a.allergy}</div>
                                      <div className="text-xs text-slate-500 mt-1">{a.reaction || "No reaction specified"}</div>
                                    </div>
                                    <Badge className={cn(
                                      "text-[10px] font-bold uppercase",
                                      a.severity === 'severe' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                    )}>
                                      {a.severity}
                                    </Badge>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-muted-foreground italic">No known allergies recorded.</p>
                              )}
                            </div>
                          </div>

                          {/* Chronic Conditions */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2 border-border">
                              <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-indigo-500" /> Chronic Diseases
                              </h4>
                            </div>
                            <div className="space-y-3">
                              {medicalData.chronic.length > 0 ? (
                                medicalData.chronic.map((c) => (
                                  <div key={c.id} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                    <div>
                                      <div className="text-sm font-semibold">{c.disease}</div>
                                      <div className="text-xs text-muted-foreground">{c.status} since {fmtDate(c.diagnosis_date)}</div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-muted-foreground italic">No chronic conditions declared.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {/* Current Medications */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2 border-border">
                              <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Pill className="w-3.5 h-3.5 text-emerald-500" /> Medications
                              </h4>
                              <Badge variant="outline" className="text-[10px]">{medicalData.medications.length}</Badge>
                            </div>
                            <div className="space-y-3">
                              {medicalData.medications.length > 0 ? (
                                medicalData.medications.map((m) => (
                                  <div key={m.id} className="p-3 rounded-lg border border-border flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
                                      <Pill className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm font-bold">{m.medication}</div>
                                      <div className="text-xs text-muted-foreground">{m.dosage} • {m.frequency}</div>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px]">{m.route}</Badge>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-muted-foreground italic">No active medications.</p>
                              )}
                            </div>
                          </div>

                          {/* Recent History / Surgeries */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2 border-border">
                              <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <HistoryIcon className="w-3.5 h-3.5 text-slate-500" /> History & Surgeries
                              </h4>
                            </div>
                            <div className="space-y-4">
                              {medicalData.surgeries.map(s => (
                                <div key={s.id} className="flex gap-3">
                                  <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center shrink-0">
                                    <StethoscopeIcon className="w-4 h-4 text-slate-500" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold">{s.surgery}</div>
                                    <div className="text-xs text-muted-foreground">{fmtDate(s.surgery_date)} • {s.hospital}</div>
                                  </div>
                                </div>
                              ))}
                              {medicalData.surgeries.length === 0 && medicalData.history.length === 0 && (
                                <p className="text-xs text-muted-foreground italic">No history recorded.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="insurance" className="m-0 p-8 pt-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <InfoTile icon={ShieldCheck} label="Provider" value={patient.insurance_name || "Self-pay"} />
                      <InfoTile icon={Receipt} label="Policy #" value={patient.insurance_number || "—"} />
                      <InfoTile icon={FileText} label="Status" value={patient.insurance_status || "Unknown"} />
                    </div>
                  </TabsContent>

                  {patient.patient_type === "minor" && (
                    <TabsContent value="pediatrics" className="m-0 p-8 pt-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        <InfoTile icon={Cake} label="Birth Weight" value={patient.birth_weight ? `${patient.birth_weight} kg` : "—"} />
                        <InfoTile icon={Thermometer} label="Birth Type" value={patient.birth_type || "—"} />
                        <InfoTile icon={Activity} label="Psychomotor" value={patient.psychomotor_development || "—"} />
                      </div>
                    </TabsContent>
                  )}

                  <TabsContent value="appointments" className="m-0 p-6 pt-4">

                    {!registered ? (
                      <div className="py-10 text-center text-sm text-muted-foreground">
                        Appointments become available after the patient registers an account.
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="relative w-48">
                            <Input placeholder={t("common.search")} value={apptSearch} onChange={(e) => setApptSearch(e.target.value)} />
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

                  <TabsContent value="transactions" className="m-0 p-6 pt-4">
                    {!registered ? (
                      <div className="py-10 text-center text-sm text-muted-foreground">
                        Financial transactions become available after the patient registers an account.
                      </div>
                    ) : loadingInvoices ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm">Loading transactions...</p>
                      </div>
                    ) : invoiceError ? (
                      <div className="py-10 text-center text-sm text-destructive">
                        Unable to load transactions. Please try again.
                      </div>
                    ) : invoices.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <Receipt className="w-12 h-12 opacity-20" />
                        <p className="text-sm font-medium">No transactions on file.</p>
                        <Button asChild variant="outline" size="sm" className="mt-2">
                          <Link to="/admin/billing/invoices/new">Create First Invoice</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border text-left">
                              <th className="pb-3 font-bold">Invoice #</th>
                              <th className="pb-3 font-bold">Date</th>
                              <th className="pb-3 font-bold">Doctor</th>
                              <th className="pb-3 font-bold">Total</th>
                              <th className="pb-3 font-bold">Paid</th>
                              <th className="pb-3 font-bold">Status</th>
                              <th className="pb-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {invoices.map((inv) => (
                              <tr key={inv.id} className="group hover:bg-muted/30 transition-colors">
                                <td className="py-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary/10">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="font-semibold">{inv.invoice_number}</span>
                                  </div>
                                </td>
                                <td className="py-4 text-muted-foreground">
                                  {fmtDate(inv.issue_date)}
                                </td>
                                <td className="py-4 text-muted-foreground">
                                  {inv.doctors?.full_name ? `Dr. ${inv.doctors.full_name}` : "—"}
                                </td>
                                <td className="py-4 font-medium">
                                  {formatMoney(inv.total)}
                                </td>
                                <td className="py-4 text-emerald-600 font-medium">
                                  {formatMoney(inv.paid)}
                                </td>
                                <td className="py-4">
                                  {statusPill(inv.status)}
                                </td>
                                <td className="py-4 text-right">
                                  <Button asChild variant="ghost" size="sm" className="gap-2 h-8">
                                    <Link to={`/admin/billing/invoices/${inv.id}`}>
                                      <Eye className="w-3.5 h-3.5" />
                                      View
                                    </Link>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
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
