import { Card } from "@/components/ui/card";
import { Lock, Smartphone, ShieldCheck, Download, Trash2, ChevronRight } from "lucide-react";

export const ProfileQuickActions = () => {
  const actions = [
    { icon: Lock, label: "Change Password", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Smartphone, label: "Two-Factor Auth", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: ShieldCheck, label: "Manage Devices", color: "text-emerald-500", bg: "bg-emerald-50" },
    { icon: Download, label: "Download My Data", color: "text-amber-500", bg: "bg-amber-50" },
    { icon: Trash2, label: "Delete Account", color: "text-rose-500", bg: "bg-rose-50" },
  ];

  return (
    <Card className="p-6 border-border bg-card shadow-sm rounded-[24px] mt-6">
      <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
      <div className="space-y-1">
        {actions.map((action, i) => (
          <button
            key={i}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${action.bg} ${action.color} flex items-center justify-center`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm">{action.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </Card>
  );
};
