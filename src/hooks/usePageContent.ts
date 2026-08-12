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
  hero_config?: any;
  footer_config?: any;
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
  status?: "draft" | "published";
  published_at?: string;
}

export const usePageContent = (slug: string, preview = false) => {
  const [page, setPage] = useState<SitePage | null>(null);
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      
      let blocksQuery = supabase
        .from("page_blocks")
        .select("*")
        .eq("page_slug", slug)
        .order("sort_order", { ascending: true });

      if (!preview) {
        blocksQuery = blocksQuery.eq("published", true).eq("status", "published");
      }

      const [{ data: p }, { data: b }] = await Promise.all([
        supabase.from("site_pages").select("*").eq("slug", slug).maybeSingle(),
        blocksQuery,
      ]);

      if (!active) return;
      setPage((p as SitePage) || null);
      setBlocks((b as PageBlock[]) || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [slug, preview]);

  return { page, blocks, loading };
};
