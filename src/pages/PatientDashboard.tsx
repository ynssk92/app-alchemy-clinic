import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Calendar, Clock, Award, TrendingUp, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import { Seo } from "@/components/Seo";

type Appt = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  doctors: { full_name: string; specialties: { name: string } | null } | null;
};

const PatientDashboard = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [appointments, setAppointments] = useState<Appt[]>([]);
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
      .then(({ data }) => setProfileName(data?.full_name || user.email || ""));
    supabase
      .from("appointments")
      .select("id, appointment_date, appointment_time, status, doctors(full_name, specialties(name))")
      .order("appointment_date", { ascending: true })
      .then(({ data }) => setAppointments((data as any) || []));
  }, [user]);

  const upcoming = appointments.filter((a) => a.status === "upcoming").length;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Your Dashboard — HealthBook"
        description="Track your health score, upcoming appointments, and achievements in your HealthBook dashboard."
        path="/patient-dashboard"
      />
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="HealthBook Logo" className="h-10" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/doctors"><Button variant="ghost">Find Doctors</Button></Link>
            <Link to="/profile"><Button variant="ghost">Profile</Button></Link>
            {isAdmin && <Link to="/admin"><Button variant="secondary">Admin Panel</Button></Link>}
            <Button variant="outline" onClick={signOut}><LogOut className="w-4 h-4 mr-2" />Sign Out</Button>
          </div>
        </div>
      </nav>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back, {profileName}!</h1>
            <p className="text-lg text-muted-foreground">Here's your health overview</p>
          </div>

          <h2 className="sr-only">Health Overview</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary-foreground" />
                </div>
                <Badge variant="secondary">Excellent</Badge>
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-1">85%</h3>
              <p className="text-sm text-muted-foreground mb-3">Health Score</p>
              <Progress value={85} className="h-2" />
            </Card>

            <Card className="p-6 border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-accent-foreground" />
                </div>
                <Badge>Active</Badge>
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-1">{upcoming}</h3>
              <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
            </Card>

            <Card className="p-6 border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-secondary-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">7/10</span>
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-1">7</h3>
              <p className="text-sm text-muted-foreground mb-3">Achievements Unlocked</p>
              <Progress value={70} className="h-2" />
            </Card>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Your Appointments</h2>
            <Link to="/doctors">
              <Button><Calendar className="w-4 h-4 mr-2" />Book New</Button>
            </Link>
          </div>

          <div className="space-y-4">
            {appointments.length === 0 ? (
              <Card className="p-12 text-center border-border bg-card">
                <p className="text-muted-foreground mb-4">No appointments yet.</p>
                <Link to="/doctors"><Button>Find a Doctor</Button></Link>
              </Card>
            ) : (
              appointments.map((a) => (
                <Card key={a.id} className="p-6 border-border bg-card hover:shadow-medium transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-card-foreground">
                          {a.doctors?.full_name || "Doctor"}
                        </h3>
                        <Badge variant={a.status === "upcoming" ? "default" : "secondary"}>
                          {a.status}
                        </Badge>
                      </div>
                      {a.doctors?.specialties?.name && (
                        <p className="text-muted-foreground mb-3">{a.doctors.specialties.name}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{a.appointment_date}</div>
                        <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{a.appointment_time}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PatientDashboard;
