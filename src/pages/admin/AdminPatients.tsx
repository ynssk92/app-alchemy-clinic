import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, ShieldOff, Trash2, Mail, Check, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type P = { id: string; full_name: string | null; phone: string | null; created_at: string; roles: string[] };
type Invite = { id: string; email: string; claimed_at: string | null; created_at: string; full_name?: string | null };

const AdminPatients = () => {
  const [rows, setRows] = useState<P[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, phone, created_at").order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const rmap = new Map<string, string[]>();
    (roles || []).forEach((r: any) => {
      rmap.set(r.user_id, [...(rmap.get(r.user_id) || []), r.role]);
    });
    setRows((profiles || []).map((p: any) => ({ ...p, roles: rmap.get(p.id) || [] })));

    const { data: inv } = await supabase.from("admin_invites").select("*").order("created_at", { ascending: false });
    const invList = (inv || []) as any[];
    const claimedIds = invList.map((i) => i.claimed_by).filter(Boolean);
    let nameMap = new Map<string, string>();
    if (claimedIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", claimedIds);
      (profs || []).forEach((p: any) => nameMap.set(p.id, p.full_name));
    }
    setInvites(invList.map((i) => ({ ...i, full_name: i.claimed_by ? nameMap.get(i.claimed_by) : null })));
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

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;
    setBusy(true);
    const { error } = await supabase.from("admin_invites").insert({ email });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Invite added. They'll become admin on next sign-in / signup.");
    setInviteEmail("");
    load();
  };

  const revokeInvite = async (id: string) => {
    const { error } = await supabase.from("admin_invites").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Invite removed");
    load();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-1">Patients & Users</h1>
      <p className="text-muted-foreground mb-8">All registered users. Grant or revoke admin here.</p>

      <Card className="p-6 mb-8 border-border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Admin Invites</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Add an email here to automatically promote that user to admin — whether they already have an account or sign up later.
        </p>
        <form onSubmit={sendInvite} className="flex gap-2 mb-6">
          <Input
            type="email"
            placeholder="person@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={busy}>
            {busy ? "Adding..." : "Invite as Admin"}
          </Button>
        </form>

        <div className="space-y-2">
          {invites.map((i) => (
            <div key={i.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
              <div className="flex-1">
                <div className="font-medium">{i.email}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {i.claimed_at ? (
                    <><Check className="w-3 h-3 text-green-600" /> Claimed {new Date(i.claimed_at).toLocaleDateString()}</>
                  ) : (
                    <><Clock className="w-3 h-3" /> Pending — will apply on signup/sign-in</>
                  )}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => revokeInvite(i.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {invites.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No invites yet.</p>}
        </div>
      </Card>

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
