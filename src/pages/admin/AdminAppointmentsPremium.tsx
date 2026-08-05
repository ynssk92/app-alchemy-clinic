import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";

const AdminAppointmentsPremium = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data: allAppointments = [], isLoading, refetch } = useQuery({
    queryKey: ["appointments-premium"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments" as any)
        .select(`
          id, appointment_date, appointment_time, status, reason, 
          patients (first_name, last_name),
          doctors (
            full_name,
            specialties (name),
            clinics (name)
          )
        `)
        .order("appointment_date", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("appointments" as any).update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments-premium"] });
      toast.success("Status updated");
    }
  });

  const filtered = allAppointments.filter((a) => {
    const name = `${a.patients?.first_name} ${a.patients?.last_name}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const stats = [
    { label: "Today's", value: allAppointments.filter(a => a.appointment_date === format(new Date(), 'yyyy-MM-dd')).length, icon: Clock, color: "text-blue-500" },
    { label: "Upcoming", value: allAppointments.filter(a => a.status === 'upcoming').length, icon: Calendar, color: "text-emerald-500" },
    { label: "Completed", value: allAppointments.filter(a => a.status === 'completed').length, icon: CheckCircle, color: "text-green-500" },
    { label: "Cancelled", value: allAppointments.filter(a => a.status === 'cancelled').length, icon: XCircle, color: "text-red-500" },
  ];

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Appointment Management</h1>
          <p className="text-slate-500 mt-1">Manage all appointments across your clinic.</p>
        </div>
        <div className="flex gap-3">
          <Input placeholder="Search Patient..." className="w-64 rounded-xl border-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <Button variant="outline" className="rounded-xl"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
          <Button onClick={() => refetch()} variant="outline" size="icon" className="rounded-xl"><RefreshCw className="w-4 h-4" /></Button>
          <Button className="rounded-xl bg-primary text-white"><Plus className="w-4 h-4 mr-2" /> New Appointment</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((s, i) => (
          <Card key={i} className="p-6 rounded-[18px] border-none shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">{s.label}</p>
                <h3 className="text-2xl font-bold mt-1">{s.value}</h3>
              </div>
              <div className={cn("p-3 rounded-full bg-slate-50", s.color)}>
                <s.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {paginated.map((a) => (
          <Card key={a.id} className="p-5 rounded-[16px] border-none shadow-sm hover:shadow-lg transition-all flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <img src={a.patients?.avatar_url || "/placeholder.svg"} className="w-12 h-12 rounded-full object-cover" alt="" />
              <div>
                <h4 className="font-bold text-slate-900">{a.patients?.first_name} {a.patients?.last_name}</h4>
                <p className="text-xs text-slate-500">Dr. {a.doctors?.first_name} {a.doctors?.last_name} · {a.reason_for_visit}</p>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-600">{format(new Date(a.appointment_date), "MMM d, yyyy")} · {a.appointment_time?.slice(0, 5)}</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge className={cn("cursor-pointer capitalize", 
                  a.status === 'upcoming' ? "bg-blue-100 text-blue-700" :
                  a.status === 'completed' ? "bg-green-100 text-green-700" :
                  "bg-red-100 text-red-700"
                )}>{a.status}</Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {['upcoming', 'completed', 'cancelled'].map(s => (
                  <DropdownMenuItem key={s} onClick={() => updateStatus.mutate({ id: a.id, status: s })}>{s}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="ghost"><Eye className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost"><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mt-8">
        <p className="text-slate-500 text-sm">Showing {paginated.length} of {filtered.length} appointments</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" /></Button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <Button key={i} variant={currentPage === i + 1 ? "default" : "outline"} onClick={() => setCurrentPage(i + 1)}>{i + 1}</Button>
          ))}
          <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAppointmentsPremium;