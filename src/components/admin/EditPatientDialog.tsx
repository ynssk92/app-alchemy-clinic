import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, BookOpen, ShieldCheck, Activity, Baby } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profileId?: string | null;
  intakeId?: string | null;
  onSaved?: () => void;
};

export const EditPatientDialog = ({ open, onOpenChange, profileId, intakeId: intakeIdProp, onSaved }: Props) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [intakeId, setIntakeId] = useState<string | null>(intakeIdProp ?? null);
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

  useEffect(() => {
    if (!open) return;
    (async () => {
      let intake: any = null;
      const query = `
        id, first_name, last_name, email, phone, dob, gender, blood_group, address_1, city, country, nationality, identity_document_type, identity_document_number,
        patient_type, languages, profession, family_situation,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
        insurance_name, insurance_number, insurance_policy, insurance_status, insurance_notes,
        rhesus, allergies, chronic_diseases, current_medications, medical_history, family_history, surgical_history, previous_hospitalizations,
        birth_type, birth_weight, birth_height, apgar_score, breastfeeding, birth_complications, psychomotor_development, development_notes
      `;
      if (intakeIdProp) {
        const { data } = await supabase.from("patient_intake").select(query).eq("id", intakeIdProp).maybeSingle();
        intake = data;
      } else if (profileId) {
        const { data } = await supabase.from("patient_intake").select(query).eq("user_id", profileId).maybeSingle();
        intake = data;
      }
      setIntakeId(intake?.id ?? null);

      let profileData: any = null;
      if (profileId) {
        const { data: p } = await supabase
          .from("profiles")
          .select("full_name, phone, nationality, identity_document_type, identity_document_number, patient_type, languages, profession, family_situation, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, insurance_name, insurance_number, insurance_policy, insurance_status, insurance_notes, rhesus")
          .eq("id", profileId)
          .maybeSingle();
        profileData = p;
      }

      setForm({
        first_name: intake?.first_name || "",
        last_name: intake?.last_name || "",
        full_name: profileData?.full_name || [intake?.first_name, intake?.last_name].filter(Boolean).join(" ") || "",
        email: intake?.email || "",
        phone: profileData?.phone || intake?.phone || "",
        nationality: profileData?.nationality || intake?.nationality || "",
        identity_document_type: profileData?.identity_document_type || intake?.identity_document_type || "",
        identity_document_number: profileData?.identity_document_number || intake?.identity_document_number || "",
        dob: intake?.dob || "",
        gender: intake?.gender || "",
        blood_group: intake?.blood_group || "",
        address_1: intake?.address_1 || "",
        city: intake?.city || "",
        country: intake?.country || "",
        patient_type: profileData?.patient_type || intake?.patient_type || "adult",
        languages: profileData?.languages || intake?.languages || [],
        profession: profileData?.profession || intake?.profession || "",
        family_situation: profileData?.family_situation || intake?.family_situation || "",
        emergency_contact_name: profileData?.emergency_contact_name || intake?.emergency_contact_name || "",
        emergency_contact_phone: profileData?.emergency_contact_phone || intake?.emergency_contact_phone || "",
        emergency_contact_relation: profileData?.emergency_contact_relation || intake?.emergency_contact_relation || "",
        insurance_name: profileData?.insurance_name || intake?.insurance_name || "",
        insurance_number: profileData?.insurance_number || intake?.insurance_number || "",
        insurance_policy: profileData?.insurance_policy || intake?.insurance_policy || "",
        insurance_status: profileData?.insurance_status || intake?.insurance_status || "",
        insurance_notes: profileData?.insurance_notes || intake?.insurance_notes || "",
        rhesus: profileData?.rhesus || intake?.rhesus || "",
        allergies: intake?.allergies || "",
        chronic_diseases: intake?.chronic_diseases || "",
        current_medications: intake?.current_medications || "",
        medical_history: intake?.medical_history || "",
        family_history: intake?.family_history || "",
        surgical_history: intake?.surgical_history || "",
        previous_hospitalizations: intake?.previous_hospitalizations || "",
        birth_type: intake?.birth_type || "",
        birth_weight: intake?.birth_weight || "",
        birth_height: intake?.birth_height || "",
        apgar_score: intake?.apgar_score || "",
        breastfeeding: intake?.breastfeeding || "",
        birth_complications: intake?.birth_complications || "",
        psychomotor_development: intake?.psychomotor_development || "",
        development_notes: intake?.development_notes || "",
      });
    })();
  }, [open, profileId, intakeIdProp]);

  const set = (k: string, v: string | any) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async () => {
    setSaving(true);
    try {
      if (profileId) {
        const { error: pErr } = await supabase
          .from("profiles")
          .update({
            full_name: form.full_name.trim() || null,
            phone: form.phone.trim() || null,
            nationality: form.nationality.trim() || null,
            identity_document_type: form.identity_document_type || null,
            identity_document_number: form.identity_document_number.trim() || null,
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
          .eq("id", profileId);
        if (pErr) throw pErr;
      }

      const parts = (form.full_name || "").trim().split(/\s+/);
      const derivedFirst = form.first_name || parts.shift() || "Patient";
      const derivedLast = form.last_name || parts.join(" ") || "-";

      const intakePayload: any = {
        first_name: derivedFirst,
        last_name: derivedLast,
        email: form.email || (profileId ? `${profileId}@placeholder.local` : "unknown@placeholder.local"),
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

      if (intakeId) {
        const { error } = await supabase.from("patient_intake").update(intakePayload).eq("id", intakeId);
        if (error) throw error;
      } else if (profileId) {
        const { data: authUser } = await supabase.auth.getUser();
        const { error } = await supabase.from("patient_intake").insert({ ...intakePayload, user_id: profileId, created_by: authUser.user?.id ?? null });
        if (error) throw error;
      }

      toast({ title: "Patient updated" });
      onOpenChange(false);
      onSaved?.();
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const SectionHeader = ({ num, title, icon: Icon }: { num: string; title: string; icon?: any }) => (
    <div className="flex items-center gap-4 mb-6">
      <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary text-xs font-bold ring-1 ring-primary/20">
        {num}
      </span>
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-primary/60" />}
        {title}
      </h3>
      <div className="h-px bg-slate-100 flex-1" />
    </div>
  );

  const FormItem = ({ label, children, colSpan = 1 }: { label: string; children: React.ReactNode; colSpan?: number }) => (
    <div className={`space-y-2 ${colSpan === 2 ? "md:col-span-2" : ""}`}>
      <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</Label>
      {children}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border-none shadow-2xl rounded-3xl bg-white">
        <div className="p-10 space-y-16">
          {/* SECTION 1: IDENTITY */}
          <section>
            <SectionHeader num="01" title="Patient Identity" icon={UserPlus} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormItem label="Full Name">
                <Input className="h-11 rounded-xl" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
              </FormItem>
              <FormItem label="Email">
                <Input className="h-11 rounded-xl" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </FormItem>
              <FormItem label="Phone">
                <Input className="h-11 rounded-xl" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </FormItem>
              <FormItem label="Nationality">
                <Input className="h-11 rounded-xl" value={form.nationality} onChange={(e) => set("nationality", e.target.value)} />
              </FormItem>
            </div>
          </section>

          {/* SECTION 2: PERSONAL */}
          <section>
            <SectionHeader num="02" title="Personal Information" icon={BookOpen} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormItem label="Date of Birth">
                <Input type="date" className="h-11 rounded-xl" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
              </FormItem>
              <FormItem label="Gender">
                <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
              <FormItem label="Patient Type">
                <Select value={form.patient_type} onValueChange={(v) => set("patient_type", v)}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adult">Adult</SelectItem>
                    <SelectItem value="minor">Minor (Pediatric)</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
              <FormItem label="Profession">
                <Input className="h-11 rounded-xl" value={form.profession} onChange={(e) => set("profession", e.target.value)} />
              </FormItem>
            </div>
          </section>

          {/* SECTION 3: INSURANCE */}
          <section>
            <SectionHeader num="03" title="Insurance & Billing" icon={ShieldCheck} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
              <FormItem label="Provider Name">
                <Input className="h-11 rounded-xl" value={form.insurance_name} onChange={(e) => set("insurance_name", e.target.value)} />
              </FormItem>
              <FormItem label="Policy Number">
                <Input className="h-11 rounded-xl" value={form.insurance_number} onChange={(e) => set("insurance_number", e.target.value)} />
              </FormItem>
              <FormItem label="Status">
                <Input className="h-11 rounded-xl" value={form.insurance_status} onChange={(e) => set("insurance_status", e.target.value)} />
              </FormItem>
            </div>
          </section>

          {/* SECTION 4: MEDICAL HISTORY */}
          <section>
            <SectionHeader num="04" title="Medical History" icon={Activity} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormItem label="Allergies" colSpan={2}>
                <Input className="h-11 rounded-xl" value={form.allergies} onChange={(e) => set("allergies", e.target.value)} />
              </FormItem>
              <FormItem label="Chronic Diseases">
                <Input className="h-11 rounded-xl" value={form.chronic_diseases} onChange={(e) => set("chronic_diseases", e.target.value)} />
              </FormItem>
              <FormItem label="Current Medications">
                <Input className="h-11 rounded-xl" value={form.current_medications} onChange={(e) => set("current_medications", e.target.value)} />
              </FormItem>
            </div>
          </section>

          {/* SECTION 5: PEDIATRIC (Optional) */}
          {form.patient_type === "minor" && (
            <section className="animate-in fade-in slide-in-from-top-4 duration-500">
              <SectionHeader num="05" title="Pediatric Information" icon={Baby} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <FormItem label="Birth Weight (kg)">
                  <Input type="number" step="0.01" className="h-11 rounded-xl" value={form.birth_weight} onChange={(e) => set("birth_weight", e.target.value)} />
                </FormItem>
                <FormItem label="Birth Height (cm)">
                  <Input type="number" step="0.1" className="h-11 rounded-xl" value={form.birth_height} onChange={(e) => set("birth_height", e.target.value)} />
                </FormItem>
                <FormItem label="Birth Type">
                  <Input className="h-11 rounded-xl" value={form.birth_type} onChange={(e) => set("birth_type", e.target.value)} placeholder="e.g. Vaginal, C-section" />
                </FormItem>
                <FormItem label="Apgar Score">
                  <Input className="h-11 rounded-xl" value={form.apgar_score} onChange={(e) => set("apgar_score", e.target.value)} />
                </FormItem>
                <FormItem label="Breastfeeding">
                  <Input className="h-11 rounded-xl" value={form.breastfeeding} onChange={(e) => set("breastfeeding", e.target.value)} />
                </FormItem>
              </div>
            </section>
          )}
        </div>
        <DialogFooter className="p-8 bg-slate-50/50 border-t border-slate-100">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11 px-8 rounded-xl">Cancel</Button>
          <Button onClick={onSubmit} disabled={saving} className="h-11 px-10 rounded-xl shadow-lg shadow-primary/20">
            {saving ? "Saving..." : "Save Patient Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
