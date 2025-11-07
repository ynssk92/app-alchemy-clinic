import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Shield, Sparkles, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="HealthBook Logo" className="h-10" />
          </div>
          <div className="flex items-center gap-4">
            <Link to="/doctors">
              <Button variant="ghost">Find Doctors</Button>
            </Link>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Your Health, Simplified</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Book Healthcare Appointments in{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Seconds
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with top doctors, manage appointments, and take control of your health
              journey—all in one beautiful, easy-to-use platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/doctors">
                <Button size="lg" className="text-lg px-8 shadow-medium hover:shadow-large transition-all">
                  Find a Doctor
                  <Calendar className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need for Better Healthcare
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete healthcare booking solution designed for modern patients and doctors
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-medium transition-all cursor-pointer border-border bg-card">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">Easy Booking</h3>
              <p className="text-muted-foreground">
                Find and book appointments with top doctors in just a few clicks. No phone calls, no hassle.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-medium transition-all cursor-pointer border-border bg-card">
              <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">Smart Reminders</h3>
              <p className="text-muted-foreground">
                Never miss an appointment with intelligent reminders and real-time notifications.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-medium transition-all cursor-pointer border-border bg-card">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">Secure Records</h3>
              <p className="text-muted-foreground">
                Your health records are encrypted and accessible only to you and your doctors.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-medium transition-all cursor-pointer border-border bg-card">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">Top Doctors</h3>
              <p className="text-muted-foreground">
                Access a network of verified, experienced healthcare professionals in your area.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-medium transition-all cursor-pointer border-border bg-card">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">Health Insights</h3>
              <p className="text-muted-foreground">
                Track your health journey with personalized insights and recommendations.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-medium transition-all cursor-pointer border-border bg-card">
              <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">Gamified Experience</h3>
              <p className="text-muted-foreground">
                Earn points and achievements for maintaining healthy habits and regular checkups.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of patients who have simplified their healthcare journey
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8 shadow-large">
              Get Started Free
              <Sparkles className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <img src={logo} alt="HealthBook Logo" className="h-8" />
            </div>
            <p className="text-muted-foreground">© 2024 HealthBook. Your health, our priority.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
