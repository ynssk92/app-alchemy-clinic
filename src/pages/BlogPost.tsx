import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Calendar, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
}

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle()
      .then(({ data }) => {
        setPost(data as Post | null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <PageShell title="Chargement..." description="" path={`/blog/${slug}`} heading="Chargement...">
        <p className="text-muted-foreground">Chargement de l'article...</p>
      </PageShell>
    );
  }

  if (!post) {
    return (
      <PageShell title="Article introuvable" description="" path={`/blog/${slug}`} heading="Article introuvable">
        <Link to="/blog" className="text-primary font-semibold inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Retour au blog
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`${post.title} — La Dune Clinique Dentaire`}
      description={post.excerpt || post.title}
      path={`/blog/${post.slug}`}
      eyebrow="Article"
      heading={post.title}
      subheading={post.excerpt || undefined}
    >
      <article className="max-w-3xl mx-auto">
        <Link to="/blog" className="text-primary font-semibold inline-flex items-center gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour au blog
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Calendar className="w-4 h-4" />
          {new Date(post.published_at || post.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
        </div>
        {post.cover_image_url && (
          <img src={post.cover_image_url} alt={post.title} className="w-full rounded-xl mb-8 object-cover max-h-[420px]" />
        )}
        <div className="prose prose-lg max-w-none whitespace-pre-wrap leading-relaxed text-foreground">
          {post.content}
        </div>
      </article>
    </PageShell>
  );
};

export default BlogPost;
