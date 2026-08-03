import { Input } from "@/components/ui/input";
import { Search, Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import { DoctorCard, type DoctorCardData } from "@/components/DoctorCard";

type Doctor = DoctorCardData & {
  rating: number | null;
  is_available: boolean;
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
    <PageShell
      title="Find Your Doctor — La Dune Clinique Dentaire"
      description="Browse verified healthcare professionals by name or specialty and book an appointment in seconds."
      path="/doctors"
      heading="Find Your Doctor"
      hideHero
    >
      <section className="relative -mx-4 overflow-hidden px-4 py-16 md:py-24 lg:py-32">
        {/* soft medical background */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-hero opacity-40" />
        <div className="pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

        <div className="mx-auto max-w-[1280px]">
          {/* header */}
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <Stethoscope className="h-3.5 w-3.5" />
              Annuaire des praticiens
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Trouvez votre{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">praticien</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Parcourez notre réseau de professionnels de santé vérifiés et réservez votre
              rendez-vous en quelques secondes.
            </p>

            <div className="relative mx-auto mt-8 max-w-xl">
              <label htmlFor="doctor-search" className="sr-only">Search doctors</label>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="doctor-search"
                type="search"
                placeholder="Rechercher par nom ou spécialité..."
                aria-label="Search by doctor name or specialty"
                className="h-14 rounded-2xl border-border bg-card pl-12 text-base shadow-soft focus-visible:ring-4 focus-visible:ring-primary/15"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[420px] animate-pulse rounded-3xl border border-border bg-muted/40" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              Aucun praticien à afficher pour le moment.
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((doctor) => (
                <div
                  key={doctor.id}
                  className={doctor.is_available ? "" : "relative opacity-60 grayscale"}
                >
                  {!doctor.is_available && (
                    <span className="absolute right-6 top-6 z-10 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      Indisponible
                    </span>
                  )}
                  <DoctorCard doctor={doctor} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
};

export default Doctors;
