import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, Calendar, Activity, FileText, Download, Printer, 
  RefreshCw, Stethoscope, TrendingUp, UserPlus, CalendarCheck,
  CheckCircle2, XCircle, Clock, AlertCircle, BarChart3, PieChart as PieChartIcon,
  ChevronRight, ArrowRight
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend
} from "recharts";
import { WidgetCard, EmptyState } from "@/components/dashboard/WidgetCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { 
  format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  subMonths, isWithinInterval, startOfYear, endOfYear, subYears,
  parseISO
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#4b5563"];

type DateRange = "today" | "yesterday" | "this_week" | "this_month" | "last_month" | "this_year";

export const AdminReports = () => {
  const { t, i18n } = useTranslation();
  const [range, setRange] = useState<DateRange>("this_month");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    patients: any[];
    appointments: any[];
    prescriptions: any[];
    doctors: any[];
    invoices: any[];
    documents: any[];
  }>({
    patients: [],
    appointments: [],
    prescriptions: [],
    doctors: [],
    invoices: [],
    documents: []
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, aRes, prRes, dRes, invRes, docRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("appointments").select("*, doctors(full_name), profiles(full_name), services(name)"),
        supabase.from("prescriptions").select("*, doctors(full_name), profiles(full_name)"),
        supabase.from("doctors").select("*"),
        supabase.from("invoices").select("*, doctors(full_name), profiles(full_name)"),
        supabase.from("patient_documents").select("*, profiles(full_name)")
      ]);

      setData({
        patients: pRes.data || [],
        appointments: aRes.data || [],
        prescriptions: prRes.data || [],
        doctors: dRes.data || [],
        invoices: invRes.data || [],
        documents: docRes.data || []
      });
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const dateInterval = useMemo(() => {
    const now = new Date();
    switch (range) {
      case "today":
        return { start: now, end: now };
      case "yesterday":
        const yesterday = subDays(now, 1);
        return { start: yesterday, end: yesterday };
      case "this_week":
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case "this_month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "last_month":
        const lm = subMonths(now, 1);
        return { start: startOfMonth(lm), end: endOfMonth(lm) };
      case "this_year":
        return { start: startOfYear(now), end: endOfYear(now) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  }, [range]);

  const filteredData = useMemo(() => {
    if (!data.patients.length && !data.appointments.length && !data.invoices.length) {
      return { patients: [], appointments: [], prescriptions: [], invoices: [], documents: [] };
    }

    const filterByDate = (item: any, dateKey: string) => {
      if (!item[dateKey]) return false;
      const date = parseISO(item[dateKey]);
      const start = new Date(dateInterval.start);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateInterval.end);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    };

    return {
      patients: data.patients.filter(p => filterByDate(p, "created_at")),
      appointments: data.appointments.filter(a => filterByDate(a, "appointment_date")),
      prescriptions: data.prescriptions.filter(p => filterByDate(p, "created_at")),
      invoices: data.invoices.filter(i => filterByDate(i, "issue_date")),
      documents: data.documents.filter(d => filterByDate(d, "document_date"))
    };
  }, [data, dateInterval]);

  const stats = useMemo(() => {
    const appts = filteredData.appointments;
    const invs = filteredData.invoices;
    
    const totalBilled = invs.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalPaid = invs.reduce((sum, inv) => sum + (inv.paid || 0), 0);
    const balance = totalBilled - totalPaid;

    return {
      totalPatients: data.patients.length,
      newPatients: filteredData.patients.length,
      totalAppts: appts.length,
      completedAppts: appts.filter(a => a.status === "completed").length,
      cancelledAppts: appts.filter(a => a.status === "cancelled").length,
      noShowAppts: appts.filter(a => a.status === "no-show").length,
      upcomingAppts: appts.filter(a => a.status === "upcoming").length,
      totalPrescriptions: filteredData.prescriptions.length,
      totalDocuments: filteredData.documents.length,
      totalBilled,
      totalPaid,
      balance,
      totalInvoices: invs.length
    };
  }, [data.patients.length, filteredData]);

  const apptsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.appointments.forEach(a => {
      const type = a.services?.name || "Consultation";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredData.appointments]);

  const apptsByStatus = useMemo(() => {
    const statuses = ["completed", "upcoming", "cancelled", "no-show"];
    return statuses.map(s => ({
      name: s.charAt(0).toUpperCase() + s.slice(1),
      value: filteredData.appointments.filter(a => a.status === s).length
    }));
  }, [filteredData.appointments]);

  const revenueByDoctor = useMemo(() => {
    const revenue: Record<string, number> = {};
    filteredData.invoices.forEach(inv => {
      const name = inv.doctors?.full_name || "Clinique";
      revenue[name] = (revenue[name] || 0) + (inv.total || 0);
    });
    return Object.entries(revenue).map(([name, value]) => ({ name, value }));
  }, [filteredData.invoices]);

  const docsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.documents.forEach(doc => {
      const cat = doc.category || "Autre";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredData.documents]);

  const doctorActivity = useMemo(() => {
    return data.doctors.map(d => {
      const docAppts = filteredData.appointments.filter(a => a.doctor_id === d.id);
      const docInvs = filteredData.invoices.filter(i => i.doctor_id === d.id);
      const revenue = docInvs.reduce((sum, inv) => sum + (inv.total || 0), 0);
      
      return {
        name: d.full_name,
        appointments: docAppts.length,
        completed: docAppts.filter(a => a.status === "completed").length,
        prescriptions: filteredData.prescriptions.filter(p => p.doctor_id === d.id).length,
        revenue
      };
    }).sort((a, b) => b.appointments - a.appointments);
  }, [data.doctors, filteredData]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 p-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">Rapports & Statistiques</h1>
          <p className="text-muted-foreground mt-1">Analyse détaillée de l'activité de la clinique.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={range} onValueChange={(v: DateRange) => setRange(v)}>
            <SelectTrigger className="w-[180px] bg-card border-border/50">
              <Calendar className="w-4 h-4 mr-2 text-primary" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="yesterday">Hier</SelectItem>
              <SelectItem value="this_week">Cette semaine</SelectItem>
              <SelectItem value="this_month">Ce mois-ci</SelectItem>
              <SelectItem value="last_month">Le mois dernier</SelectItem>
              <SelectItem value="this_year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={loadData} className="hover:bg-primary/5">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="hidden sm:flex" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Imprimer
          </Button>
          <Button className="bg-gradient-primary shadow-md">
            <Download className="w-4 h-4 mr-2" /> Exporter
          </Button>
        </div>
      </header>

      {/* Summary KPI Cards */}
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          label="Total Patients" 
          value={stats.totalPatients} 
          subtitle={`+${stats.newPatients} cette période`}
          icon={Users} 
          tint="stat-blue"
          up={true}
          delta={`${((stats.newPatients / (stats.totalPatients || 1)) * 100).toFixed(1)}%`}
        />
        <KpiCard 
          label="Rendez-vous" 
          value={stats.totalAppts} 
          subtitle={`${stats.upcomingAppts} à venir`}
          icon={Calendar} 
          tint="stat-cyan"
        />
        <KpiCard 
          label="Chiffre d'Affaires" 
          value={`${stats.totalBilled.toLocaleString()} MAD`}
          subtitle={`${stats.totalInvoices} factures`}
          icon={TrendingUp} 
          tint="stat-green"
          up={true}
        />
        <KpiCard 
          label="Archives Médicales" 
          value={stats.totalDocuments} 
          subtitle="Documents téléchargés"
          icon={FileText} 
          tint="stat-violet"
        />
      </div>

      {/* Billing & Revenue Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <WidgetCard 
          className="lg:col-span-8"
          title="Rapport Financier"
          description="Performance des revenus par médecin (MAD)"
          icon={TrendingUp}
          tint="stat-green"
        >
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByDoctor}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
                <Tooltip 
                  formatter={(value: any) => [`${value.toLocaleString()} MAD`, "Revenu"]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="hsl(var(--stat-green))" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </WidgetCard>

        <WidgetCard 
          className="lg:col-span-4"
          title="Statut des Paiements"
          description="Répartition encaissé vs restant"
          icon={PieChartIcon}
          tint="stat-blue"
        >
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Payé', value: stats.totalPaid },
                    { name: 'À percevoir', value: stats.balance }
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#059669" />
                  <Cell fill="#dc2626" />
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value.toLocaleString()} MAD`, "Montant"]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </WidgetCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Appointments by Status */}
        <WidgetCard 
          className="lg:col-span-4"
          title="Archives par Catégorie"
          description="Documents par type de dossier"
          icon={FileText}
          tint="stat-violet"
        >
          <div className="h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={docsByCategory}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {docsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </WidgetCard>

        {/* Appointments by Type */}
        <WidgetCard 
          className="lg:col-span-8"
          title="Rendez-vous par Statut"
          description="Répartition opérationnelle"
          icon={Activity}
          tint="stat-cyan"
        >
          <div className="h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={apptsByStatus}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="hsl(var(--stat-cyan))" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </WidgetCard>
      </div>

      {/* Doctor Activity Table */}
      <WidgetCard
        title="Activité des Praticiens"
        description="Performance par docteur sur la période sélectionnée"
        icon={Users}
        tint="stat-violet"
      >
        <div className="mt-4 border border-border/50 rounded-xl overflow-hidden bg-card/50">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Médecin</TableHead>
                <TableHead className="text-center">Rendez-vous</TableHead>
                <TableHead className="text-center">Complétés</TableHead>
                <TableHead className="text-center">Ordonnances</TableHead>
                <TableHead className="text-center">Revenu (MAD)</TableHead>
                <TableHead className="text-right">Taux de Complétion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctorActivity.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Aucune donnée pour cette période
                  </TableCell>
                </TableRow>
              ) : (
                doctorActivity.map((doc, i) => (
                  <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {doc.name ? doc.name.charAt(0) : 'D'}
                        </div>
                        {doc.name || 'Inconnu'}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{doc.appointments}</TableCell>
                    <TableCell className="text-center">{doc.completed}</TableCell>
                    <TableCell className="text-center">{doc.prescriptions}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none">
                        {doc.appointments > 0 ? ((doc.completed / doc.appointments) * 100).toFixed(0) : 0}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </WidgetCard>

      {/* Recent Activity Lists */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <WidgetCard
          title="Derniers Rendez-vous"
          description="Aperçu des rendez-vous récents"
          icon={CalendarCheck}
          tint="stat-cyan"
        >
          <div className="space-y-4 mt-2">
            {filteredData.appointments.slice(0, 5).map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:border-primary/20 transition-all hover:bg-primary/5 group">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${a.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{a.profiles?.full_name || 'Patient'}</div>
                    <div className="text-xs text-muted-foreground">{a.doctors?.full_name || 'Dr.'} • {a.services?.name || 'Consultation'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-foreground">{format(parseISO(a.appointment_date), 'dd MMM yyyy')}</div>
                  <Badge className={`text-[10px] h-5 ${
                    a.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                    a.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  } border-none`}>
                    {a.status}
                  </Badge>
                </div>
              </div>
            ))}
            {filteredData.appointments.length === 0 && <EmptyState label="Aucun rendez-vous sur cette période" />}
          </div>
        </WidgetCard>

        <WidgetCard
          title="Dernières Ordonnances"
          description="Activité de prescription récente"
          icon={FileText}
          tint="stat-violet"
        >
          <div className="space-y-4 mt-2">
            {filteredData.prescriptions.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:border-primary/20 transition-all hover:bg-primary/5 group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{p.profiles?.full_name || 'Patient'}</div>
                    <div className="text-xs text-muted-foreground">Dr. {p.doctors?.full_name || 'Médecin'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-foreground">{format(parseISO(p.created_at), 'dd MMM yyyy')}</div>
                  <div className="text-[10px] text-muted-foreground truncate max-w-[80px]">Réf: {p.id.split('-')[0].toUpperCase()}</div>
                </div>
              </div>
            ))}
            {filteredData.prescriptions.length === 0 && <EmptyState label="Aucune ordonnance sur cette période" />}
          </div>
        </WidgetCard>
      </div>
    </div>
  );
};

export default AdminReports;
