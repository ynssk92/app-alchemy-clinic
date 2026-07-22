import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Row = {
  id: string; appointment_date: string; appointment_time: string;
  status: string; reason: string | null; created_at: string;
  doctors: { full_name: string } | null;
};

const AdminAppointmentRequests = () => {
  const [rows, setRows] = useState<Row[]>([]);

  const load = () => supabase.from("appointments")
    .select("id, appointment_date, appointment_time, status, reason, created_at, doctors(full_name)")
    .eq("status", "upcoming")
    .order("created_at", { ascending: false })
    .then(({ data }) => setRows((data as any) || []));

  useEffect(() => { load(); }, []);

  const act = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "completed" ? "Approved" : "Declined");
    load();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Appointment Requests</h1>
      <p className="text-muted-foreground mb-6">Review and confirm pending booking requests</p>

      <div className="grid gap-3">
        {rows.map((r) => (
          <Card key={r.id} className="p-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold">{r.doctors?.full_name || "Doctor"}</h3>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Pending</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {r.appointment_date} at {r.appointment_time.slice(0, 5)}
                {r.reason && ` • ${r.reason}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Requested {new Date(r.created_at).toLocaleString()}
              </p>
            </div>
            <Button size="sm" onClick={() => act(r.id, "completed")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
              <Check className="w-4 h-4" /> Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => act(r.id, "cancelled")}
              className="gap-1 text-destructive hover:text-destructive">
              <X className="w-4 h-4" /> Decline
            </Button>
          </Card>
        ))}
        {rows.length === 0 && (
          <p className="text-muted-foreground text-center py-12">No pending appointment requests.</p>
        )}
      </div>
    </div>
  );
};

export default AdminAppointmentRequests;
