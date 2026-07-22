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
  "Dashboard", "Doctors", "Patients", "Appointments",
  "Specialties", "Clinics", "Blog", "Messages", "Reports", "Users",
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
    const { data, error } = await supabase.from("roles").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRoles((data as any) || []);
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
    const { error } = await supabase.from("roles").update({ permissions: permOpen.permissions }).eq("id", permOpen.id);
    if (error) return toast.error(error.message);
    toast.success("Permissions saved"); setPermOpen(null); load();
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
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4" /> New Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create new role</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <Label>Role name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Nurse" />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpenNew(false)}>Cancel</Button>
              <Button onClick={createRole}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto] items-center gap-4 px-6 py-3 bg-muted/40 border-b text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <div>Role</div>
          <div>Created On</div>
          <div>Status</div>
          <div className="w-32"></div>
          <div className="w-10"></div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-muted-foreground">Loading…</div>
        ) : roles.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">No roles yet.</div>
        ) : (
          roles.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-[1fr_1fr_1fr_auto_auto] items-center gap-4 px-6 py-4 border-b last:border-0 hover:bg-muted/30 transition-colors"
            >
              <div className="font-medium">{r.name}</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(r.created_at), "dd MMM yyyy")}
              </div>
              <div>
                {r.status === "active" ? (
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 bg-emerald-500/5">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-destructive/40 text-destructive bg-destructive/5">
                    Inactive
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setPermOpen(r)}
              >
                <Shield className="w-4 h-4" /> Permissions
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  <DropdownMenuItem onClick={() => setEditOpen({ ...r })}>
                    <Pencil className="w-4 h-4 mr-2" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleStatus(r)}>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Mark {r.status === "active" ? "Inactive" : "Active"}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => deleteRole(r)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </Card>

      {/* Permissions dialog */}
      <Dialog open={!!permOpen} onOpenChange={(o) => !o && setPermOpen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Permissions — {permOpen?.name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center px-2 py-2 text-xs uppercase tracking-wide text-muted-foreground border-b">
              <div>Module</div>
              <div className="w-16 text-center">View</div>
              <div className="w-16 text-center">Create</div>
              <div className="w-16 text-center">Edit</div>
              <div className="w-16 text-center">Delete</div>
            </div>
            {MODULES.map((mod) => {
              const p = permOpen?.permissions?.[mod] || {};
              return (
                <div key={mod} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center px-2 py-2 border-b last:border-0">
                  <div className="font-medium text-sm">{mod}</div>
                  {(["view", "create", "edit", "delete"] as const).map((k) => (
                    <div key={k} className="w-16 flex justify-center">
                      <Checkbox checked={!!p[k]} onCheckedChange={() => togglePerm(mod, k)} />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPermOpen(null)}>Cancel</Button>
            <Button onClick={savePermissions}>Save permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={!!editOpen} onOpenChange={(o) => !o && setEditOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename role</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Role name</Label>
            <Input
              value={editOpen?.name || ""}
              onChange={(e) => editOpen && setEditOpen({ ...editOpen, name: e.target.value })}
            />
            <div className="flex items-center justify-between pt-2">
              <Label>Active</Label>
              <Switch
                checked={editOpen?.status === "active"}
                onCheckedChange={(v) => editOpen && setEditOpen({ ...editOpen, status: v ? "active" : "inactive" })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(null)}>Cancel</Button>
            <Button onClick={renameRole}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRoles;
