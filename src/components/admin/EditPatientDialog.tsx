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
  patientId: string;
  onSaved?: () => void;
};

export const EditPatientDialog = ({ open, onOpenChange, patientId, onSaved }: Props) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    dob: "",
    gender: "",
    blood_group: "",
    address_1: "",
    city: "",
    country: "",
  });
  const [intakeId, setIntakeId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !patientId) return;
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", patientId)
        .maybeSingle();
      const { data: intake } = await supabase
        .from("patient_intake")
        .select("id, dob, gender, blood_group, address_1, city, country")
        .eq("user_id", patientId)
        .maybeSingle();
      setIntakeId(intake?.id ?? null);
      setForm({
        full_name: p?.full_name || "",
        phone: p?.phone || "",
        dob: intake?.dob || "",
        gender: intake?.gender || "",
        blood_group: intake?.blood_group || "",
        address_1: intake?.address_1 || "",
        city: intake?.city || "",
        country: intake?.country || "",
      });
    })();
  }, [open, patientId]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async () => {
    setSaving(true);
    const { error: pErr } = await supabase
      .from("profiles")
      .update({ full_name: form.full_name.trim() || null, phone: form.phone.trim() || null })
      .eq("id", patientId);
    if (pErr) {
      toast({ title: "Update failed", description: pErr.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    const intakePayload: any = {
      dob: form.dob || null,
      gender: form.gender || null,
      blood_group: form.blood_group || null,
      address_1: form.address_1 || null,
      city: form.city || null,
      country: form.country || null,
    };

    if (intakeId) {
      const { error } = await supabase.from("patient_intake").update(intakePayload).eq("id", intakeId);
      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
    } else {
      const parts = (form.full_name || "").trim().split(" ");
      const first = parts.shift() || "Patient";
      const last = parts.join(" ") || "-";
      const { data: authUser } = await supabase.auth.getUser();
      const { error } = await supabase.from("patient_intake").insert({
        ...intakePayload,
        user_id: patientId,
        first_name: first,
        last_name: last,
        email: `${patientId}@placeholder.local`,
        phone: form.phone || null,
        created_by: authUser.user?.id ?? null,
      });
      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    toast({ title: "Patient updated" });
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit patient</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Full name</Label>
            <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
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
