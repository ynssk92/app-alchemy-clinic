import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldOff, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type P = { id: string; full_name: string | null; phone: string | null; created_at: string; roles: string[] };

const AdminPatients = () => {
  const [rows, setRows] = useState<P[]>([]);

  const load = async () => {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, phone, created_at").order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const rmap = new Map<string, string[]>();
    (roles || []).forEach((r: any) => {
      rmap.set(r.user_id, [...(rmap.get(r.user_id) || []), r.role]);
    });
    setRows((profiles || []).map((p: any) => ({ ...p, roles: rmap.get(p.id) || [] })));
  };

  useEffect(() => { load(); }, []);

  const toggleAdmin = async (id: string, isAdmin: boolean) => {
    if (isAdmin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", id).eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("Admin removed");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: id, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("Admin granted");
    }
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this user's profile? Their auth account remains.")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-1">Patients & Users</h1>
      <p className="text-muted-foreground mb-8">All registered users. Grant or revoke admin here.</p>

      <div className="grid gap-3">
        {rows.map((p) => {
          const isAdmin = p.roles.includes("admin");
          return (
            <Card key={p.id} className="p-4 flex items-center gap-4 border-border bg-card">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold">{p.full_name || "Unnamed"}</h3>
                  {isAdmin && <Badge>Admin</Badge>}
                  {p.roles.includes("patient") && <Badge variant="secondary">Patient</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {p.phone || "No phone"} • Joined {new Date(p.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button size="sm" variant={isAdmin ? "outline" : "default"} onClick={() => toggleAdmin(p.id, isAdmin)}>
                {isAdmin ? <><ShieldOff className="w-4 h-4 mr-2" />Revoke Admin</> : <><Shield className="w-4 h-4 mr-2" />Make Admin</>}
              </Button>
              <Button size="sm" variant="outline" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4" /></Button>
            </Card>
          );
        })}
        {rows.length === 0 && <p className="text-muted-foreground text-center py-8">No users yet.</p>}
      </div>
    </div>
  );
};

export default AdminPatients;
