import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "@/assets/logo.png";

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    rating: 4.9,
    reviews: 127,
    location: "Downtown Medical Center",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    available: true,
    experience: "15 years",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Dermatologist",
    rating: 4.8,
    reviews: 94,
    location: "City Skin Clinic",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    available: true,
    experience: "12 years",
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "General Practitioner",
    rating: 5.0,
    reviews: 203,
    location: "Community Health Hub",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    available: false,
    experience: "10 years",
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Pediatrician",
    rating: 4.7,
    reviews: 156,
    location: "Children's Care Center",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    available: true,
    experience: "18 years",
  },
  {
    id: 5,
    name: "Dr. Aisha Patel",
    specialty: "Orthopedic Surgeon",
    rating: 4.9,
    reviews: 88,
    location: "Sports Medicine Institute",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha",
    available: true,
    experience: "14 years",
  },
  {
    id: 6,
    name: "Dr. David Kim",
    specialty: "Psychiatrist",
    rating: 4.8,
    reviews: 112,
    location: "Mental Wellness Center",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    available: true,
    experience: "16 years",
  },
];

const Doctors = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="HealthBook Logo" className="h-10" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/patient-dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-hero py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center">Find Your Doctor</h1>
          <p className="text-lg text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
            Browse our network of verified healthcare professionals
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by doctor name or specialty..."
                className="pl-12 h-14 text-lg shadow-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card
                key={doctor.id}
                className="overflow-hidden hover:shadow-large transition-all cursor-pointer border-border bg-card"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-20 h-20 rounded-xl bg-muted"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-card-foreground mb-1">{doctor.name}</h3>
                      <Badge className="mb-2">{doctor.specialty}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-foreground">{doctor.rating}</span>
                        <span>({doctor.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{doctor.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{doctor.experience} experience</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {doctor.available ? (
                      <>
                        <Link to="/booking" className="flex-1">
                          <Button className="w-full">Book Appointment</Button>
                        </Link>
                        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      </>
                    ) : (
                      <Button className="w-full" variant="outline" disabled>
                        Not Available
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Doctors;
