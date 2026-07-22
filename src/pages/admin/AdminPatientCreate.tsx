import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, ImagePlus, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(80),
  last_name: z.string().trim().min(1, "Last name is required").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  blood_group: z.string().optional().or(z.literal("")),
  status: z.string().optional().or(z.literal("")),
  primary_doctor_id: z.string().optional().or(z.literal("")),
  address_1: z.string().max(200).optional().or(z.literal("")),
  address_2: z.string().max(200).optional().or(z.literal("")),
  country: z.string().max(80).optional().or(z.literal("")),
  state: z.string().max(80).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  pincode: z.string().max(20).optional().or(z.literal("")),
});

const empty = {
  first_name: "", last_name: "", email: "", phone: "",
  dob: "", gender: "", blood_group: "", status: "active",
  primary_doctor_id: "", address_1: "", address_2: "",
  country: "", state: "", city: "", pincode: "",
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-base font-bold text-foreground mb-5">{children}</h2>
);

const Req = () => <span className="text-destructive">*</span>;

const AdminPatientCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [doctors, setDoctors] = useState<{ id: string; full_name: string }[]>([]);

  useEffect(() => {
    supabase.from("doctors").select("id, full_name").order("full_name")
      .then(({ data }) => setDoctors(data || []));
  }, []);

  const set = (k: keyof typeof empty) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");
    const url = URL.createObjectURL(f);
    setAvatar(url);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      return toast.error(parsed.error.errors[0]?.message || "Please check the form");
    }
    setBusy(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const payload: any = {
        ...parsed.data,
        email: parsed.data.email.toLowerCase(),
        dob: parsed.data.dob || null,
        primary_doctor_id: parsed.data.primary_doctor_id || null,
        created_by: userRes.user?.id || null,
      };
      const { error } = await supabase.from("patient_intake").insert(payload);
      if (error) throw error;
      toast.success("Patient added");
      navigate("/admin/patients");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link to="/admin/patients" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Patients</h1>
      </div>

      <form onSubmit={submit}>
        <Card className="p-8 border-border">
          <SectionTitle>Patient Information</SectionTitle>

          {/* Profile image */}
          <div className="flex items-center gap-5 mb-8">
            <span className="text-sm">Profile Image</span>
            <label className="relative cursor-pointer group">
              <Avatar className="w-20 h-20 border">
                {avatar && <AvatarImage src={avatar} className="object-cover" />}
                <AvatarFallback className="bg-muted">
                  <UserPlus className="w-6 h-6 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 inset-x-0 h-7 rounded-b-full bg-foreground/80 text-background flex items-center justify-center opacity-90 group-hover:opacity-100 transition">
                <ImagePlus className="w-3.5 h-3.5" />
              </span>
              <input type="file" accept="image/*" onChange={onAvatar} className="hidden" />
            </label>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <Label>First Name <Req /></Label>
              <Input value={form.first_name} onChange={(e) => set("first_name")(e.target.value)} />
            </div>
            <div>
              <Label>Last Name <Req /></Label>
              <Input value={form.last_name} onChange={(e) => set("last_name")(e.target.value)} />
            </div>

            <div>
              <Label>Phone Number <Req /></Label>
              <Input value={form.phone} onChange={(e) => set("phone")(e.target.value)} placeholder="+1 (201) 555-0123" />
            </div>
            <div>
              <Label>Email Address <Req /></Label>
              <Input type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} />
            </div>

            <div>
              <Label>Primary Doctor <Req /></Label>
              <Select value={form.primary_doctor_id} onValueChange={set("primary_doctor_id")}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>Dr. {d.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>DOB <Req /></Label>
              <Input type="date" value={form.dob} onChange={(e) => set("dob")(e.target.value)} />
            </div>

            <div>
              <Label>Gender <Req /></Label>
              <Select value={form.gender} onValueChange={set("gender")}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Blood Group <Req /></Label>
              <Select value={form.blood_group} onValueChange={set("blood_group")}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status <Req /></Label>
              <Select value={form.status} onValueChange={set("status")}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t border-border my-8" />

          <SectionTitle>Address Information</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <Label>Address 1 <Req /></Label>
              <Input value={form.address_1} onChange={(e) => set("address_1")(e.target.value)} />
            </div>
            <div>
              <Label>Address 2 <Req /></Label>
              <Input value={form.address_2} onChange={(e) => set("address_2")(e.target.value)} />
            </div>

            <div>
              <Label>Country <Req /></Label>
              <Input value={form.country} onChange={(e) => set("country")(e.target.value)} placeholder="Select" />
            </div>
            <div>
              <Label>State <Req /></Label>
              <Input value={form.state} onChange={(e) => set("state")(e.target.value)} placeholder="Select" />
            </div>

            <div>
              <Label>City <Req /></Label>
              <Input value={form.city} onChange={(e) => set("city")(e.target.value)} placeholder="Select" />
            </div>
            <div>
              <Label>Pincode <Req /></Label>
              <Input value={form.pincode} onChange={(e) => set("pincode")(e.target.value)} />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={() => navigate("/admin/patients")}>Cancel</Button>
          <Button type="submit" disabled={busy} className="bg-gradient-primary text-primary-foreground gap-2">
            <UserPlus className="w-4 h-4" />
            {busy ? "Saving…" : "Add New Patient"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminPatientCreate;
