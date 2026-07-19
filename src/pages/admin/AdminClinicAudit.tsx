import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Search, X } from "lucide-react";

type LogRow = {
  id: string;
  clinic_id: string | null;
  clinic_name: string | null;
  action: string;
  actor_id: string | null;
  changed_fields: string[] | null;
  old_values: any;
  new_values: any;
  created_at: string;
};

const actionColor: Record<string, string> = {
  create: "bg-secondary text-secondary-foreground",
  update: "bg-primary text-primary-foreground",
  delete: "bg-destructive text-destructive-foreground",
};

const ALL = "__all__";

const AdminClinicAudit = () => {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [actors, setActors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [clinicId, setClinicId] = useState<string>(ALL);
  const [actorId, setActorId] = useState<string>(ALL);
  const [field, setField] = useState<string>(ALL);
  const [action, setAction] = useState<string>(ALL);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("clinic_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      const rows = (data as LogRow[]) || [];
      setLogs(rows);

      const ids = Array.from(new Set(rows.map((r) => r.actor_id).filter(Boolean))) as string[];
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", ids);
        setActors(Object.fromEntries((profs || []).map((p: any) => [p.id, p.full_name || "Unknown"])));
      }
      setLoading(false);
    })();
  }, []);

  const clinicOptions = useMemo(() => {
    const map = new Map<string, string>();
    logs.forEach((l) => {
      if (l.clinic_id) map.set(l.clinic_id, l.clinic_name || "(unnamed)");
    });
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [logs]);

  const actorOptions = useMemo(() => {
    const ids = Array.from(new Set(logs.map((l) => l.actor_id).filter(Boolean))) as string[];
    return ids
      .map((id) => ({ id, name: actors[id] || "Unknown" }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [logs, actors]);

  const fieldOptions = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => (l.changed_fields || []).forEach((f) => set.add(f)));
    return Array.from(set).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromTs = from ? new Date(from).getTime() : null;
    const toTs = to ? new Date(to).getTime() + 86_399_000 : null;
    return logs.filter((l) => {
      if (clinicId !== ALL && l.clinic_id !== clinicId) return false;
      if (actorId !== ALL && l.actor_id !== actorId) return false;
      if (action !== ALL && l.action !== action) return false;
      if (field !== ALL && !(l.changed_fields || []).includes(field)) return false;
      const ts = new Date(l.created_at).getTime();
      if (fromTs && ts < fromTs) return false;
      if (toTs && ts > toTs) return false;
      if (q) {
        const hay = [
          l.clinic_name,
          actors[l.actor_id || ""],
          JSON.stringify(l.old_values),
          JSON.stringify(l.new_values),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [logs, search, clinicId, actorId, action, field, from, to, actors]);

  const clearAll = () => {
    setSearch(""); setClinicId(ALL); setActorId(ALL); setField(ALL); setAction(ALL); setFrom(""); setTo("");
  };

  const activeCount = [
    search, clinicId !== ALL, actorId !== ALL, field !== ALL, action !== ALL, from, to,
  ].filter(Boolean).length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-1">Clinic Audit Log</h1>
      <p className="text-muted-foreground mb-6">Every change to a clinic — who, what, and when.</p>

      <Card className="p-4 mb-6 border-border bg-card space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search clinic name, editor, or values…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <Select value={clinicId} onValueChange={setClinicId}>
            <SelectTrigger><SelectValue placeholder="Clinic" /></SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value={ALL}>All clinics</SelectItem>
              {clinicOptions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={actorId} onValueChange={setActorId}>
            <SelectTrigger><SelectValue placeholder="Editor" /></SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value={ALL}>All editors</SelectItem>
              {actorOptions.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value={ALL}>All actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
            </SelectContent>
          </Select>
          <Select value={field} onValueChange={setField}>
            <SelectTrigger><SelectValue placeholder="Field" /></SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value={ALL}>All fields</SelectItem>
              {fieldOptions.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filtered.length} of {logs.length} entries{activeCount > 0 && ` · ${activeCount} filter${activeCount > 1 ? "s" : ""} active`}</span>
          {activeCount > 0 && (
            <Button size="sm" variant="ghost" onClick={clearAll}>
              <X className="w-4 h-4 mr-1" />Clear
            </Button>
          )}
        </div>
      </Card>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No matching entries.</p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((l) => (
            <Card key={l.id} className="p-4 border-border bg-card">
              <div className="flex items-start gap-4 flex-wrap">
                <Badge className={actionColor[l.action] || ""}>{l.action}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{l.clinic_name || "(unnamed)"}</div>
                  <div className="text-sm text-muted-foreground">
                    by <span className="font-medium text-foreground">{actors[l.actor_id || ""] || "System"}</span>
                    {" · "}
                    <span title={new Date(l.created_at).toLocaleString()}>
                      {formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {l.action === "update" && l.changed_fields && l.changed_fields.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {l.changed_fields.map((f) => (
                        <div key={f} className="text-sm">
                          <span className="font-medium">{f}:</span>{" "}
                          <span className="text-muted-foreground line-through">
                            {String(l.old_values?.[f] ?? "—")}
                          </span>{" "}
                          →{" "}
                          <span className="text-foreground">{String(l.new_values?.[f] ?? "—")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {l.action === "create" && l.new_values && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {[l.new_values.address, l.new_values.phone].filter(Boolean).join(" • ")}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminClinicAudit;
