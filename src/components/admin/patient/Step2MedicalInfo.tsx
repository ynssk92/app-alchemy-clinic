import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Activity, Pill, Stethoscope, Heart, Plus, Trash2, Droplet, Ruler, Weight } from "lucide-react";
import { PatientFormData } from "./PatientWizard";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StepProps {
  formData: PatientFormData;
  onChange: (data: Partial<PatientFormData>) => void;
}

const MEDICAL_CONDITIONS = [
  "Diabetes", "Hypertension", "Heart Disease", "Kidney Disease", 
  "Asthma", "Cancer", "Thyroid Disease", "Pregnancy", "Epilepsy", "None"
];

const ALLERGIES = [
  "Penicillin", "Latex", "Anesthesia", "Food", "Medicine", "Other"
];

const Step2MedicalInfo = ({ formData, onChange }: StepProps) => {
  const [doctors, setDoctors] = useState<{ id: string; full_name: string }[]>([]);

  useEffect(() => {
    supabase.from("doctors").select("id, full_name").then(({ data }) => setDoctors(data || []));
  }, []);

  useEffect(() => {
    if (formData.height_cm && formData.weight_kg) {
      const h = parseFloat(formData.height_cm) / 100;
      const w = parseFloat(formData.weight_kg);
      if (h > 0 && w > 0) {
        const bmi = (w / (h * h)).toFixed(1);
        onChange({ bmi });
      }
    }
  }, [formData.height_cm, formData.weight_kg]);

  const toggleCondition = (cond: string) => {
    const next = formData.medical_history.includes(cond)
      ? formData.medical_history.filter(c => c !== cond)
      : [...formData.medical_history, cond];
    onChange({ medical_history: next });
  };

  const toggleAllergy = (all: string) => {
    const next = formData.allergies.includes(all)
      ? formData.allergies.filter(a => a !== all)
      : [...formData.allergies, all];
    onChange({ allergies: next });
  };

  const addMed = () => {
    onChange({
      medications: [...formData.medications, { medication: "", dose: "", frequency: "", duration: "", notes: "" }]
    });
  };

  const removeMed = (index: number) => {
    onChange({
      medications: formData.medications.filter((_, i) => i !== index)
    });
  };

  const updateMed = (index: number, data: any) => {
    const next = [...formData.medications];
    next[index] = { ...next[index], ...data };
    onChange({ medications: next });
  };

  return (
    <div className="space-y-8">
      {/* Vitals & Primary Info */}
      <Card className="p-8 border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xl rounded-[20px] overflow-hidden">
        <div className="flex items-center gap-2 mb-8 text-primary">
          <Stethoscope className="w-5 h-5" />
          <h2 className="text-xl font-bold">Medical Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Droplet className="w-3 h-3 text-red-500" /> Blood Group
            </Label>
            <Select value={formData.blood_group} onValueChange={(v) => onChange({ blood_group: v })}>
              <SelectTrigger className="h-12 rounded-xl border-border/50">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Ruler className="w-3 h-3 text-blue-500" /> Height (cm)
            </Label>
            <Input 
              type="number"
              value={formData.height_cm} 
              onChange={(e) => onChange({ height_cm: e.target.value })}
              className="h-12 px-4 rounded-xl border-border/50"
              placeholder="175"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Weight className="w-3 h-3 text-orange-500" /> Weight (kg)
            </Label>
            <Input 
              type="number"
              value={formData.weight_kg} 
              onChange={(e) => onChange({ weight_kg: e.target.value })}
              className="h-12 px-4 rounded-xl border-border/50"
              placeholder="70"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">BMI Score</Label>
            <div className={`h-12 px-4 rounded-xl flex items-center font-bold text-lg ${
              parseFloat(formData.bmi) > 25 ? 'bg-orange-500/10 text-orange-600' : 'bg-emerald-500/10 text-emerald-600'
            }`}>
              {formData.bmi || "—"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-border/50">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Primary Doctor</Label>
            <Select value={formData.primary_doctor_id} onValueChange={(v) => onChange({ primary_doctor_id: v })}>
              <SelectTrigger className="h-12 px-4 rounded-xl border-border/50">
                <SelectValue placeholder="Select Doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map(d => (
                  <SelectItem key={d.id} value={d.id}>Dr. {d.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Insurance Provider</Label>
              <Input 
                value={formData.insurance_provider} 
                onChange={(e) => onChange({ insurance_provider: e.target.value })}
                className="h-12 px-4 rounded-xl border-border/50"
                placeholder="AXA, Allianz..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Insurance Number</Label>
              <Input 
                value={formData.insurance_number} 
                onChange={(e) => onChange({ insurance_number: e.target.value })}
                className="h-12 px-4 rounded-xl border-border/50"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* History & Allergies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xl rounded-[20px]">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <Heart className="w-5 h-5" />
            <h2 className="text-xl font-bold">Medical History</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {MEDICAL_CONDITIONS.map(cond => (
              <Badge 
                key={cond}
                variant={formData.medical_history.includes(cond) ? "default" : "outline"}
                className={`px-4 py-2 rounded-xl cursor-pointer transition-all hover:scale-105 ${
                  formData.medical_history.includes(cond) 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-transparent text-muted-foreground border-border/50 hover:bg-primary/5"
                }`}
                onClick={() => toggleCondition(cond)}
              >
                {cond}
              </Badge>
            ))}
          </div>
          <div className="mt-6 space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Other Conditions</Label>
            <Input 
              value={formData.custom_conditions}
              onChange={(e) => onChange({ custom_conditions: e.target.value })}
              className="rounded-xl border-border/50"
              placeholder="List any other medical conditions..."
            />
          </div>
        </Card>

        <Card className="p-8 border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xl rounded-[20px]">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <Activity className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold">Allergies</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALLERGIES.map(all => (
              <Badge 
                key={all}
                variant={formData.allergies.includes(all) ? "destructive" : "outline"}
                className={`px-4 py-2 rounded-xl cursor-pointer transition-all hover:scale-105 ${
                  formData.allergies.includes(all) 
                    ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20" 
                    : "bg-transparent text-muted-foreground border-border/50 hover:bg-destructive/5"
                }`}
                onClick={() => toggleAllergy(all)}
              >
                {all}
              </Badge>
            ))}
          </div>
          <div className="mt-6 space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Custom Allergy</Label>
            <Input 
              value={formData.custom_allergies}
              onChange={(e) => onChange({ custom_allergies: e.target.value })}
              className="rounded-xl border-border/50"
              placeholder="Specify custom allergy..."
            />
          </div>
        </Card>
      </div>

      {/* Medications Dynamic Table */}
      <Card className="p-8 border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xl rounded-[20px] overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-primary">
            <Pill className="w-5 h-5" />
            <h2 className="text-xl font-bold">Current Medications</h2>
          </div>
          <Button onClick={addMed} size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 gap-2 rounded-xl border-none">
            <Plus className="w-4 h-4" /> Add Row
          </Button>
        </div>

        <div className="overflow-x-auto -mx-8 px-8 pb-4">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Medication</th>
                <th className="text-left py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Dose</th>
                <th className="text-left py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Frequency</th>
                <th className="text-left py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Duration</th>
                <th className="text-left py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Notes</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {formData.medications.map((m, idx) => (
                <tr key={idx} className="border-b border-border/10 group">
                  <td className="py-4 pr-4"><Input value={m.medication} onChange={e => updateMed(idx, { medication: e.target.value })} className="h-10 rounded-xl bg-white/30" /></td>
                  <td className="py-4 pr-4"><Input value={m.dose} onChange={e => updateMed(idx, { dose: e.target.value })} className="h-10 rounded-xl bg-white/30" /></td>
                  <td className="py-4 pr-4"><Input value={m.frequency} onChange={e => updateMed(idx, { frequency: e.target.value })} className="h-10 rounded-xl bg-white/30" /></td>
                  <td className="py-4 pr-4"><Input value={m.duration} onChange={e => updateMed(idx, { duration: e.target.value })} className="h-10 rounded-xl bg-white/30" /></td>
                  <td className="py-4 pr-4"><Input value={m.notes} onChange={e => updateMed(idx, { notes: e.target.value })} className="h-10 rounded-xl bg-white/30" /></td>
                  <td className="py-4 text-center">
                    <Button variant="ghost" size="icon" onClick={() => removeMed(idx)} className="text-muted-foreground hover:text-destructive rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {formData.medications.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <p className="text-sm">No medications listed</p>
                    <Button variant="link" onClick={addMed} className="text-primary mt-1">Add your first medication</Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Step2MedicalInfo;
