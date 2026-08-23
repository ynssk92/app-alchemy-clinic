import { useState, useEffect } from "react";
import { History, Search, Filter, Calendar as CalendarIcon, User as UserIcon, Activity, ExternalLink } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: any;
  created_at: string;
  actor_name?: string;
}

const AdminHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionType, setActionType] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Using 'as any' to bypass temporary type mismatch until Supabase types refresh
      let query = supabase
        .from("audit_logs" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (actionType !== "all") {
        if (actionType === "auth") {
          query = query.or("action.ilike.%login%,action.ilike.%signup%,action.ilike.%logout%");
        } else if (actionType === "create") {
          query = query.ilike("action", "%_created");
        } else if (actionType === "update") {
          query = query.ilike("action", "%_updated");
        } else if (actionType === "delete") {
          query = query.ilike("action", "%_deleted");
        }
      }

      if (searchTerm) {
        query = query.or(`actor_email.ilike.%${searchTerm}%,target_id.ilike.%${searchTerm}%`);
      }

      if (dateRange !== "all") {
        const now = new Date();
        let startDate = new Date();
        if (dateRange === "today") {
          startDate.setHours(0, 0, 0, 0);
        } else if (dateRange === "week") {
          startDate.setDate(now.getDate() - 7);
        } else if (dateRange === "month") {
          startDate.setMonth(now.getMonth() - 1);
        }
        query = query.gte("created_at", startDate.toISOString());
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      const auditLogs = (data || []) as AuditLog[];

      // Enrich with profile names
      const actorIds = [...new Set(auditLogs.map(l => l.actor_id).filter(Boolean))] as string[];
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", actorIds);
        
        const profileMap = Object.fromEntries(profiles?.map(p => [p.id, p.full_name]) || []);
        const enrichedLogs = auditLogs.map(l => ({
          ...l,
          actor_name: l.actor_id ? profileMap[l.actor_id] : null
        }));
        setLogs(enrichedLogs);
      } else {
        setLogs(auditLogs);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Erreur lors du chargement de l'historique");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleApplyFilters = () => {
    fetchLogs();
  };

  const getActionBadge = (action: string) => {
    if (action.includes("created")) return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Création</Badge>;
    if (action.includes("updated")) return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Modification</Badge>;
    if (action.includes("deleted")) return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none">Suppression</Badge>;
    if (action.includes("login") || action.includes("signup")) return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Auth</Badge>;
    return <Badge variant="secondary">{action}</Badge>;
  };

  const formatActionName = (action: string) => {
    return action
      .replace(/_/g, " ")
      .replace("created", "créé(e)")
      .replace("updated", "mis(e) à jour")
      .replace("deleted", "supprimé(e)")
      .replace("profiles", "profil")
      .replace("patient intake", "patient")
      .replace("appointments", "rendez-vous")
      .replace("admin invites", "invitation")
      .replace("user roles", "rôle utilisateur");
  };

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
              placeholder="Utilisateur ou Cible..."
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

          <Button 
            onClick={handleApplyFilters}
            variant="outline" 
            className="bg-white hover:bg-slate-50 border-slate-200"
          >
            Appliquer les filtres
          </Button>
        </div>
      </Card>

      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
        <ScrollArea className="h-[600px]">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-primary/40" />
              <p>Chargement des logs...</p>
            </div>
          ) : logs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-slate-100 rounded-lg">
                      <UserIcon className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900">
                          {log.actor_name || log.actor_email || "Système"}
                        </span>
                        {log.actor_email && (
                          <span className="text-xs text-slate-400">({log.actor_email})</span>
                        )}
                        {getActionBadge(log.action)}
                      </div>
                      <p className="text-sm text-slate-600 capitalize">
                        {formatActionName(log.action)}
                        {log.target_type && ` sur ${log.target_type}`}
                      </p>
                      {log.target_id && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-slate-400">
                          ID Cible: {log.target_id}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {format(new Date(log.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                    </span>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 px-2" onClick={() => console.log(log.details)}>
                        <ExternalLink className="w-3 h-3" />
                        Détails
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-24 text-center text-muted-foreground">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">Journal d'audit</h3>
              <p className="max-w-xs mx-auto text-sm">
                Aucune activité enregistrée pour le moment.
              </p>
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
};

export default AdminHistory;