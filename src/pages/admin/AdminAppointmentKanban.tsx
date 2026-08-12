import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  LayoutGrid, 
  CheckCircle2, 
  Clock3, 
  XCircle,
  MoreVertical,
  ChevronRight,
  User
} from "lucide-react";

type Row = {
  id: string; 
  appointment_date: string; 
  appointment_time: string;
  status: string; 
  reason: string | null;
  doctors: { full_name: string } | null;
};

const COLUMNS = [
  { 
    key: "upcoming", 
    label: "Upcoming", 
    icon: Clock3,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
    emptyIcon: Calendar
  },
  { 
    key: "completed", 
    label: "Completed", 
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100",
    emptyIcon: CheckCircle2
  },
  { 
    key: "cancelled", 
    label: "Cancelled", 
    icon: XCircle,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-100",
    emptyIcon: XCircle
  },
] as const;

const AdminAppointmentKanban = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("id, appointment_date, appointment_time, status, reason, doctors(full_name)")
      .order("appointment_date", { ascending: true });
    
    if (error) {
      toast.error("Failed to load appointments");
    } else {
      setRows((data as any) || []);
    }
    setIsLoading(false);
  };

  useEffect(() => { 
    load(); 
  }, []);

  const move = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Moved to ${status}`);
    load();
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    // Add a visual class to the dragged element
    const target = e.target as HTMLElement;
    target.style.opacity = "0.4";
  };

  const onDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = "1";
  };

  const onDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) move(id, status);
  };

  const filteredRows = rows.filter(r => 
    r.doctors?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC] -m-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 text-sm">Manage and track all patient appointments</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search appointments..." 
              className="pl-9 bg-white border-slate-200 w-full md:w-[240px] focus-visible:ring-primary/20 rounded-full h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="bg-white border-slate-200 rounded-full h-9 gap-2 text-slate-600">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
          <Button variant="outline" size="icon" className="bg-white border-slate-200 rounded-full h-9 w-9">
            <LayoutGrid className="w-4 h-4 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-2 px-2">
        {COLUMNS.map((col) => {
          const items = filteredRows.filter((r) => r.status === col.key);
          const Icon = col.icon;
          
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, col.key)}
              className="flex-1 min-w-[320px] max-w-[400px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1.5 rounded-lg", col.bgColor)}>
                    <Icon className={cn("w-4 h-4", col.color)} />
                  </div>
                  <h3 className="font-semibold text-slate-800">{col.label}</h3>
                  <Badge variant="secondary" className="bg-slate-200/50 text-slate-600 border-none font-medium ml-1">
                    {items.length}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              {/* Appointment List Area */}
              <div className="space-y-3 min-h-[500px]">
                {items.map((r) => (
                  <Card
                    key={r.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, r.id)}
                    onDragEnd={onDragEnd}
                    className="group relative bg-white border-slate-200/60 p-4.5 rounded-[18px] shadow-soft hover:shadow-medium transition-all duration-200 cursor-grab active:cursor-grabbing border-l-4 border-l-transparent hover:border-l-primary"
                  >
                    {/* Card Top Row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-[15px] leading-tight">
                            {r.doctors?.full_name || "Doctor"}
                          </p>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "mt-1 text-[10px] px-1.5 py-0 h-4 border-none font-medium uppercase tracking-wider",
                              col.key === "upcoming" && "bg-blue-50 text-blue-600",
                              col.key === "completed" && "bg-emerald-50 text-emerald-600",
                              col.key === "cancelled" && "bg-rose-50 text-rose-600"
                            )}
                          >
                            {col.label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-4 text-slate-500">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.appointment_date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.appointment_time.slice(0, 5)}</span>
                        </div>
                      </div>
                      
                      {r.reason && (
                        <p className="text-slate-600 text-[13px] leading-relaxed line-clamp-2">
                          {r.reason}
                        </p>
                      )}
                    </div>

                    {/* Quick Actions (Visually redesigned) */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex gap-1">
                        {COLUMNS.filter((c) => c.key !== col.key).map((c) => (
                          <Button 
                            key={c.key} 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 text-[10px] font-semibold px-2 hover:bg-slate-50 text-slate-500 hover:text-slate-900"
                            onClick={() => move(r.id, c.key)}
                          >
                            Mark {c.label}
                          </Button>
                        ))}
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {items.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-200/50 rounded-2xl bg-white/50">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <col.emptyIcon className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-slate-900 font-medium text-sm">No {col.label.toLowerCase()} appointments</p>
                    <p className="text-slate-500 text-xs mt-1 text-center">
                      Appointments will appear here when scheduled.
                    </p>
                  </div>
                )}
                
                {isLoading && items.length === 0 && (
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                      <div key={i} className="h-[160px] w-full bg-slate-200/30 animate-pulse rounded-[18px]" />
                    ))}
                  </div>
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