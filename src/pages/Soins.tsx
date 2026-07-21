import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import esthetique from "@/assets/soin-esthetique.jpg";
import implant from "@/assets/soin-implant.jpg";
import ortho from "@/assets/soin-ortho.jpg";
import visage from "@/assets/soin-visage.jpg";
import diagnostic from "@/assets/soin-diagnostic.jpg";

const categories = [
  {
    id: "esthetique",
    label: "Esthétique du Sourire",
    title: "Esthétique du Sourire",
    description:
      "Révélez votre meilleur sourire grâce à nos techniques avancées de dentisterie cosmétique.",
    image: esthetique,
    items: [
      "Blanchiment Dentaire",
      "Facettes (Chirurgie Esthétique)",
      "Prothèses (Couronnes & Bridges)",
    ],
  },
  {
    id: "implantologie",
    label: "Implantologie",
    title: "Implantologie",
    description:
      "Retrouvez le confort et la fonctionnalité d'une dentition complète avec des implants sur mesure.",
    image: implant,
    items: [
      "Implants dentaires unitaires",
      "All-on-4 / All-on-6",
      "Greffe osseuse et sinus lift",
    ],
  },
  {
    id: "orthodontie",
    label: "Orthodontie",
    title: "Orthodontie",
    description:
      "Alignez votre sourire discrètement avec nos solutions invisibles ou traditionnelles.",
    image: ortho,
    items: [
      "Aligneurs transparents (Invisalign)",
      "Bagues métalliques et céramiques",
      "Orthodontie enfant & adulte",
    ],
  },
  {
    id: "visage",
    label: "Esthétique du Visage",
    title: "Esthétique du Visage",
    description:
      "Sublimez votre visage avec des soins esthétiques complémentaires à votre sourire.",
    image: visage,
    items: [
      "Injections d'acide hyaluronique",
      "Toxine botulique",
      "Harmonisation faciale",
    ],
  },
  {
    id: "diagnostic",
    label: "Diagnostic & Soins",
    title: "Diagnostic & Soins",
    description:
      "Une prise en charge complète, de la prévention aux traitements conservateurs.",
    image: diagnostic,
    items: [
      "Bilan et radiographie 3D",
      "Détartrage et prophylaxie",
      "Traitement des caries et endodontie",
    ],
  },
];

const Soins = () => {
  const [active, setActive] = useState(categories[0].id);
  const current = categories.find((c) => c.id === active)!;

  return (
    <PageShell
      title="Nos Soins — La Dune Clinique Dentaire"
      description="Découvrez la gamme complète de soins dentaires proposés à La Dune Clinique Dentaire : esthétique, implantologie, orthodontie et plus."
      path="/soins"
      eyebrow="Nos prestations"
      heading="Une Expertise Complète"
      subheading="Tous vos soins, de l'esthétique à la chirurgie, au même endroit."
    >
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={active === cat.id ? "default" : "outline"}
            onClick={() => setActive(cat.id)}
            className="font-semibold"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <Card className="p-6 md:p-10 shadow-medium">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="overflow-hidden rounded-xl">
            <img
              src={current.image}
              alt={current.title}
              width={1024}
              height={1024}
              loading="lazy"
              className="w-full h-full object-cover aspect-square transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{current.title}</h2>
            <p className="text-muted-foreground text-lg mb-6">{current.description}</p>
            <ul className="space-y-3">
              {current.items.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </PageShell>
  );
};

export default Soins;
