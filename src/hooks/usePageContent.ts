import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SitePage {
  slug: string;
  name: string;
  seo_title: string;
  seo_description: string;
  eyebrow: string | null;
  heading: string;
  subheading: string | null;
  intro: string | null;
}

export interface PageBlock {
  id: string;
  page_slug: string;
  kind: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  icon: string | null;
  items: string[];
  sort_order: number;
  published: boolean;
}

export const usePageContent = (slug: string) => {
  const [page, setPage] = useState<SitePage | null>(null);
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: b }] = await Promise.all([
        supabase.from("site_pages").select("*").eq("slug", slug).maybeSingle(),
        supabase
          .from("page_blocks")
          .select("*")
          .eq("page_slug", slug)
          .eq("published", true)
          .order("sort_order", { ascending: true }),
      ]);
      if (!active) return;
      setPage((p as SitePage) || null);
      setBlocks((b as PageBlock[]) || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [slug]);

  return { page, blocks, loading };
};
