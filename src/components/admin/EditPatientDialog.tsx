import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
      if (intakeIdProp) {
        const { data } = await supabase
          .from("patient_intake")
          .select(`
            id, first_name, last_name, email, phone, dob, gender, blood_group, address_1, city, country, nationality, identity_document_type, identity_document_number,
            patient_type, languages, profession, family_situation,
            emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
            insurance_name, insurance_number, insurance_policy, insurance_status, insurance_notes,
            rhesus, allergies, chronic_diseases, current_medications, medical_history, family_history, surgical_history, previous_hospitalizations,
            birth_type, birth_weight, birth_height, apgar_score, breastfeeding, birth_complications, psychomotor_development, development_notes
          `)
          .eq("id", intakeIdProp)
          .maybeSingle();
        intake = data;
      } else if (profileId) {
        const { data } = await supabase
          .from("patient_intake")
          .select(`
            id, first_name, last_name, email, phone, dob, gender, blood_group, address_1, city, country, nationality, identity_document_type, identity_document_number,
            patient_type, languages, profession, family_situation,
            emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
            insurance_name, insurance_number, insurance_policy, insurance_status, insurance_notes,
            rhesus, allergies, chronic_diseases, current_medications, medical_history, family_history, surgical_history, previous_hospitalizations,
            birth_type, birth_weight, birth_height, apgar_score, breastfeeding, birth_complications, psychomotor_development, development_notes
          `)
          .eq("user_id", profileId)
          .maybeSingle();
        intake = data;
      }
      setIntakeId(intake?.id ?? null);

      let profileData: any = null;
      if (profileId) {
        const { data: p } = await supabase
          .from("profiles")
          .select(`
            full_name, phone, nationality, identity_document_type, identity_document_number,
            patient_type, languages, profession, family_situation,
            emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
            insurance_name, insurance_number, insurance_policy, insurance_status, insurance_notes,
            rhesus
          `)
          .eq("id", profileId)
          .maybeSingle();
        profileData = p;
      }

      const composedFullName =
        profileData?.full_name ||
        [intake?.first_name, intake?.last_name].filter(Boolean).join(" ") ||
        "";

      setForm({
        first_name: intake?.first_name || "",
        last_name: intake?.last_name || "",
        full_name: composedFullName,
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
        // New fields
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

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async () => {
    setSaving(true);
    try {
      // Update profile (if patient is registered)
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

      // Derive first/last from full name when editing a registered patient
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
      };

      if (intakeId) {
        const { error } = await supabase.from("patient_intake").update(intakePayload).eq("id", intakeId);
        if (error) throw error;
      } else if (profileId) {
        const { data: authUser } = await supabase.auth.getUser();
        const { error } = await supabase.from("patient_intake").insert({
          ...intakePayload,
          user_id: profileId,
          created_by: authUser.user?.id ?? null,
        });
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

  const isRegistered = !!profileId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 border border-slate-100 shadow-2xl rounded-2xl bg-white">
        <div className="bg-white px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                {isRegistered ? "Registered Patient File" : "Guest Intake Record"}
              </DialogTitle>
            </div>
            <p className="text-sm text-slate-500 font-medium pl-12">
              Update {form.full_name || "patient"} information
            </p>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-10">
          {/* 1. PATIENT IDENTITY */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold">01</span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Patient Identity</h3>
            </div>
            <div className="h-px bg-slate-100 w-full" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {isRegistered ? (
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">Full Name *</Label>
                  <Input 
                    value={form.full_name} 
                    onChange={(e) => set("full_name", e.target.value)}
                    className="h-[46px] rounded-[10px] bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5 transition-all"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-500 uppercase">First Name *</Label>
                    <Input 
                      value={form.first_name} 
                      onChange={(e) => set("first_name", e.target.value)}
                      className="h-[46px] rounded-[10px] bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-500 uppercase">Last Name *</Label>
                    <Input 
                      value={form.last_name} 
                      onChange={(e) => set("last_name", e.target.value)}
                      className="h-[46px] rounded-[10px] bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5 transition-all"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase">Email Address</Label>
                <Input 
                  type="email" 
                  value={form.email} 
                  onChange={(e) => set("email", e.target.value)} 
                  disabled={isRegistered}
                  className="h-[46px] rounded-[10px] bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5 transition-all disabled:opacity-70 disabled:bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase">Phone Number</Label>
                <Input 
                  value={form.phone} 
                  onChange={(e) => set("phone", e.target.value)}
                  className="h-[46px] rounded-[10px] bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5 transition-all"
                  placeholder="+212 ..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase">Nationality</Label>
                <Input 
                  value={form.nationality} 
                  onChange={(e) => set("nationality", e.target.value)}
                  className="h-[46px] rounded-[10px] bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5 transition-all"
                  placeholder="e.g. Moroccan"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">Doc Type</Label>
                  <Select value={form.identity_document_type} onValueChange={(v) => set("identity_document_type", v)}>
                  <SelectTrigger className="h-[46px] rounded-[10px] bg-white border-slate-200 focus:ring-indigo-500/5 transition-all">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CIN">CIN</SelectItem>
                      <SelectItem value="Passport">Passport</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">Doc Number</Label>
                  <Input 
                    value={form.identity_document_number} 
                    onChange={(e) => set("identity_document_number", e.target.value)}
                    className="h-[46px] rounded-[10px] bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5 transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 2. PERSONAL INFORMATION */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold">02</span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Personal Information</h3>
            </div>
            <div className="h-px bg-slate-100 w-full" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase">Date of Birth</Label>
                <Input 
                  type="date" 
                  value={form.dob} 
                  onChange={(e) => set("dob", e.target.value)}
                  className="h-[46px] rounded-[10px] bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase">Gender</Label>
                <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                  <SelectTrigger className="h-[46px] rounded-[10px] bg-white border-slate-200 focus:ring-indigo-500/5 transition-all">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase">Blood Group</Label>
                <Select value={form.blood_group} onValueChange={(v) => set("blood_group", v)}>
                  <SelectTrigger className="h-[46px] rounded-[10px] bg-white border-slate-200 focus:ring-indigo-500/5 transition-all">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* 3. ADDRESS */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold">03</span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Address</h3>
            </div>
            <div className="h-px bg-slate-100 w-full" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase">Home Address</Label>
                <Input 
                  value={form.address_1} 
                  onChange={(e) => set("address_1", e.target.value)}
                  className="h-[46px] rounded-[10px] bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5 transition-all"
                  placeholder="Street name, building number..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase">City</Label>
                <Input 
                  value={form.city} 
                  onChange={(e) => set("city", e.target.value)}
                  className="h-[46px] rounded-[10px] bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase">Country</Label>
                <Input 
                  value={form.country} 
                  onChange={(e) => set("country", e.target.value)}
                  className="h-[46px] rounded-[10px] bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5 transition-all"
                />
              </div>
            </div>
          </section>
        </div>

        <DialogFooter className="bg-slate-50/50 border-t border-slate-100 p-6 sm:justify-end gap-3 rounded-b-2xl">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="h-11 px-6 font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Button>
          <Button 
            onClick={onSubmit} 
            disabled={saving} 
            className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm transition-all active:scale-95"
          >
            {saving ? "Updating Patient..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
