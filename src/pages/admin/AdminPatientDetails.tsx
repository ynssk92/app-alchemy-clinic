import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, Phone, User, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Row = { id: string; full_name: string | null; phone: string | null; created_at: string };

const AdminPatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [appts, setAppts] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, phone, created_at")
        .order("created_at", { ascending: false });
      setList(data || []);
      if (!id && data?.[0]) navigate(`/admin/patients/details/${data[0].id}`, { replace: true });
    })();
  }, [id, navigate]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("id, full_name, phone, created_at, avatar_url")
        .eq("id", id)
        .maybeSingle();
      setSelected(p as any);
      if ((p as any)?.avatar_url) {
        const { data: signed } = await supabase.storage
          .from("avatars")
          .createSignedUrl((p as any).avatar_url, 3600);
        setAvatarUrl(signed?.signedUrl || null);
      } else {
        setAvatarUrl(null);
      }
      const { data: a } = await supabase
        .from("appointments")
        .select("id, appointment_date, appointment_time, status, reason, doctors(full_name)")
        .eq("patient_id", id)
        .order("appointment_date", { ascending: false });
      setAppts(a || []);
    })();
  }, [id]);

  const filtered = list.filter((p) =>
    (p.full_name || "").toLowerCase().includes(q.toLowerCase())
  );

  const initials = (selected?.full_name || "P")
    .split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Patient Details</h1>
          <p className="text-sm text-muted-foreground">Full profile & appointment history</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/patients"><ArrowLeft className="w-4 h-4 mr-2" />Back to Patients</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <Card className="p-4 border-border h-fit">
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patients…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/admin/patients/details/${p.id}`)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${
                  p.id === id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {p.full_name || "Unnamed"}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No patients</p>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          {selected ? (
            <>
              <Card className="p-6 border-border">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 border">
                    {avatarUrl && <AvatarImage src={avatarUrl} />}
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">{selected.full_name || "Unnamed"}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{selected.phone || "—"}</span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />ID {selected.id.slice(0, 8)}</span>
                      <span>Joined {new Date(selected.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-border">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Calendar className="w-4 h-4" />Appointment History</h3>
                <div className="space-y-2">
                  {appts.map((a: any) => (
                    <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{a.reason || "General visit"}</div>
                        <div className="text-xs text-muted-foreground">
                          Dr. {a.doctors?.full_name || "—"} · {new Date(a.appointment_date).toLocaleDateString()} · {a.appointment_time}
                        </div>
                      </div>
                      <Badge variant="secondary" className="capitalize">{a.status}</Badge>
                    </div>
                  ))}
                  {appts.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">No appointments yet</p>
                  )}
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-10 border-border text-center text-muted-foreground">
              Select a patient from the list
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPatientDetails;
