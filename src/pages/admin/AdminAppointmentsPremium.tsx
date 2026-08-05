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
import { format, isToday, isThisWeek, isThisMonth, parseISO } from "date-fns";

const AdminAppointmentsPremium = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data: allAppointments = [], isLoading, error, refetch } = useQuery({
    queryKey: ["appointments-premium"],
    queryFn: async () => {
      console.log("Fetching appointments...");
      const { data, error } = await supabase
        .from("appointments" as any)
        .select(`
          id, 
          appointment_date, 
          appointment_time, 
          status, 
          reason,
          created_at,
          patients (
            first_name, 
            last_name, 
            avatar_url
          ),
          doctors (
            full_name,
            specialties (name),
            clinics (name)
          )
        `)
        .order("appointment_date", { ascending: false });

      if (error) {
        console.error("Database error fetching appointments:", error);
        throw error;
      }
      
      console.log(`Successfully loaded ${data?.length || 0} appointments`);
      return (data || []) as any[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('admin-appointments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          console.log("Real-time update received, refetching...");
          queryClient.invalidateQueries({ queryKey: ["appointments-premium"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("appointments" as any).update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments-premium"] });
      toast.success("Status updated successfully");
    },
    onError: (err: any) => {
      toast.error(`Failed to update status: ${err.message}`);
    }
  });

  const removeAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments-premium"] });
      toast.success("Appointment deleted");
    },
    onError: (err: any) => {
      toast.error(`Failed to delete: ${err.message}`);
    }
  });

  const filtered = allAppointments.filter((a) => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const patientName = `${a.patients?.first_name} ${a.patients?.last_name}`.toLowerCase();
    const doctorName = (a.doctors?.full_name || "").toLowerCase();
    const reason = (a.reason || "").toLowerCase();
    
    const matchesSearch = patientName.includes(searchLower) || 
                          doctorName.includes(searchLower) || 
                          reason.includes(searchLower);

    // Status filter
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;

    // Date filter
    let matchesDate = true;
    if (dateFilter !== "all" && a.appointment_date) {
      const apptDate = parseISO(a.appointment_date);
      if (dateFilter === "today") matchesDate = isToday(apptDate);
      else if (dateFilter === "week") matchesDate = isThisWeek(apptDate, { weekStartsOn: 1 });
      else if (dateFilter === "month") matchesDate = isThisMonth(apptDate);
    }

    return matchesSearch && matchesStatus && matchesDate;
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
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Appointment Management</h1>
          <p className="text-slate-500 mt-1">Manage all appointments across your clinic.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search Patient, Doctor, ID..." 
              className="w-64 pl-9 rounded-xl border-slate-200 bg-white" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl bg-white border-slate-200">
                <Filter className="w-4 h-4 mr-2" /> 
                {statusFilter === "all" ? "Status" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("upcoming")}>Upcoming</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("confirmed")}>Confirmed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>Cancelled</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl bg-white border-slate-200">
                <Calendar className="w-4 h-4 mr-2" /> 
                {dateFilter === "all" ? "Date" : dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setDateFilter("all")}>All Time</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter("today")}>Today</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter("week")}>This Week</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter("month")}>This Month</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="icon" 
            className={cn("rounded-xl bg-white border-slate-200", isLoading && "animate-spin")}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button className="rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> New Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s, i) => (
          <Card key={i} className="p-6 rounded-[18px] border-none shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">{s.label}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12 mt-1" />
                ) : (
                  <h3 className="text-2xl font-bold mt-1 text-slate-900 group-hover:scale-110 transition-transform origin-left">{s.value}</h3>
                )}
              </div>
              <div className={cn("p-3 rounded-2xl bg-slate-50 transition-colors group-hover:bg-white", s.color)}>
                <s.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-5 rounded-[16px] border-none shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </Card>
          ))
        ) : error ? (
          <Card className="p-12 rounded-[24px] border-none shadow-sm bg-white text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Unable to load appointments</h3>
            <p className="text-slate-500 mb-6">There was a problem connecting to the database.</p>
            <Button onClick={() => refetch()} className="rounded-xl px-8">
              <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </Button>
          </Card>
        ) : paginated.length > 0 ? (
          paginated.map((a) => (
            <Card key={a.id} className="p-5 rounded-[16px] border-none bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm overflow-hidden">
                    {a.patients?.avatar_url ? (
                      <img src={a.patients.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span>{a.patients?.first_name?.[0]}{a.patients?.last_name?.[0]}</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {a.patients?.first_name} {a.patients?.last_name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Dr. {a.doctors?.full_name}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{a.doctors?.specialties?.name || "General"}</span>
                    {a.doctors?.clinics?.name && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="italic">{a.doctors.clinics.name}</span>
                      </>
                    )}
                  </div>
                  {a.reason && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{a.reason}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-1 px-4 border-l border-slate-50">
                <div className="text-sm font-bold text-slate-700">
                  {format(parseISO(a.appointment_date), "EEEE, d MMM yyyy")}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Clock className="w-3 h-3" /> {a.appointment_time} · 30 min
                </div>
                <div className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">
                  Created {format(new Date(a.created_at), "MMM d, HH:mm")}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge className={cn(
                      "cursor-pointer capitalize px-3 py-1 rounded-lg border-none shadow-sm transition-all hover:scale-105", 
                      a.status === 'upcoming' ? "bg-blue-100 text-blue-700 hover:bg-blue-200" :
                      a.status === 'confirmed' ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" :
                      a.status === 'completed' ? "bg-green-100 text-green-700 hover:bg-green-200" :
                      "bg-red-100 text-red-700 hover:bg-red-200"
                    )}>
                      {a.status}
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    {['upcoming', 'confirmed', 'completed', 'cancelled'].map(s => (
                      <DropdownMenuItem 
                        key={s} 
                        className="capitalize"
                        onClick={() => updateStatus.mutate({ id: a.id, status: s })}
                      >
                        {s}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                  <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-9 w-9 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this appointment?")) {
                        removeAppointment.mutate(a.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-20 rounded-[24px] border-none bg-white/50 shadow-sm text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Calendar className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No appointments found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">
              Try changing your filters or create a new appointment for your clinic.
            </p>
            <Button className="mt-8 rounded-xl px-8 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> Create First Appointment
            </Button>
          </Card>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mt-10 gap-4">
        <p className="text-slate-500 text-sm font-medium">
          Showing {paginated.length} of {filtered.length} appointments
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="icon"
              className="rounded-xl bg-white border-slate-200 h-9 w-9"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button 
                  key={i} 
                  variant={currentPage === i + 1 ? "default" : "ghost"} 
                  className={cn(
                    "h-9 w-9 rounded-xl font-bold transition-all",
                    currentPage === i + 1 ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-400 hover:text-primary hover:bg-primary/5"
                  )}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button 
              variant="outline" 
              size="icon"
              className="rounded-xl bg-white border-slate-200 h-9 w-9"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAppointmentsPremium;