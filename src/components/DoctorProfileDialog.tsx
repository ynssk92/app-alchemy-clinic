import { Link } from "react-router-dom";
import { 
  Award, 
  Calendar, 
  Languages, 
  Mail, 
  Phone, 
  Stethoscope, 
  MapPin, 
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DoctorCardData } from "@/components/DoctorCard";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { flag: "🇫🇷", label: "Français" },
  { flag: "🇺🇸", label: "English" },
  { flag: "🇲🇦", label: "العربية" },
];

const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

type Props = {
  doctor: DoctorCardData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const DoctorProfileDialog = ({ doctor, open, onOpenChange }: Props) => {
  const specialty = doctor.specialties?.name || "Praticien";
  const rating = doctor.rating || 4.9;
  const clinicName = doctor.clinics?.name || "La Dune Clinique";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden rounded-[32px] p-0 border-none shadow-large">
        <div className="relative flex flex-col md:flex-row h-full">
          {/* Left Sidebar / Hero Area */}
          <div className="relative w-full md:w-[260px] bg-slate-50 flex flex-col items-center pt-10 pb-8 px-6 border-b md:border-b-0 md:border-r border-slate-100">
            <div className="relative mb-6">
              {/* Profile Image with Ring */}
              <div className="absolute inset-[-6px] rounded-full border border-slate-200 ring-4 ring-slate-100/50" />
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-medium bg-white">
                {doctor.avatar_url ? (
                  <img
                    src={doctor.avatar_url}
                    alt={doctor.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-3xl font-bold text-slate-400">
                    {initialsOf(doctor.full_name)}
                  </div>
                )}
              </div>
              
              {/* Availability Badge Overlay */}
              {doctor.is_available !== false && (
                <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                </div>
              )}
            </div>

            <div className="text-center space-y-1 mb-6">
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Available Now</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-slate-700">{rating} / 5.0</span>
              </div>
            </div>

            {/* Quick Stats Column */}
            <div className="w-full space-y-3 mt-auto">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-soft">
                <Award className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Experience</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{doctor.experience_years || 5}+ Years</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-soft">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Location</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{clinicName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 flex flex-col p-8 md:p-10">
            <DialogHeader className="mb-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-3xl font-bold text-[#1a2b4b]">
                    {doctor.full_name}
                  </DialogTitle>
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <DialogDescription className="text-base font-semibold text-primary flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  {specialty}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="flex-1 space-y-8">
              {/* About Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Professional Summary</h4>
                <p className="text-base leading-relaxed text-slate-600">
                  {doctor.bio ||
                    `${doctor.full_name} is a dedicated ${specialty} at ${clinicName}, specializing in advanced clinical techniques and personalized patient care with over ${doctor.experience_years || 5} years of experience.`}
                </p>
              </div>

              {/* Languages Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Languages className="h-3.5 w-3.5" />
                  Languages spoken
                </h4>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) => (
                    <span
                      key={l.label}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-semibold text-slate-700"
                    >
                      <span className="text-base">{l.flag}</span>
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Service Highlights */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: CheckCircle2, label: "Certified Expert" },
                  { icon: Clock, label: "Flexible Hours" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-500">
                    <item.icon className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-soft">
                <Link to={`/booking?doctor=${doctor.id}`} className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Make an appointment
                </Link>
              </Button>
              <div className="flex gap-3 shrink-0">
                <Button asChild variant="outline" className="h-12 w-12 rounded-2xl p-0 border-slate-200 hover:bg-slate-50">
                  <Link to="/contact" title="Email Doctor">
                    <Mail className="h-5 w-5 text-slate-600" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 w-12 rounded-2xl p-0 border-slate-200 hover:bg-slate-50">
                  <Link to="/contact" title="Call Clinic">
                    <Phone className="h-5 w-5 text-slate-600" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorProfileDialog;
