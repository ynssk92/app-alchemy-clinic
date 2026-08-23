import { useState } from "react";
import { History, Search, Filter, Calendar as CalendarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionType, setActionType] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
      </div>

      {/* Filters Section */}
      <Card className="p-4 border-slate-200 shadow-sm bg-white/50 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Rechercher par utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          
          <Select value={actionType} onValueChange={setActionType}>
            <SelectTrigger className="bg-white">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Type d'action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les actions</SelectItem>
              <SelectItem value="create">Création</SelectItem>
              <SelectItem value="update">Modification</SelectItem>
              <SelectItem value="delete">Suppression</SelectItem>
              <SelectItem value="auth">Authentification</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="bg-white">
              <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toute la période</SelectItem>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois-ci</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="bg-white hover:bg-slate-50 border-slate-200">
            Appliquer les filtres
          </Button>
        </div>
      </Card>

      <Card className="p-12 text-center text-muted-foreground border-dashed bg-white/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <History className="w-12 h-12 text-slate-300" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">Journal d'audit</h3>
            <p className="max-w-xs mx-auto text-sm">
              Aucun log ne correspond à vos critères de recherche pour le moment.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminHistory;
