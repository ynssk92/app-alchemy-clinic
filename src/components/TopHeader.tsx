import { Mail, Phone, Clock } from "lucide-react";
import { useAppSettings } from "@/hooks/useAppSettings";
import { cn } from "@/lib/utils";

export const TopHeader = () => {
  const { settings } = useAppSettings();

  return (
    <div className="hidden lg:block w-full bg-white border-b border-slate-100 py-3">
      <div className="container mx-auto px-4 flex items-center justify-end gap-10">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">Email</span>
            <a href={`mailto:${settings.contact_email}`} className="text-sm font-bold text-slate-700 hover:text-primary transition-colors">
              {settings.contact_email}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-primary">
            <Phone className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">Phone</span>
            <a href={`tel:${settings.contact_phone?.replace(/\s/g, "")}`} className="text-sm font-bold text-slate-700 hover:text-primary transition-colors">
              {settings.contact_phone}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4 border-l border-slate-100 pl-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-primary">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">Office Hours</span>
            <span className="text-sm font-bold text-slate-700 italic">
              Mon - Sat : 9:00 - 19:00
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
