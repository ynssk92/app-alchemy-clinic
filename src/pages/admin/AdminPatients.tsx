import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Pencil, UserPlus, Search, Eye, Filter, Loader2 } from "lucide-react";
import { EditPatientDialog } from "@/components/admin/EditPatientDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  patient_number: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  status: string;
  created_at: string;
};

const AdminPatients = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "blocked">("all");
  const [query, setQuery] = useState("");
  const [editingPatient, setEditingPatient] = useState<{id: string, user_id?: string} | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, patient_number, first_name, last_name, phone, email, status, created_at, user_id")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const mapped: Row[] = (data || []).map(p => ({
        id: p.id,
        patient_number: p.patient_number || '—',
        full_name: `${p.first_name} ${p.last_name}`,
        phone: p.phone,
        email: p.email,
         status: p.status || 'active',
        created_at: p.created_at,
        user_id: p.user_id,
      }));

      setRows(mapped);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this patient record? All history will be lost.")) return;
    const { error } = await supabase.from("patients").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!q) return true;
      return (
        r.full_name.toLowerCase().includes(q) ||
        (r.phone || "").toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q) ||
        r.patient_number.toLowerCase().includes(q)
      );
    });
  }, [rows, filter, query]);

  const stats = useMemo(() => ({
    all: rows.length,
    active: rows.filter(r => r.status === 'active').length,
    inactive: rows.filter(r => r.status === 'inactive').length,
    blocked: rows.filter(r => r.status === 'blocked').length,
  }), [rows]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground mt-1">Manage your clinic's premium EMR records</p>
        </div>
        <Button asChild className="bg-gradient-primary text-primary-foreground gap-2 rounded-xl h-12 px-6 shadow-lg shadow-primary/20">
          <Link to="/admin/patients/create">
            <UserPlus className="w-4 h-4" />
            Add New Patient
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-fit">
          <TabsList className="bg-white/50 dark:bg-slate-900/50 border border-border/50 h-11 p-1 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg h-9 font-bold px-4">All ({stats.all})</TabsTrigger>
            <TabsTrigger value="active" className="rounded-lg h-9 font-bold px-4">Active ({stats.active})</TabsTrigger>
            <TabsTrigger value="inactive" className="rounded-lg h-9 font-bold px-4">Inactive ({stats.inactive})</TabsTrigger>
            <TabsTrigger value="blocked" className="rounded-lg h-9 font-bold px-4 text-destructive">Blocked ({stats.blocked})</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative md:ml-auto md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, ID, phone..."
            className="pl-9 h-11 rounded-xl bg-white/50 dark:bg-slate-900/50 border-border/50"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-24 w-full bg-muted animate-pulse rounded-2xl" />
          ))
        ) : visibleRows.map((p) => (
          <Card key={p.id} className="p-4 flex items-center gap-4 border-none bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm rounded-2xl hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold">
              {p.full_name[0]}
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg">{p.full_name}</h3>
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest bg-white dark:bg-slate-900">{p.patient_number}</Badge>
                <Badge className={cn(
                  "rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  p.status === 'active' ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
                )}>
                  {p.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-3">
                <span>{p.phone || "No phone"}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{p.email || "No email"}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>Added {new Date(p.created_at).toLocaleDateString()}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="ghost" asChild className="rounded-xl h-10 px-4 hover:bg-primary/5 hover:text-primary">
                <Link to={`/admin/patients/details/${p.id}`}>
                  <Eye className="w-4 h-4 mr-2" /> View
                </Link>
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="rounded-xl h-10 px-4 hover:bg-primary/5 hover:text-primary"
                onClick={() => setEditingPatient({ id: p.id, user_id: (p as any).user_id })}
              >
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button size="icon" variant="ghost" onClick={() => remove(p.id)} className="rounded-xl h-10 w-10 hover:bg-destructive/5 hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
        {!loading && visibleRows.length === 0 && (
          <Card className="p-20 border-none bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl text-center">
            <Search className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="font-bold text-xl">No patients found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your filters or add a new patient</p>
            <Button asChild variant="outline" className="mt-6 rounded-xl">
              <Link to="/admin/patients/create">Add First Patient</Link>
            </Button>
          </Card>
        )}
      </div>

      <EditPatientDialog
        open={!!editingPatient}
        onOpenChange={(open) => !open && setEditingPatient(null)}
        intakeId={editingPatient?.id}
        profileId={editingPatient?.user_id}
        onSaved={load}
      />
    </div>
  );
};

export default AdminPatients;
