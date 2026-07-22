import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminDoctorAdd = () => {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<{ id: string; name: string }[]>([]);
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    full_name: "", bio: "", avatar_url: "", experience_years: 0, rating: 5,
    is_available: true, specialty_id: "", clinic_id: "",
  });

  useEffect(() => {
    (async () => {
      const [{ data: s }, { data: c }] = await Promise.all([
        supabase.from("specialties").select("id, name").order("name"),
        supabase.from("clinics").select("id, name").order("name"),
      ]);
      setSpecialties(s || []);
      setClinics(c || []);
    })();
  }, []);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("doctor-avatars").upload(path, file);
      if (upErr) throw upErr;
      const { data } = await supabase.storage.from("doctor-avatars").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      setForm((f: any) => ({ ...f, avatar_url: data?.signedUrl || "" }));
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.full_name.trim()) return toast.error("Name is required");
    setSaving(true);
    const { error } = await supabase.from("doctors").insert({
      full_name: form.full_name.trim(),
      bio: form.bio || null,
      avatar_url: form.avatar_url || null,
      experience_years: Number(form.experience_years) || 0,
      rating: Number(form.rating) || 5,
      is_available: form.is_available,
      specialty_id: form.specialty_id || null,
      clinic_id: form.clinic_id || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Doctor added");
    navigate("/admin/doctors");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Link to="/admin/doctors" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          Add Doctor
        </h1>
      </div>

      <Card className="p-6 border-border max-w-4xl">
        <h2 className="font-bold mb-5">Doctor information</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2 flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
              {form.avatar_url ? <img src={form.avatar_url} className="w-full h-full object-cover" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
            </div>
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
              <span className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-muted">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload photo
              </span>
            </label>
          </div>

          <div>
            <Label>Full Name *</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <Label>Experience (years)</Label>
            <Input type="number" min={0} value={form.experience_years}
              onChange={(e) => setForm({ ...form, experience_years: e.target.value })} />
          </div>

          <div>
            <Label>Specialty</Label>
            <Select value={form.specialty_id} onValueChange={(v) => setForm({ ...form, specialty_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger>
              <SelectContent>
                {specialties.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Clinic</Label>
            <Select value={form.clinic_id} onValueChange={(v) => setForm({ ...form, clinic_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select clinic" /></SelectTrigger>
              <SelectContent>
                {clinics.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Rating</Label>
            <Input type="number" min={0} max={5} step={0.1} value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })} />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Switch checked={form.is_available} onCheckedChange={(v) => setForm({ ...form, is_available: v })} />
            <Label>Available for booking</Label>
          </div>

          <div className="md:col-span-2">
            <Label>Bio</Label>
            <Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => navigate("/admin/doctors")}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-gradient-primary text-primary-foreground gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Add Doctor
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminDoctorAdd;
