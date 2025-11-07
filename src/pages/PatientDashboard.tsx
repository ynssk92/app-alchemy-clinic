import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Calendar, Clock, Award, TrendingUp, FileText, User } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const PatientDashboard = () => {
  const appointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      date: "May 15, 2024",
      time: "10:00 AM",
      status: "upcoming",
    },
    {
      id: 2,
      doctor: "Dr. Michael Chen",
      specialty: "Dermatologist",
      date: "May 20, 2024",
      time: "2:30 PM",
      status: "upcoming",
    },
    {
      id: 3,
      doctor: "Dr. Emily Rodriguez",
      specialty: "General Practitioner",
      date: "April 28, 2024",
      time: "11:00 AM",
      status: "completed",
    },
  ];

  const healthScore = 85;
  const achievementProgress = 7;
  const totalAchievements = 10;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="HealthBook Logo" className="h-10" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/doctors">
              <Button variant="ghost">Find Doctors</Button>
            </Link>
            <Button variant="outline">
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </nav>

      {/* Dashboard */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back, Alex!</h1>
            <p className="text-lg text-muted-foreground">
              Here's your health overview for today
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary">Excellent</Badge>
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-1">
                {healthScore}%
              </h3>
              <p className="text-sm text-muted-foreground mb-3">Health Score</p>
              <Progress value={healthScore} className="h-2" />
            </Card>

            <Card className="p-6 border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <Badge>Active</Badge>
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-1">2</h3>
              <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
            </Card>

            <Card className="p-6 border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {achievementProgress}/{totalAchievements}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-1">
                {achievementProgress}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">Achievements Unlocked</p>
              <Progress
                value={(achievementProgress / totalAchievements) * 100}
                className="h-2"
              />
            </Card>
          </div>

          {/* Appointments */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Your Appointments</h2>
                <Link to="/booking">
                  <Button>
                    <Calendar className="w-4 h-4 mr-2" />
                    Book New
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <Card
                    key={appointment.id}
                    className="p-6 border-border bg-card hover:shadow-medium transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-card-foreground">
                            {appointment.doctor}
                          </h3>
                          <Badge
                            variant={
                              appointment.status === "upcoming" ? "default" : "secondary"
                            }
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{appointment.specialty}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{appointment.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                      </div>
                      {appointment.status === "upcoming" && (
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Card className="p-4 border-border bg-card hover:shadow-medium transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-card-foreground">View Records</h4>
                      <p className="text-sm text-muted-foreground">Access health history</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-border bg-card hover:shadow-medium transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium text-card-foreground">Achievements</h4>
                      <p className="text-sm text-muted-foreground">View your progress</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-border bg-card hover:shadow-medium transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-card-foreground">Health Insights</h4>
                      <p className="text-sm text-muted-foreground">Personalized tips</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Gamification Card */}
              <Card className="p-6 mt-6 bg-gradient-primary border-0">
                <div className="text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-bold">Level 7 Health Champion</span>
                  </div>
                  <p className="text-sm text-white/90 mb-4">
                    Complete 3 more checkups to reach Level 8 and unlock exclusive rewards!
                  </p>
                  <Progress value={70} className="h-2 bg-white/20" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PatientDashboard;
