import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id,title,slug,excerpt,cover_image_url,published_at,created_at")
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .then(({ data }) => {
        setPosts((data as Post[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <PageShell
      title="Blog — La Dune Clinique Dentaire"
      description="Conseils, actualités et guides sur la santé bucco-dentaire par La Dune Clinique Dentaire."
      path="/blog"
      eyebrow="Actualités"
      heading="Le Blog"
      subheading="Conseils d'experts, guides pratiques et actualités de la clinique."
    >
      {loading ? (
        <p className="text-center text-muted-foreground">Chargement...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-muted-foreground">Aucun article publié pour le moment.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((p) => (
            <Link key={p.id} to={`/blog/${p.slug}`}>
              <Card className="overflow-hidden hover:shadow-strong hover:-translate-y-1 transition-all cursor-pointer h-full">
                {p.cover_image_url && (
                  <img src={p.cover_image_url} alt={p.title} className="w-full h-48 object-cover" loading="lazy" />
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4" />
                    {new Date(p.published_at || p.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{p.title}</h3>
                  {p.excerpt && <p className="text-muted-foreground">{p.excerpt}</p>}
                  <span className="inline-block mt-4 text-primary font-semibold">Lire l'article →</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default Blog;
