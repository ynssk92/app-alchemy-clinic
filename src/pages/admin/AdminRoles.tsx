import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Plus, Shield, MoreVertical, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Role = {
  id: string;
  name: string;
  status: "active" | "inactive";
  permissions: Record<string, { view?: boolean; create?: boolean; edit?: boolean; delete?: boolean }>;
  created_at: string;
};

const MODULES = [
  "patients", "medical_records", "prescriptions", "appointments",
  "billing", "inventory", "settings",
];

const AdminRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [permOpen, setPermOpen] = useState<Role | null>(null);
  const [editOpen, setEditOpen] = useState<Role | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("role_permissions" as any).select("*");
    if (error) return toast.error(error.message);
    
    // Group permissions by role
    const grouped = (data || []).reduce((acc: any, curr: any) => {
      if (!acc[curr.role]) acc[curr.role] = { id: curr.role, name: curr.role, status: 'active', permissions: {}, created_at: new Date().toISOString() };
      const [mod, act] = curr.permission.split('.');
      if (!acc[curr.role].permissions[mod]) acc[curr.role].permissions[mod] = {};
      acc[curr.role].permissions[mod][act] = true;
      return acc;
    }, {});

    // Ensure all base roles exist in the list
    ["admin", "doctor", "assistant", "patient"].forEach(r => {
      if (!grouped[r]) grouped[r] = { id: r, name: r, status: 'active', permissions: {}, created_at: new Date().toISOString() };
    });

    setRoles(Object.values(grouped));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createRole = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase.from("roles").insert({ name: newName.trim() });
    if (error) return toast.error(error.message);
    toast.success("Role created");
    setNewName(""); setOpenNew(false); load();
  };

  const toggleStatus = async (r: Role) => {
    const next = r.status === "active" ? "inactive" : "active";
    const { error } = await supabase.from("roles").update({ status: next }).eq("id", r.id);
    if (error) return toast.error(error.message);
    load();
  };

  const deleteRole = async (r: Role) => {
    if (!confirm(`Delete role "${r.name}"?`)) return;
    const { error } = await supabase.from("roles").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const renameRole = async () => {
    if (!editOpen) return;
    const { error } = await supabase.from("roles").update({ name: editOpen.name }).eq("id", editOpen.id);
    if (error) return toast.error(error.message);
    toast.success("Updated"); setEditOpen(null); load();
  };

  const savePermissions = async () => {
    if (!permOpen) return;
    try {
      // Note: role_permissions management is still direct but restricted by RLS to admins.
      // This tool manages the PERMISSIONS for a role, not the users.
      await supabase.from("role_permissions" as any).delete().eq("role", permOpen.id);
      
      const newPerms: any[] = [];
      Object.entries(permOpen.permissions).forEach(([mod, acts]: [string, any]) => {
        Object.entries(acts).forEach(([act, val]) => {
          if (val) newPerms.push({ role: permOpen.id, permission: `${mod}.${act}` });
        });
      });

      if (newPerms.length > 0) {
        const { error } = await supabase.from("role_permissions" as any).insert(newPerms);
        if (error) throw error;
      }

      
      toast.success("Permissions saved"); 
      setPermOpen(null); 
      // Refresh to apply changes immediately
      window.location.reload();
      load();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const togglePerm = (mod: string, key: "view" | "create" | "edit" | "delete") => {
    if (!permOpen) return;
    const perms = { ...(permOpen.permissions || {}) };
    perms[mod] = { ...(perms[mod] || {}), [key]: !perms[mod]?.[key] };
    setPermOpen({ ...permOpen, permissions: perms });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roles</h1>
          <p className="text-sm text-muted-foreground">Manage roles and their access permissions.</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-800 flex items-start gap-2 max-w-2xl">
          <Shield className="w-4 h-4 mt-0.5 shrink-0" />
          <p>
            Permissions are strictly role-based. Modifications here affect all users assigned to the respective role. 
            Administrators have full system access regardless of mapped permissions.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-3 bg-muted/40 border-b text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <div>System Role</div>
          <div className="w-32 text-right pr-4">Actions</div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-muted-foreground">Loading…</div>
        ) : roles.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">No roles yet.</div>
        ) : (
          roles.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-5 border-b last:border-0 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-lg capitalize">{r.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.id === 'admin' ? 'Full system access (Bypass permissions)' : `Manage granular ${r.name} permissions`}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pr-2">
                <Button
                  variant={r.id === 'admin' ? "ghost" : "outline"}
                  size="sm"
                  className="gap-2 rounded-xl"
                  onClick={() => setPermOpen(r)}
                  disabled={r.id === 'admin'}
                >
                  <ShieldCheck className="w-4 h-4" /> 
                  {r.id === 'admin' ? 'Full Access' : 'Manage Permissions'}
                </Button>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* Permissions dialog */}
      <Dialog open={!!permOpen} onOpenChange={(o) => !o && setPermOpen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 capitalize">
              <ShieldCheck className="w-6 h-6 text-primary" />
              {permOpen?.name} Permissions
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto px-1">
            <div className="grid grid-cols-[1fr_auto_auto] gap-6 items-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b bg-muted/20 rounded-t-xl">
              <div>Module</div>
              <div className="w-20 text-center">View</div>
              <div className="w-20 text-center">Edit / Create</div>
            </div>
            {MODULES.map((mod) => {
              const p = permOpen?.permissions?.[mod] || {};
              return (
                <div key={mod} className="grid grid-cols-[1fr_auto_auto] gap-6 items-center px-4 py-4 border-b last:border-0 hover:bg-muted/10 transition-colors">
                  <div>
                    <div className="font-bold text-slate-900 capitalize">{mod.replace('_', ' ')}</div>
                    <div className="text-[10px] text-muted-foreground">Access controls for {mod} module</div>
                  </div>
                  <div className="w-20 flex justify-center">
                    <Checkbox 
                      checked={!!p.view} 
                      onCheckedChange={() => togglePerm(mod, 'view')}
                      className="h-5 w-5 rounded-md border-2" 
                    />
                  </div>
                  <div className="w-20 flex justify-center">
                    <Checkbox 
                      checked={!!p.edit || !!p.create} 
                      onCheckedChange={() => {
                        togglePerm(mod, 'edit');
                        togglePerm(mod, 'create');
                      }}
                      className="h-5 w-5 rounded-md border-2" 
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter className="bg-muted/10 p-4 -mx-6 -mb-6 border-t rounded-b-lg">
            <Button variant="ghost" onClick={() => setPermOpen(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={savePermissions} className="rounded-xl px-8">Save Role Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Removed rename dialog as roles are now fixed system roles */}
    </div>
  );
};

export default AdminRoles;
