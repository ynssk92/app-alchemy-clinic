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
    dob: "",
    gender: "",
    blood_group: "",
    address_1: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    if (!open) return;
    (async () => {
      console.log("EditPatientDialog opened with intakeId:", intakeIdProp, "profileId:", profileId);
      let data: any = null;
      
      // Prioritize the new 'patients' table
      if (intakeIdProp) {
        const { data: patient, error } = await supabase
          .from("patients")
          .select(`
            *,
            patient_addresses(*),
            patient_medical_history(*),
            patient_notes(*)
          `)
          .eq("id", intakeIdProp)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching from patients table:", error);
        } else if (patient) {
          console.log("Found patient in 'patients' table:", patient);
          data = {
            id: patient.id,
            first_name: patient.first_name,
            last_name: patient.last_name,
            email: patient.email,
            phone: patient.phone,
            dob: patient.dob,
            gender: patient.gender,
            blood_group: patient.patient_medical_history?.[0]?.blood_group,
            address_1: patient.patient_addresses?.[0]?.street_address,
            city: patient.patient_addresses?.[0]?.city,
            country: patient.patient_addresses?.[0]?.country,
            full_name: `${patient.first_name} ${patient.last_name}`,
            user_id: patient.user_id
          };
        }
      }

      // Fallback to legacy patient_intake if not found or no ID
      if (!data) {
        const query = intakeIdProp 
          ? supabase.from("patient_intake").select("*").eq("id", intakeIdProp)
          : profileId 
            ? supabase.from("patient_intake").select("*").eq("user_id", profileId)
            : null;

        if (query) {
          const { data: intake, error } = await query.maybeSingle();
          if (error) console.error("Error fetching from patient_intake:", error);
          if (intake) {
            console.log("Found patient in 'patient_intake' table:", intake);
            data = intake;
          }
        }
      }

      // Profile name fallback
      let profileName = "";
      let profilePhone = "";
      if (profileId || data?.user_id) {
        const { data: p } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", profileId || data?.user_id)
          .maybeSingle();
        profileName = p?.full_name || "";
        profilePhone = p?.phone || "";
      }

      if (data) {
        setIntakeId(data.id);
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          full_name: profileName || data.full_name || `${data.first_name} ${data.last_name}`.trim(),
          email: data.email || "",
          phone: profilePhone || data.phone || "",
          dob: data.dob || "",
          gender: data.gender || "",
          blood_group: data.blood_group || "",
          address_1: data.address_1 || data.street_address || "",
          city: data.city || "",
          country: data.country || "",
        });
      }
    })();
  }, [open, profileId, intakeIdProp]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async () => {
    setSaving(true);
    console.log("Submitting patient update for intakeId:", intakeId, "payload:", form);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Update profile (if patient is registered)
      if (profileId) {
        const { error: pErr } = await supabase
          .from("profiles")
          .update({
            full_name: form.full_name.trim() || null,
            phone: form.phone.trim() || null,
          })
          .eq("id", profileId);
        if (pErr) throw pErr;
      }

      const parts = (form.full_name || "").trim().split(/\s+/);
      const derivedFirst = form.first_name || parts.shift() || "Patient";
      const derivedLast = form.last_name || parts.join(" ") || "-";

      // 1. Update 'patients' table (The new EMR source of truth)
      if (intakeId) {
        const { error: patientErr } = await supabase.from("patients").update({
          first_name: derivedFirst,
          last_name: derivedLast,
          email: form.email,
          phone: form.phone,
          dob: form.dob || null,
          gender: form.gender,
        }).eq("id", intakeId);
        
        if (patientErr) console.error("Error updating 'patients' table:", patientErr);

        // Update related tables in parallel
        await Promise.all([
          supabase.from("patient_addresses").upsert({
            patient_id: intakeId,
            street_address: form.address_1,
            city: form.city,
            country: form.country,
          }, { onConflict: 'patient_id' }),
          supabase.from("patient_medical_history").upsert({
            patient_id: intakeId,
            blood_group: form.blood_group,
          }, { onConflict: 'patient_id' })
        ]);
      }

      // 2. Backward compatibility: update legacy patient_intake table
      const legacyPayload: any = {
        first_name: derivedFirst,
        last_name: derivedLast,
        email: form.email || (profileId ? `${profileId}@placeholder.local` : "unknown@placeholder.local"),
        phone: form.phone || null,
        dob: form.dob || null,
        gender: form.gender || null,
        blood_group: form.blood_group || null,
        address_1: form.address_1 || null,
        city: form.city || null,
        country: form.country || null,
      };

      if (intakeId) {
        const { error: legacyErr } = await supabase.from("patient_intake").update(legacyPayload).eq("id", intakeId);
        if (legacyErr) console.warn("Legacy patient_intake update skipped or failed:", legacyErr.message);
      } else if (profileId) {
        const { error: legacyErr } = await supabase.from("patient_intake").insert({
          ...legacyPayload,
          user_id: profileId,
          created_by: user?.id ?? null,
        });
        if (legacyErr) console.warn("Legacy patient_intake insert failed:", legacyErr.message);
      }

      toast({ title: "Patient updated successfully" });
      onOpenChange(false);
      onSaved?.();
    } catch (e: any) {
      console.error("Critical update error:", e);
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const isRegistered = !!profileId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit patient</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {isRegistered ? (
            <div className="col-span-2">
              <Label>Full name</Label>
              <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
            </div>
          ) : (
            <>
              <div>
                <Label>First name</Label>
                <Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} />
              </div>
              <div>
                <Label>Last name</Label>
                <Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} />
              </div>
            </>
          )}
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} disabled={isRegistered} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div>
            <Label>Date of birth</Label>
            <Input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
          </div>
          <div>
            <Label>Gender</Label>
            <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Blood group</Label>
            <Select value={form.blood_group} onValueChange={(v) => set("blood_group", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>Address</Label>
            <Input value={form.address_1} onChange={(e) => set("address_1", e.target.value)} />
          </div>
          <div>
            <Label>City</Label>
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div>
            <Label>Country</Label>
            <Input value={form.country} onChange={(e) => set("country", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit} disabled={saving} className="bg-gradient-primary text-primary-foreground">
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
