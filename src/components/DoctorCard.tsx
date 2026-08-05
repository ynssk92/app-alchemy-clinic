import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  UserRound, 
  Stethoscope, 
  CalendarDays, 
  Languages, 
  Star, 
  Clock, 
  ShieldCheck, 
  MapPin,
  ChevronRight
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

const LANGUAGES = [
  { flag: "🇫🇷", label: "Français" },
  { flag: "🇺🇸", label: "English" },
  { flag: "🇲🇦", label: "العربية" },
];

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
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-large transition-all duration-300 sm:p-8"
    >
      {/* Top Section with Avatar */}
      <div className="relative mb-6 flex justify-center">
        <div className="relative h-[150px] w-[150px]">
          {/* Blue gradient ring */}
          <div className="absolute inset-[-4px] rounded-full bg-gradient-to-tr from-[#2563EB] via-[#3B82F6] to-[#06B6D4] opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
          
          <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white shadow-medium">
            {doctor.avatar_url ? (
              <img
                src={doctor.avatar_url}
                alt={doctor.full_name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-3xl font-bold text-white">
                {initialsOf(doctor.full_name)}
              </div>
            )}
          </div>

          {/* Online badge */}
          {doctor.is_available !== false && (
            <div className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#22C55E] shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col text-center">
        <div className="mb-2 flex items-center justify-center gap-1.5">
          <h3 className="text-[28px] font-bold tracking-tight text-[#111827]">
            {doctor.full_name}
          </h3>
          <ShieldCheck className="h-5 w-5 text-[#2563EB]" />
        </div>

        <div className="mb-4 flex justify-center">
          <span className="rounded-full bg-gradient-to-r from-[#2563EB]/10 to-[#3B82F6]/10 px-4 py-1 text-sm font-semibold text-[#2563EB]">
            {specialty}
          </span>
        </div>

        {/* Info Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 text-left">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 rounded-lg bg-slate-50 p-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rating</p>
              <p className="text-sm font-semibold text-slate-700">{rating} (120+)</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 rounded-lg bg-slate-50 p-1.5">
              <Clock className="h-4 w-4 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expérience</p>
              <p className="text-sm font-semibold text-slate-700">{doctor.experience_years || 5}+ ans</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 rounded-lg bg-slate-50 p-1.5">
              <Languages className="h-4 w-4 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Langues</p>
              <p className="text-sm font-semibold text-slate-700">FR, EN, AR</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 rounded-lg bg-slate-50 p-1.5">
              <MapPin className="h-4 w-4 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinique</p>
              <p className="text-sm font-semibold text-slate-700 truncate max-w-[80px]">{clinicName}</p>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="mb-8 rounded-2xl bg-[#F8FAFC] p-4 text-left">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Prochaine disponibilité</span>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#22C55E]">
              <div className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
              Aujourd'hui
            </span>
          </div>
          <p className="text-sm font-bold text-[#111827]">Demain à 09:30</p>
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-3">
          <Button 
            asChild 
            className="w-full h-12 rounded-xl bg-[#2563EB] text-base font-bold text-white shadow-lg transition-all hover:bg-[#1d4ed8] active:scale-[0.98]"
          >
            <Link to={`/booking?doctor=${doctor.id}`} className="flex items-center justify-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Prendre RDV
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full h-12 rounded-xl text-[#2563EB] font-bold hover:bg-[#2563EB]/5"
            onClick={() => setProfileOpen(true)}
          >
            Voir le profil
            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>

      {/* Optional Tag: Available Today */}
      <div className="absolute left-4 top-4">
        <span className="flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#22C55E] shadow-sm border border-[#22C55E]/20">
          <div className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
          Disponible
        </span>
      </div>

      <DoctorProfileDialog doctor={doctor} open={profileOpen} onOpenChange={setProfileOpen} />
    </motion.article>
  );
};

export default DoctorCard;