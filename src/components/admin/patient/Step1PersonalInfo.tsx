import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImagePlus, User, MapPin, Briefcase, Globe, Info } from "lucide-react";
import { PatientFormData } from "./PatientWizard";
import { useState, useEffect } from "react";

interface StepProps {
  formData: PatientFormData;
  onChange: (data: Partial<PatientFormData>) => void;
}

const Step1PersonalInfo = ({ formData, onChange }: StepProps) => {
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge);
    } else {
      setAge(null);
    }
  }, [formData.dob]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to storage here. For now, we'll use a preview.
      const url = URL.createObjectURL(file);
      onChange({ avatar_url: url });
    }
  };

  return (
    <div className="space-y-8">
      {/* Patient Profile Card */}
      <Card className="p-8 border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xl rounded-[20px] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />
        
        <div className="flex items-center gap-2 mb-8 text-primary">
          <User className="w-5 h-5" />
          <h2 className="text-xl font-bold">Patient Profile</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <Avatar className="w-32 h-32 rounded-[24px] border-4 border-white dark:border-slate-800 shadow-2xl transition-transform group-hover:scale-105">
                <AvatarImage src={formData.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-primary/5 text-primary">
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-2 right-2 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-all">
                <ImagePlus className="w-5 h-5" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold">Profile Picture</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">ID: #NEW-PT</p>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name *</Label>
              <Input 
                value={formData.first_name} 
                onChange={(e) => onChange({ first_name: e.target.value })}
                className="h-12 px-4 rounded-xl border-border/50 focus:ring-primary/20 transition-all"
                placeholder="Ex: Aisha"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name *</Label>
              <Input 
                value={formData.last_name} 
                onChange={(e) => onChange({ last_name: e.target.value })}
                className="h-12 px-4 rounded-xl border-border/50 focus:ring-primary/20 transition-all"
                placeholder="Ex: Missou"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender *</Label>
              <Select value={formData.gender} onValueChange={(v) => onChange({ gender: v })}>
                <SelectTrigger className="h-12 px-4 rounded-xl border-border/50">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">DOB *</Label>
                <Input 
                  type="date"
                  value={formData.dob} 
                  onChange={(e) => onChange({ dob: e.target.value })}
                  className="h-12 px-4 rounded-xl border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Age</Label>
                <div className="h-12 px-4 rounded-xl border border-border/50 bg-muted/30 flex items-center font-bold">
                  {age !== null ? `${age} yrs` : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-border/50">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Marital Status</Label>
            <Select value={formData.marital_status} onValueChange={(v) => onChange({ marital_status: v })}>
              <SelectTrigger className="h-12 px-4 rounded-xl border-border/50">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nationality</Label>
            <Input 
              value={formData.nationality} 
              onChange={(e) => onChange({ nationality: e.target.value })}
              className="h-12 px-4 rounded-xl border-border/50"
              placeholder="Ex: Moroccan"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">National ID / Passport</Label>
            <Input 
              value={formData.national_id} 
              onChange={(e) => onChange({ national_id: e.target.value })}
              className="h-12 px-4 rounded-xl border-border/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Occupation</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                value={formData.occupation} 
                onChange={(e) => onChange({ occupation: e.target.value })}
                className="h-12 pl-10 pr-4 rounded-xl border-border/50"
                placeholder="Ex: Engineer"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
            <Input 
              type="email"
              value={formData.email} 
              onChange={(e) => onChange({ email: e.target.value })}
              className="h-12 px-4 rounded-xl border-border/50"
              placeholder="patient@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mobile Phone</Label>
            <Input 
              value={formData.phone} 
              onChange={(e) => onChange({ phone: e.target.value })}
              className="h-12 px-4 rounded-xl border-border/50"
              placeholder="+212 ..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preferred Language</Label>
            <Select value={formData.preferred_language} onValueChange={(v) => onChange({ preferred_language: v })}>
              <SelectTrigger className="h-12 px-4 rounded-xl border-border/50">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Address Card */}
      <Card className="p-8 border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xl rounded-[20px] overflow-hidden">
        <div className="flex items-center gap-2 mb-8 text-primary">
          <MapPin className="w-5 h-5" />
          <h2 className="text-xl font-bold">Address Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Country</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                value={formData.country} 
                onChange={(e) => onChange({ country: e.target.value })}
                className="h-12 pl-10 pr-4 rounded-xl border-border/50"
                placeholder="Ex: Morocco"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">City</Label>
            <Input 
              value={formData.city} 
              onChange={(e) => onChange({ city: e.target.value })}
              className="h-12 px-4 rounded-xl border-border/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Postal Code</Label>
            <Input 
              value={formData.postal_code} 
              onChange={(e) => onChange({ postal_code: e.target.value })}
              className="h-12 px-4 rounded-xl border-border/50"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Street Address</Label>
            <Input 
              value={formData.street_address} 
              onChange={(e) => onChange({ street_address: e.target.value })}
              className="h-12 px-4 rounded-xl border-border/50"
              placeholder="Building, Street, etc."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Google Maps Location</Label>
            <Input 
              value={formData.google_maps_location} 
              onChange={(e) => onChange({ google_maps_location: e.target.value })}
              className="h-12 px-4 rounded-xl border-border/50 text-xs"
              placeholder="Paste URL (Optional)"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Step1PersonalInfo;
