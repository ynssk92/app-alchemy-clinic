import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogSkeleton, BlogEmpty } from "@/components/blog/BlogStates";
import { motion } from "framer-motion";

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
      description="Expert advice, practical guides, and the latest news from La Dune Clinique Dentaire."
      path="/blog"
      hideHero
    >
      {/* Editorial Header */}
      <section className="mb-12 py-12 px-8 bg-slate-50/50 rounded-[32px] border border-blue-50/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-secondary mb-4"
          >
            NEWS & INSIGHTS
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight"
          >
            The Blog
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 leading-relaxed"
          >
            Expert advice, practical guides, and the latest news from La Dune Clinique Dentaire.
          </motion.p>
        </div>
      </section>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <BlogSkeleton />
        ) : posts.length === 0 ? (
          <BlogEmpty />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA or Spacing */}
      <div className="mt-24 text-center">
        <p className="text-slate-400 text-sm">
          Vous cherchez un sujet spécifique ? <a href="#contact" className="text-primary font-medium hover:underline">Contactez-nous</a>
        </p>
      </div>
    </PageShell>
  );
};

export default Blog;
