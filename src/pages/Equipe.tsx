import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Doctor = {
  id: string;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  experience_years: number | null;
  specialties: { name: string } | null;
};

const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Equipe = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
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
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : doctors.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Aucun praticien à afficher pour le moment.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((d) => (
            <Card key={d.id} className="p-6 text-center hover:shadow-strong transition-all">
              {d.avatar_url ? (
                <img
                  src={d.avatar_url}
                  alt={d.full_name}
                  className="w-24 h-24 mx-auto rounded-full object-cover mb-4 border border-border"
                />
              ) : (
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mb-4">
                  {initialsOf(d.full_name)}
                </div>
              )}
              <h3 className="text-lg font-bold">{d.full_name}</h3>
              <p className="text-sm text-muted-foreground">
                {d.specialties?.name || "Praticien"}
                {d.experience_years ? ` · ${d.experience_years} ans d'expérience` : ""}
              </p>
              {d.bio && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{d.bio}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default Equipe;
