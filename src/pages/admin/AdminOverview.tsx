import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Stethoscope, Calendar, Users, Tag, Building2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminOverview = () => {
  const [stats, setStats] = useState({ doctors: 0, appts: 0, patients: 0, specialties: 0, clinics: 0, upcoming: 0 });

  useEffect(() => {
    (async () => {
      const [d, a, p, s, c, up] = await Promise.all([
        supabase.from("doctors").select("*", { count: "exact", head: true }),
        supabase.from("appointments").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("specialties").select("*", { count: "exact", head: true }),
        supabase.from("clinics").select("*", { count: "exact", head: true }),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "upcoming"),
      ]);
      setStats({
        doctors: d.count || 0, appts: a.count || 0, patients: p.count || 0,
        specialties: s.count || 0, clinics: c.count || 0, upcoming: up.count || 0,
      });
    })();
  }, []);

  const cards = [
    { icon: Stethoscope, label: "Doctors", value: stats.doctors, color: "bg-gradient-primary" },
    { icon: Calendar, label: "Total Appointments", value: stats.appts, color: "bg-gradient-accent" },
    { icon: TrendingUp, label: "Upcoming", value: stats.upcoming, color: "bg-secondary" },
    { icon: Users, label: "Patients", value: stats.patients, color: "bg-primary" },
    { icon: Tag, label: "Specialties", value: stats.specialties, color: "bg-accent" },
    { icon: Building2, label: "Clinics", value: stats.clinics, color: "bg-gradient-primary" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Admin Overview</h1>
      <p className="text-muted-foreground mb-8">Live snapshot of clinic operations</p>

      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Card key={c.label} className="p-6 border-border bg-card hover:shadow-medium transition-all">
            <div className={`w-12 h-12 ${c.color} rounded-xl flex items-center justify-center mb-4`}>
              <c.icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="text-3xl font-bold text-card-foreground mb-1">{c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
