import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const posts = [
  { title: "5 gestes essentiels pour une bouche saine", date: "12 Juil 2026", excerpt: "Les habitudes simples qui font la différence au quotidien." },
  { title: "Blanchiment dentaire : ce qu'il faut savoir", date: "28 Juin 2026", excerpt: "Techniques, efficacité et précautions à connaître." },
  { title: "Implants dentaires : mode d'emploi", date: "05 Juin 2026", excerpt: "Un guide complet pour comprendre le parcours implantaire." },
  { title: "Orthodontie invisible chez l'adulte", date: "18 Mai 2026", excerpt: "Aligneurs transparents : discrétion et efficacité." },
];

const Blog = () => (
  <PageShell
    title="Blog — La Dune Clinique Dentaire"
    description="Conseils, actualités et guides sur la santé bucco-dentaire par La Dune Clinique Dentaire."
    path="/blog"
    eyebrow="Actualités"
    heading="Le Blog"
    subheading="Conseils d'experts, guides pratiques et actualités de la clinique."
  >
    <div className="grid md:grid-cols-2 gap-6">
      {posts.map((p) => (
        <Card key={p.title} className="p-6 hover:shadow-strong hover:-translate-y-1 transition-all cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Calendar className="w-4 h-4" />
            {p.date}
          </div>
          <h3 className="text-xl font-bold mb-2">{p.title}</h3>
          <p className="text-muted-foreground">{p.excerpt}</p>
          <span className="inline-block mt-4 text-primary font-semibold">Lire l'article →</span>
        </Card>
      ))}
    </div>
  </PageShell>
);

export default Blog;
