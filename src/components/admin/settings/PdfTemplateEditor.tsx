import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Layout, 
  Palette, 
  Type, 
  Eye, 
  Save, 
  Undo,
  GripVertical
} from "lucide-react";
import { 
  PdfTemplateConfig, 
  getPdfTemplate, 
  savePdfTemplate, 
  DEFAULT_TEMPLATE,
  PdfSection
} from "@/utils/pdfTemplateService";
import { toast } from "sonner";

const SECTION_LABELS: Record<PdfSection, string> = {
  personal: "Personal Information",
  medical: "Medical Summary",
  allergies: "Allergies",
  medications: "Current Medications",
  notes: "Clinical Notes"
};

const PdfTemplateEditor = () => {
  const [config, setConfig] = useState<PdfTemplateConfig>(DEFAULT_TEMPLATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await getPdfTemplate();
      setConfig(data);
    } catch (error) {
      console.error("Failed to load PDF template", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePdfTemplate(config);
      toast.success("PDF Template updated successfully");
    } catch (error: any) {
      toast.error("Failed to save template: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    setConfig(DEFAULT_TEMPLATE);
    toast.info("Reset to defaults (Click save to apply)");
  };

  const toggleSection = (section: PdfSection) => {
    const isEnabled = config.enabledSections.includes(section);
    const next = isEnabled 
      ? config.enabledSections.filter(s => s !== section)
      : [...config.enabledSections, section];
    
    setConfig({ ...config, enabledSections: next });
  };

  if (loading) return <div className="p-8 text-center">Loading editor...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Configuration Column */}
      <div className="space-y-6">
        <Card className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[24px]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Branding & General
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={resetToDefault} title="Reset to default">
                  <Undo className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : <Save className="w-4 h-4 mr-2" />}
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Document Title</Label>
              <Input 
                value={config.title} 
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="Ex: Electronic Medical Record"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <Input 
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              <div className="flex items-end pb-2">
                <div className="flex items-center gap-2">
                  <Switch 
                    id="show-logo" 
                    checked={config.showLogo}
                    onCheckedChange={(v) => setConfig({ ...config, showLogo: v })}
                  />
                  <Label htmlFor="show-logo">Show Logo in Header</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Header Font Size</Label>
                <Input 
                  type="number" 
                  value={config.headerFontSize}
                  onChange={(e) => setConfig({ ...config, headerFontSize: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Body Font Size</Label>
                <Input 
                  type="number" 
                  value={config.bodyFontSize}
                  onChange={(e) => setConfig({ ...config, bodyFontSize: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[24px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="w-5 h-5 text-primary" />
              Sections Configuration
            </CardTitle>
            <CardDescription>Enable or disable EMR sections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {config.sectionsOrder.map((section) => (
              <div key={section} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                  <span className="text-sm font-medium">{SECTION_LABELS[section]}</span>
                </div>
                <Switch 
                  checked={config.enabledSections.includes(section)}
                  onCheckedChange={() => toggleSection(section)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Preview Column */}
      <div className="space-y-6">
        <div className="sticky top-6">
          <Card className="border-none shadow-2xl bg-white rounded-[16px] overflow-hidden min-h-[600px] flex flex-col">
            <div className="bg-slate-100 p-3 border-b flex items-center gap-2 justify-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <Eye className="w-3 h-3" /> Live Template Preview
            </div>
            
            <div className="p-10 flex-1 space-y-6">
              {/* PDF Mock Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="font-bold leading-tight" style={{ fontSize: `${config.headerFontSize}px`, color: config.primaryColor }}>
                    {config.title}
                  </h1>
                  <p className="text-[8px] text-slate-400 mt-1">Generated on: 8/5/2026, 5:16:00 PM</p>
                </div>
                {config.showLogo && (
                  <div className="w-24 h-12 bg-slate-200 rounded flex items-center justify-center text-[8px] font-bold text-slate-400">
                    LOGO
                  </div>
                )}
              </div>

              {/* PDF Mock Content */}
              <div className="space-y-8 mt-12" style={{ fontSize: `${config.bodyFontSize}px` }}>
                {config.sectionsOrder.filter(s => config.enabledSections.includes(s)).map((section, idx) => (
                  <div key={section} className="space-y-3">
                    <h3 className="font-bold border-b pb-1" style={{ color: config.primaryColor }}>
                      {idx + 1}. {SECTION_LABELS[section]}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-slate-500">
                      <div className="space-y-1">
                        <div className="h-2 w-full bg-slate-100 rounded" />
                        <div className="h-2 w-3/4 bg-slate-100 rounded" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-2 w-full bg-slate-100 rounded" />
                        <div className="h-2 w-1/2 bg-slate-100 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t flex items-center justify-between text-[10px] text-slate-400">
              <span>Patient Report: #PT-8B3F</span>
              <span>Page 1 of 1</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PdfTemplateEditor;
