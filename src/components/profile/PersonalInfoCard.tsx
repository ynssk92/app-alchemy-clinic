import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Mail, Phone, User, Calendar, Globe, MapPin, MessageSquare } from "lucide-react";

interface PersonalInfoProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  userEmail: string | undefined;
}

export const PersonalInfoCard = ({ formData, onChange, userEmail }: PersonalInfoProps) => {
  return (
    <Card className="p-8 border-border bg-card shadow-sm rounded-[24px]">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold">Personal Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">First Name</Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={formData.first_name || ""} 
              onChange={(e) => onChange("first_name", e.target.value)}
              className="pl-11 h-[52px] rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20" 
              placeholder="Enter first name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Last Name</Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={formData.last_name || ""} 
              onChange={(e) => onChange("last_name", e.target.value)}
              className="pl-11 h-[52px] rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20" 
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={userEmail || ""} 
              disabled 
              className="pl-11 h-[52px] rounded-2xl bg-muted/10 border-border/50 cursor-not-allowed opacity-70" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={formData.phone || ""} 
              onChange={(e) => onChange("phone", e.target.value)}
              className="pl-11 h-[52px] rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20" 
              placeholder="+33 6 00 00 00 00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Date of Birth</Label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              type="date"
              value={formData.dob || ""} 
              onChange={(e) => onChange("dob", e.target.value)}
              className="pl-11 h-[52px] rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Gender</Label>
          <Select value={formData.gender || ""} onValueChange={(val) => onChange("gender", val)}>
            <SelectTrigger className="h-[52px] rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Nationality</Label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={formData.nationality || ""} 
              onChange={(e) => onChange("nationality", e.target.value)}
              className="pl-11 h-[52px] rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20" 
              placeholder="French"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Preferred Language</Label>
          <Select value={formData.preferred_language || "fr"} onValueChange={(val) => onChange("preferred_language", val)}>
            <SelectTrigger className="h-[52px] rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">Arabic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Full Address</Label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={formData.address || ""} 
              onChange={(e) => onChange("address", e.target.value)}
              className="pl-11 h-[52px] rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20" 
              placeholder="Street address, apartment, etc."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">City</Label>
          <Input 
            value={formData.city || ""} 
            onChange={(e) => onChange("city", e.target.value)}
            className="h-[52px] rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20" 
            placeholder="Paris"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Country</Label>
          <Input 
            value={formData.country || ""} 
            onChange={(e) => onChange("country", e.target.value)}
            className="h-[52px] rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20" 
            placeholder="France"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Emergency Contact Name</Label>
          <Input 
            value={formData.emergency_contact_name || ""} 
            onChange={(e) => onChange("emergency_contact_name", e.target.value)}
            className="h-[52px] rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20" 
            placeholder="Name of contact"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Emergency Contact Phone</Label>
          <Input 
            value={formData.emergency_contact_phone || ""} 
            onChange={(e) => onChange("emergency_contact_phone", e.target.value)}
            className="h-[52px] rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20" 
            placeholder="+33 6 00 00 00 00"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Preferred Communication</Label>
          <Select value={formData.preferred_communication || "email"} onValueChange={(val) => onChange("preferred_communication", val)}>
            <SelectTrigger className="h-[52px] rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20">
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};
