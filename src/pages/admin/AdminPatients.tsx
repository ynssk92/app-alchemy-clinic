import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Pencil, UserPlus, Search, Eye } from "lucide-react";

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
};

const AdminPatients = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "registered" | "not_registered">("all");
  const [query, setQuery] = useState("");



  const load = async () => {
    // 1. Patient intake records (created via Admin → Add Patient)
    const { data: intake } = await supabase
      .from("patient_intake")
      .select("id, user_id, first_name, last_name, phone, email, created_at")
      .order("created_at", { ascending: false });

    // 2. Registered patient profiles (self-signup) — exclude staff
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, phone, created_at")
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
        if (r.includes("admin") || r.includes("assistant")) return false;
        if (intakeUserIds.has(p.id)) return false; // already represented by intake
        return true;
      })
      .map((p: any) => ({
        key: `profile:${p.id}`,
        source: "profile",
        profile_id: p.id,
        full_name: p.full_name,
        phone: p.phone,
        created_at: p.created_at,
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Patients</h1>
          <p className="text-muted-foreground">Manage registered and admin-added patients.</p>
        </div>
        <Button asChild className="bg-gradient-primary text-primary-foreground gap-2">
          <Link to="/admin/patients/create">
            <UserPlus className="w-4 h-4" />
            Add New Patient
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="registered">Registered ({counts.registered})</TabsTrigger>
            <TabsTrigger value="not_registered">Not registered ({counts.not_registered})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative md:ml-auto md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, email"
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-3">
        {visibleRows.map((p) => (
          <Card key={p.key} className="p-4 flex items-center gap-4 border-border bg-card flex-wrap">

            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-bold">{p.full_name || "Unnamed"}</h3>
                <Badge variant="secondary">Patient</Badge>
                {p.profile_id ? (
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-transparent">Registered</Badge>
                ) : (
                  <Badge variant="outline">Not registered</Badge>
                )}

              </div>
              <p className="text-sm text-muted-foreground">
                {p.phone || p.email || "No contact"} • Added{" "}
                {new Date(p.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link to={`/admin/patients/details/${p.profile_id || p.intake_id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View
              </Link>
            </Button>
            {p.profile_id && (
              <Button size="sm" variant="outline" onClick={() => setEditingId(p.profile_id!)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => remove(p)}>
              <Trash2 className="w-4 h-4" />
            </Button>

          </Card>
        ))}
        {visibleRows.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            {rows.length === 0 ? "No patients yet." : "No patients match this filter."}
          </p>
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
