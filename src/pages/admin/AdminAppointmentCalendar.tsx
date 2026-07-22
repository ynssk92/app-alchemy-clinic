import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type Row = {
  id: string; appointment_date: string; appointment_time: string;
  status: string; doctors: { full_name: string } | null;
};

const AdminAppointmentCalendar = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [cursor, setCursor] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });

  useEffect(() => {
    supabase.from("appointments")
      .select("id, appointment_date, appointment_time, status, doctors(full_name)")
      .then(({ data }) => setRows((data as any) || []));
  }, []);

  const { days, monthLabel } = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) grid.push(null);
    for (let i = 1; i <= daysInMonth; i++) grid.push(new Date(year, month, i));
    while (grid.length % 7 !== 0) grid.push(null);
    return {
      days: grid,
      monthLabel: cursor.toLocaleString("en-US", { month: "long", year: "numeric" }),
    };
  }, [cursor]);

  const byDate = useMemo(() => {
    const m: Record<string, Row[]> = {};
    rows.forEach((r) => {
      (m[r.appointment_date] ||= []).push(r);
    });
    return m;
  }, [rows]);

  const shift = (n: number) => {
    const d = new Date(cursor); d.setMonth(d.getMonth() + n); setCursor(d);
  };
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Calendar</h1>
      <p className="text-muted-foreground mb-6">Monthly view of all appointments</p>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={() => shift(-1)}><ChevronLeft className="w-4 h-4" /></Button>
            <Button size="icon" variant="outline" onClick={() => shift(1)}><ChevronRight className="w-4 h-4" /></Button>
            <Button variant="ghost" onClick={() => { const d = new Date(); d.setDate(1); setCursor(d); }}>Today</Button>
          </div>
          <h2 className="text-xl font-bold">{monthLabel}</h2>
          <div className="w-40" />
        </div>

        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="bg-muted/50 text-xs font-semibold text-center py-2 text-muted-foreground">
              {d}
            </div>
          ))}
          {days.map((d, i) => {
            const key = d?.toISOString().slice(0, 10) || `x${i}`;
            const items = d ? byDate[key] || [] : [];
            return (
              <div key={key + i} className={cn(
                "bg-card min-h-[110px] p-2 text-xs flex flex-col gap-1",
                !d && "bg-muted/20"
              )}>
                {d && (
                  <div className={cn(
                    "text-[11px] font-semibold self-end px-1.5 rounded",
                    key === today && "bg-primary text-primary-foreground"
                  )}>
                    {d.getDate()}
                  </div>
                )}
                {items.slice(0, 3).map((it) => (
                  <div key={it.id} className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] truncate",
                    it.status === "upcoming" && "bg-primary/10 text-primary",
                    it.status === "completed" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                    it.status === "cancelled" && "bg-destructive/10 text-destructive",
                  )}>
                    {it.appointment_time.slice(0, 5)} · {it.doctors?.full_name || "Doctor"}
                  </div>
                ))}
                {items.length > 3 && (
                  <div className="text-[10px] text-muted-foreground">+{items.length - 3} more</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><Badge className="bg-primary/10 text-primary hover:bg-primary/10">Upcoming</Badge></div>
          <div className="flex items-center gap-1.5"><Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10">Completed</Badge></div>
          <div className="flex items-center gap-1.5"><Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10">Cancelled</Badge></div>
        </div>
      </Card>
    </div>
  );
};

export default AdminAppointmentCalendar;
