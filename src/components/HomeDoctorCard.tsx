import { Link } from "react-router-dom";
import { Calendar, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export type HomeDoctorCardProps = {
  doctor: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    experience_years: number | null;
    specialties: { name: string } | null;
    is_available?: boolean;
  };
  index: number;
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

export const HomeDoctorCard = ({ doctor, index }: HomeDoctorCardProps) => {
  const specialty = doctor.specialties?.name || "Praticien";

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -8 }}
      className="group relative flex flex-col overflow-hidden rounded-[28px] border border-[#E5E7EB] bg-white p-8 shadow-soft transition-all duration-350 hover:shadow-large"
    >
      {/* Top Section with Avatar */}
      <div className="relative mb-6 flex justify-center">
        <div className="relative h-[160px] w-[160px]">
          {/* Soft blue outer ring */}
          <div className="absolute inset-[-4px] rounded-full bg-[#2563EB]/5 transition-colors duration-300 group-hover:bg-[#2563EB]/10" />
          
          <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white shadow-sm">
            {doctor.avatar_url ? (
              <img
                src={doctor.avatar_url}
                alt={doctor.full_name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-50 text-3xl font-bold text-slate-300">
                {initialsOf(doctor.full_name)}
              </div>
            )}
          </div>

          {/* Green availability indicator */}
          {doctor.is_available !== false && (
            <div className="absolute bottom-3 right-3 flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-white bg-[#22C55E] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-white opacity-75" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col text-center">
        <h3 className="text-2xl font-bold tracking-tight text-[#111827] mb-2">
          {doctor.full_name}
        </h3>

        <div className="mb-4 flex justify-center">
          <span className="rounded-full bg-[#2563EB]/5 px-4 py-1 text-sm font-semibold text-[#2563EB]">
            {specialty}
          </span>
        </div>

        <p className="mb-8 text-sm font-medium text-slate-400">
          Available this week
        </p>

        {/* CTA Button */}
        <Button 
          asChild 
          className="mt-auto h-[52px] w-full rounded-[16px] bg-gradient-to-r from-[#203080] to-[#2563EB] text-base font-bold text-white shadow-md transition-all hover:translate-y-[-2px] hover:shadow-lg active:scale-[0.98] hover:glow"
        >
          <Link 
            to={`/booking?doctor_id=${doctor.id}&doctor_name=${encodeURIComponent(doctor.full_name)}&doctor_specialty=${encodeURIComponent(specialty)}`} 
            className="flex items-center justify-center gap-2"
          >
            <Calendar className="h-5 w-5" />
            Book Appointment
          </Link>
        </Button>
      </div>
    </motion.article>
  );
};
