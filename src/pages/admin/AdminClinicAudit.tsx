import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

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

const AdminClinicAudit = () => {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [actors, setActors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("clinic_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
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

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-1">Clinic Audit Log</h1>
      <p className="text-muted-foreground mb-8">Every change to a clinic — who, what, and when.</p>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading…</p>
      ) : logs.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No changes recorded yet.</p>
      ) : (
        <div className="grid gap-3">
          {logs.map((l) => (
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
