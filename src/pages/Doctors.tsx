import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Seo } from "@/components/Seo";
import { SiteHeader } from "@/components/SiteHeader";

type Doctor = {
  id: string;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  experience_years: number | null;
  rating: number | null;
  is_available: boolean;
  specialties: { name: string } | null;
  clinics: { name: string } | null;
};

const Doctors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("doctors")
      .select("id, full_name, bio, avatar_url, experience_years, rating, is_available, specialties(name), clinics(name)")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setDoctors((data as any) || []);
        setLoading(false);
      });
  }, []);

  const filtered = doctors.filter(
    (d) =>
      d.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialties?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Find Doctors — HealthBook"
        description="Browse verified healthcare professionals by name or specialty and book an appointment in seconds."
        path="/doctors"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Doctor Directory",
          url: "https://app-alchemy-clinic.lovable.app/doctors",
        }}
      />
      <SiteHeader />

      <section className="bg-gradient-hero py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center">Find Your Doctor</h1>
          <p className="text-lg text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
            Browse our network of verified healthcare professionals
          </p>
          <div className="max-w-2xl mx-auto relative">
            <label htmlFor="doctor-search" className="sr-only">Search doctors</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
            <Input id="doctor-search" type="search" placeholder="Search by doctor name or specialty..."
              aria-label="Search by doctor name or specialty"
              className="pl-12 h-14 text-lg shadow-medium"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="sr-only">Available Doctors</h2>
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading doctors...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No doctors found.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((doctor) => (
                <Card key={doctor.id} className="overflow-hidden hover:shadow-large transition-all border-border bg-card">
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <img src={doctor.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.id}`}
                        alt={doctor.full_name} className="w-20 h-20 rounded-xl bg-muted" />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-card-foreground mb-1">{doctor.full_name}</h3>
                        {doctor.specialties?.name && <Badge className="mb-2">{doctor.specialties.name}</Badge>}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-foreground">{doctor.rating ?? 5}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {doctor.clinics?.name && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" /><span>{doctor.clinics.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" /><span>{doctor.experience_years ?? 0} years experience</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doctor.is_available ? (
                        <>
                          <Link to={`/booking?doctor=${doctor.id}`} className="flex-1">
                            <Button className="w-full">Book Appointment</Button>
                          </Link>
                          <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        </>
                      ) : (
                        <Button className="w-full" variant="outline" disabled>Not Available</Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Doctors;
