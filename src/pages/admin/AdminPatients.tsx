import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Pencil, UserPlus } from "lucide-react";
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Patients</h1>
          <p className="text-muted-foreground">All registered patients.</p>
        </div>
        <Button asChild className="bg-gradient-primary text-primary-foreground gap-2">
          <Link to="/admin/patients/create">
            <UserPlus className="w-4 h-4" />
            Add New Patient
          </Link>
        </Button>
      </div>

      <div className="grid gap-3">
        {rows.map((p) => (
          <Card key={p.key} className="p-4 flex items-center gap-4 border-border bg-card flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-bold">{p.full_name || "Unnamed"}</h3>
                <Badge variant="secondary">Patient</Badge>
                {p.source === "intake" && !p.profile_id && (
                  <Badge variant="outline">Not registered</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {p.phone || p.email || "No contact"} • Added{" "}
                {new Date(p.created_at).toLocaleDateString()}
              </p>
            </div>
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
        {rows.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No patients yet.</p>
        )}
      </div>

      {editingId && (
        <EditPatientDialog
          open={!!editingId}
          onOpenChange={(v) => !v && setEditingId(null)}
          patientId={editingId}
          onSaved={load}
        />
      )}
    </div>
  );
};

export default AdminPatients;
