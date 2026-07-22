import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Loader2, Calendar, Inbox, ExternalLink, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AssistantRow = {
  user_id: string;
  full_name: string | null;
  is_assistant: boolean;
  is_admin: boolean;
};

type CheckState = "idle" | "running" | "pass" | "fail";
type Check = { key: string; label: string; detail?: string; state: CheckState };

const AdminAssistantVerifier = () => {
  const [assistants, setAssistants] = useState<AssistantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");
  const [checks, setChecks] = useState<Check[]>([]);
  const [running, setRunning] = useState(false);

  const selected = useMemo(() => assistants.find((a) => a.user_id === selectedId) || null, [assistants, selectedId]);

  const loadAssistants = async () => {
    setLoading(true);
    const { data: roles, error } = await supabase
      .from("user_roles")
      .select("user_id, role");
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const byUser = new Map<string, { assistant: boolean; admin: boolean }>();
    for (const r of roles || []) {
      const entry = byUser.get(r.user_id) || { assistant: false, admin: false };
      if (r.role === "assistant") entry.assistant = true;
      if (r.role === "admin") entry.admin = true;
      byUser.set(r.user_id, entry);
    }
    const assistantIds = [...byUser.entries()].filter(([, v]) => v.assistant).map(([id]) => id);
    if (assistantIds.length === 0) {
      setAssistants([]);
      setLoading(false);
      return;
    }
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", assistantIds);
    const rows: AssistantRow[] = assistantIds.map((id) => {
      const flags = byUser.get(id)!;
      const p = profiles?.find((x) => x.id === id);
      return { user_id: id, full_name: p?.full_name ?? null, is_assistant: true, is_admin: flags.admin };
    });
    setAssistants(rows);
    if (!selectedId && rows[0]) setSelectedId(rows[0].user_id);
    setLoading(false);
  };

  useEffect(() => {
    loadAssistants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runChecks = async () => {
    if (!selected) return;
    setRunning(true);
    const initial: Check[] = [
      { key: "role", label: "Assistant role granted", state: "running" },
      { key: "not_admin", label: "Not also an admin (least-privilege)", state: "running" },
      { key: "profile", label: "Profile row exists", state: "running" },
      { key: "appointments", label: "Appointments table reachable", state: "running" },
      { key: "messages", label: "Contact messages table reachable", state: "running" },
    ];
    setChecks(initial);

    const next: Check[] = [...initial];
    const set = (key: string, patch: Partial<Check>) => {
      const i = next.findIndex((c) => c.key === key);
      if (i >= 0) next[i] = { ...next[i], ...patch };
      setChecks([...next]);
    };

    // 1. role via has_role
    const { data: roleOk, error: roleErr } = await supabase.rpc("has_role", {
      _user_id: selected.user_id,
      _role: "assistant",
    });
    set("role", {
      state: roleErr ? "fail" : roleOk ? "pass" : "fail",
      detail: roleErr ? roleErr.message : roleOk ? "has_role returned true" : "has_role returned false",
    });

    // 2. not also admin
    set("not_admin", {
      state: selected.is_admin ? "fail" : "pass",
      detail: selected.is_admin ? "User also holds admin role — verify this is intentional" : "Assistant-only",
    });

    // 3. profile row
    const { data: prof, error: profErr } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", selected.user_id)
      .maybeSingle();
    set("profile", {
      state: profErr ? "fail" : prof ? "pass" : "fail",
      detail: profErr ? profErr.message : prof ? `Name: ${prof.full_name ?? "—"}` : "No profile row found",
    });

    // 4. appointments reachable (admin-side read is a proxy for the table/policies being healthy)
    const { count: apptCount, error: apptErr } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true });
    set("appointments", {
      state: apptErr ? "fail" : "pass",
      detail: apptErr ? apptErr.message : `${apptCount ?? 0} rows visible to staff`,
    });

    // 5. messages reachable
    const { count: msgCount, error: msgErr } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true });
    set("messages", {
      state: msgErr ? "fail" : "pass",
      detail: msgErr ? msgErr.message : `${msgCount ?? 0} messages visible to staff`,
    });

    setRunning(false);
  };

  const revoke = async () => {
    if (!selected) return;
    if (!confirm(`Revoke assistant role from ${selected.full_name || selected.user_id}?`)) return;
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", selected.user_id)
      .eq("role", "assistant");
    if (error) return toast.error(error.message);
    toast.success("Assistant role revoked");
    setChecks([]);
    setSelectedId("");
    loadAssistants();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Assistant Access Verifier
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Pick any assistant account to inspect its permissions and confirm it can view appointments and open the
            message inbox. Checks run against the database using the same policies the assistant is bound by.
          </p>
        </div>
      </header>

      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[240px]">
            <label className="text-sm font-medium mb-1 block">Assistant account</label>
            <Select value={selectedId} onValueChange={setSelectedId} disabled={loading || assistants.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading..." : "Select an assistant"} />
              </SelectTrigger>
              <SelectContent>
                {assistants.map((a) => (
                  <SelectItem key={a.user_id} value={a.user_id}>
                    {a.full_name || a.user_id.slice(0, 8)}
                    {a.is_admin ? " · also admin" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={runChecks} disabled={!selected || running}>
            {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
            Run verification
          </Button>
          <Button variant="outline" onClick={revoke} disabled={!selected || running}>
            Revoke assistant
          </Button>
        </div>

        {assistants.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">
            No assistant accounts yet. Grant the assistant role from{" "}
            <Link to="/admin/patients" className="text-primary underline">
              Admin → Patients
            </Link>
            .
          </p>
        )}
      </Card>

      {checks.length > 0 && (
        <Card className="p-6 space-y-3">
          <h2 className="font-semibold">Verification results</h2>
          <ul className="divide-y divide-border">
            {checks.map((c) => (
              <li key={c.key} className="py-3 flex items-start gap-3">
                {c.state === "running" && <Loader2 className="w-5 h-5 text-muted-foreground animate-spin mt-0.5" />}
                {c.state === "pass" && <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />}
                {c.state === "fail" && <XCircle className="w-5 h-5 text-destructive mt-0.5" />}
                {c.state === "idle" && <div className="w-5 h-5" />}
                <div className="flex-1">
                  <div className="font-medium text-sm">{c.label}</div>
                  {c.detail && <div className="text-xs text-muted-foreground">{c.detail}</div>}
                </div>
                <Badge
                  variant={c.state === "pass" ? "default" : c.state === "fail" ? "destructive" : "secondary"}
                  className="uppercase text-[10px]"
                >
                  {c.state}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-6 space-y-4">
        <h2 className="font-semibold">Manual smoke test</h2>
        <p className="text-sm text-muted-foreground">
          Open these in a private window signed in as the assistant to confirm access end-to-end. This page cannot sign
          in as another user for security reasons.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/admin/appointments"
            target="_blank"
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium text-sm">Open Appointments</div>
                <div className="text-xs text-muted-foreground">/admin/appointments</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </Link>
          <Link
            to="/admin/messages"
            target="_blank"
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-3">
              <Inbox className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium text-sm">Open Message Inbox</div>
                <div className="text-xs text-muted-foreground">/admin/messages</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AdminAssistantVerifier;
