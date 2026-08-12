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
      className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-primary/20"
    >
      {/* Doctor Photo Section */}
      <div className="relative mb-6 flex flex-col items-center">
        <div className="relative h-40 w-40">
          <div className="absolute inset-0 rounded-full border border-slate-100 bg-slate-50 shadow-inner" />
          
          <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white shadow-md">
            {doctor.avatar_url ? (
              <img
                src={doctor.avatar_url}
                alt={doctor.full_name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-3xl font-bold text-slate-400">
                {initialsOf(doctor.full_name)}
              </div>
            )}
          </div>
        </div>

        {/* CTA Button Overlay */}
        <div className="mt-6 w-full">
          <Button 
            asChild 
            className="w-full h-10 rounded-full bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-[0.98]"
          >
            <Link to={`/booking?doctor=${doctor.id}`}>
              Get Appointment
            </Link>
          </Button>
        </div>
      </div>

      {/* Doctor Name & Specialty */}
      <div className="flex flex-col items-center text-center">
        <h3 
          onClick={() => setProfileOpen(true)}
          className="cursor-pointer text-2xl font-bold text-[#1a2b4b] leading-tight hover:text-primary transition-colors mb-2"
        >
          {doctor.full_name}
        </h3>
        
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-3">
          {specialty}
        </p>

        <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
          Consultation - (012)3456789
        </p>
      </div>

      <DoctorProfileDialog doctor={doctor} open={profileOpen} onOpenChange={setProfileOpen} />
    </motion.article>
  );
};

export default DoctorCard;