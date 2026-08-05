import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, Award, Building, BookText, Globe } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ProfessionalInfoProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const ProfessionalInfoCard = ({ formData, onChange }: ProfessionalInfoProps) => {
  return (
    <Card className="p-8 border-border bg-card shadow-sm rounded-[24px] mt-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Stethoscope className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold">Professional Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">License Number</Label>
          <div className="relative">
            <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={formData.license_number || ""} 
              onChange={(e) => onChange("license_number", e.target.value)}
              className="pl-11 h-[52px] rounded-2xl bg-muted/30 border-border/50" 
              placeholder="MED-987654321"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Years of Experience</Label>
          <Input 
            type="number"
            value={formData.experience_years || ""} 
            onChange={(e) => onChange("experience_years", e.target.value)}
            className="h-[52px] rounded-2xl bg-muted/30 border-border/50" 
            placeholder="10"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Consultation Duration (min)</Label>
          <div className="relative">
            <BookText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              type="number"
              value={formData.consultation_duration || 30} 
              onChange={(e) => onChange("consultation_duration", e.target.value)}
              className="pl-11 h-[52px] rounded-2xl bg-muted/30 border-border/50" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Spoken Languages</Label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={(formData.languages || []).join(", ")} 
              onChange={(e) => onChange("languages", e.target.value.split(",").map(l => l.trim()))}
              className="pl-11 h-[52px] rounded-2xl bg-muted/30 border-border/50" 
              placeholder="French, English"
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Professional Biography</Label>
          <Textarea 
            value={formData.biography || ""} 
            onChange={(e) => onChange("biography", e.target.value)}
            className="min-h-[120px] rounded-2xl bg-muted/30 border-border/50" 
            placeholder="Tell patients about your background and expertise..."
          />
        </div>
      </div>
    </Card>
  );
};
