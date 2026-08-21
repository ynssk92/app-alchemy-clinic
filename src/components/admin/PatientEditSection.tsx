import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Props = {
  patient: any;
  onSaved: () => void;
};

export const PatientEditSection = ({ patient, onSaved }: Props) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: patient.first_name || "",
    last_name: patient.last_name || "",
    email: patient.email || "",
    phone: patient.phone || "",
    nationality: patient.nationality || "",
    identity_document_type: patient.identity_document_type || "",
    identity_document_number: patient.identity_document_number || "",
    dob: patient.dob || "",
    gender: patient.gender || "",
    blood_group: patient.blood_group || "",
    address_1: patient.address_1 || "",
    city: patient.city || "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("patient_intake")
        .update({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
          nationality: form.nationality,
          identity_document_type: form.identity_document_type,
          identity_document_number: form.identity_document_number,
          dob: form.dob,
          gender: form.gender,
          blood_group: form.blood_group,
          address_1: form.address_1,
          city: form.city,
        })
        .eq("id", patient.intakeId);
      
      if (error) throw error;
      toast({ title: "Patient information updated successfully." });
      setIsEditing(false);
      onSaved();
    } catch (e: any) {
      toast({ title: "Unable to update patient information.", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!isEditing) {
    return <Button onClick={() => setIsEditing(true)}>Edit Patient</Button>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">First Name</Label>
          <Input 
            value={form.first_name} 
            onChange={(e) => setForm({...form, first_name: e.target.value})} 
            className="h-11 border-slate-200 focus:border-primary focus:ring-primary/5 transition-all"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Name</Label>
          <Input 
            value={form.last_name} 
            onChange={(e) => setForm({...form, last_name: e.target.value})} 
            className="h-11 border-slate-200 focus:border-primary focus:ring-primary/5 transition-all"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</Label>
          <Input 
            value={form.email} 
            onChange={(e) => setForm({...form, email: e.target.value})} 
            className="h-11 border-slate-200 focus:border-primary focus:ring-primary/5 transition-all"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</Label>
          <Input 
            value={form.phone} 
            onChange={(e) => setForm({...form, phone: e.target.value})} 
            className="h-11 border-slate-200 focus:border-primary focus:ring-primary/5 transition-all"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nationality</Label>
          <Input 
            value={form.nationality} 
            onChange={(e) => setForm({...form, nationality: e.target.value})} 
            className="h-11 border-slate-200 focus:border-primary focus:ring-primary/5 transition-all"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Doc Type</Label>
            <Select value={form.identity_document_type} onValueChange={(v) => setForm({...form, identity_document_type: v})}>
              <SelectTrigger className="h-11 border-slate-200"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CIN">CIN</SelectItem>
                <SelectItem value="Passport">Passport</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Doc Number</Label>
            <Input 
              value={form.identity_document_number} 
              onChange={(e) => setForm({...form, identity_document_number: e.target.value})} 
              className="h-11 border-slate-200 focus:border-primary focus:ring-primary/5 transition-all"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">DOB</Label>
          <Input 
            type="date" 
            value={form.dob} 
            onChange={(e) => setForm({...form, dob: e.target.value})} 
            className="h-11 border-slate-200 focus:border-primary focus:ring-primary/5 transition-all"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</Label>
          <Select value={form.gender} onValueChange={(v) => setForm({...form, gender: v})}>
            <SelectTrigger className="h-11 border-slate-200"><SelectValue placeholder="Gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
      </div>
    </div>
  );
};
