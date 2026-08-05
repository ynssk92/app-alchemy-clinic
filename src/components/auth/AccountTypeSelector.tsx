import { cn } from "@/lib/utils";
import { User, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

interface AccountTypeSelectorProps {
  value: "patient" | "doctor";
  onChange: (value: "patient" | "doctor") => void;
}

export const AccountTypeSelector = ({ value, onChange }: AccountTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <button
        type="button"
        onClick={() => onChange("patient")}
        className={cn(
          "relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 outline-none",
          value === "patient"
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-slate-100 hover:border-slate-200 bg-white"
        )}
      >
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
          value === "patient" ? "bg-primary text-white" : "bg-slate-50 text-slate-400"
        )}>
          <User className="h-6 w-6" />
        </div>
        <div className="text-center">
          <p className={cn("font-bold text-sm", value === "patient" ? "text-primary" : "text-slate-600")}>
            Patient
          </p>
          <p className="text-[10px] text-slate-400">Book appointments</p>
        </div>
        {value === "patient" && (
          <motion.div
            layoutId="account-type-check"
            className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center"
          >
            <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </button>

      <button
        type="button"
        onClick={() => onChange("doctor")}
        className={cn(
          "relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 outline-none",
          value === "doctor"
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-slate-100 hover:border-slate-200 bg-white"
        )}
      >
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
          value === "doctor" ? "bg-primary text-white" : "bg-slate-50 text-slate-400"
        )}>
          <Stethoscope className="h-6 w-6" />
        </div>
        <div className="text-center">
          <p className={cn("font-bold text-sm", value === "doctor" ? "text-primary" : "text-slate-600")}>
            Doctor
          </p>
          <p className="text-[10px] text-slate-400">Manage patients</p>
        </div>
        {value === "doctor" && (
          <motion.div
            layoutId="account-type-check"
            className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center"
          >
            <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </button>
    </div>
  );
};
