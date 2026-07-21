import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Cpu, Microscope, ScanLine, Zap } from "lucide-react";

const items = [
  { icon: ScanLine, title: "Imagerie 3D", text: "Scanner cône beam pour un diagnostic précis." },
  { icon: Cpu, title: "CFAO Numérique", text: "Prothèses conçues et usinées sur place." },
  { icon: Microscope, title: "Microscopie", text: "Endodontie assistée pour un traitement minutieux." },
  { icon: Zap, title: "Laser dentaire", text: "Interventions douces et cicatrisation rapide." },
];

const Expertise = () => (
  <PageShell
    title="Expertise — La Dune Clinique Dentaire"
    description="Technologies de pointe et savoir-faire clinique au service de votre sourire."
    path="/expertise"
    eyebrow="Notre savoir-faire"
    heading="Une expertise à la pointe"
    subheading="Nous investissons dans les meilleures technologies et la formation continue pour offrir des soins d'exception."
  >
    <div className="grid md:grid-cols-2 gap-6">
      {items.map((i) => (
        <Card key={i.title} className="p-8 hover:shadow-medium transition-all">
          <i.icon className="w-12 h-12 text-primary mb-4" />
          <h3 className="text-2xl font-bold mb-2">{i.title}</h3>
          <p className="text-muted-foreground">{i.text}</p>
        </Card>
      ))}
    </div>
  </PageShell>
);

export default Expertise;
