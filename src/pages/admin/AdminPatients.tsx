import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trash2, 
  Pencil, 
  UserPlus, 
  Search, 
  Eye, 
  Users, 
  UserCheck, 
  UserMinus,
  Calendar,
  Phone,
  Mail
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditPatientDialog } from "@/components/admin/EditPatientDialog";

type Row = {
  key: string;
  source: "intake" | "profile";
  intake_id?: string;
  profile_id?: string;
  full_name: string | null;
  phone: string | null;
  email?: string | null;
  created_at: string;
  avatar_url?: string | null;
};

const AdminPatients = () => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Row[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "registered" | "not_registered">("all");
  const [query, setQuery] = useState("");

  const load = async () => {
    // 1. Patient intake records
    const { data: intake } = await supabase
      .from("patient_intake")
      .select("id, user_id, first_name, last_name, phone, email, created_at")
      .order("created_at", { ascending: false });

    // 2. Registered patient profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, phone, created_at, avatar_url")
      .order("created_at", { ascending: false });

    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const rmap = new Map<string, string[]>();
    (roles || []).forEach((r: any) => {
      rmap.set(r.user_id, [...(rmap.get(r.user_id) || []), r.role]);
    });

    const intakeUserIds = new Set((intake || []).map((i: any) => i.user_id).filter(Boolean));

    const intakeRows: Row[] = (intake || []).map((i: any) => ({
      key: `intake:${i.id}`,
      source: "intake",
      intake_id: i.id,
      profile_id: i.user_id || undefined,
      full_name: [i.first_name, i.last_name].filter(Boolean).join(" ") || null,
      phone: i.phone,
      email: i.email,
      created_at: i.created_at,
    }));

    const profileRows: Row[] = (profiles || [])
      .filter((p: any) => {
        const r = rmap.get(p.id) || [];
        if (!r.includes("patient")) return false;
        if (r.includes("admin") || r.includes("assistant") || r.includes("doctor")) return false;
        if (intakeUserIds.has(p.id)) return false;
        return true;
      })
      .map((p: any) => ({
        key: `profile:${p.id}`,
        source: "profile",
        profile_id: p.id,
        full_name: p.full_name,
        phone: p.phone,
        created_at: p.created_at,
        avatar_url: p.avatar_url,
      }));

    const all = [...intakeRows, ...profileRows].sort(
      (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
    );
    setRows(all);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (row: Row) => {
    if (!confirm("Delete this patient record?")) return;
    if (row.source === "intake" && row.intake_id) {
      const { error } = await supabase.from("patient_intake").delete().eq("id", row.intake_id);
      if (error) return toast.error(error.message);
    } else if (row.profile_id) {
      const { error } = await supabase.from("profiles").delete().eq("id", row.profile_id);
      if (error) return toast.error(error.message);
    }
    toast.success("Deleted");
    load();
  };

  const counts = useMemo(() => {
    const registered = rows.filter((r) => !!r.profile_id).length;
    const notReg = rows.length - registered;
    return { all: rows.length, registered, not_registered: notReg };
  }, [rows]);

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "registered" && !r.profile_id) return false;
      if (filter === "not_registered" && r.profile_id) return false;
      if (!q) return true;
      return (
        (r.full_name || "").toLowerCase().includes(q) ||
        (r.phone || "").toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q)
      );
    });
  }, [rows, filter, query]);

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">Patients</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage and organize all patients registered in your clinic.
          </p>
        </div>
        <Button 
          asChild 
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] h-11 px-6 rounded-md"
        >
          <Link to="/admin/patients/create" className="flex items-center gap-2 font-medium">
            <UserPlus className="w-5 h-5" />
            Add New Patient
          </Link>
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Patients", value: counts.all, icon: Users, color: "text-primary" },
          { label: "Registered", value: counts.registered, icon: UserCheck, color: "text-emerald-600" },
          { label: "Not Registered", value: counts.not_registered, icon: UserMinus, color: "text-amber-600" },
        ].map((stat, i) => (
          <Card key={i} className="p-5 flex items-center justify-between border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className={`p-2.5 rounded-lg bg-background border border-border/50 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </Card>
        ))}
      </div>

      {/* Toolbar Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-1.5 bg-card/30 backdrop-blur-md rounded-xl border border-border/40">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="w-full md:w-auto">
          <TabsList className="bg-transparent h-10 p-1 gap-1">
            <TabsTrigger 
              value="all" 
              className="px-4 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              {t("patients.list.allPatients", { defaultValue: "All Patients" })}
            </TabsTrigger>
            <TabsTrigger 
              value="registered"
              className="px-4 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              {t("patients.list.registered", { defaultValue: "Registered" })}
            </TabsTrigger>
            <TabsTrigger 
              value="not_registered"
              className="px-4 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              {t("patients.list.notRegistered", { defaultValue: "Not Registered" })}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-80 group">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("patients.list.searchPlaceholder", { defaultValue: "Search patients..." })}
            className="pl-10 h-10 border-border/60 bg-background/50 focus:bg-background transition-all rounded-lg"
          />
        </div>
      </div>

      {/* List Section */}
      <div className="space-y-3">
        {visibleRows.map((p) => (
          <Card 
            key={p.key} 
            className="group p-4 flex flex-col sm:flex-row sm:items-center gap-4 border-border/40 bg-card hover:bg-muted/30 hover:border-border/80 transition-all duration-300 shadow-sm hover:shadow-md rounded-xl"
          >
            {/* Avatar & Basic Info */}
            <div className="flex items-center gap-4 flex-1">
              <Avatar className="h-12 w-12 border-2 border-border/50 shadow-sm group-hover:border-primary/20 transition-colors">
                <AvatarImage src={p.avatar_url || ""} alt={p.full_name || "Patient"} />
                <AvatarFallback className="bg-primary/5 text-primary font-bold text-sm">
                  {getInitials(p.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base text-foreground truncate max-w-[200px]">
                    {p.full_name || "Unnamed Patient"}
                  </h3>
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase font-bold tracking-wider hover:bg-primary/15">
                    {t("nav.patients")}
                  </Badge>
                  {p.profile_id ? (
                    <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px] uppercase font-bold tracking-wider hover:bg-emerald-100/50">
                      {t("patients.list.registered", { defaultValue: "Registered" })}
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-500 border-none text-[10px] uppercase font-bold tracking-wider hover:bg-slate-200/50">
                      {t("patients.list.notRegistered", { defaultValue: "Not Registered" })}
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  {p.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 opacity-60" />
                      {p.phone}
                    </span>
                  )}
                  {p.email && !p.phone && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 opacity-60" />
                      {p.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 opacity-60" />
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 sm:pt-0 sm:border-l sm:pl-4 border-border/50">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      asChild
                      className="h-9 px-3 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                    >
                      <Link to={`/admin/patients/details/${p.profile_id || p.intake_id}`}>
                        <Eye className="w-4 h-4 sm:mr-2" />
                        <span className="hidden lg:inline text-xs font-medium">View</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View patient details</TooltipContent>
                </Tooltip>

                {p.profile_id && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setEditingId(p.profile_id!)}
                        className="h-9 px-3 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                      >
                        <Pencil className="w-4 h-4 sm:mr-2" />
                        <span className="hidden lg:inline text-xs font-medium">Edit</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit profile</TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => remove(p)}
                      className="h-9 px-3 hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                    >
                      <Trash2 className="w-4 h-4 sm:mr-2" />
                      <span className="hidden lg:inline text-xs font-medium">Delete</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete record</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </Card>
        ))}

        {visibleRows.length === 0 && (
          <Card className="flex flex-col items-center justify-center py-20 bg-muted/20 border-dashed border-2 rounded-2xl">
            <div className="p-4 rounded-full bg-primary/5 mb-4">
              <Users className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">No patients found</h3>
            <p className="text-muted-foreground text-center max-w-sm px-6">
              {rows.length === 0 
                ? "Your patient list is currently empty. Start by adding your first patient." 
                : "There are no patients matching your current search or filter criteria."}
            </p>
            {rows.length === 0 && (
              <Button asChild className="mt-6">
                <Link to="/admin/patients/create">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add New Patient
                </Link>
              </Button>
            )}
          </Card>
        )}
      </div>

      {editingId && (
        <EditPatientDialog
          open={!!editingId}
          onOpenChange={(v) => !v && setEditingId(null)}
          profileId={editingId}
          onSaved={load}
        />
      )}
    </div>
  );
};

export default AdminPatients;