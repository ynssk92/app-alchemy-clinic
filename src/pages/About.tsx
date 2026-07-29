import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageContent } from "@/hooks/usePageContent";
import { resolveIcon } from "@/lib/pageContent";

const About = () => {
  const { page, blocks, loading } = usePageContent("about");
  const mission = blocks.find((b) => b.kind === "mission");
  const values = blocks.filter((b) => b.kind === "value");
  const paragraphs = (page?.intro || "").split(/\n{2,}/).filter(Boolean);

  return (
    <PageShell
      title={page?.seo_title || "À Propos — La Dune Clinique Dentaire"}
      description={page?.seo_description || "Découvrez l'histoire, la mission et les valeurs de La Dune Clinique Dentaire."}
      path="/about"
      eyebrow={page?.eyebrow || undefined}
      heading={page?.heading || "À Propos"}
      subheading={page?.subheading || undefined}
    >
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            {mission && (
              <Card className="p-8 bg-gradient-primary text-primary-foreground">
                <h2 className="text-2xl font-bold mb-2">{mission.title}</h2>
                <p className="opacity-90 whitespace-pre-line">{mission.body}</p>
              </Card>
            )}
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v) => {
              const Icon = resolveIcon(v.icon);
              return (
                <Card key={v.id} className="p-6 hover:shadow-medium transition-shadow">
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">{v.title}</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{v.body}</p>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </PageShell>
  );
};

export default About;
