import { useEffect, useState } from "react";
import { useAppSettings, AppSettings } from "@/hooks/useAppSettings";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Upload, Palette, Save, RotateCcw } from "lucide-react";

const PRESETS = [
  { name: "Royal Blue", primary: "230 60% 34%", secondary: "220 70% 55%", accent: "210 90% 60%" },
  { name: "Emerald", primary: "158 64% 30%", secondary: "158 55% 45%", accent: "150 80% 55%" },
  { name: "Sunset", primary: "14 85% 48%", secondary: "22 90% 58%", accent: "40 95% 60%" },
  { name: "Violet", primary: "265 65% 45%", secondary: "275 65% 60%", accent: "290 85% 65%" },
  { name: "Slate", primary: "215 25% 27%", secondary: "215 20% 40%", accent: "200 80% 55%" },
];

function hslToHex(hsl: string): string {
  const [h, sStr, lStr] = hsl.split(" ");
  const s = parseFloat(sStr) / 100;
  const l = parseFloat(lStr) / 100;
  const hh = parseFloat(h);
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (hh < 60) [r, g, b] = [c, x, 0];
  else if (hh < 120) [r, g, b] = [x, c, 0];
  else if (hh < 180) [r, g, b] = [0, c, x];
  else if (hh < 240) [r, g, b] = [0, x, c];
  else if (hh < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hslToHex(value)}
          onChange={(e) => onChange(hexToHsl(e.target.value))}
          className="h-10 w-14 rounded-md border border-border bg-transparent cursor-pointer"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="H S% L%" className="font-mono text-xs" />
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const { settings, logoUrl, mobileLogoUrl, faviconUrl, refresh } = useAppSettings();
  const { isAdmin } = usePermissions();
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => { setDraft(settings); }, [settings]);

  const update = (patch: Partial<AppSettings>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    const root = document.documentElement;
    if (patch.primary_hsl) { root.style.setProperty("--primary", patch.primary_hsl); root.style.setProperty("--ring", patch.primary_hsl); }
    if (patch.secondary_hsl) root.style.setProperty("--secondary", patch.secondary_hsl);
    if (patch.accent_hsl) root.style.setProperty("--accent", patch.accent_hsl);
    if (patch.background_hsl) root.style.setProperty("--background", patch.background_hsl);
    if (patch.foreground_hsl) root.style.setProperty("--foreground", patch.foreground_hsl);
    if (patch.radius) root.style.setProperty("--radius", patch.radius);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("app_settings").update({
      site_name: draft.site_name,
      logo_url: draft.logo_url,
      mobile_logo_url: draft.mobile_logo_url,
      favicon_url: draft.favicon_url,
      primary_hsl: draft.primary_hsl,
      secondary_hsl: draft.secondary_hsl,
      accent_hsl: draft.accent_hsl,
      background_hsl: draft.background_hsl,
      foreground_hsl: draft.foreground_hsl,
      radius: draft.radius,
      contact_phone: draft.contact_phone,
      contact_phone_secondary: draft.contact_phone_secondary,
      contact_email: draft.contact_email,
      contact_address: draft.contact_address,
      map_url: draft.map_url,
      emergency_phone: draft.emergency_phone,
      hours_weekdays: draft.hours_weekdays,
      hours_saturday: draft.hours_saturday,
      hours_sunday: draft.hours_sunday,
    }).eq("id", true);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Settings saved");
    await refresh();
  };

  const uploadAsset = async (file: File, prefix: string, field: "logo_url" | "mobile_logo_url" | "favicon_url") => {
    setUploadingKey(field);
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${prefix}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("branding").upload(path, file, { upsert: true, contentType: file.type });
    setUploadingKey(null);
    if (error) { toast.error(error.message); return; }
    update({ [field]: path } as Partial<AppSettings>);
    toast.success("Uploaded — click Save to apply");
  };


  const resetDefaults = () => {
    update({
      primary_hsl: "230 60% 34%",
      secondary_hsl: "220 70% 55%",
      accent_hsl: "210 90% 60%",
      background_hsl: "210 40% 98%",
      foreground_hsl: "222 47% 11%",
      radius: "0.75rem",
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage branding, theme colors, and UI appearance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetDefaults}><RotateCcw className="w-4 h-4 mr-2" />Reset</Button>
          <Button onClick={save} disabled={saving} className="bg-gradient-primary text-primary-foreground">
            <Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="branding">
        <TabsList>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="ui">UI</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Coordonnées</CardTitle>
              <CardDescription>Phone, email and address shown on the public website.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([
                ["contact_phone", "Téléphone"],
                ["contact_phone_secondary", "Téléphone secondaire"],
                ["emergency_phone", "Urgences"],
                ["contact_email", "Email"],
                ["contact_address", "Adresse"],
                ["map_url", "Lien Google Maps"],
              ] as const).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    value={draft[key] ?? ""}
                    onChange={(e) => update({ [key]: e.target.value } as Partial<AppSettings>)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Horaires d'ouverture</CardTitle>
              <CardDescription>Free text, e.g. “9:00 - 19:00” or “Fermé”.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {([
                ["hours_weekdays", "Lundi - Vendredi"],
                ["hours_saturday", "Samedi"],
                ["hours_sunday", "Dimanche"],
              ] as const).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    value={draft[key] ?? ""}
                    onChange={(e) => update({ [key]: e.target.value } as Partial<AppSettings>)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="branding" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Logos & Favicon</CardTitle>
              <CardDescription>PNG or SVG with transparent background recommended. Favicon should be square (32–512px).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: "logo_url" as const, label: "Desktop logo", prefix: "logo", preview: logoUrl, current: draft.logo_url, bg: "bg-muted/40", box: "h-20 w-40" },
                { key: "mobile_logo_url" as const, label: "Mobile logo", prefix: "mobile-logo", preview: mobileLogoUrl, current: draft.mobile_logo_url, bg: "bg-muted/40", box: "h-20 w-20" },
                { key: "favicon_url" as const, label: "Favicon (browser tab)", prefix: "favicon", preview: faviconUrl ?? logoUrl, current: draft.favicon_url, bg: "bg-background border", box: "h-12 w-12" },
              ].map((row) => (
                <div key={row.key} className="flex items-center gap-6 flex-wrap">
                  <div className="min-w-[140px]">
                    <Label>{row.label}</Label>
                  </div>
                  <div className={`${row.box} rounded-lg border border-border ${row.bg} flex items-center justify-center overflow-hidden shrink-0`}>
                    <img src={row.preview} alt={`${row.label} preview`} className="max-h-full max-w-full object-contain" />
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept={row.key === "favicon_url" ? "image/png,image/x-icon,image/svg+xml,image/vnd.microsoft.icon" : "image/*"}
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAsset(f, row.prefix, row.key); }}
                    />
                    <Button asChild variant="outline" disabled={uploadingKey === row.key}>
                      <span><Upload className="w-4 h-4 mr-2" />{uploadingKey === row.key ? "Uploading…" : "Upload"}</span>
                    </Button>
                  </label>
                  {row.current && (
                    <Button variant="ghost" onClick={() => update({ [row.key]: null } as Partial<AppSettings>)}>Remove</Button>
                  )}
                </div>
              ))}
              <div className="space-y-2 pt-2 border-t border-border">
                <Label>Site name</Label>
                <Input value={draft.site_name} onChange={(e) => update({ site_name: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="theme" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" />Color palette</CardTitle>
              <CardDescription>Changes preview live. Click Save to apply for everyone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-2 block">Presets</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => update({ primary_hsl: p.primary, secondary_hsl: p.secondary, accent_hsl: p.accent })}
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-muted transition"
                    >
                      <span className="h-4 w-4 rounded-full" style={{ background: `hsl(${p.primary})` }} />
                      <span className="text-sm">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorField label="Primary" value={draft.primary_hsl} onChange={(v) => update({ primary_hsl: v })} />
                <ColorField label="Secondary" value={draft.secondary_hsl} onChange={(v) => update({ secondary_hsl: v })} />
                <ColorField label="Accent" value={draft.accent_hsl} onChange={(v) => update({ accent_hsl: v })} />
                <ColorField label="Background" value={draft.background_hsl} onChange={(v) => update({ background_hsl: v })} />
                <ColorField label="Foreground (text)" value={draft.foreground_hsl} onChange={(v) => update({ foreground_hsl: v })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ui" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Interface</CardTitle>
              <CardDescription>Adjust corner rounding across the app.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Border radius ({draft.radius})</Label>
                <input
                  type="range"
                  min={0}
                  max={1.5}
                  step={0.05}
                  value={parseFloat(draft.radius)}
                  onChange={(e) => update({ radius: `${e.target.value}rem` })}
                  className="w-full"
                />
                <div className="flex gap-2 pt-2">
                  <div className="h-10 w-24 bg-primary" style={{ borderRadius: draft.radius }} />
                  <div className="h-10 w-24 bg-secondary" style={{ borderRadius: draft.radius }} />
                  <div className="h-10 w-24 bg-accent" style={{ borderRadius: draft.radius }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
