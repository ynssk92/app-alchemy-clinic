import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  UserRound, 
  CalendarDays, 
  Languages, 
  Star, 
  Clock, 
  ShieldCheck, 
  MapPin,
  ChevronRight,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DoctorProfileDialog } from "@/components/DoctorProfileDialog";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type DoctorCardData = {
  id: string;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  experience_years: number | null;
  specialties: { name: string } | null;
  rating?: number | null;
  clinics?: { name: string } | null;
  is_available?: boolean;
};

const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const DoctorCard = ({ doctor }: { doctor: DoctorCardData }) => {
  const specialty = doctor.specialties?.name || "Praticien";
  const [profileOpen, setProfileOpen] = useState(false);
  const rating = doctor.rating || 4.9;
  const clinicName = doctor.clinics?.name || "La Dune Clinique";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/10"
    >
      {/* Availability Status Indicator */}
      <div className="absolute top-6 right-6 z-10">
        <div className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-white/80 backdrop-blur-sm border",
          doctor.is_available !== false 
            ? "text-emerald-600 border-emerald-100" 
            : "text-slate-400 border-slate-100"
        )}>
          <div className={cn(
            "h-1.5 w-1.5 rounded-full",
            doctor.is_available !== false ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
          )} />
          {doctor.is_available !== false ? "Available" : "Unavailable"}
        </div>
      </div>

      {/* Doctor Photo Section */}
      <div className="relative mb-6 flex justify-center pt-2">
        <div className="relative h-32 w-32">
          {/* Subtle blue-gray ring around the image */}
          <div className="absolute inset-[-6px] rounded-full border border-slate-100 ring-4 ring-slate-50/50" />
          
          <div className="relative h-full w-full overflow-hidden rounded-full bg-slate-50 border-2 border-white shadow-sm">
            {doctor.avatar_url ? (
              <img
                src={doctor.avatar_url}
                alt={doctor.full_name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-2xl font-bold text-slate-400">
                {initialsOf(doctor.full_name)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Name & Specialty */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          <h3 className="text-xl font-bold text-[#1a2b4b] leading-tight group-hover:text-primary transition-colors">
            {doctor.full_name}
          </h3>
          <ShieldCheck className="h-4 w-4 text-primary" />
        </div>
        
        <span className="inline-flex px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-semibold tracking-medium">
          {specialty}
        </span>
      </div>

      {/* Information Area - Compact Icons & Typography */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-8 border-t border-slate-50 pt-6">
        <div className="flex items-center gap-2.5">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Rating</p>
            <p className="text-xs font-semibold text-slate-700">{rating}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
            <Award className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Experience</p>
            <p className="text-xs font-semibold text-slate-700">{doctor.experience_years || 5}+ Years</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
            <Languages className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Languages</p>
            <p className="text-xs font-semibold text-slate-700">FR, EN, AR</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
            <MapPin className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Clinic</p>
            <p className="text-xs font-semibold text-slate-700 truncate">{clinicName}</p>
          </div>
        </div>
      </div>

      {/* Next Availability Highlight */}
      <div className="mb-6 rounded-2xl bg-slate-50/50 border border-slate-100/50 p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Next availability</span>
          <span className="text-[10px] font-bold text-emerald-600">Available Today</span>
        </div>
        <p className="text-sm font-bold text-[#1a2b4b]">Tomorrow at 09:30</p>
      </div>

      {/* Primary Actions */}
      <div className="mt-auto flex flex-col gap-3">
        <Button 
          asChild 
          className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-sm transition-all active:scale-[0.98]"
        >
          <Link to={`/booking?doctor=${doctor.id}`} className="flex items-center justify-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Make an appointment
          </Link>
        </Button>
        
        <button
          onClick={() => setProfileOpen(true)}
          className="w-full py-2 text-sm font-bold text-primary flex items-center justify-center gap-1 hover:gap-2 transition-all"
        >
          View profile
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <DoctorProfileDialog doctor={doctor} open={profileOpen} onOpenChange={setProfileOpen} />
    </motion.article>
  );
};

export default DoctorCard;