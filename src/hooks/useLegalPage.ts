import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type LegalSection = { title: string; content: string };

export type LegalPageData = {
  title: string;
  subtitle: string;
  version: string;
  lastUpdated: string | null;
  sections: LegalSection[];
  readingTime: string;
};

export type LegalDefaults = Omit<LegalPageData, "lastUpdated"> & { lastUpdated?: string | null };

/** Rough reading-time estimate (≈200 words / minute). */
export const estimateReadingTime = (sections: LegalSection[]) => {
  const words = sections.reduce(
    (acc, s) => acc + `${s.title} ${s.content}`.trim().split(/\s+/).length,
    0,
  );
  return `${Math.max(1, Math.round(words / 200))} min read`;
};

/**
 * Loads legal page content from the database (admin-editable) and
 * falls back to the bundled default content when nothing is published.
 */
export const useLegalPage = (slug: string, fallback: LegalDefaults) => {
  const [data, setData] = useState<LegalPageData>({
    ...fallback,
    lastUpdated: fallback.lastUpdated ?? null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: row } = await supabase
        .from("legal_pages")
        .select("title, version, last_updated, content")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (!active) return;

      const content = (row?.content ?? null) as
        | { subtitle?: string; sections?: LegalSection[]; estimated_reading_time?: string }
        | null;
      const sections = content?.sections?.length ? content.sections : fallback.sections;

      setData({
        title: row?.title || fallback.title,
        subtitle: content?.subtitle || fallback.subtitle,
        version: row?.version || fallback.version,
        lastUpdated: row?.last_updated ?? null,
        sections,
        readingTime: content?.estimated_reading_time || estimateReadingTime(sections),
      });
      setLoading(false);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return { data, loading };
};
