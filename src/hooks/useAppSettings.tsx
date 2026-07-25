import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import defaultLogo from "@/assets/logo.png";

export type AppSettings = {
  logo_url: string | null;
  site_name: string;
  primary_hsl: string;
  secondary_hsl: string;
  accent_hsl: string;
  background_hsl: string;
  foreground_hsl: string;
  radius: string;
};

const DEFAULTS: AppSettings = {
  logo_url: null,
  site_name: "La Dune Clinique Dentaire",
  primary_hsl: "230 60% 34%",
  secondary_hsl: "220 70% 55%",
  accent_hsl: "210 90% 60%",
  background_hsl: "210 40% 98%",
  foreground_hsl: "222 47% 11%",
  radius: "0.75rem",
};

type Ctx = {
  settings: AppSettings;
  logoUrl: string;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AppSettingsContext = createContext<Ctx>({
  settings: DEFAULTS,
  logoUrl: defaultLogo,
  loading: true,
  refresh: async () => {},
});

async function resolveLogo(path: string | null): Promise<string> {
  if (!path) return defaultLogo;
  if (path.startsWith("http")) return path;
  const { data } = await supabase.storage.from("branding").createSignedUrl(path, 60 * 60 * 24 * 365);
  return data?.signedUrl ?? defaultLogo;
}

function applyTheme(s: AppSettings) {
  const root = document.documentElement;
  root.style.setProperty("--primary", s.primary_hsl);
  root.style.setProperty("--secondary", s.secondary_hsl);
  root.style.setProperty("--accent", s.accent_hsl);
  root.style.setProperty("--background", s.background_hsl);
  root.style.setProperty("--foreground", s.foreground_hsl);
  root.style.setProperty("--ring", s.primary_hsl);
  root.style.setProperty("--radius", s.radius);
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [logoUrl, setLogoUrl] = useState<string>(defaultLogo);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from("app_settings").select("*").maybeSingle();
    if (data) {
      const merged: AppSettings = { ...DEFAULTS, ...data };
      setSettings(merged);
      applyTheme(merged);
      setLogoUrl(await resolveLogo(merged.logo_url));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppSettingsContext.Provider value={{ settings, logoUrl, loading, refresh: load }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export const useAppSettings = () => useContext(AppSettingsContext);
