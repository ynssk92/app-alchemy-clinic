import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Globe, 
  Languages, 
  AlertCircle, 
  CheckCircle2,
  FileJson,
  Filter,
  Search, 
  RotateCcw, 
  Save
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

// Base JSON translations
import commonEn from "@/i18n/locales/en/common.json";
import commonFr from "@/i18n/locales/fr/common.json";
import commonAr from "@/i18n/locales/ar/common.json";

type TranslationKey = {
  key: string;
  baseValue: string;
  overrideValue: string | null;
  isModified: boolean;
};

const languages = [
  { code: "en", label: "English", flag: "🇺🇸", base: commonEn },
  { code: "fr", label: "Français", flag: "🇫🇷", base: commonFr },
  { code: "ar", label: "العربية", flag: "🇲🇦", base: commonAr },
];

const AdminLanguages = () => {
  const { t, i18n } = useTranslation();
  const [activeLang, setActiveLang] = useState("fr");
  const [search, setSearch] = useState("");
  const [overrides, setOverrides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "modified" | "missing">("all");

  const fetchOverrides = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("translation_overrides")
        .select("*");
      
      if (error) throw error;
      setOverrides(data || []);
    } catch (err) {
      console.error("Error fetching translations:", err);
      toast.error("Failed to load translation overrides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverrides();
  }, []);

  // Helper to flatten nested JSON objects into dot notation keys
  const flattenObject = (obj: any, prefix = "") => {
    return Object.keys(obj).reduce((acc: any, k) => {
      const pre = prefix.length ? prefix + "." : "";
      if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(acc, flattenObject(obj[k], pre + k));
      } else {
        acc[pre + k] = obj[k];
      }
      return acc;
    }, {});
  };

  const getTranslationData = (langCode: string) => {
    const lang = languages.find(l => l.code === langCode);
    if (!lang) return [];

    const flatBase = flattenObject(lang.base);
    const langOverrides = overrides.filter(o => o.lang === langCode);

    return Object.keys(flatBase).map(key => {
      const override = langOverrides.find(o => o.key === key);
      return {
        key,
        baseValue: flatBase[key],
        overrideValue: override ? override.value : null,
        isModified: !!override,
      };
    });
  };

  const handleSave = async (lang: string, key: string, value: string) => {
    setSaving(`${lang}-${key}`);
    try {
      const { error } = await supabase
        .from("translation_overrides")
        .upsert({ lang, key, value }, { onConflict: "lang,key" });

      if (error) throw error;
      
      await fetchOverrides();
      toast.success(`Translation updated for ${key}`);
      
      // Reload i18n to reflect changes (in a real app you'd reload the resource bundle)
      // For now, we'll just show the success toast
    } catch (err) {
      console.error("Error saving translation:", err);
      toast.error("Failed to save translation");
    } finally {
      setSaving(null);
    }
  };

  const handleReset = async (lang: string, key: string) => {
    try {
      const { error } = await supabase
        .from("translation_overrides")
        .delete()
        .match({ lang, key });

      if (error) throw error;
      
      await fetchOverrides();
      toast.success(`Reset ${key} to default`);
    } catch (err) {
      console.error("Error resetting translation:", err);
      toast.error("Failed to reset translation");
    }
  };

  const filteredData = getTranslationData(activeLang).filter(item => {
    const matchesSearch = 
      item.key.toLowerCase().includes(search.toLowerCase()) || 
      item.baseValue.toLowerCase().includes(search.toLowerCase()) || 
      (item.overrideValue?.toLowerCase().includes(search.toLowerCase()) ?? false);
    
    if (filter === "modified") return matchesSearch && item.isModified;
    if (filter === "missing") return matchesSearch && !item.baseValue && !item.overrideValue;
    return matchesSearch;
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Languages className="w-8 h-8" />
            Language & Translations
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your clinic's multilingual content and translation overrides.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchOverrides} disabled={loading}>
            <RotateCcw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button size="sm" className="bg-gradient-primary text-white">
            <Globe className="w-4 h-4 mr-2" />
            Active: {activeLang.toUpperCase()}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search keys or values..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Show</label>
              <div className="flex flex-col gap-1">
                {(["all", "modified", "missing"] as const).map((f) => (
                  <Button
                    key={f}
                    variant={filter === f ? "secondary" : "ghost"}
                    size="sm"
                    className="justify-start font-medium"
                    onClick={() => setFilter(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    <Badge variant="outline" className="ml-auto bg-white/50">
                      {f === "all" ? getTranslationData(activeLang).length : 
                       f === "modified" ? getTranslationData(activeLang).filter(i => i.isModified).length :
                       getTranslationData(activeLang).filter(i => !i.baseValue && !i.overrideValue).length}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-xs text-amber-600 font-medium">
                <AlertCircle className="w-3 h-3" />
                Changes are applied instantly.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-md border-slate-200 overflow-hidden">
          <Tabs value={activeLang} onValueChange={setActiveLang} className="w-full">
            <div className="px-6 pt-4 border-b bg-muted/30">
              <TabsList className="bg-white/50 p-1 border">
                {languages.map((lang) => (
                  <TabsTrigger 
                    key={lang.code} 
                    value={lang.code}
                    className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2"
                  >
                    <span>{lang.flag}</span>
                    {lang.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <CardContent className="p-0">
              <ScrollArea className="h-[650px]">
                {loading ? (
                  <div className="p-8 space-y-4">
                    {[...Array(8)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
                      <TableRow>
                        <TableHead className="w-[30%]">Key</TableHead>
                        <TableHead className="w-[35%]">Original ({activeLang})</TableHead>
                        <TableHead className="w-[35%]">Override / Current</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length > 0 ? (
                        filteredData.map((item) => (
                          <TableRow key={item.key} className="group hover:bg-slate-50 transition-colors">
                            <TableCell className="font-mono text-[11px] text-slate-500 py-4 align-top">
                              <div className="flex flex-col gap-1">
                                {item.key}
                                {item.isModified && (
                                  <Badge variant="secondary" className="w-fit text-[9px] h-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Modified</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 align-top">
                              <p className="text-sm text-slate-600 italic">
                                {item.baseValue || <span className="text-slate-300">No base value</span>}
                              </p>
                            </TableCell>
                            <TableCell className="py-4 align-top">
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <Input
                                    defaultValue={item.overrideValue || item.baseValue}
                                    placeholder="Enter translation..."
                                    className={cn(
                                      "text-sm",
                                      item.isModified ? "border-emerald-200 focus-visible:ring-emerald-500" : "border-slate-200"
                                    )}
                                    onBlur={(e) => {
                                      const val = e.target.value;
                                      if (val !== (item.overrideValue || item.baseValue)) {
                                        handleSave(activeLang, item.key, val);
                                      }
                                    }}
                                  />
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {item.isModified && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 text-[11px] text-slate-500 hover:text-amber-600"
                                      onClick={() => handleReset(activeLang, item.key)}
                                    >
                                      <RotateCcw className="w-3 h-3 mr-1" />
                                      Reset to Default
                                    </Button>
                                  )}
                                  {saving === `${activeLang}-${item.key}` && (
                                    <span className="text-[11px] text-primary animate-pulse flex items-center gap-1">
                                      <Save className="w-3 h-3" />
                                      Saving...
                                    </span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="h-64 text-center">
                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                              <FileJson className="w-12 h-12 opacity-20" />
                              <p>No translations found matching your search.</p>
                              <Button variant="outline" size="sm" onClick={() => {setSearch(""); setFilter("all");}}>
                                Clear Filters
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AdminLanguages;
