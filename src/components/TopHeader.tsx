import { Mail, Phone, Clock } from "lucide-react";
import { useAppSettings } from "@/hooks/useAppSettings";
import { cn } from "@/lib/utils";

export const TopHeader = () => {
  const { settings } = useAppSettings();

  return (
    <div className="hidden lg:block w-full bg-slate-50/50 border-b border-slate-100 py-2">
      <div className="container mx-auto px-4 flex items-center justify-end gap-8">
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 text-primary/60" />
          <a href={`mailto:${settings.contact_email}`} className="text-[12px] font-medium text-slate-500 hover:text-primary transition-colors">
            {settings.contact_email}
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-primary/60" />
          <a href={`tel:${settings.contact_phone?.replace(/\s/g, "")}`} className="text-[12px] font-medium text-slate-500 hover:text-primary transition-colors">
            {settings.contact_phone}
          </a>
        </div>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-8">
          <Clock className="h-3.5 w-3.5 text-primary/60" />
          <span className="text-[12px] font-medium text-slate-500 italic">
            Mon - Sat : 9:00 - 19:00
          </span>
        </div>
      </div>
    </div>
  );
};
