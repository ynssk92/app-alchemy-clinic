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
import { Plus, Pencil, Trash2, Upload, Loader2, ListChecks, Save, X, CalendarClock, CalendarPlus, Search, Filter, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import DoctorScheduleDialog from "@/components/admin/DoctorScheduleDialog";


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
  const [uploading, setUploading] = useState(false);
  const [scheduleFor, setScheduleFor] = useState<Doctor | null>(null);
  const [search, setSearch] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const filteredRows = rows.filter(r => {
    const matchesSearch = r.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = filterSpecialty === "all" || r.specialty_id === filterSpecialty;
    const matchesStatus = filterStatus === "all" || (filterStatus === "available" ? r.is_available : !r.is_available);
    return matchesSearch && matchesSpecialty && matchesStatus;
  });



  const uploadAvatar = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("doctor-avatars").upload(path, file, {
        cacheControl: "3600", upsert: false,
      });
      if (upErr) throw upErr;
      const { data, error: urlErr } = await supabase.storage.from("doctor-avatars")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (urlErr) throw urlErr;
      setForm((f: any) => ({ ...f, avatar_url: data.signedUrl }));
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

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

  // ---- Bulk edit ----
  const [bulk, setBulk] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, { full_name: string; avatar_url: string | null }>>({});
  const [bulkUploading, setBulkUploading] = useState<string | null>(null);
  const [savingBulk, setSavingBulk] = useState(false);

  const startBulk = () => {
    const d: Record<string, any> = {};
    rows.forEach((r) => (d[r.id] = { full_name: r.full_name, avatar_url: r.avatar_url }));
    setDrafts(d);
    setBulk(true);
  };
  const cancelBulk = () => { setBulk(false); setDrafts({}); };

  const bulkUpload = async (id: string, file: File) => {
    setBulkUploading(id);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("doctor-avatars").upload(path, file);
      if (upErr) throw upErr;
      const { data, error: urlErr } = await supabase.storage.from("doctor-avatars")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (urlErr) throw urlErr;
      setDrafts((p) => ({ ...p, [id]: { ...p[id], avatar_url: data.signedUrl } }));
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setBulkUploading(null);
    }
  };

  const saveBulk = async () => {
    setSavingBulk(true);
    const changed = rows.filter((r) => {
      const d = drafts[r.id];
      return d && (d.full_name !== r.full_name || (d.avatar_url || null) !== (r.avatar_url || null));
    });
    if (changed.length === 0) {
      toast.info("No changes to save");
      setSavingBulk(false);
      return;
    }
    let ok = 0;
    for (const r of changed) {
      const d = drafts[r.id];
      const { error } = await supabase.from("doctors")
        .update({ full_name: d.full_name.trim(), avatar_url: d.avatar_url || null })
        .eq("id", r.id);
      if (!error) ok++;
    }
    toast.success(`Updated ${ok} of ${changed.length} doctors`);
    setSavingBulk(false);
    setBulk(false);
    setDrafts({});
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Doctors</h1>
          <p className="text-muted-foreground">Manage the doctor directory</p>
        </div>
        <div className="flex items-center gap-2">
          {bulk ? (
            <>
              <Button variant="outline" onClick={cancelBulk} disabled={savingBulk}>
                <X className="w-4 h-4 mr-2" />Cancel
              </Button>
              <Button onClick={saveBulk} disabled={savingBulk}>
                {savingBulk ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save All
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={startBulk} disabled={rows.length === 0}>
                <ListChecks className="w-4 h-4 mr-2" />Bulk Edit
              </Button>
              <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />Add Doctor</Button>
            </>
          )}
        </div>
      </div>

      {bulk ? (
        <Card className="p-4 border-border bg-card">
          <p className="text-sm text-muted-foreground mb-4">
            Edit names and photos below, then click <span className="font-medium text-foreground">Save All</span>.
          </p>
          <div className="divide-y divide-border">
            {rows.map((d) => {
              const draft = drafts[d.id] || { full_name: d.full_name, avatar_url: d.avatar_url };
              return (
                <div key={d.id} className="py-3 flex items-center gap-3">
                  <img
                    src={draft.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.id}`}
                    className="w-12 h-12 rounded-lg object-cover bg-muted flex-shrink-0" alt=""
                  />
                  <Input
                    value={draft.full_name}
                    onChange={(e) =>
                      setDrafts((p) => ({ ...p, [d.id]: { ...draft, full_name: e.target.value } }))
                    }
                    className="flex-1 min-w-0"
                  />
                  <label>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => e.target.files?.[0] && bulkUpload(d.id, e.target.files[0])} />
                    <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-md cursor-pointer hover:bg-muted text-sm">
                      {bulkUploading === d.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Upload className="w-4 h-4" />}
                      <span>Photo</span>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rows.map((d) => (
            <Card key={d.id} className="p-4 flex items-center gap-4 border-border bg-card">
              <img src={d.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.id}`}
                className="w-14 h-14 rounded-lg bg-muted object-cover" alt="" />
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
              <Link to={`/booking?doctor=${d.id}`}>
                <Button size="sm" title="Book appointment">
                  <CalendarPlus className="w-4 h-4" />
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={() => setScheduleFor(d)} title="Manage schedule">
                <CalendarClock className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => openEdit(d)}><Pencil className="w-4 h-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => remove(d.id)}><Trash2 className="w-4 h-4" /></Button>
            </Card>

          ))}
          {rows.length === 0 && <p className="text-muted-foreground text-center py-8">No doctors yet.</p>}
        </div>
      )}

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
            <div>
              <Label>Doctor Photo</Label>
              <div className="flex items-center gap-3 mt-2">
                {form.avatar_url && (
                  <img src={form.avatar_url} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />
                )}
                <label className="flex-1">
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span className="text-sm">{uploading ? "Uploading..." : "Upload image"}</span>
                  </div>
                </label>
              </div>
              <Input className="mt-2" placeholder="…or paste image URL"
                value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} />
            </div>
            <div><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_available} onCheckedChange={(v) => setForm({ ...form, is_available: v })} />
              <Label>Available for booking</Label>
            </div>
          </div>
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <DoctorScheduleDialog
        doctorId={scheduleFor?.id ?? null}
        doctorName={scheduleFor?.full_name}
        onClose={() => setScheduleFor(null)}
      />
    </div>

  );
};

export default AdminDoctors;
