import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import defaultLogo from "@/assets/logo.png";

export type AppSettings = {
  logo_url: string | null;
  mobile_logo_url: string | null;
  favicon_url: string | null;
  site_name: string;
  primary_hsl: string;
  secondary_hsl: string;
  accent_hsl: string;
  background_hsl: string;
  foreground_hsl: string;
  radius: string;
  contact_phone: string;
  contact_phone_secondary: string;
  contact_email: string;
  contact_address: string;
  map_url: string;
  emergency_phone: string;
  hours_weekdays: string;
  hours_saturday: string;
  hours_sunday: string;
};

const DEFAULTS: AppSettings = {
  logo_url: null,
  mobile_logo_url: null,
  favicon_url: null,
  site_name: "La Dune Clinique Dentaire",
  primary_hsl: "230 60% 34%",
  secondary_hsl: "220 70% 55%",
  accent_hsl: "210 90% 60%",
  background_hsl: "210 40% 98%",
  foreground_hsl: "222 47% 11%",
  radius: "0.75rem",
  contact_phone: "+212 5 28 00 00 00",
  contact_phone_secondary: "",
  contact_email: "contact@ladune.ma",
  contact_address: "Agadir, Maroc",
  map_url: "",
  emergency_phone: "",
  hours_weekdays: "9:00 - 19:00",
  hours_saturday: "9:00 - 13:00",
  hours_sunday: "Fermé",
};


type Ctx = {
  settings: AppSettings;
  logoUrl: string;
  mobileLogoUrl: string;
  faviconUrl: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AppSettingsContext = createContext<Ctx>({
  settings: DEFAULTS,
  logoUrl: defaultLogo,
  mobileLogoUrl: defaultLogo,
  faviconUrl: null,
  loading: true,
  refresh: async () => {},
});

async function resolveAsset(path: string | null, fallback: string | null = null): Promise<string | null> {
  if (!path) return fallback;
  if (path.startsWith("http")) return path;
  const { data } = await supabase.storage.from("branding").createSignedUrl(path, 60 * 60 * 24 * 365);
  return data?.signedUrl ?? fallback;
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

function applyFavicon(url: string | null) {
  if (!url) return;
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = url;
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [logoUrl, setLogoUrl] = useState<string>(defaultLogo);
  const [mobileLogoUrl, setMobileLogoUrl] = useState<string>(defaultLogo);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from("app_settings").select("*").maybeSingle();
    if (data) {
      // Keep asset fields nullable, but never let NULL text columns wipe defaults.
      const clean = Object.fromEntries(
        Object.entries(data).filter(
          ([k, v]) =>
            v !== null ||
            k === "logo_url" ||
            k === "mobile_logo_url" ||
            k === "favicon_url",
        ),
      );
      const merged: AppSettings = { ...DEFAULTS, ...(clean as Partial<AppSettings>) };
      setSettings(merged);
      applyTheme(merged);
      const desktop = (await resolveAsset(merged.logo_url, defaultLogo))!;
      setLogoUrl(desktop);
      setMobileLogoUrl((await resolveAsset(merged.mobile_logo_url, desktop))!);
      const fav = await resolveAsset(merged.favicon_url);
      setFaviconUrl(fav);
      applyFavicon(fav);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppSettingsContext.Provider value={{ settings, logoUrl, mobileLogoUrl, faviconUrl, loading, refresh: load }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export const useAppSettings = () => useContext(AppSettingsContext);
