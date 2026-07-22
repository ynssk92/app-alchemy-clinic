import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Upload, Loader2, Save, Camera, Plus, Trash2,
  User, MapPin, CalendarClock, ClipboardList, GraduationCap, Award, BadgeCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_INDEX: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["male", "female", "other"];
const DESIGNATIONS = ["Dentist", "Orthodontist", "Endodontist", "Periodontist", "Oral Surgeon", "Prosthodontist", "Pediatric Dentist"];
const APPT_TYPES = ["In-person", "Video call", "Home visit"];
const SESSIONS = ["Morning", "Afternoon", "Evening"];

type Slot = { session: string; from: string; to: string };
type Row = { name: string; from: string; to?: string; extra?: string };

const SectionTitle = ({ icon: Icon, children }: any) => (
  <div className="flex items-center gap-2 mb-5">
    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
      <Icon className="w-4 h-4" />
    </div>
    <h2 className="font-bold text-base">{children}</h2>
  </div>
);

const Field = ({ label, required, children }: any) => (
  <div>
    <Label className="text-sm font-semibold text-foreground">
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    <div className="mt-1.5">{children}</div>
  </div>
);

const AdminDoctorAdd = () => {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<{ id: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarPath, setAvatarPath] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // Contact
  const [contact, setContact] = useState({
    name: "", username: "", phone: "", email: "", dob: "",
    experience_years: "", specialty_id: "", designation: "",
    license: "", languages: "English,French", blood_group: "", gender: "",
    bio: "", featured: false,
  });

  // Address
  const [address, setAddress] = useState({
    address1: "", address2: "", country: "", city: "", state: "", pincode: "",
  });

  // Schedule
  const [activeDay, setActiveDay] = useState("Monday");
  const [schedule, setSchedule] = useState<Record<string, Slot[]>>(
    Object.fromEntries(DAYS.map((d) => [d, [{ session: "Morning", from: "09:00", to: "13:00" }]])) as any
  );

  // Appointment
  const [appt, setAppt] = useState({
    type: "", advance_days: "", duration: "", charge: "", max_per_slot: "", display: false,
  });

  // Education / Awards / Certifications
  const [education, setEducation] = useState<Row[]>([{ name: "", extra: "", from: "", to: "" }]);
  const [awards, setAwards] = useState<Row[]>([{ name: "", from: "" }]);
  const [certifications, setCertifications] = useState<Row[]>([{ name: "", from: "" }]);

  useEffect(() => {
    supabase.from("specialties").select("id, name").order("name").then(({ data }) => setSpecialties(data || []));
  }, []);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("doctor-avatars").upload(path, file);
      if (upErr) throw upErr;
      const { data } = await supabase.storage.from("doctor-avatars").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      setAvatarPath(data?.signedUrl || "");
      setAvatarPreview(URL.createObjectURL(file));
      toast.success("Photo uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const updateSlot = (day: string, i: number, patch: Partial<Slot>) =>
    setSchedule((s) => ({ ...s, [day]: s[day].map((sl, idx) => (idx === i ? { ...sl, ...patch } : sl)) }));
  const addSlot = (day: string) =>
    setSchedule((s) => ({ ...s, [day]: [...s[day], { session: "Afternoon", from: "14:00", to: "18:00" }] }));
  const removeSlot = (day: string, i: number) =>
    setSchedule((s) => ({ ...s, [day]: s[day].filter((_, idx) => idx !== i) }));
  const applyAll = () => {
    const src = schedule[activeDay];
    setSchedule((s) => Object.fromEntries(DAYS.map((d) => [d, src.map((x) => ({ ...x }))])) as any);
    toast.success(`Applied ${activeDay} to all days`);
  };

  const addRow = (setter: any) => setter((r: Row[]) => [...r, { name: "", from: "", to: "", extra: "" }]);
  const removeRow = (setter: any, i: number) => setter((r: Row[]) => r.filter((_, idx) => idx !== i));
  const updateRow = (setter: any, i: number, patch: Partial<Row>) =>
    setter((r: Row[]) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const save = async () => {
    if (!contact.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      const extras = {
        username: contact.username,
        email: contact.email,
        phone: contact.phone,
        dob: contact.dob,
        designation: contact.designation,
        license: contact.license,
        languages: contact.languages,
        blood_group: contact.blood_group,
        gender: contact.gender,
        address,
        appointment: appt,
        education,
        awards,
        certifications,
        featured: contact.featured,
        display_on_booking: appt.display,
      };
      const composedBio = [
        contact.bio?.trim(),
        "",
        "—— Additional info ——",
        JSON.stringify(extras, null, 2),
      ].filter(Boolean).join("\n");

      const { data: inserted, error } = await supabase.from("doctors").insert({
        full_name: contact.name.trim(),
        bio: composedBio,
        avatar_url: avatarPath || null,
        experience_years: Number(contact.experience_years) || 0,
        rating: 5,
        is_available: true,
        specialty_id: contact.specialty_id || null,
      }).select("id").single();
      if (error) throw error;

      // Persist weekly schedule
      const rows = DAYS.flatMap((d) =>
        schedule[d]
          .filter((s) => s.from && s.to && s.to > s.from)
          .map((s) => ({
            doctor_id: inserted.id,
            day_of_week: DAY_INDEX[d],
            start_time: s.from,
            end_time: s.to,
          }))
      );
      if (rows.length) await supabase.from("doctor_availability").insert(rows);

      toast.success("Doctor added");
      navigate("/admin/doctors");
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Link to="/admin/doctors" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          New Doctor
        </h1>
      </div>

      <Card className="p-8 border-border">
        {/* Contact Information */}
        <SectionTitle icon={User}>Contact Information</SectionTitle>

        <div className="flex items-start gap-6 mb-8">
          <div className="text-sm font-semibold pt-8">Profile Image</div>
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            <div className="relative w-24 h-24">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center border-4 border-background">
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </div>
            </div>
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Name" required>
            <Input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
          </Field>
          <Field label="Username" required>
            <Input value={contact.username} onChange={(e) => setContact({ ...contact, username: e.target.value })} />
          </Field>
          <Field label="Phone Number" required>
            <Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
          </Field>
          <Field label="Email Address" required>
            <Input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
          </Field>
          <Field label="DOB" required>
            <Input type="date" value={contact.dob} onChange={(e) => setContact({ ...contact, dob: e.target.value })} />
          </Field>
          <Field label="Year Of Experience" required>
            <Input type="number" min={0} value={contact.experience_years}
              onChange={(e) => setContact({ ...contact, experience_years: e.target.value })} />
          </Field>
          <Field label="Department" required>
            <Select value={contact.specialty_id} onValueChange={(v) => setContact({ ...contact, specialty_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {specialties.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Designation" required>
            <Select value={contact.designation} onValueChange={(v) => setContact({ ...contact, designation: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {DESIGNATIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Medical License Number" required>
            <Input value={contact.license} onChange={(e) => setContact({ ...contact, license: e.target.value })} />
          </Field>
          <Field label="Language Spoken">
            <Input placeholder="English, French" value={contact.languages}
              onChange={(e) => setContact({ ...contact, languages: e.target.value })} />
          </Field>
          <Field label="Blood Group" required>
            <Select value={contact.blood_group} onValueChange={(v) => setContact({ ...contact, blood_group: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {BLOOD.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Gender" required>
            <Select value={contact.gender} onValueChange={(v) => setContact({ ...contact, gender: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => <SelectItem key={g} value={g}>{g[0].toUpperCase() + g.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Bio">
              <Textarea rows={3} placeholder="About Doctor" value={contact.bio}
                onChange={(e) => setContact({ ...contact, bio: e.target.value })} />
            </Field>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <Switch checked={contact.featured} onCheckedChange={(v) => setContact({ ...contact, featured: v })} />
          <Label className="text-sm">Feature On Website</Label>
        </div>

        <div className="border-t border-border my-8" />

        {/* Address Information */}
        <SectionTitle icon={MapPin}>Address Information</SectionTitle>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Address 1"><Input value={address.address1} onChange={(e) => setAddress({ ...address, address1: e.target.value })} /></Field>
          <Field label="Address 2"><Input value={address.address2} onChange={(e) => setAddress({ ...address, address2: e.target.value })} /></Field>
          <Field label="Country"><Input value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} /></Field>
          <Field label="City"><Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></Field>
          <Field label="State"><Input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} /></Field>
          <Field label="Pincode"><Input value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} /></Field>
        </div>

        <div className="border-t border-border my-8" />

        {/* Schedule */}
        <SectionTitle icon={CalendarClock}>Schedule</SectionTitle>
        <div className="flex flex-wrap gap-2 mb-5">
          {DAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setActiveDay(d)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-semibold transition-colors",
                activeDay === d ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/70"
              )}
            >
              {d}
            </button>
          ))}
        </div>

        {schedule[activeDay].map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end mb-3">
            <Field label={i === 0 ? "Session" : ""}>
              <Select value={s.session} onValueChange={(v) => updateSlot(activeDay, i, { session: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SESSIONS.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label={i === 0 ? "From" : ""}>
              <Input type="time" value={s.from} onChange={(e) => updateSlot(activeDay, i, { from: e.target.value })} />
            </Field>
            <Field label={i === 0 ? "To" : ""}>
              <Input type="time" value={s.to} onChange={(e) => updateSlot(activeDay, i, { to: e.target.value })} />
            </Field>
            {i === schedule[activeDay].length - 1 ? (
              <Button type="button" variant="outline" size="icon" onClick={() => addSlot(activeDay)}>
                <Plus className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="button" variant="outline" size="icon" onClick={() => removeSlot(activeDay, i)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}

        <Button type="button" onClick={applyAll} className="bg-foreground text-background hover:bg-foreground/90 mt-2">
          Apply All
        </Button>

        <div className="border-t border-border my-8" />

        {/* Appointment Info */}
        <SectionTitle icon={ClipboardList}>Appointment Information</SectionTitle>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Appointment Type">
            <Select value={appt.type} onValueChange={(v) => setAppt({ ...appt, type: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {APPT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <div />
          <Field label="Accept bookings (in Advance)">
            <div className="flex">
              <Input type="number" min={0} value={appt.advance_days}
                onChange={(e) => setAppt({ ...appt, advance_days: e.target.value })} className="rounded-r-none" />
              <span className="inline-flex items-center px-3 border border-l-0 border-input rounded-r-md bg-muted text-sm text-muted-foreground">Days</span>
            </div>
          </Field>
          <Field label="Appointment Duration">
            <div className="flex">
              <Input type="number" min={0} value={appt.duration}
                onChange={(e) => setAppt({ ...appt, duration: e.target.value })} className="rounded-r-none" />
              <span className="inline-flex items-center px-3 border border-l-0 border-input rounded-r-md bg-muted text-sm text-muted-foreground">Mins</span>
            </div>
          </Field>
          <Field label="Consultation Charge">
            <div className="flex">
              <Input type="number" min={0} value={appt.charge}
                onChange={(e) => setAppt({ ...appt, charge: e.target.value })} className="rounded-r-none" />
              <span className="inline-flex items-center px-3 border border-l-0 border-input rounded-r-md bg-muted text-sm text-muted-foreground">$</span>
            </div>
          </Field>
          <Field label="Max Bookings Per Slot">
            <Input type="number" min={0} value={appt.max_per_slot}
              onChange={(e) => setAppt({ ...appt, max_per_slot: e.target.value })} />
          </Field>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <Switch checked={appt.display} onCheckedChange={(v) => setAppt({ ...appt, display: v })} />
          <Label className="text-sm">Display on Booking Page</Label>
        </div>

        <div className="border-t border-border my-8" />

        {/* Educational Information */}
        <SectionTitle icon={GraduationCap}>Educational Information</SectionTitle>
        {education.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-end mb-3">
            <Field label={i === 0 ? "Educational Degree" : ""}>
              <Input value={row.name} onChange={(e) => updateRow(setEducation, i, { name: e.target.value })} />
            </Field>
            <Field label={i === 0 ? "University" : ""}>
              <Input value={row.extra || ""} onChange={(e) => updateRow(setEducation, i, { extra: e.target.value })} />
            </Field>
            <Field label={i === 0 ? "From" : ""}>
              <Input type="date" value={row.from} onChange={(e) => updateRow(setEducation, i, { from: e.target.value })} />
            </Field>
            <Field label={i === 0 ? "To" : ""}>
              <Input type="date" value={row.to || ""} onChange={(e) => updateRow(setEducation, i, { to: e.target.value })} />
            </Field>
            {i === education.length - 1 ? (
              <Button type="button" variant="outline" size="icon" onClick={() => addRow(setEducation)}>
                <Plus className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="button" variant="outline" size="icon" onClick={() => removeRow(setEducation, i)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}

        <div className="border-t border-border my-8" />

        {/* Awards */}
        <SectionTitle icon={Award}>Awards &amp; Recognition</SectionTitle>
        {awards.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end mb-3">
            <Field label={i === 0 ? "Name" : ""}>
              <Input value={row.name} onChange={(e) => updateRow(setAwards, i, { name: e.target.value })} />
            </Field>
            <Field label={i === 0 ? "From" : ""}>
              <Input type="date" value={row.from} onChange={(e) => updateRow(setAwards, i, { from: e.target.value })} />
            </Field>
            {i === awards.length - 1 ? (
              <Button type="button" variant="outline" size="icon" onClick={() => addRow(setAwards)}>
                <Plus className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="button" variant="outline" size="icon" onClick={() => removeRow(setAwards, i)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}

        <div className="border-t border-border my-8" />

        {/* Certifications */}
        <SectionTitle icon={BadgeCheck}>Certifications</SectionTitle>
        {certifications.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end mb-3">
            <Field label={i === 0 ? "Name" : ""}>
              <Input value={row.name} onChange={(e) => updateRow(setCertifications, i, { name: e.target.value })} />
            </Field>
            <Field label={i === 0 ? "From" : ""}>
              <Input type="date" value={row.from} onChange={(e) => updateRow(setCertifications, i, { from: e.target.value })} />
            </Field>
            {i === certifications.length - 1 ? (
              <Button type="button" variant="outline" size="icon" onClick={() => addRow(setCertifications)}>
                <Plus className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="button" variant="outline" size="icon" onClick={() => removeRow(setCertifications, i)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}

        <div className="border-t border-border mt-8 pt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/admin/doctors")}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-gradient-primary text-primary-foreground gap-2 min-w-[140px]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Add Doctor
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminDoctorAdd;
