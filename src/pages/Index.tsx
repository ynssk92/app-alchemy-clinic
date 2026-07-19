import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Shield, Sparkles, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Seo } from "@/components/Seo";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const Index = () => {
  useScrollReveal();
  return (
    <div className="min-h-screen bg-background">

      <Seo
        title="HealthBook — Book Healthcare Appointments in Seconds"
        description="Find and book appointments with verified doctors instantly. Manage your health records, get reminders, and take control of your care."
        path="/"
      />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 transition-transform duration-300 hover:scale-105">
            <img src={logo} alt="HealthBook Logo" className="h-10" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="relative text-sm font-bold text-foreground hover:text-primary transition-colors duration-300 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-gradient-primary after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left after:transition-transform after:duration-300"
            >
              Home
            </Link>
            <Link
              to="/doctors"
              className="relative text-sm font-bold text-foreground hover:text-primary transition-colors duration-300 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-gradient-primary after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left after:transition-transform after:duration-300"
            >
              Find Doctors
            </Link>
            <a
              href="#features"
              className="relative text-sm font-bold text-foreground hover:text-primary transition-colors duration-300 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-gradient-primary after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left after:transition-transform after:duration-300"
            >
              Features
            </a>
            <a
              href="#contact"
              className="relative text-sm font-bold text-foreground hover:text-primary transition-colors duration-300 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-gradient-primary after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left after:transition-transform after:duration-300"
            >
              Contact
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button className="shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Your Health, Simplified</span>
            </div>
            <h1 className="reveal text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight" style={{ transitionDelay: "80ms" }}>
              Book Healthcare Appointments in{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Seconds
              </span>
            </h1>
            <p className="reveal text-xl text-muted-foreground mb-8" style={{ transitionDelay: "160ms" }}>
              Connect with top doctors, manage appointments, and take control of your health
              journey—all in one beautiful, easy-to-use platform.
            </p>
            <div className="reveal flex flex-col sm:flex-row gap-4 justify-center" style={{ transitionDelay: "240ms" }}>
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
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need for Better Healthcare
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete healthcare booking solution designed for modern patients and doctors
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Calendar, bg: "bg-gradient-primary", title: "Easy Booking", desc: "Find and book appointments with top doctors in just a few clicks. No phone calls, no hassle." },
              { icon: Clock, bg: "bg-gradient-accent", title: "Smart Reminders", desc: "Never miss an appointment with intelligent reminders and real-time notifications." },
              { icon: Shield, bg: "bg-secondary", title: "Secure Records", desc: "Your health records are encrypted and accessible only to you and your doctors." },
              { icon: Users, bg: "bg-primary", title: "Top Doctors", desc: "Access a network of verified, experienced healthcare professionals in your area." },
              { icon: TrendingUp, bg: "bg-gradient-primary", title: "Health Insights", desc: "Track your health journey with personalized insights and recommendations." },
              { icon: Sparkles, bg: "bg-gradient-accent", title: "Gamified Experience", desc: "Earn points and achievements for maintaining healthy habits and regular checkups." },
            ].map((f, i) => (
              <Card
                key={f.title}
                className="reveal reveal-scale p-6 hover:shadow-medium hover:-translate-y-1 transition-all cursor-pointer border-border bg-card"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
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
          <h2 className="reveal text-4xl font-bold text-white mb-4">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="reveal text-xl text-white/90 mb-8 max-w-2xl mx-auto" style={{ transitionDelay: "100ms" }}>
            Join thousands of patients who have simplified their healthcare journey
          </p>
          <Link to="/auth" className="reveal inline-block" style={{ transitionDelay: "200ms" }}>
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
