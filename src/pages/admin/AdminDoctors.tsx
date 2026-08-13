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
import { Plus, Pencil, Trash2, Upload, Loader2, ListChecks, Save, X, CalendarClock, CalendarPlus, Search, Filter, UserRound, Zap } from "lucide-react";
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
    setLoading(true);
    const { data } = await supabase.from("doctors")
      .select("*, specialties(name), clinics(name)")
      .order("created_at", { ascending: false });
    setRows((data as any) || []);
    setLoading(false);
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Doctors</h1>
          <p className="text-muted-foreground mt-1">Manage the doctor directory</p>
        </div>
        <div className="flex items-center gap-2">
          {bulk ? (
            <>
              <Button variant="outline" onClick={cancelBulk} disabled={savingBulk} className="rounded-xl">
                <X className="w-4 h-4 mr-2" />Cancel
              </Button>
              <Button onClick={saveBulk} disabled={savingBulk} className="rounded-xl bg-gradient-primary shadow-lg shadow-primary/20">
                {savingBulk ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save All
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={startBulk} disabled={rows.length === 0} className="rounded-xl">
                <ListChecks className="w-4 h-4 mr-2" />Bulk Edit
              </Button>
              <Button onClick={openNew} className="rounded-xl bg-gradient-primary shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" />Add Doctor
              </Button>
            </>
          )}
        </div>
      </div>

      {!bulk && (
        <div className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-card/50 border border-border/50 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search doctors..." 
              className="pl-9 rounded-xl bg-background border-border/60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
              <SelectTrigger className="w-[160px] rounded-xl bg-background border-border/60">
                <Filter className="w-3.5 h-3.5 mr-2 opacity-60" />
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px] rounded-xl bg-background border-border/60">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {bulk ? (
        <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
          <div className="p-4 bg-muted/30 border-b">
            <p className="text-sm text-muted-foreground">
              Edit names and photos below, then click <span className="font-semibold text-foreground">Save All</span>.
            </p>
          </div>
          <div className="divide-y divide-border">
            {rows.map((d) => {
              const draft = drafts[d.id] || { full_name: d.full_name, avatar_url: d.avatar_url };
              return (
                <div key={d.id} className="p-4 flex items-center gap-4 hover:bg-muted/10 transition-colors">
                  <div className="relative">
                    <img
                      src={draft.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.id}`}
                      className="w-12 h-12 rounded-xl object-cover bg-muted flex-shrink-0 border border-border/50 shadow-sm" alt=""
                    />
                    {bulkUploading === d.id && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-xl">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <Input
                    value={draft.full_name}
                    onChange={(e) =>
                      setDrafts((p) => ({ ...p, [d.id]: { ...draft, full_name: e.target.value } }))
                    }
                    className="flex-1 rounded-xl"
                  />
                  <Button variant="outline" size="sm" asChild className="rounded-xl h-10 px-4 cursor-pointer">
                    <label>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => e.target.files?.[0] && bulkUpload(d.id, e.target.files[0])} />
                      <Upload className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline text-xs">Photo</span>
                    </label>
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <>
          {loading ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="rounded-3xl border-border/60 bg-card overflow-hidden h-[400px]">
                  <div className="aspect-[4/3] bg-muted animate-pulse" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 w-3/4 bg-muted animate-pulse rounded-lg" />
                    <div className="h-4 w-1/2 bg-muted animate-pulse rounded-lg" />
                    <div className="pt-4 flex justify-between">
                      <div className="h-9 w-24 bg-muted animate-pulse rounded-xl" />
                      <div className="flex gap-2">
                        <div className="h-9 w-9 bg-muted animate-pulse rounded-xl" />
                        <div className="h-9 w-9 bg-muted animate-pulse rounded-xl" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredRows.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {filteredRows.map((d) => (
                <Card key={d.id} className="group rounded-3xl border-border/60 bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img 
                      src={d.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.id}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt={d.full_name} 
                    />
                    <div className="absolute top-4 right-4">
                      {d.is_available ? (
                        <Badge className="bg-positive/10 text-positive border-positive/20 backdrop-blur-md rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-positive mr-2 animate-pulse" />
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-background/80 border-border/50 backdrop-blur-md rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Unavailable
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-xl leading-tight text-foreground">{d.full_name}</h3>
                        {d.specialties?.name && (
                          <Badge variant="secondary" className="rounded-lg text-[10px] font-bold h-5 px-1.5 py-0 bg-primary/5 text-primary border-primary/10">
                            {d.specialties.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground mt-2">
                        <p className="flex items-center gap-2">
                          <span className="font-medium text-foreground/80">{d.clinics?.name || "No clinic"}</span>
                        </p>
                        <p className="flex items-center gap-2 text-xs">
                          <Zap className="w-3.5 h-3.5 text-primary/60" />
                          <span>{d.experience_years || 0} years experience</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-border/40">
                      <Link to={`/booking?doctor=${d.id}`}>
                        <Button size="sm" className="rounded-xl px-4 bg-gradient-primary shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all font-semibold text-xs h-9">
                          <CalendarPlus className="w-3.5 h-3.5 mr-2" />
                          Appointment
                        </Button>
                      </Link>
                      <div className="flex items-center gap-1.5">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 rounded-xl bg-muted/30 hover:bg-primary/5 hover:text-primary transition-colors"
                          onClick={() => setScheduleFor(d)} 
                          title="Manage schedule"
                        >
                          <CalendarClock className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 rounded-xl bg-muted/30 hover:bg-primary/5 hover:text-primary transition-colors"
                          onClick={() => openEdit(d)}
                          title="Edit doctor"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 rounded-xl bg-muted/30 hover:bg-destructive/5 hover:text-destructive transition-colors"
                          onClick={() => remove(d.id)}
                          title="Delete doctor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-border/60">
              <div className="w-20 h-20 rounded-full bg-muted/40 flex items-center justify-center mb-6">
                <UserRound className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">No doctors found</h2>
              <p className="text-muted-foreground max-w-sm mb-8">
                {search || filterSpecialty !== "all" || filterStatus !== "all" 
                  ? "We couldn't find any doctors matching your search filters. Try adjusting your criteria."
                  : "Add your first doctor to start building your clinic directory."}
              </p>
              <Button onClick={openNew} className="rounded-xl bg-gradient-primary px-8 py-6 h-auto text-lg shadow-xl shadow-primary/20 transition-all hover:scale-105">
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Doctor
              </Button>
            </div>
          )}
        </>
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
