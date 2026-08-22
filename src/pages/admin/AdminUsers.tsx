import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Shield,
  ShieldOff,
  Trash2,
  Mail,
  Check,
  Clock,
  Headset,
  Search,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type U = {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  roles: string[];
};
type Invite = {
  id: string;
  email: string;
  claimed_at: string | null;
  created_at: string;
  full_name?: string | null;
};

type RoleFilter = "staff" | "all" | "admin" | "assistant" | "doctor" | "patient";
type SortKey = "created_at" | "full_name";

const PAGE_SIZES = [10, 25, 50, 100];

const AdminUsers = () => {
  const [rows, setRows] = useState<U[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [busy, setBusy] = useState(false);

  // Server-side controls
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter] = useState<RoleFilter>("staff");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  // Debounce search input (350ms)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(0);
  }, [debounced, filter, sortKey, sortAsc, pageSize]);

  const reqIdRef = useRef(0);

  const loadUsers = useCallback(async () => {
    const rid = ++reqIdRef.current;
    setLoading(true);
    try {
      // If filtering by role, restrict to user_ids that carry that role
      let idFilter: string[] | null = null;
      if (filter !== "all") {
        const roles = filter === "staff" ? ["admin", "assistant", "doctor"] : [filter];
        const { data: rl, error } = await supabase
          .from("user_roles")
          .select("user_id")
          .in("role", roles as any);
        if (error) throw error;
        idFilter = Array.from(new Set((rl || []).map((r: any) => r.user_id)));
        if (idFilter.length === 0) {
          if (rid === reqIdRef.current) {
            setRows([]);
            setTotal(0);
          }
          return;
        }
      }

      let q = supabase
        .from("profiles")
        .select("id, full_name, phone, created_at", { count: "exact" })
        .order(sortKey, { ascending: sortAsc, nullsFirst: false })
        .range(page * pageSize, page * pageSize + pageSize - 1);

      if (idFilter) q = q.in("id", idFilter);
      if (debounced) {
        const s = debounced.replace(/[%_]/g, "\\$&");
        q = q.or(`full_name.ilike.%${s}%,phone.ilike.%${s}%`);
      }

      const { data, count, error } = await q;
      if (error) throw error;

      const pageIds = (data || []).map((p: any) => p.id);
      let rmap = new Map<string, string[]>();
      if (pageIds.length) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .in("user_id", pageIds);
        (roles || []).forEach((r: any) => {
          rmap.set(r.user_id, [...(rmap.get(r.user_id) || []), r.role]);
        });
      }

      if (rid !== reqIdRef.current) return; // stale
      setRows((data || []).map((p: any) => ({ ...p, roles: rmap.get(p.id) || [] })));
      setTotal(count || 0);
    } catch (e: any) {
      toast.error(e.message || "Failed to load users");
    } finally {
      if (rid === reqIdRef.current) setLoading(false);
    }
  }, [debounced, filter, sortKey, sortAsc, page, pageSize]);

  const loadInvites = useCallback(async () => {
    const { data: inv } = await supabase
      .from("admin_invites")
      .select("*")
      .order("created_at", { ascending: false });
    const invList = (inv || []) as any[];
    const claimedIds = invList.map((i) => i.claimed_by).filter(Boolean);
    const nameMap = new Map<string, string>();
    if (claimedIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", claimedIds);
      (profs || []).forEach((p: any) => nameMap.set(p.id, p.full_name));
    }
    setInvites(
      invList.map((i) => ({ ...i, full_name: i.claimed_by ? nameMap.get(i.claimed_by) : null }))
    );
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadInvites();
  }, [loadInvites]);

  const toggleRole = async (id: string, role: "admin" | "assistant", has: boolean) => {
    // Self-demotion prevention
    const { user: currentUser } = await supabase.auth.getUser();
    if (id === currentUser?.id && role === "admin" && has) {
      return toast.error("You cannot revoke your own administrator status for security reasons.");
    }

    if (has) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", id).eq("role", role);
      if (error) return toast.error(error.message);
      toast.success(`${role} removed`);
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: id, role });
      if (error) return toast.error(error.message);
      toast.success(`${role} granted`);
    }
    loadUsers();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this user's profile? Their auth account remains.")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    loadUsers();
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
    loadInvites();
  };

  const revokeInvite = async (id: string) => {
    const { error } = await supabase.from("admin_invites").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Invite removed");
    loadInvites();
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(key === "full_name");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, page * pageSize + rows.length);

  const SortBtn = ({ label, k }: { label: string; k: SortKey }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toggleSort(k)}
      className="h-8 px-2 font-semibold"
    >
      {label}
      {sortKey === k &&
        (sortAsc ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />)}
    </Button>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-1">Users</h1>
      <p className="text-muted-foreground mb-8">
        All accounts in the system — admins, assistants, doctors, and patients.
      </p>

      <Card className="p-6 mb-8 border-border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Admin Invites</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Add an email here to automatically promote that user to admin — whether they already have
          an account or sign up later.
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
                <div className="font-medium">
                  {i.claimed_at ? i.full_name || "Unnamed admin" : i.email}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {i.claimed_at ? (
                    <>
                      <Check className="w-3 h-3 text-green-600" /> Claimed{" "}
                      {new Date(i.claimed_at).toLocaleDateString()}
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3" /> Pending — will apply on signup/sign-in
                    </>
                  )}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => revokeInvite(i.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {invites.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No invites yet.</p>
          )}
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">All accounts ({total.toLocaleString()})</h2>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as RoleFilter)}>
            <TabsList>
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="admin">Admins</TabsTrigger>
              <TabsTrigger value="assistant">Assistants</TabsTrigger>
              <TabsTrigger value="doctor">Doctors</TabsTrigger>
              <TabsTrigger value="patient">Patients</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card className="border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30 text-xs text-muted-foreground">
          <div className="flex-1 min-w-[200px]">
            <SortBtn label="Name" k="full_name" />
          </div>
          <div className="hidden md:block w-40">
            <SortBtn label="Joined" k="created_at" />
          </div>
          <div className="w-[360px] text-right pr-2">Actions</div>
        </div>

        <div className="divide-y">
          {rows.map((p) => {
            const isAdmin = p.roles.includes("admin");
            const isAssistant = p.roles.includes("assistant");
            const isDoctor = p.roles.includes("doctor");
            const isPatient = p.roles.includes("patient");
            return (
              <div key={p.id} className="p-4 flex items-center gap-4 flex-wrap hover:bg-muted/30">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold">{p.full_name || "Unnamed"}</h3>
                    {isAdmin && <Badge>Admin</Badge>}
                    {isAssistant && (
                      <Badge variant="outline" className="border-primary text-primary">
                        Assistant
                      </Badge>
                    )}
                    {isDoctor && <Badge variant="secondary">Doctor</Badge>}
                    {isPatient && !isAdmin && !isAssistant && !isDoctor && (
                      <Badge variant="outline">Patient</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{p.phone || "No phone"}</p>
                </div>
                <div className="hidden md:block w-40 text-sm text-muted-foreground">
                  {new Date(p.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    size="sm"
                    variant={isAssistant ? "outline" : "secondary"}
                    onClick={() => toggleRole(p.id, "assistant", isAssistant)}
                  >
                    <Headset className="w-4 h-4 mr-2" />
                    {isAssistant ? "Revoke Assistant" : "Make Assistant"}
                  </Button>
                  <Button
                    size="sm"
                    variant={isAdmin ? "outline" : "default"}
                    onClick={() => toggleRole(p.id, "admin", isAdmin)}
                  >
                    {isAdmin ? (
                      <>
                        <ShieldOff className="w-4 h-4 mr-2" />
                        Revoke Admin
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Make Admin
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => remove(p.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          {!loading && rows.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No users found.</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t bg-muted/20 flex-wrap">
          <div className="text-sm text-muted-foreground">
            {from}–{to} of {total.toLocaleString()}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Rows</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger className="h-8 w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[80px] text-center">
                Page {page + 1} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
                disabled={page + 1 >= totalPages || loading}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminUsers;
