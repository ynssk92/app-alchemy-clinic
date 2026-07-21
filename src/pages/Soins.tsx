import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Sparkles, Smile, Shield, Stethoscope, Baby, Crown } from "lucide-react";

const services = [
  { icon: Stethoscope, title: "Soins généraux", text: "Détartrage, caries, contrôles réguliers." },
  { icon: Sparkles, title: "Esthétique dentaire", text: "Blanchiment, facettes, sourire harmonieux." },
  { icon: Crown, title: "Prothèses & Implants", text: "Solutions durables pour retrouver le confort." },
  { icon: Smile, title: "Orthodontie", text: "Alignement invisible et traditionnel." },
  { icon: Baby, title: "Dentisterie pédiatrique", text: "Soins adaptés aux plus jeunes." },
  { icon: Shield, title: "Prévention", text: "Éducation et suivi pour une bouche saine." },
];

const Soins = () => (
  <PageShell
    title="Nos Soins — La Dune Clinique Dentaire"
    description="Découvrez la gamme complète de soins dentaires proposés à La Dune Clinique Dentaire."
    path="/soins"
    eyebrow="Nos prestations"
    heading="Nos Soins"
    subheading="Une prise en charge complète pour toute la famille, de la prévention aux traitements avancés."
  >
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((s) => (
        <Card key={s.title} className="p-6 hover:shadow-strong hover:-translate-y-1 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
            <s.icon className="w-6 h-6 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">{s.title}</h3>
          <p className="text-muted-foreground">{s.text}</p>
        </Card>
      ))}
    </div>
  </PageShell>
);

export default Soins;
