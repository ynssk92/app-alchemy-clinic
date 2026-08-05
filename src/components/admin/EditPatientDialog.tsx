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
      let intake: any = null;
      if (intakeIdProp) {
        const { data } = await supabase
          .from("patient_intake")
          .select("id, first_name, last_name, email, phone, dob, gender, blood_group, address_1, city, country")
          .eq("id", intakeIdProp)
          .maybeSingle();
        intake = data;
      } else if (profileId) {
        const { data } = await supabase
          .from("patient_intake")
          .select("id, first_name, last_name, email, phone, dob, gender, blood_group, address_1, city, country")
          .eq("user_id", profileId)
          .maybeSingle();
        intake = data;
      }
      setIntakeId(intake?.id ?? null);

      let profileName = "";
      let profilePhone = "";
      if (profileId) {
        const { data: p } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", profileId)
          .maybeSingle();
        profileName = p?.full_name || "";
        profilePhone = p?.phone || "";
      }

      const composedFullName =
        profileName ||
        [intake?.first_name, intake?.last_name].filter(Boolean).join(" ") ||
        "";

      setForm({
        first_name: intake?.first_name || "",
        last_name: intake?.last_name || "",
        full_name: composedFullName,
        email: intake?.email || "",
        phone: profilePhone || intake?.phone || "",
        dob: intake?.dob || "",
        gender: intake?.gender || "",
        blood_group: intake?.blood_group || "",
        address_1: intake?.address_1 || "",
        city: intake?.city || "",
        country: intake?.country || "",
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
