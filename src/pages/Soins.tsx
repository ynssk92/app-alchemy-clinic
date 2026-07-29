import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";
import { resolveImage } from "@/lib/pageContent";

const Soins = () => {
  const { page, blocks, loading } = usePageContent("soins");
  const categories = blocks.filter((b) => b.kind === "category");
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!active && categories.length) setActive(categories[0].id);
  }, [categories, active]);

  const current = categories.find((c) => c.id === active) || categories[0];

  return (
    <PageShell
      title={page?.seo_title || "Nos Soins — La Dune Clinique Dentaire"}
      description={page?.seo_description || "Découvrez la gamme complète de soins dentaires proposés à La Dune Clinique Dentaire."}
      path="/soins"
      eyebrow={page?.eyebrow || undefined}
      heading={page?.heading || "Nos Soins"}
      subheading={page?.subheading || undefined}
    >
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-10 w-full max-w-xl mx-auto" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : !current ? (
        <p className="text-center text-muted-foreground">Aucun soin publié pour le moment.</p>
      ) : (
        <>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={current.id === cat.id ? "default" : "outline"}
                onClick={() => setActive(cat.id)}
                className="font-semibold"
              >
                {cat.title}
              </Button>
            ))}
          </div>

          <Card className="p-6 md:p-10 shadow-medium">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {resolveImage(current.image_url) && (
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={resolveImage(current.image_url)}
                    alt={current.subtitle || current.title || "Soin dentaire"}
                    width={1024}
                    height={1024}
                    loading="lazy"
                    className="w-full h-full object-cover aspect-square transition-transform duration-500 hover:scale-105"
                  />
                </div>
              )}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{current.subtitle || current.title}</h2>
                <p className="text-muted-foreground text-lg mb-6 whitespace-pre-line">{current.body}</p>
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
        </>
      )}
    </PageShell>
  );
};

export default Soins;
