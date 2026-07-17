import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Doctor = {
  id: string; full_name: string; bio: string | null; avatar_url: string | null;
  experience_years: number | null; rating: number | null; is_available: boolean;
  specialty_id: string | null; clinic_id: string | null;
  specialties?: { name: string } | null; clinics?: { name: string } | null;
};

const empty = { full_name: "", bio: "", avatar_url: "", experience_years: 0, rating: 5, is_available: true, specialty_id: "", clinic_id: "" };

const AdminDoctors = () => {
  const [rows, setRows] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<{ id: string; name: string }[]>([]);
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>(empty);

  const load = async () => {
    const { data } = await supabase.from("doctors")
      .select("*, specialties(name), clinics(name)")
      .order("created_at", { ascending: false });
    setRows((data as any) || []);
  };

  useEffect(() => {
    load();
    supabase.from("specialties").select("id, name").then(({ data }) => setSpecialties(data || []));
    supabase.from("clinics").select("id, name").then(({ data }) => setClinics(data || []));
  }, []);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (d: Doctor) => {
    setEditing(d.id);
    setForm({
      full_name: d.full_name, bio: d.bio || "", avatar_url: d.avatar_url || "",
      experience_years: d.experience_years || 0, rating: d.rating || 5,
      is_available: d.is_available, specialty_id: d.specialty_id || "", clinic_id: d.clinic_id || "",
    });
    setOpen(true);
  };

  const save = async () => {
    const payload = {
      ...form,
      specialty_id: form.specialty_id || null,
      clinic_id: form.clinic_id || null,
      avatar_url: form.avatar_url || null,
    };
    const { error } = editing
      ? await supabase.from("doctors").update(payload).eq("id", editing)
      : await supabase.from("doctors").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Doctor updated" : "Doctor added");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this doctor?")) return;
    const { error } = await supabase.from("doctors").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Doctors</h1>
          <p className="text-muted-foreground">Manage the doctor directory</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />Add Doctor</Button>
      </div>

      <div className="grid gap-4">
        {rows.map((d) => (
          <Card key={d.id} className="p-4 flex items-center gap-4 border-border bg-card">
            <img src={d.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.id}`}
              className="w-14 h-14 rounded-lg bg-muted" alt="" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{d.full_name}</h3>
                {d.specialties?.name && <Badge variant="secondary">{d.specialties.name}</Badge>}
                {d.is_available ? <Badge>Available</Badge> : <Badge variant="outline">Unavailable</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                {d.clinics?.name || "No clinic"} • {d.experience_years || 0} years
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => openEdit(d)}><Pencil className="w-4 h-4" /></Button>
            <Button size="sm" variant="outline" onClick={() => remove(d.id)}><Trash2 className="w-4 h-4" /></Button>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-muted-foreground text-center py-8">No doctors yet.</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Doctor" : "Add Doctor"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Full Name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Specialty</Label>
                <Select value={form.specialty_id} onValueChange={(v) => setForm({ ...form, specialty_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{specialties.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Clinic</Label>
                <Select value={form.clinic_id} onValueChange={(v) => setForm({ ...form, clinic_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{clinics.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Experience (years)</Label><Input type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: +e.target.value })} /></div>
              <div><Label>Rating</Label><Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: +e.target.value })} /></div>
            </div>
            <div><Label>Avatar URL</Label><Input value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} /></div>
            <div><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_available} onCheckedChange={(v) => setForm({ ...form, is_available: v })} />
              <Label>Available for booking</Label>
            </div>
          </div>
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDoctors;
