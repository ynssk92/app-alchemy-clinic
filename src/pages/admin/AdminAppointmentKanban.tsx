import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Row = {
  id: string; appointment_date: string; appointment_time: string;
  status: string; reason: string | null;
  doctors: { full_name: string } | null;
};

const COLUMNS: { key: string; label: string; color: string }[] = [
  { key: "upcoming", label: "Upcoming", color: "border-t-primary" },
  { key: "completed", label: "Completed", color: "border-t-emerald-500" },
  { key: "cancelled", label: "Cancelled", color: "border-t-destructive" },
];

const AdminAppointmentKanban = () => {
  const [rows, setRows] = useState<Row[]>([]);

  const load = () => supabase.from("appointments")
    .select("id, appointment_date, appointment_time, status, reason, doctors(full_name)")
    .order("appointment_date", { ascending: true })
    .then(({ data }) => setRows((data as any) || []));

  useEffect(() => { load(); }, []);

  const move = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Moved to ${status}`);
    load();
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };
  const onDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) move(id, status);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Kanban View</h1>
      <p className="text-muted-foreground mb-6">Drag cards between columns to update status</p>

      <div className="grid md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const items = rows.filter((r) => r.status === col.key);
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, col.key)}
              className={cn("rounded-xl border-t-4 bg-muted/30 p-3 min-h-[300px]", col.color)}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-bold">{col.label}</h3>
                <Badge variant="secondary">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.map((r) => (
                  <Card
                    key={r.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, r.id)}
                    className="p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                  >
                    <div className="font-semibold text-sm">{r.doctors?.full_name || "Doctor"}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {r.appointment_date} · {r.appointment_time.slice(0, 5)}
                    </div>
                    {r.reason && <div className="text-xs mt-2 line-clamp-2">{r.reason}</div>}
                    <div className="flex gap-1 mt-2">
                      {COLUMNS.filter((c) => c.key !== col.key).map((c) => (
                        <Button key={c.key} size="sm" variant="ghost" className="h-6 text-[10px] px-2"
                          onClick={() => move(r.id, c.key)}>
                          → {c.label}
                        </Button>
                      ))}
                    </div>
                  </Card>
                ))}
                {items.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">Drop cards here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminAppointmentKanban;
