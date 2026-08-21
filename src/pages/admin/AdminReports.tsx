import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, Calendar, Activity, FileText, Download, Printer, 
  RefreshCw, Stethoscope, ChevronDown 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from "recharts";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, subMonths } from "date-fns";
import { fr } from "date-fns/locale";

const COLORS = ["#203080", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export const AdminReports = () => {
  const { t, i18n } = useTranslation();
  const [dateRange, setDateRange] = useState("this_month");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    // Aggregate data based on dateRange
    // Simplified fetch for demo purposes as per implementation requirements
    const [patients, appts, prescriptions] = await Promise.all([
      supabase.from("profiles").select("id, created_at, gender"),
      supabase.from("appointments").select("id, status, appointment_date, doctor_id, services(name)"),
      supabase.from("prescriptions").select("id, created_at, doctor_id")
    ]);
    
    setData({
      patients: patients.data || [],
      appts: appts.data || [],
      prescriptions: prescriptions.data || []
    });
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [dateRange]);

  if (loading) return <div>Loading reports...</div>;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold uppercase tracking-tight">Reports</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDateRange("this_month")}>This Month</Button>
          <Button onClick={loadData} variant="secondary"><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
          <Button><Download className="w-4 h-4 mr-2" /> Export</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Total Patients" value={data.patients.length} icon={Users} />
        <KpiCard label="Total Appointments" value={data.appts.length} icon={Calendar} />
        <KpiCard label="Total Consultations" value={data.appts.filter((a:any) => a.status === 'completed').length} icon={Stethoscope} />
        <KpiCard label="Prescriptions" value={data.prescriptions.length} icon={FileText} />
      </div>
      
      {/* Add charts and tables here */}
    </div>
  );
};

export default AdminReports;
