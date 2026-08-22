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
  Mail,
  ChevronRight,
  Filter,
  MoreVertical
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
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
    } catch (error) {
      console.error("Error loading patients:", error);
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
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
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Patients</h1>
          <p className="text-slate-500 font-medium">
            Manage your patient database and track registration status.
          </p>
        </div>
        <Button 
          asChild 
          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] h-12 px-8 rounded-2xl"
        >
          <Link to="/admin/patients/create" className="flex items-center gap-2 font-semibold">
            <UserPlus className="w-5 h-5" />
            Add New Patient
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Patients", value: counts.all, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Registered", value: counts.registered, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending Setup", value: counts.not_registered, icon: UserMinus, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat, i) => (
          <Card key={i} className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-shadow duration-300 rounded-[24px]">
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Toolbar / Search Section */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-4">
        <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 w-full lg:w-auto overflow-x-auto">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="w-full">
            <TabsList className="bg-transparent h-11 p-0 gap-1 flex justify-start lg:justify-center">
              {[
                { value: "all", label: "All Patients" },
                { value: "registered", label: "Registered" },
                { value: "not_registered", label: "Pending" }
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className="px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-semibold text-slate-600"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-96 group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, phone or email..."
              className="pl-12 h-12 border-slate-100 bg-white focus:ring-primary/20 focus:border-primary transition-all rounded-2xl shadow-sm text-base"
            />
          </div>
          <Button variant="outline" className="h-12 w-12 rounded-2xl p-0 border-slate-100 bg-white text-slate-600 shadow-sm hover:bg-slate-50">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Patient List Content */}
      <div className="space-y-4 pt-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-6 border-none shadow-sm bg-white rounded-[24px] animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-slate-100 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-48 bg-slate-100 rounded-lg" />
                  <div className="h-4 w-32 bg-slate-100 rounded-lg" />
                </div>
              </div>
            </Card>
          ))
        ) : visibleRows.length > 0 ? (
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-[1fr_200px_200px_150px_100px] gap-4 px-8 py-5 border-b border-slate-50 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <div>Patient</div>
              <div>Contact</div>
              <div>Added Date</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>

            <div className="divide-y divide-slate-50">
              {visibleRows.map((p) => (
                <div 
                  key={p.key}
                  className="group md:grid md:grid-cols-[1fr_200px_200px_150px_100px] gap-4 px-8 py-6 items-center hover:bg-slate-50/70 transition-all duration-300"
                >
                  {/* Patient Info */}
                  <div className="flex items-center gap-5 min-w-0">
                    <Avatar className="h-16 w-16 border-4 border-white shadow-md rounded-2xl group-hover:scale-105 transition-transform">
                      <AvatarImage src={p.avatar_url || ""} alt={p.full_name || ""} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 text-primary font-black text-xl">
                        {getInitials(p.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg text-slate-900 truncate mb-1">
                        {p.full_name || "Unnamed Patient"}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-slate-100 text-slate-500 border-none text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                          ID: {p.profile_id?.substring(0, 8) || p.intake_id?.substring(0, 8)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info (Desktop Only) */}
                  <div className="hidden md:flex flex-col gap-1 text-sm">
                    {p.phone && (
                      <span className="flex items-center gap-2 text-slate-600 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {p.phone}
                      </span>
                    )}
                    {p.email && (
                      <span className="flex items-center gap-2 text-slate-400 truncate">
                        <Mail className="w-3.5 h-3.5" />
                        {p.email}
                      </span>
                    )}
                  </div>

                  {/* Added Date (Desktop Only) */}
                  <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {new Date(p.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>

                  {/* Status */}
                  <div className="hidden md:block">
                    {p.profile_id ? (
                      <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100/50 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                        Registered
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-600 border border-amber-100/50 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                        Pending
                      </Badge>
                    )}
                  </div>

                  {/* Actions (Desktop) */}
                  <div className="hidden md:flex items-center justify-end gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            asChild
                            className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary text-slate-400"
                          >
                            <Link to={`/admin/patients/details/${p.profile_id || p.intake_id}`}>
                              <Eye className="w-5 h-5" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View Record</TooltipContent>
                      </Tooltip>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-400">
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-slate-100 shadow-xl">
                          {p.profile_id && (
                            <DropdownMenuItem onClick={() => setEditingId(p.profile_id!)} className="rounded-xl p-3 cursor-pointer">
                              <Pencil className="w-4 h-4 mr-3 text-slate-400" />
                              <span className="font-semibold text-slate-700">Edit Profile</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => remove(p)} className="rounded-xl p-3 cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                            <Trash2 className="w-4 h-4 mr-3" />
                            <span className="font-semibold">Delete Record</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipProvider>
                  </div>

                  {/* Mobile Mobile View Layout */}
                  <div className="md:hidden mt-6 space-y-4 pt-4 border-t border-slate-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Contact</span>
                        <p className="text-sm font-medium text-slate-700">{p.phone || p.email || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                        <div>
                          {p.profile_id ? (
                            <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-bold uppercase">Registered</Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-600 border-none text-[10px] font-bold uppercase">Pending</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button asChild className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-900 border-none rounded-xl h-11">
                        <Link to={`/admin/patients/details/${p.profile_id || p.intake_id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Record
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="h-11 w-11 rounded-xl border-slate-100 shadow-sm">
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-slate-100">
                          {p.profile_id && (
                            <DropdownMenuItem onClick={() => setEditingId(p.profile_id!)} className="rounded-xl p-3">
                              <Pencil className="w-4 h-4 mr-3" /> Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => remove(p)} className="rounded-xl p-3 text-rose-600">
                            <Trash2 className="w-4 h-4 mr-3" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center py-24 bg-white border-dashed border-2 border-slate-200 rounded-[40px] shadow-sm">
            <div className="p-6 rounded-3xl bg-slate-50 mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-16 h-16 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Patients Found</h3>
            <p className="text-slate-500 text-center max-w-sm px-6 font-medium text-lg leading-relaxed">
              {rows.length === 0 
                ? "Your patient database is currently empty. Start growing your clinic today." 
                : "We couldn't find any patients matching your current search criteria."}
            </p>
            {rows.length === 0 && (
              <Button asChild className="mt-8 h-12 px-8 rounded-2xl shadow-lg shadow-primary/20">
                <Link to="/admin/patients/create">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add Your First Patient
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