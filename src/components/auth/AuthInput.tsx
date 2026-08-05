import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  label: string;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, type, icon: Icon, label, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        <label className="text-xs font-semibold text-slate-500 ml-1">{label}</label>
        <div className="relative">
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon size={18} />
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-[52px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background transition-all placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
              Icon && "pl-11",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
      </div>
    );
  }
);
AuthInput.displayName = "AuthInput";
