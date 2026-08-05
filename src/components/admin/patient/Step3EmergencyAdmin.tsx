import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldAlert, 
  Tooth, 
  Users, 
  Settings, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Lock,
  Smartphone,
  Mail,
  Zap,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { PatientFormData } from "./PatientWizard";

interface StepProps {
  formData: PatientFormData;
  onChange: (data: Partial<PatientFormData>) => void;
}

const DENTAL_TREATMENTS = [
  "Braces", "Implants", "Crowns", "Bridges", "Root Canal", "Extractions", "Dentures", "Teeth Whitening"
];

const Step3EmergencyAdmin = ({ formData, onChange }: StepProps) => {
  const toggleDentalTreatment = (t: string) => {
    const next = formData.dental_treatments.includes(t)
      ? formData.dental_treatments.filter(x => x !== t)
      : [...formData.dental_treatments, t];
    onChange({ dental_treatments: next });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Emergency Contact */}
        <Card className="p-8 border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xl rounded-[20px]">
          <div className="flex items-center gap-2 mb-8 text-primary">
            <ShieldAlert className="w-5 h-5 text-destructive" />
            <h2 className="text-xl font-bold">Emergency Contact</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
              <Input 
                value={formData.emergency_name} 
                onChange={(e) => onChange({ emergency_name: e.target.value })}
                className="h-12 rounded-xl border-border/50"
                placeholder="Ex: John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Relationship</Label>
                <Select value={formData.emergency_relationship} onValueChange={(v) => onChange({ emergency_relationship: v })}>
                  <SelectTrigger className="h-12 rounded-xl border-border/50">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                <Input 
                  value={formData.emergency_phone} 
                  onChange={(e) => onChange({ emergency_phone: e.target.value })}
                  className="h-12 rounded-xl border-border/50"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Dental History */}
        <Card className="p-8 border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xl rounded-[20px]">
          <div className="flex items-center gap-2 mb-8 text-primary">
            <Zap className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold">Dental History</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Previous Dentist</Label>
                <Input 
                  value={formData.previous_dentist} 
                  onChange={(e) => onChange({ previous_dentist: e.target.value })}
                  className="h-12 rounded-xl border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Visit</Label>
                <Input 
                  type="date"
                  value={formData.last_visit} 
                  onChange={(e) => onChange({ last_visit: e.target.value })}
                  className="h-12 rounded-xl border-border/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Previous Treatments</Label>
              <div className="flex flex-wrap gap-2">
                {DENTAL_TREATMENTS.map(t => (
                  <Badge 
                    key={t}
                    variant={formData.dental_treatments.includes(t) ? "default" : "outline"}
                    className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                      formData.dental_treatments.includes(t) 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-transparent text-muted-foreground border-border/50"
                    }`}
                    onClick={() => toggleDentalTreatment(t)}
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Social History */}
        <Card className="p-8 border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xl rounded-[20px]">
          <div className="flex items-center gap-2 mb-8 text-primary">
            <Users className="w-5 h-5" />
            <h2 className="text-xl font-bold">Social History</h2>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Smoking</Label>
              <div className="flex gap-2">
                {["never", "former", "current"].map(s => (
                  <Button 
                    key={s}
                    variant={formData.smoking === s ? "default" : "outline"}
                    size="sm"
                    className="flex-1 rounded-xl capitalize"
                    onClick={() => onChange({ smoking: s })}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Alcohol</Label>
              <Select value={formData.alcohol} onValueChange={(v) => onChange({ alcohol: v })}>
                <SelectTrigger className="h-12 rounded-xl border-border/50">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="occasionally">Occasionally</SelectItem>
                  <SelectItem value="frequently">Frequently</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Administrative */}
        <Card className="p-8 border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xl rounded-[20px]">
          <div className="flex items-center gap-2 mb-8 text-primary">
            <Settings className="w-5 h-5" />
            <h2 className="text-xl font-bold">Administrative</h2>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Patient Status</Label>
              <Select value={formData.status} onValueChange={(v) => onChange({ status: v })}>
                <SelectTrigger className="h-12 rounded-xl border-border/50">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lead Source</Label>
              <Select value={formData.lead_source} onValueChange={(v) => onChange({ lead_source: v })}>
                <SelectTrigger className="h-12 rounded-xl border-border/50">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="walk-in">Walk-in</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Consent */}
        <Card className="p-8 border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xl rounded-[20px]">
          <div className="flex items-center gap-2 mb-8 text-primary">
            <Lock className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold">Consent</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold">Receive SMS</span>
              </div>
              <Switch checked={formData.receive_sms} onCheckedChange={(v) => onChange({ receive_sms: v })} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold">Receive Email</span>
              </div>
              <Switch checked={formData.receive_email} onCheckedChange={(v) => onChange({ receive_email: v })} />
            </div>
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-start gap-3 mt-2">
                <Checkbox id="gdpr" checked={formData.gdpr_consent} onCheckedChange={(v) => onChange({ gdpr_consent: !!v })} className="mt-1" />
                <Label htmlFor="gdpr" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  I consent to the processing of medical data according to GDPR regulations.
                </Label>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Notes */}
      <Card className="p-8 border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xl rounded-[20px] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full -z-10" />
        <div className="flex items-center gap-2 mb-8 text-amber-600">
          <FileText className="w-5 h-5" />
          <h2 className="text-xl font-bold">Clinical & Internal Notes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Doctor Notes
              </Label>
              <Textarea 
                value={formData.doctor_notes} 
                onChange={(e) => onChange({ doctor_notes: e.target.value })}
                className="min-h-[120px] rounded-2xl border-border/50"
                placeholder="Clinical observations..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <MessageSquare className="w-3 h-3 text-blue-500" /> Internal Notes
              </Label>
              <Textarea 
                value={formData.internal_notes} 
                onChange={(e) => onChange({ internal_notes: e.target.value })}
                className="min-h-[120px] rounded-2xl border-border/50"
                placeholder="Staff only notes..."
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-destructive" /> Warnings
              </Label>
              <Textarea 
                value={formData.warnings} 
                onChange={(e) => onChange({ warnings: e.target.value })}
                className="min-h-[120px] rounded-2xl border-destructive/20 bg-destructive/5"
                placeholder="Critical warnings (drug reactions, etc.)..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileText className="w-3 h-3 text-primary" /> Special Instructions
              </Label>
              <Textarea 
                value={formData.special_instructions} 
                onChange={(e) => onChange({ special_instructions: e.target.value })}
                className="min-h-[120px] rounded-2xl border-border/50"
                placeholder="Patient care instructions..."
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Step3EmergencyAdmin;
