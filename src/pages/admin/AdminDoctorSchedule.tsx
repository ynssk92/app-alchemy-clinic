import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Search, Plus, Trash2, Clock, CalendarDays, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Doctor = { id: string; full_name: string; avatar_url: string | null; specialties?: { name: string } | null };
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const AdminDoctorSchedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState<Doctor[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSlot, setNewSlot] = useState({ day_of_week: 1, start_time: "09:00", end_time: "17:00" });
  const [newHoliday, setNewHoliday] = useState({ start_date: "", end_date: "", reason: "" });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("doctors")
        .select("id, full_name, avatar_url, specialties(name)").order("full_name");
      setList((data as any) || []);
      if (!id && data?.[0]) navigate(`/admin/doctors/schedule/${data[0].id}`, { replace: true });
    })();
  }, [id, navigate]);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [{ data: d }, { data: a }, { data: h }] = await Promise.all([
      supabase.from("doctors").select("id, full_name, avatar_url, specialties(name)").eq("id", id).maybeSingle(),
      supabase.from("doctor_availability").select("*").eq("doctor_id", id).order("day_of_week").order("start_time"),
      supabase.from("doctor_holidays").select("*").eq("doctor_id", id).order("start_date", { ascending: false }),
    ]);
    setSelected(d as any);
    setSlots((a as any) || []);
    setHolidays((h as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [id]);

  const addSlot = async () => {
    if (newSlot.end_time <= newSlot.start_time) return toast.error("End must be after start");
    const { error } = await supabase.from("doctor_availability").insert({ doctor_id: id, ...newSlot });
    if (error) return toast.error(error.message);
    toast.success("Window added"); load();
  };
  const removeSlot = async (sid: string) => {
    const { error } = await supabase.from("doctor_availability").delete().eq("id", sid);
    if (error) return toast.error(error.message);
    load();
  };
  const addHoliday = async () => {
    if (!newHoliday.start_date || !newHoliday.end_date) return toast.error("Pick dates");
    const { error } = await supabase.from("doctor_holidays").insert({
      doctor_id: id, start_date: newHoliday.start_date, end_date: newHoliday.end_date,
      reason: newHoliday.reason.trim() || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Holiday added");
    setNewHoliday({ start_date: "", end_date: "", reason: "" });
    load();
  };
  const removeHoliday = async (hid: string) => {
    const { error } = await supabase.from("doctor_holidays").delete().eq("id", hid);
    if (error) return toast.error(error.message);
    load();
  };

  const filtered = list.filter((d) => (d.full_name || "").toLowerCase().includes(q.toLowerCase()));
  const initials = (selected?.full_name || "D").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Link to="/admin/doctors" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          Doctor Schedule
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <Card className="p-4 border-border h-fit">
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search doctors…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto">
            {filtered.map((d) => (
              <button
                key={d.id}
                onClick={() => navigate(`/admin/doctors/schedule/${d.id}`)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${
                  d.id === id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                Dr. {d.full_name}
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          {selected && (
            <Card className="p-5 border-border flex items-center gap-4">
              <Avatar className="w-14 h-14">
                {selected.avatar_url && <AvatarImage src={selected.avatar_url} className="object-cover" />}
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-lg">Dr. {selected.full_name}</div>
                <div className="text-sm text-muted-foreground">{selected.specialties?.name || "General"}</div>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-primary" />
                  <h3 className="font-bold">Weekly availability</h3>
                </div>
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end mb-4">
                  <div>
                    <Label className="text-xs">Day</Label>
                    <Select value={String(newSlot.day_of_week)} onValueChange={(v) => setNewSlot({ ...newSlot, day_of_week: +v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Start</Label>
                    <Input type="time" value={newSlot.start_time} onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">End</Label>
                    <Input type="time" value={newSlot.end_time} onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })} />
                  </div>
                  <Button size="sm" onClick={addSlot}><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="space-y-2">
                  {slots.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-2 rounded-md bg-muted/40 text-sm">
                      <span><span className="font-semibold w-10 inline-block">{DAYS[s.day_of_week]}</span>
                        {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}</span>
                      <Button size="sm" variant="ghost" onClick={() => removeSlot(s.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                  {slots.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">No windows yet.</p>}
                </div>
              </Card>

              <Card className="p-6 border-border">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <h3 className="font-bold">Holidays & time off</h3>
                </div>
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end mb-4">
                  <div>
                    <Label className="text-xs">From</Label>
                    <Input type="date" value={newHoliday.start_date} onChange={(e) => setNewHoliday({ ...newHoliday, start_date: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">To</Label>
                    <Input type="date" value={newHoliday.end_date} onChange={(e) => setNewHoliday({ ...newHoliday, end_date: e.target.value })} />
                  </div>
                  <Button size="sm" onClick={addHoliday}><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="mb-4">
                  <Label className="text-xs">Reason (optional)</Label>
                  <Input maxLength={120} value={newHoliday.reason} onChange={(e) => setNewHoliday({ ...newHoliday, reason: e.target.value })} />
                </div>
                <div className="space-y-2">
                  {holidays.map((h: any) => (
                    <div key={h.id} className="flex items-center justify-between p-2 rounded-md bg-muted/40 text-sm">
                      <span>
                        <span className="font-semibold">{h.start_date}</span>
                        {h.end_date !== h.start_date && <> → <span className="font-semibold">{h.end_date}</span></>}
                        {h.reason && <span className="text-muted-foreground"> • {h.reason}</span>}
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => removeHoliday(h.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                  {holidays.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">No holidays.</p>}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDoctorSchedule;
