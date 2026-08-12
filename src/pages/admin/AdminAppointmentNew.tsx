import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  FileText, 
  Plus,
  ChevronLeft,
  Info,
  Search,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const AdminAppointmentNew = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<{ id: string; full_name: string }[]>([]);
  const [patients, setPatients] = useState<{ id: string; full_name: string | null }[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [form, setForm] = useState({
    patient_id: "", doctor_id: "", appointment_date: "", appointment_time: "", reason: "", service_id: ""
  });
  const [saving, setSaving] = useState(false);
  const [serviceSearchOpen, setServiceSearchOpen] = useState(false);

  useEffect(() => {
    supabase.from("doctors").select("id, full_name").order("full_name")
      .then(({ data }) => setDoctors(data || []));
    supabase.from("profiles").select("id, full_name").order("full_name")
      .then(({ data }) => setPatients(data || []));
    supabase.from("services").select("*, category:service_categories(name)").eq("active", true).order("name")
      .then(({ data }) => setServices(data || []));
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
    toast.success("Appointment created successfully");
    navigate("/admin/appointments");
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] -m-6 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-[850px]">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">New Appointment</h1>
            </div>
            <p className="text-slate-500 text-sm">Manually schedule an appointment for a patient</p>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/admin/appointments")}
            className="self-start md:self-center text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 rounded-full pr-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to list
          </Button>
        </div>

        {/* Form Container */}
        <Card className="bg-white border-slate-200/60 rounded-[20px] shadow-soft overflow-hidden">
          <form onSubmit={submit} className="divide-y divide-slate-100">
            {/* Section 1: Patient & Doctor */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Patient & Doctor</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Patient <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={form.patient_id} onValueChange={(v) => setForm({ ...form, patient_id: v })}>
                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:ring-primary/20">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.full_name || p.id.slice(0, 8)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium flex items-center gap-2">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                    Doctor <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={form.doctor_id} onValueChange={(v) => setForm({ ...form, doctor_id: v })}>
                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:ring-primary/20">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Schedule */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Schedule</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Date <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    type="date" 
                    value={form.appointment_date}
                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:ring-primary/20"
                    onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Time <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    type="time" 
                    value={form.appointment_time}
                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:ring-primary/20"
                    onChange={(e) => setForm({ ...form, appointment_time: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Reason */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Reason for Visit</h3>
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Additional Notes</Label>
                <Textarea 
                  value={form.reason} 
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Describe the consultation, cleaning, follow-up, or any specific patient concerns..." 
                  className="min-h-[120px] rounded-xl bg-slate-50 border-slate-200 focus:ring-primary/20 resize-none p-4 text-[15px]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 md:p-8 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/admin/appointments")}
                className="w-full sm:w-auto h-11 px-8 border-slate-200 text-slate-600 hover:bg-white rounded-xl transition-all"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving} 
                className="w-full sm:w-auto h-11 px-8 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  "Scheduling..."
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Appointment
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminAppointmentNew;