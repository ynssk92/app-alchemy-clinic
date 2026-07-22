import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AdminAppointmentNew = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<{ id: string; full_name: string }[]>([]);
  const [patients, setPatients] = useState<{ id: string; full_name: string | null }[]>([]);
  const [form, setForm] = useState({
    patient_id: "", doctor_id: "", appointment_date: "", appointment_time: "", reason: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("doctors").select("id, full_name").order("full_name")
      .then(({ data }) => setDoctors(data || []));
    supabase.from("profiles").select("id, full_name").order("full_name")
      .then(({ data }) => setPatients(data || []));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_id || !form.doctor_id || !form.appointment_date || !form.appointment_time) {
      return toast.error("Please fill all required fields");
    }
    setSaving(true);
    const { error } = await supabase.from("appointments").insert({
      ...form, status: "upcoming",
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Appointment created");
    navigate("/admin/appointments");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-1">New Appointment</h1>
      <p className="text-muted-foreground mb-8">Manually schedule an appointment for a patient</p>
      <Card className="p-6">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Patient *</Label>
            <Select value={form.patient_id} onValueChange={(v) => setForm({ ...form, patient_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.full_name || p.id.slice(0, 8)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Doctor *</Label>
            <Select value={form.doctor_id} onValueChange={(v) => setForm({ ...form, doctor_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date *</Label>
              <Input type="date" value={form.appointment_date}
                onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} />
            </div>
            <div>
              <Label>Time *</Label>
              <Input type="time" value={form.appointment_time}
                onChange={(e) => setForm({ ...form, appointment_time: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Reason</Label>
            <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Consultation, cleaning, follow-up…" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="bg-gradient-primary text-primary-foreground">
              {saving ? "Creating…" : "Create Appointment"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/admin/appointments")}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminAppointmentNew;
