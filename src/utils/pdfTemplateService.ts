import { supabase } from "@/integrations/supabase/client";

export type PdfSection = "personal" | "medical" | "allergies" | "medications" | "notes";

export interface PdfTemplateConfig {
  title: string;
  primaryColor: string; // hex
  headerFontSize: number;
  bodyFontSize: number;
  showLogo: boolean;
  enabledSections: PdfSection[];
  sectionsOrder: PdfSection[];
}

export const DEFAULT_TEMPLATE: PdfTemplateConfig = {
  title: "Electronic Medical Record",
  primaryColor: "#203080",
  headerFontSize: 22,
  bodyFontSize: 10,
  showLogo: true,
  enabledSections: ["personal", "medical", "allergies", "medications", "notes"],
  sectionsOrder: ["personal", "medical", "allergies", "medications", "notes"],
};

export const getPdfTemplate = async (): Promise<PdfTemplateConfig> => {
  const { data, error } = await supabase
    .from("app_settings")
    .select("meta")
    .eq("id", true)
    .single();

  if (error || !data?.meta || !(data.meta as any).pdf_template) {
    return DEFAULT_TEMPLATE;
  }

  return (data.meta as any).pdf_template as PdfTemplateConfig;
};

export const savePdfTemplate = async (config: PdfTemplateConfig) => {
  // First get current meta to preserve other fields
  const { data } = await supabase
    .from("app_settings")
    .select("meta")
    .eq("id", true)
    .single();

  const currentMeta = (data?.meta as any) || {};
  
  const { error } = await supabase
    .from("app_settings")
    .update({
      meta: {
        ...currentMeta,
        pdf_template: config
      }
    })
    .eq("id", true);

  if (error) throw error;
};
