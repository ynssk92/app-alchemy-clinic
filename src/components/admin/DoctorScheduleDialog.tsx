import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2, CalendarDays, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Props = { doctorId: string | null; doctorName?: string; onClose: () => void };
type Slot = { id: string; day_of_week: number; start_time: string; end_time: string };
type Holiday = { id: string; start_date: string; end_date: string; reason: string | null };

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DoctorScheduleDialog = ({ doctorId, doctorName, onClose }: Props) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSlot, setNewSlot] = useState({ day_of_week: 1, start_time: "09:00", end_time: "17:00" });
  const [newHoliday, setNewHoliday] = useState({ start_date: "", end_date: "", reason: "" });

  const load = async () => {
    if (!doctorId) return;
    setLoading(true);
    const [a, h] = await Promise.all([
      supabase.from("doctor_availability").select("*").eq("doctor_id", doctorId)
        .order("day_of_week").order("start_time"),
      supabase.from("doctor_holidays").select("*").eq("doctor_id", doctorId)
        .order("start_date", { ascending: false }),
    ]);
    setSlots((a.data as any) || []);
    setHolidays((h.data as any) || []);
    setLoading(false);
  };

  useEffect(() => { if (doctorId) load(); }, [doctorId]);

  const addSlot = async () => {
    if (newSlot.end_time <= newSlot.start_time) return toast.error("End must be after start");
    const { error } = await supabase.from("doctor_availability")
      .insert({ doctor_id: doctorId, ...newSlot });
    if (error) return toast.error(error.message);
    toast.success("Window added");
    load();
  };

  const removeSlot = async (id: string) => {
    const { error } = await supabase.from("doctor_availability").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const addHoliday = async () => {
    if (!newHoliday.start_date || !newHoliday.end_date) return toast.error("Pick dates");
    if (newHoliday.end_date < newHoliday.start_date) return toast.error("End must be on/after start");
    const { error } = await supabase.from("doctor_holidays").insert({
      doctor_id: doctorId,
      start_date: newHoliday.start_date,
      end_date: newHoliday.end_date,
      reason: newHoliday.reason.trim() || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Holiday added");
    setNewHoliday({ start_date: "", end_date: "", reason: "" });
    load();
  };

  const removeHoliday = async (id: string) => {
    const { error } = await supabase.from("doctor_holidays").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <Dialog open={!!doctorId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule — {doctorName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-6">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Weekly availability</h3>
              </div>

              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end mb-3">
                <div>
                  <Label className="text-xs">Day</Label>
                  <Select value={String(newSlot.day_of_week)}
                    onValueChange={(v) => setNewSlot({ ...newSlot, day_of_week: +v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Start</Label>
                  <Input type="time" value={newSlot.start_time}
                    onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">End</Label>
                  <Input type="time" value={newSlot.end_time}
                    onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })} />
                </div>
                <Button size="sm" onClick={addSlot}><Plus className="w-4 h-4" /></Button>
              </div>

              <div className="space-y-2">
                {slots.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-md bg-muted/40 text-sm">
                    <span><span className="font-semibold w-10 inline-block">{DAYS[s.day_of_week]}</span>
                      {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}</span>
                    <Button size="sm" variant="ghost" onClick={() => removeSlot(s.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {slots.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">No windows yet.</p>}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Holidays & time off</h3>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1.5fr_auto] gap-2 items-end mb-3">
                <div>
                  <Label className="text-xs">From</Label>
                  <Input type="date" value={newHoliday.start_date}
                    onChange={(e) => setNewHoliday({ ...newHoliday, start_date: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">To</Label>
                  <Input type="date" value={newHoliday.end_date}
                    onChange={(e) => setNewHoliday({ ...newHoliday, end_date: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Reason (optional)</Label>
                  <Input maxLength={120} value={newHoliday.reason}
                    onChange={(e) => setNewHoliday({ ...newHoliday, reason: e.target.value })} />
                </div>
                <Button size="sm" onClick={addHoliday}><Plus className="w-4 h-4" /></Button>
              </div>

              <div className="space-y-2">
                {holidays.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-2 rounded-md bg-muted/40 text-sm">
                    <span>
                      <span className="font-semibold">{h.start_date}</span>
                      {h.end_date !== h.start_date && <> → <span className="font-semibold">{h.end_date}</span></>}
                      {h.reason && <span className="text-muted-foreground"> • {h.reason}</span>}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => removeHoliday(h.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {holidays.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">No holidays scheduled.</p>}
              </div>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DoctorScheduleDialog;
