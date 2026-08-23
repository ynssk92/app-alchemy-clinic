import { History } from "lucide-react";
import { Card } from "@/components/ui/card";

const AdminHistory = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl">
          <History className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Historique</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Journal d'audit du système et historique des actions administratives.
          </p>
        </div>
      </div>

      <Card className="p-12 text-center text-muted-foreground border-dashed bg-white/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <History className="w-12 h-12 text-slate-300" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">Historique d'audit</h3>
            <p className="max-w-xs mx-auto text-sm">
              Cette section affichera prochainement les logs détaillés des actions effectuées par les administrateurs.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminHistory;
