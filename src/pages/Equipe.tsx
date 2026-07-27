import { PageShell } from "@/components/PageShell";
import { DoctorCard, type DoctorCardData } from "@/components/DoctorCard";
import { Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Equipe = () => {
  const [doctors, setDoctors] = useState<DoctorCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("doctors")
        .select("id, full_name, bio, avatar_url, experience_years, specialties(name)")
        .eq("is_available", true)
        .order("full_name", { ascending: true });
      setDoctors((data as any) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <PageShell
      title="L'Équipe — La Dune Clinique Dentaire"
      description="Rencontrez l'équipe de La Dune Clinique Dentaire : praticiens, assistants et coordinateurs."
      path="/equipe"
      eyebrow="Notre équipe"
      heading="L'Équipe La Dune"
      subheading="Des professionnels passionnés, unis par une même exigence : votre satisfaction."
    >
      <section className="relative -mx-4 overflow-hidden px-4 py-16 md:py-24 lg:py-30">
        {/* soft medical background */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-hero opacity-40" />
        <div className="pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

        <div className="mx-auto max-w-[1280px]">
          {/* header */}
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <Stethoscope className="h-3.5 w-3.5" />
              Nos experts médicaux
            </span>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Rencontrez nos{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">spécialistes</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Une équipe pluridisciplinaire de praticiens diplômés, formés aux dernières technologies
              dentaires, qui vous accompagne avec précision, écoute et bienveillance.
            </p>
          </div>

          {loading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[420px] animate-pulse rounded-3xl border border-border bg-muted/40" />
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              Aucun praticien à afficher pour le moment.
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((d) => (
                <DoctorCard key={d.id} doctor={d} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
};

export default Equipe;
