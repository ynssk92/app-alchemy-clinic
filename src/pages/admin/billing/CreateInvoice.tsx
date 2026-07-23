import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2, Save, Send } from "lucide-react";
import { formatMoney } from "@/lib/currency";

type Item = { key: string; service_id: string | null; description: string; qty: number; unit_price: number; discount: number; tax: number };

const emptyItem = (): Item => ({ key: Math.random().toString(36).slice(2), service_id: null, description: "", qty: 1, unit_price: 0, discount: 0, tax: 0 });

export default function CreateInvoice() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [patientId, setPatientId] = useState<string>("");
  const [doctorId, setDoctorId] = useState<string>("");
  const [appointmentId, setAppointmentId] = useState<string>("");
  const [clinicId, setClinicId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<Item[]>([emptyItem()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, d, s, c] = await Promise.all([
        supabase.from("profiles").select("id, full_name, phone").order("full_name"),
        supabase.from("doctors").select("id, full_name").order("full_name"),
        supabase.from("services").select("id, name, price, tax_rate").eq("active", true).order("name"),
        supabase.from("clinics").select("id, name").order("name"),
      ]);
      setPatients(p.data || []);
      setDoctors(d.data || []);
      setServices(s.data || []);
      setClinics(c.data || []);
      if (c.data?.[0]) setClinicId(c.data[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!patientId) { setAppointments([]); return; }
    supabase.from("appointments").select("id, appointment_date, appointment_time, reason").eq("patient_id", patientId).order("appointment_date", { ascending: false })
      .then(({ data }) => setAppointments(data || []));
  }, [patientId]);

  const updateItem = (key: string, patch: Partial<Item>) =>
    setItems((arr) => arr.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  const setServiceOnItem = (key: string, serviceId: string) => {
    const svc = services.find((s) => s.id === serviceId);
    if (!svc) return;
    const unit_price = Number(svc.price);
    const item = items.find((i) => i.key === key);
    const qty = item?.qty ?? 1;
    const taxAmount = Math.round(((unit_price * qty) * Number(svc.tax_rate) / 100) * 100) / 100;
    updateItem(key, { service_id: serviceId, description: svc.name, unit_price, tax: taxAmount });
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + (Number(i.qty) * Number(i.unit_price)), 0);
    const discount = items.reduce((s, i) => s + Number(i.discount || 0), 0);
    const tax = items.reduce((s, i) => s + Number(i.tax || 0), 0);
    const total = subtotal - discount + tax;
    return { subtotal, discount, tax, total };
  }, [items]);

  const save = async (status: "draft" | "pending") => {
    if (!patientId) return toast.error("Select a patient");
    if (items.length === 0 || items.every((i) => !i.description)) return toast.error("Add at least one service line");
    setSaving(true);
    const { data: inv, error } = await supabase
      .from("invoices")
      .insert({
        clinic_id: clinicId || null,
        patient_id: patientId,
        doctor_id: doctorId || null,
        appointment_id: appointmentId || null,
        notes: notes || null,
        status,
        issue_date: issueDate,
        created_by: user?.id,
      })
      .select()
      .single();
    if (error || !inv) { setSaving(false); return toast.error(error?.message || "Failed"); }

    const validItems = items.filter((i) => i.description);
    const { error: itemsErr } = await supabase.from("invoice_items").insert(
      validItems.map((i) => ({
        invoice_id: inv.id,
        service_id: i.service_id,
        description: i.description,
        qty: i.qty,
        unit_price: i.unit_price,
        discount: i.discount,
        tax: i.tax,
      }))
    );
    setSaving(false);
    if (itemsErr) return toast.error(itemsErr.message);
    toast.success("Invoice created");
    navigate(`/admin/billing/invoices/${inv.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Invoice</h1>
          <p className="text-sm text-muted-foreground">Add services, discounts and taxes to build a new invoice.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => save("draft")} disabled={saving}><Save className="w-4 h-4 mr-2" />Save Draft</Button>
          <Button onClick={() => save("pending")} disabled={saving}><Send className="w-4 h-4 mr-2" />Issue Invoice</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT */}
        <Card className="p-5 space-y-4 lg:col-span-1">
          <h3 className="font-semibold">Client</h3>
          <div>
            <Label>Patient *</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>{patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Doctor</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
              <SelectContent>{doctors.map((d) => <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Appointment</Label>
            <Select value={appointmentId} onValueChange={setAppointmentId} disabled={!patientId || appointments.length === 0}>
              <SelectTrigger><SelectValue placeholder={patientId ? "Optional" : "Select patient first"} /></SelectTrigger>
              <SelectContent>{appointments.map((a) => <SelectItem key={a.id} value={a.id}>{a.appointment_date} · {a.appointment_time}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Clinic</Label>
            <Select value={clinicId} onValueChange={setClinicId}>
              <SelectTrigger><SelectValue placeholder="Select clinic" /></SelectTrigger>
              <SelectContent>{clinics.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes for this invoice" />
          </div>
        </Card>

        {/* RIGHT */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <div><Label>Invoice #</Label><Input value="Auto (INV-YYYY-000001)" disabled /></div>
              <div><Label>Date</Label><Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} /></div>
              <div><Label>Status</Label><Input value="Draft / Pending on save" disabled /></div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="p-2 font-medium">Service</th>
                    <th className="p-2 font-medium">Description</th>
                    <th className="p-2 font-medium w-20">Qty</th>
                    <th className="p-2 font-medium w-28">Price</th>
                    <th className="p-2 font-medium w-24">Discount</th>
                    <th className="p-2 font-medium w-24">Tax</th>
                    <th className="p-2 font-medium w-28 text-right">Total</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => {
                    const total = (i.qty * i.unit_price) - (i.discount || 0) + (i.tax || 0);
                    return (
                      <tr key={i.key} className="border-t align-top">
                        <td className="p-2">
                          <Select value={i.service_id || ""} onValueChange={(v) => setServiceOnItem(i.key, v)}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="Choose…" /></SelectTrigger>
                            <SelectContent>{services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </td>
                        <td className="p-2"><Input value={i.description} onChange={(e) => updateItem(i.key, { description: e.target.value })} /></td>
                        <td className="p-2"><Input type="number" step="0.01" value={i.qty} onChange={(e) => updateItem(i.key, { qty: Number(e.target.value) })} /></td>
                        <td className="p-2"><Input type="number" step="0.01" value={i.unit_price} onChange={(e) => updateItem(i.key, { unit_price: Number(e.target.value) })} /></td>
                        <td className="p-2"><Input type="number" step="0.01" value={i.discount} onChange={(e) => updateItem(i.key, { discount: Number(e.target.value) })} /></td>
                        <td className="p-2"><Input type="number" step="0.01" value={i.tax} onChange={(e) => updateItem(i.key, { tax: Number(e.target.value) })} /></td>
                        <td className="p-2 text-right font-medium">{formatMoney(total)}</td>
                        <td className="p-2">
                          <Button size="icon" variant="ghost" className="text-destructive"
                            onClick={() => setItems((arr) => arr.length > 1 ? arr.filter((x) => x.key !== i.key) : arr)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setItems((arr) => [...arr, emptyItem()])}>
              <Plus className="w-4 h-4 mr-1" />Add Row
            </Button>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-3">Summary</h3>
            <div className="space-y-2 max-w-sm ml-auto">
              <Row label="Subtotal" value={formatMoney(totals.subtotal)} />
              <Row label="Discount" value={`- ${formatMoney(totals.discount)}`} />
              <Row label="Tax" value={formatMoney(totals.tax)} />
              <div className="border-t pt-2" />
              <Row label="Grand Total" value={formatMoney(totals.total)} bold />
              <Row label="Paid" value={formatMoney(0)} />
              <Row label="Remaining" value={formatMoney(totals.total)} bold />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className={`flex justify-between text-sm ${bold ? "font-bold text-base" : ""}`}>
    <span className="text-muted-foreground">{label}</span>
    <span>{value}</span>
  </div>
);
