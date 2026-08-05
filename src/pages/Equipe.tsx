import { PageShell } from "@/components/PageShell";
import { DoctorCard, type DoctorCardData } from "@/components/DoctorCard";
import { UserRound } from "lucide-react";
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
      heading="L'Équipe La Dune"
      hideHero
    >

      <section className="relative -mx-4 overflow-hidden bg-[#F8FAFC] px-4 py-[100px]">
        {/* subtle blue radial gradients */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#2563EB]/5 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-[#06B6D4]/5 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-[1400px]">
          {/* header */}
          <div className="mx-auto mb-[60px] max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2563EB]/20 bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#2563EB] shadow-sm">
              <UserRound className="h-3.5 w-3.5" />
              👨‍⚕️ OUR DOCTORS
            </span>
            <h1 className="mt-6 text-[44px] font-bold leading-[1.1] tracking-tight text-[#111827] md:text-[56px]">
              Meet Our Medical Experts
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500">
              Our experienced specialists are committed to delivering personalized, high-quality healthcare with the latest medical technologies.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[580px] animate-pulse rounded-[28px] border border-[#E5E7EB] bg-white shadow-soft" />
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              Aucun praticien à afficher pour le moment.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
