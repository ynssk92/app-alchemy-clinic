import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Search, X, Download, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

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
type SortKey = "created_at" | "action" | "clinic_name" | "actor" | "changed_fields";
const PAGE_SIZES = [10, 25, 50, 100];

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

  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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

  const sorted = useMemo(() => {
    const rows = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      switch (sortKey) {
        case "created_at":
          av = new Date(a.created_at).getTime();
          bv = new Date(b.created_at).getTime();
          break;
        case "action":
          av = a.action; bv = b.action; break;
        case "clinic_name":
          av = (a.clinic_name || "").toLowerCase();
          bv = (b.clinic_name || "").toLowerCase(); break;
        case "actor":
          av = (actors[a.actor_id || ""] || "").toLowerCase();
          bv = (actors[b.actor_id || ""] || "").toLowerCase(); break;
        case "changed_fields":
          av = (a.changed_fields || []).length;
          bv = (b.changed_fields || []).length; break;
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return rows;
  }, [filtered, sortKey, sortDir, actors]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sorted, currentPage, pageSize]
  );

  // Reset to page 1 when filters/sort/pageSize change
  useEffect(() => { setPage(1); }, [search, clinicId, actorId, field, action, from, to, sortKey, sortDir, pageSize]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir(key === "created_at" ? "desc" : "asc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />;
    return sortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />;
  };

  const clearAll = () => {
    setSearch(""); setClinicId(ALL); setActorId(ALL); setField(ALL); setAction(ALL); setFrom(""); setTo("");
  };

  const exportCsv = () => {
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const headers = ["Timestamp", "Action", "Clinic", "Editor", "Changed Fields", "Old Values", "New Values"];
    const lines = [headers.join(",")];
    sorted.forEach((l) => {
      lines.push([
        new Date(l.created_at).toISOString(),
        l.action,
        l.clinic_name || "",
        actors[l.actor_id || ""] || "",
        (l.changed_fields || []).join("; "),
        l.old_values ? JSON.stringify(l.old_values) : "",
        l.new_values ? JSON.stringify(l.new_values) : "",
      ].map(esc).join(","));
    });
    const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clinic-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const activeCount = [
    search, clinicId !== ALL, actorId !== ALL, field !== ALL, action !== ALL, from, to,
  ].filter(Boolean).length;

  const SortableTh = ({ k, children, className }: { k: SortKey; children: React.ReactNode; className?: string }) => (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => toggleSort(k)}
        className="inline-flex items-center gap-1 font-semibold hover:text-foreground transition-colors"
      >
        {children}
        <SortIcon k={k} />
      </button>
    </TableHead>
  );

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
        <div className="flex items-center justify-between text-sm text-muted-foreground gap-2 flex-wrap">
          <span>{sorted.length} of {logs.length} entries{activeCount > 0 && ` · ${activeCount} filter${activeCount > 1 ? "s" : ""} active`}</span>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <Button size="sm" variant="ghost" onClick={clearAll}>
                <X className="w-4 h-4 mr-1" />Clear
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={exportCsv} disabled={sorted.length === 0}>
              <Download className="w-4 h-4 mr-1" />Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading…</p>
      ) : sorted.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No matching entries.</p>
      ) : (
        <Card className="border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTh k="created_at" className="w-[180px]">When</SortableTh>
                  <SortableTh k="action" className="w-[110px]">Action</SortableTh>
                  <SortableTh k="clinic_name">Clinic</SortableTh>
                  <SortableTh k="actor" className="w-[180px]">Editor</SortableTh>
                  <SortableTh k="changed_fields">Changes</SortableTh>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-sm text-muted-foreground align-top" title={new Date(l.created_at).toLocaleString()}>
                      {formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="align-top">
                      <Badge className={actionColor[l.action] || ""}>{l.action}</Badge>
                    </TableCell>
                    <TableCell className="font-medium align-top">{l.clinic_name || "(unnamed)"}</TableCell>
                    <TableCell className="text-sm align-top">{actors[l.actor_id || ""] || "System"}</TableCell>
                    <TableCell className="align-top">
                      {l.action === "update" && l.changed_fields && l.changed_fields.length > 0 && (
                        <div className="space-y-1">
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
                        <div className="text-sm text-muted-foreground">
                          {[l.new_values.address, l.new_values.phone].filter(Boolean).join(" • ") || "Created"}
                        </div>
                      )}
                      {l.action === "delete" && (
                        <div className="text-sm text-muted-foreground">Removed</div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-3 p-3 border-t border-border flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page</span>
              <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="h-8 w-[80px]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover">
                  {PAGE_SIZES.map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="ml-2">
                {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" onClick={() => setPage(1)} disabled={currentPage === 1}>« First</Button>
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>‹ Prev</Button>
              <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next ›</Button>
              <Button size="sm" variant="outline" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>Last »</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminClinicAudit;
