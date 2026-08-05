import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, Filter, Calendar, RefreshCw, Plus, MoreHorizontal, 
  Clock, User, Stethoscope, ChevronRight, Eye, Pencil, XCircle,
  AlertCircle, GripVertical
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const COLUMNS = [
  { id: "upcoming", label: "Upcoming", color: "blue", icon: Clock },
  { id: "confirmed", label: "Confirmed", color: "emerald", icon: Calendar },
  { id: "completed", label: "Completed", color: "green", icon: ChevronRight },
  { id: "cancelled", label: "Cancelled", color: "red", icon: XCircle },
];

const COLUMN_COLORS: Record<string, string> = {
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  green: "bg-green-500",
  red: "bg-red-500",
};

const AdminAppointmentKanban = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: appointments = [], isLoading, refetch } = useQuery({
    queryKey: ["appointments-kanban"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments" as any)
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          reason_for_visit,
          patient_id,
          patients (
            first_name,
            last_name,
            avatar_url
          ),
          doctors (
            first_name,
            last_name,
            specialties (name)
          )
        `)
        .order("appointment_date", { ascending: true });

      if (error) throw error;
      return data as any[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("appointments" as any)
        .update({ status } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments-kanban"] });
      toast.success("Appointment status updated");
    },
    onError: (error: any) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    updateStatusMutation.mutate({ id: draggableId, status: destination.droppableId });
  };

  const filteredAppointments = appointments.filter((app) => {
    const patientName = `${app.patients?.first_name} ${app.patients?.last_name}`.toLowerCase();
    return patientName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] -mx-8 -mt-8 p-8">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointment Board</h1>
          <p className="text-slate-500 text-sm">Manage appointments by simply dragging cards.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search Patient..." 
              className="pl-9 bg-white border-slate-200 rounded-xl h-10 w-64 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="rounded-xl border-slate-200 bg-white h-10 shadow-sm gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl border-slate-200 bg-white h-10 w-10 shadow-sm" onClick={() => refetch()}>
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
          <Button className="rounded-xl bg-primary text-white h-10 shadow-lg shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Add Appointment
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {COLUMNS.map((column) => (
            <div key={column.id} className="flex flex-col min-w-[280px]">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-2 sticky top-0 bg-[#F8FAFC] z-10 py-2">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", COLUMN_COLORS[column.color])} />
                  <h3 className="font-bold text-slate-700">{column.label}</h3>
                  <Badge variant="secondary" className="bg-slate-200/50 text-slate-600 rounded-md border-none px-1.5 h-5">
                    {filteredAppointments.filter(a => a.status === column.id).length}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Droppable Column Area */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      "min-h-[650px] p-4 rounded-[20px] bg-white shadow-sm border border-slate-100 transition-colors",
                      snapshot.isDraggingOver && "bg-slate-50 border-primary/20"
                    )}
                  >
                    <div className="space-y-4">
                      {filteredAppointments
                        .filter((app) => app.status === column.id)
                        .map((app, index) => (
                          <Draggable key={app.id} draggableId={app.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={cn(
                                  "group relative bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden",
                                  snapshot.isDragging && "shadow-2xl rotate-2 scale-[1.03] z-50 border-primary/30"
                                )}
                              >
                                {/* Left Stripe Indicator */}
                                <div className={cn("absolute left-0 top-0 bottom-0 w-1", COLUMN_COLORS[column.color])} />
                                
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10 rounded-xl shadow-sm">
                                      <AvatarImage src={app.patients?.avatar_url} />
                                      <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                                        {app.patients?.first_name?.[0]}{app.patients?.last_name?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                      <h4 className="font-bold text-slate-900 text-sm truncate">
                                        {app.patients?.first_name} {app.patients?.last_name}
                                      </h4>
                                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                        {app.appointment_time?.slice(0, 5)} · 30 min
                                      </p>
                                    </div>
                                  </div>
                                  <div {...provided.dragHandleProps} className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                  <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Dr. {app.doctors?.last_name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="truncate">{app.reason_for_visit || "General Checkup"}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50">
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50">
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      
                      {filteredAppointments.filter(a => a.status === column.id).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                            <column.icon className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="text-sm font-bold text-slate-400">No appointments</p>
                          <p className="text-xs text-slate-300">Drag an appointment here.</p>
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default AdminAppointmentKanban;
