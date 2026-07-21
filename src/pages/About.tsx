import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Heart, Award, Users } from "lucide-react";

const About = () => (
  <PageShell
    title="À Propos — La Dune Clinique Dentaire"
    description="Découvrez l'histoire, la mission et les valeurs de La Dune Clinique Dentaire."
    path="/about"
    eyebrow="Qui sommes-nous"
    heading="À Propos de La Dune"
    subheading="Une clinique dentaire moderne dédiée à votre bien-être bucco-dentaire, alliant expertise, technologie et confort."
  >
    <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Fondée avec la vision d'offrir des soins dentaires d'excellence, La Dune Clinique Dentaire
          accueille chaque patient dans un environnement chaleureux et professionnel.
        </p>
        <p>
          Notre équipe pluridisciplinaire s'engage à fournir des traitements personnalisés, en
          utilisant les dernières avancées technologiques pour garantir précision, confort et
          résultats durables.
        </p>
      </div>
      <Card className="p-8 bg-gradient-primary text-primary-foreground">
        <h3 className="text-2xl font-bold mb-2">Notre mission</h3>
        <p className="opacity-90">
          Rendre les soins dentaires accessibles, transparents et humains — pour chaque sourire.
        </p>
      </Card>
    </div>
    <div className="grid md:grid-cols-3 gap-6">
      {[
        { icon: Heart, title: "Bienveillance", text: "Une écoute attentive à chaque étape." },
        { icon: Award, title: "Excellence", text: "Des standards cliniques rigoureux." },
        { icon: Users, title: "Proximité", text: "Un accompagnement humain et durable." },
      ].map((v) => (
        <Card key={v.title} className="p-6 hover:shadow-medium transition-shadow">
          <v.icon className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">{v.title}</h3>
          <p className="text-muted-foreground">{v.text}</p>
        </Card>
      ))}
    </div>
  </PageShell>
);

export default About;
