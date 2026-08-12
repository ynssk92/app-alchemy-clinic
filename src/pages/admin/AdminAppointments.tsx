import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trash2, 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  User, 
  Clock, 
  FileText,
  ChevronRight,
  MoreVertical,
  AlertCircle,
  Download,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type Row = {
  id: string; 
  appointment_date: string; 
  appointment_time: string;
  status: string; 
  reason: string | null; 
  patient_id: string;
  doctors: { full_name: string } | null;
};

const AdminAppointments = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    const { data } = await supabase.from("appointments")
      .select("id, appointment_date, appointment_time, status, reason, patient_id, doctors(full_name)")
      .order("appointment_date", { ascending: false });
    setRows((data as any) || []);
    setIsLoading(false);
  };

  useEffect(() => { 
    load(); 
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Appointment deleted");
    load();
  };

  const exportToCSV = () => {
    if (filteredRows.length === 0) {
      return toast.error("No data to export");
    }

    const headers = ["Date", "Time", "Doctor", "Status", "Reason"];
    const csvContent = [
      headers.join(","),
      ...filteredRows.map(r => [
        r.appointment_date,
        r.appointment_time,
        `"${r.doctors?.full_name || "Doctor"}"`,
        r.status,
        `"${r.reason || ""}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `appointments-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully");
  };

  const filteredRows = rows.filter(r => {
    const matchesSearch = (r.doctors?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.reason?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: rows.length,
    upcoming: rows.filter(r => r.status === "upcoming").length,
    completed: rows.filter(r => r.status === "completed").length,
    cancelled: rows.filter(r => r.status === "cancelled").length,
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-50 text-blue-600 border-blue-100";
      case "completed": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "cancelled": return "bg-rose-50 text-rose-600 border-rose-100";
      default: return "bg-amber-50 text-amber-600 border-amber-100";
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] -m-6 p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appointments</h1>
          </div>
          <p className="text-slate-500 text-sm">Manage and track all clinic appointments</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, color: "text-slate-900", bg: "bg-white" },
            { label: "Upcoming", value: stats.upcoming, color: "text-blue-600", bg: "bg-blue-50/50" },
            { label: "Completed", value: stats.completed, color: "text-emerald-600", bg: "bg-emerald-50/50" },
            { label: "Cancelled", value: stats.cancelled, color: "text-rose-600", bg: "bg-rose-50/50" },
          ].map((s, i) => (
            <div key={i} className={cn("px-4 py-2 rounded-xl border border-slate-200/60 shadow-sm", s.bg)}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{s.label}</p>
              <p className={cn("text-lg font-bold", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group flex-1 md:w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by doctor or reason..." 
              className="pl-9 bg-white border-slate-200 rounded-full h-10 text-sm focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] rounded-full h-10 bg-white border-slate-200 text-slate-600">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={() => navigate("/admin/appointments/new")}
          className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white rounded-full px-6 h-10 gap-2 shadow-md shadow-primary/10"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </Button>
      </div>

      {/* Appointment List */}
      <div className="space-y-3">
        {filteredRows.map((r) => (
          <Card key={r.id} className="group relative bg-white border-slate-200/60 p-4 rounded-[16px] shadow-soft hover:shadow-medium transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Doctor Info */}
              <div className="flex items-center gap-3 md:w-[250px] shrink-0">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">{r.doctors?.full_name || "Doctor"}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Dental Specialist</p>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:flex-1">
                <div className="flex items-center gap-2 text-slate-600 md:w-[180px]">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm font-medium">{r.appointment_date}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 md:w-[120px]">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm font-medium">{r.appointment_time.slice(0, 5)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 flex-1 min-w-0">
                  <FileText className="w-4 h-4 text-slate-300 shrink-0" />
                  <p className="text-sm truncate pr-4">{r.reason || "No consultation reason provided"}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-md", getStatusStyle(r.status))}>
                  {r.status}
                </Badge>
                
                <div className="flex items-center gap-2">
                  <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                    <SelectTrigger className="w-32 h-9 text-xs rounded-lg border-slate-200 bg-slate-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => remove(r.id)}
                    className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {/* Empty State */}
        {filteredRows.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-slate-200/60 rounded-[20px] shadow-soft">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No appointments found</h3>
            <p className="text-slate-500 text-sm text-center max-w-[300px] mb-8">
              {searchQuery || statusFilter !== "all" 
                ? "We couldn't find any appointments matching your filters." 
                : "Your appointment list is currently empty."}
            </p>
            <Button 
              onClick={() => navigate("/admin/appointments/new")}
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Appointment</span>
            </Button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 w-full bg-slate-200/30 animate-pulse rounded-[16px]" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;