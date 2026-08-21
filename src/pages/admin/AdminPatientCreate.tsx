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
  nationality: z.string().trim().max(80).optional().or(z.literal("")),
  identity_document_type: z.string().trim().max(50).optional().or(z.literal("")),
  identity_document_number: z.string().trim().max(50).optional().or(z.literal("")),
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
  nationality: "", identity_document_type: "", identity_document_number: "",
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
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-slate-100">
            <Link to="/admin/patients">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create New Patient</h1>
            <p className="text-slate-500 font-medium">Add a new record to the clinical database.</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white/80 backdrop-blur-sm">
          {/* Form Header / Image */}
          <div className="bg-slate-50/50 p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-8">
            <div className="relative group mx-auto md:mx-0">
              <Avatar className="w-28 h-28 border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                {avatar ? (
                  <AvatarImage src={avatar} className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-primary/5">
                    <UserPlus className="w-8 h-8 text-primary/40" />
                  </AvatarFallback>
                )}
              </Avatar>
              <label className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all">
                <ImagePlus className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={onAvatar} className="hidden" />
              </label>
            </div>
            
            <div className="text-center md:text-left space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Patient Profile Photo</h3>
              <p className="text-sm text-slate-500 max-w-xs">
                Upload a professional photo to help identify the patient in the records. Max 5MB.
              </p>
            </div>
          </div>

          <div className="p-8 space-y-12">
            {/* 1. PATIENT IDENTITY */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">1. Patient Identity</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">First Name <Req /></Label>
                  <Input 
                    value={form.first_name} 
                    onChange={(e) => set("first_name")(e.target.value)}
                    className="h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary/5 transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">Last Name <Req /></Label>
                  <Input 
                    value={form.last_name} 
                    onChange={(e) => set("last_name")(e.target.value)}
                    className="h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary/5 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">Phone Number <Req /></Label>
                  <Input 
                    value={form.phone} 
                    onChange={(e) => set("phone")(e.target.value)} 
                    placeholder="+212 ..."
                    className="h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary/5 transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">Email Address <Req /></Label>
                  <Input 
                    type="email" 
                    value={form.email} 
                    onChange={(e) => set("email")(e.target.value)}
                    className="h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary/5 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">Nationality</Label>
                  <Input 
                    value={form.nationality} 
                    onChange={(e) => set("nationality")(e.target.value)}
                    placeholder="e.g. Moroccan"
                    className="h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary/5 transition-all shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-500 uppercase">Doc Type</Label>
                    <Select value={form.identity_document_type} onValueChange={set("identity_document_type")}>
                      <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CIN">CIN</SelectItem>
                        <SelectItem value="Passport">Passport</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-500 uppercase">Doc Number</Label>
                    <Input 
                      value={form.identity_document_number} 
                      onChange={(e) => set("identity_document_number")(e.target.value)}
                      className="h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary/5 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 2. PERSONAL INFORMATION */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">2. Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">Primary Doctor <Req /></Label>
                  <Select value={form.primary_doctor_id} onValueChange={set("primary_doctor_id")}>
                    <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm">
                      <SelectValue placeholder="Select Doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((d) => (
                        <SelectItem key={d.id} value={d.id}>Dr. {d.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">Date of Birth <Req /></Label>
                  <Input 
                    type="date" 
                    value={form.dob} 
                    onChange={(e) => set("dob")(e.target.value)}
                    className="h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary/5 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">Gender <Req /></Label>
                  <Select value={form.gender} onValueChange={set("gender")}>
                    <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">Blood Group <Req /></Label>
                  <Select value={form.blood_group} onValueChange={set("blood_group")}>
                    <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">Account Status <Req /></Label>
                  <Select value={form.status} onValueChange={set("status")}>
                    <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* 3. ADDRESS */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">3. Address Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">Address 1 <Req /></Label>
                  <Input 
                    value={form.address_1} 
                    onChange={(e) => set("address_1")(e.target.value)}
                    className="h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary/5 transition-all shadow-sm"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">Address 2</Label>
                  <Input 
                    value={form.address_2} 
                    onChange={(e) => set("address_2")(e.target.value)}
                    className="h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary/5 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">Country <Req /></Label>
                  <Input 
                    value={form.country} 
                    onChange={(e) => set("country")(e.target.value)} 
                    placeholder="Select"
                    className="h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary/5 transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">State/Province <Req /></Label>
                  <Input 
                    value={form.state} 
                    onChange={(e) => set("state")(e.target.value)} 
                    placeholder="Select"
                    className="h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary/5 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">City <Req /></Label>
                  <Input 
                    value={form.city} 
                    onChange={(e) => set("city")(e.target.value)} 
                    placeholder="Select"
                    className="h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary/5 transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase">Pincode/ZIP <Req /></Label>
                  <Input 
                    value={form.pincode} 
                    onChange={(e) => set("pincode")(e.target.value)}
                    className="h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary/5 transition-all shadow-sm"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => navigate("/admin/patients")}
              className="h-11 px-6 font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={busy} 
              className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
            >
              {busy ? (
                <>Saving Record...</>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Register Patient
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default AdminPatientCreate;
