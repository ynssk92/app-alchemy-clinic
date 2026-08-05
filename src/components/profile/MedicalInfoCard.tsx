import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HeartPulse, ShieldAlert, UserPlus, Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface MedicalInfoProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const MedicalInfoCard = ({ formData, onChange }: MedicalInfoProps) => {
  return (
    <Card className="p-8 border-border bg-card shadow-sm rounded-[24px] mt-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <HeartPulse className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold">Medical Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Blood Group</Label>
          <Input 
            value={formData.blood_group || ""} 
            onChange={(e) => onChange("blood_group", e.target.value)}
            className="h-[52px] rounded-2xl bg-muted/30 border-border/50" 
            placeholder="A+, O-, etc."
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Insurance Provider</Label>
          <Input 
            value={formData.insurance_provider || ""} 
            onChange={(e) => onChange("insurance_provider", e.target.value)}
            className="h-[52px] rounded-2xl bg-muted/30 border-border/50" 
            placeholder="Health Mutual Co."
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Insurance Number</Label>
          <Input 
            value={formData.insurance_number || ""} 
            onChange={(e) => onChange("insurance_number", e.target.value)}
            className="h-[52px] rounded-2xl bg-muted/30 border-border/50" 
            placeholder="POL-123456789"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Primary Practitioner</Label>
          <Input 
            value={formData.primary_practitioner || ""} 
            onChange={(e) => onChange("primary_practitioner", e.target.value)}
            className="h-[52px] rounded-2xl bg-muted/30 border-border/50" 
            placeholder="Dr. John Smith"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Known Allergies</Label>
          <div className="relative">
            <ShieldAlert className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
            <Textarea 
              value={formData.allergies || ""} 
              onChange={(e) => onChange("allergies", e.target.value)}
              className="pl-11 min-h-[100px] rounded-2xl bg-muted/30 border-border/50" 
              placeholder="Peanuts, Penicillin, etc. (Leave blank if none)"
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Medical Conditions</Label>
          <div className="relative">
            <Info className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
            <Textarea 
              value={formData.medical_conditions || ""} 
              onChange={(e) => onChange("medical_conditions", e.target.value)}
              className="pl-11 min-h-[100px] rounded-2xl bg-muted/30 border-border/50" 
              placeholder="Asthma, Diabetes, etc."
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
