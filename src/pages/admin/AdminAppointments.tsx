import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Row = {
  id: string; appointment_date: string; appointment_time: string;
  status: string; reason: string | null; patient_id: string;
  doctors: { full_name: string } | null;
};

const AdminAppointments = () => {
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    const { data } = await supabase.from("appointments")
      .select("id, appointment_date, appointment_time, status, reason, patient_id, doctors(full_name)")
      .order("appointment_date", { ascending: false });
    setRows((data as any) || []);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this appointment?")) return;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-1">Appointments</h1>
      <p className="text-muted-foreground mb-8">All bookings across the platform</p>

      <div className="grid gap-3">
        {rows.map((r) => (
          <Card key={r.id} className="p-4 flex items-center gap-4 border-border bg-card">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold">{r.doctors?.full_name || "Doctor"}</h3>
                <Badge variant={r.status === "upcoming" ? "default" : r.status === "completed" ? "secondary" : "outline"}>
                  {r.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {r.appointment_date} at {r.appointment_time}
                {r.reason && ` • ${r.reason}`}
              </p>
            </div>
            <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4" /></Button>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-muted-foreground text-center py-8">No appointments yet.</p>}
      </div>
    </div>
  );
};

export default AdminAppointments;
