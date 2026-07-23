import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Row = { id: string; full_name: string | null; phone: string | null; status: string; status_reason: string | null; created_at: string };

export default function AdminApprovals() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });

  const load = async () => {
    setLoading(true);
    // Only patient-role accounts (exclude admins/assistants/doctors)
    const { data: patientRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "patient");
    const patientIds = (patientRoles || []).map((r: any) => r.user_id);
    if (patientIds.length === 0) {
      setRows([]);
      setCounts({ pending: 0, approved: 0, rejected: 0 });
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("id,full_name,phone,status,status_reason,created_at")
      .in("id", patientIds)
      .eq("status", tab)
      .order("created_at", { ascending: false });
    setRows((data as any) || []);

    const { data: allStatuses } = await supabase
      .from("profiles")
      .select("status")
      .in("id", patientIds);
    const c = { pending: 0, approved: 0, rejected: 0 } as any;
    (allStatuses || []).forEach((r: any) => { if (c[r.status] !== undefined) c[r.status]++; });
    setCounts(c);
    setLoading(false);
  };

  useEffect(() => { load(); }, [tab]);

  const filtered = rows.filter((r) =>
    !q || (r.full_name || "").toLowerCase().includes(q.toLowerCase()) || (r.phone || "").includes(q)
  );

  const setStatus = async (id: string, status: "approved" | "rejected", statusReason?: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        status,
        status_reason: statusReason || null,
        status_updated_at: new Date().toISOString(),
        status_updated_by: user?.id,
      })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Patient ${status}`);
    setReason("");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Patient Approvals</h1>
        <p className="text-muted-foreground">Review and approve new patient registrations.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="pending"><Clock className="w-4 h-4 mr-1" />Pending <Badge variant="secondary" className="ml-2">{counts.pending}</Badge></TabsTrigger>
            <TabsTrigger value="approved"><CheckCircle2 className="w-4 h-4 mr-1" />Approved <Badge variant="secondary" className="ml-2">{counts.approved}</Badge></TabsTrigger>
            <TabsTrigger value="rejected"><XCircle className="w-4 h-4 mr-1" />Rejected <Badge variant="secondary" className="ml-2">{counts.rejected}</Badge></TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search name or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="divide-y">
          {loading && <div className="p-8 text-center text-muted-foreground">Loading…</div>}
          {!loading && filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No {tab} patients.</div>
          )}
          {filtered.map((r) => (
            <div key={r.id} className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="font-semibold">{r.full_name || "Unnamed"}</div>
                <div className="text-sm text-muted-foreground">{r.phone || "—"} · Registered {new Date(r.created_at).toLocaleDateString()}</div>
                {r.status_reason && <div className="text-xs mt-1 text-muted-foreground">Reason: {r.status_reason}</div>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "secondary"}>
                  {r.status}
                </Badge>
                {r.status !== "approved" && (
                  <Button size="sm" onClick={() => setStatus(r.id, "approved")}>
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                  </Button>
                )}
                {r.status !== "rejected" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive"><XCircle className="w-4 h-4 mr-1" /> Reject</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject patient?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Provide an optional reason shown to the patient.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <Textarea placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setReason("")}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => setStatus(r.id, "rejected", reason)}>Reject</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
