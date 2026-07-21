import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";

const members = [
  { name: "Dr. Amine Bennani", role: "Chirurgien-dentiste, Fondateur", initials: "AB" },
  { name: "Dr. Salma El Fassi", role: "Orthodontiste", initials: "SE" },
  { name: "Dr. Karim Alaoui", role: "Implantologue", initials: "KA" },
  { name: "Dr. Nora Idrissi", role: "Dentisterie pédiatrique", initials: "NI" },
  { name: "Yasmine Ouali", role: "Assistante dentaire", initials: "YO" },
  { name: "Hicham Rami", role: "Coordinateur patients", initials: "HR" },
];

const Equipe = () => (
  <PageShell
    title="L'Équipe — La Dune Clinique Dentaire"
    description="Rencontrez l'équipe de La Dune Clinique Dentaire : praticiens, assistants et coordinateurs."
    path="/equipe"
    eyebrow="Notre équipe"
    heading="L'Équipe La Dune"
    subheading="Des professionnels passionnés, unis par une même exigence : votre satisfaction."
  >
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((m) => (
        <Card key={m.name} className="p-6 text-center hover:shadow-strong transition-all">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mb-4">
            {m.initials}
          </div>
          <h3 className="text-lg font-bold">{m.name}</h3>
          <p className="text-sm text-muted-foreground">{m.role}</p>
        </Card>
      ))}
    </div>
  </PageShell>
);

export default Equipe;
