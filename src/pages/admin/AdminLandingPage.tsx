import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  Save, 
  Eye, 
  Video, 
  Image as ImageIcon, 
  Layout, 
  Settings,
  ArrowRight,
  ExternalLink,
  Pencil
} from "lucide-react";
import { Link } from "react-router-dom";
import type { SitePage } from "@/hooks/usePageContent";

interface HeroConfig {
  badge: string;
  heading: string;
  highlight: string;
  description: string;
  primaryCTA: string;
  primaryURL: string;
  secondaryCTA: string;
  secondaryURL: string;
  floatingTitle: string;
  floatingSubtitle: string;
  overlayOpacity: number;
  videoUrl?: string;
  imageUrl?: string;
  testimonialStyle: 'grid' | 'carousel';
  testimonialLimit: number;
  // Section Headers
  servicesLabel?: string;
  servicesHeading?: string;
  teamLabel?: string;
  teamHeading?: string;
  teamDescription?: string;
  blogLabel?: string;
  blogHeading?: string;
}

const AdminLandingPage = () => {
  const [page, setPage] = useState<SitePage & { hero_config?: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");

  const loadPage = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_pages")
      .select("*")
      .eq("slug", "home")
      .maybeSingle();

    if (error) {
      toast({ 
        title: "Error loading page", 
        description: error.message, 
        variant: "destructive" 
      });
    } else {
      setPage(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPage();
  }, []);

  const handleHeroChange = (field: keyof HeroConfig, value: any) => {
    if (!page) return;
    const currentHero = (page.hero_config as HeroConfig) || {};
    setPage({
      ...page,
      hero_config: {
        ...currentHero,
        [field]: value,
      },
    });
  };

  const handleGlobalConfigChange = (field: string, value: any) => {
    if (!page) return;
    setPage({
      ...page,
      hero_config: {
        ...(page.hero_config || {}),
        [field]: value,
      },
    });
  };

  const saveContent = async () => {
    if (!page) return;
    setSaving(true);
    const { error } = await supabase
      .from("site_pages")
      .update({
        hero_config: page.hero_config,
        seo_title: page.seo_title,
        seo_description: page.seo_description,
      })
      .eq("slug", "home");

    setSaving(false);
    if (error) {
      toast({ 
        title: "Save failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } else {
      toast({ title: "Landing page updated successfully" });
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading landing page configuration...</div>;
  }

  const hero = (page?.hero_config as HeroConfig) || {} as HeroConfig;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Landing Page CMS</h1>
          <p className="text-muted-foreground text-sm">
            Manage the content and appearance of your public landing page.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/?preview=true" target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Preview Site
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/" target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              Live Site
            </a>
          </Button>
          <Button onClick={saveContent} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-[750px]">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="seo">SEO & Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="mt-6 space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                Hero Content
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hero-badge">Badge Text</Label>
                  <Input 
                    id="hero-badge" 
                    value={(hero as any).badge || ""} 
                    onChange={(e) => handleHeroChange("badge", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hero-heading">Main Heading</Label>
                  <Input 
                    id="hero-heading" 
                    value={(hero as any).heading || ""} 
                    onChange={(e) => handleHeroChange("heading", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero-highlight">Highlight Text</Label>
                  <Input 
                    id="hero-highlight" 
                    value={(hero as any).highlight || ""} 
                    onChange={(e) => handleHeroChange("highlight", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero-desc">Description</Label>
                  <Textarea 
                    id="hero-desc" 
                    rows={3}
                    value={(hero as any).description || ""} 
                    onChange={(e) => handleHeroChange("description", e.target.value)}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Background Media
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hero-video">Background Video URL</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="hero-video" 
                      placeholder="https://..."
                      value={(hero as any).videoUrl || ""} 
                      onChange={(e) => handleHeroChange("videoUrl", e.target.value)}
                    />
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Direct MP4 link for the cinematic background video.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <Label>Overlay Opacity</Label>
                    <span className="text-xs font-mono">{(hero as any).overlayOpacity || 40}%</span>
                  </div>
                  <Slider 
                    value={[(hero as any).overlayOpacity || 40]} 
                    max={90}
                    step={1} 
                    onValueChange={([val]) => handleHeroChange("overlayOpacity", val)}
                  />
                </div>

                <div className="pt-4 space-y-4 border-t">
                  <h3 className="text-sm font-medium">CTA Buttons</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Primary Label</Label>
                      <Input 
                        value={(hero as any).primaryCTA || ""} 
                        onChange={(e) => handleHeroChange("primaryCTA", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Primary URL</Label>
                      <Input 
                        value={(hero as any).primaryURL || ""} 
                        onChange={(e) => handleHeroChange("primaryURL", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4 lg:col-span-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Floating Info Card
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="float-title">Card Title</Label>
                  <Input 
                    id="float-title" 
                    value={(hero as any).floatingTitle || ""} 
                    onChange={(e) => handleHeroChange("floatingTitle", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="float-sub">Card Subtitle</Label>
                  <Input 
                    id="float-sub" 
                    value={(hero as any).floatingSubtitle || ""} 
                    onChange={(e) => handleHeroChange("floatingSubtitle", e.target.value)}
                  />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sections" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                Homepage Content Sections
              </h2>
              <Button asChild size="sm">
                <Link to="/admin/pages">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Detailed Content
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              The homepage is composed of dynamic sections. Click below to manage individual blocks for Trust markers, Expertise, Services, and more.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Trust Markers", desc: "Logos and highlights at the top", kind: "trust" },
                { title: "Dental Services", desc: "Treatment categories and tabs", kind: "department" },
                { title: "Clinical Expertise", desc: "Features and tech highlights", kind: "expertise" },
                { title: "Why La Dune", desc: "Differentiation and core values", kind: "why-us" },
                { title: "Patient Reviews", desc: "Testimonial cards and quotes", kind: "experience" },
                { title: "Call to Action", desc: "Final booking banner", kind: "final-cta" },
              ].map((section) => (
                <div key={section.kind} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                  <h3 className="font-medium">{section.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{section.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="headers" className="mt-6 space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                Services Section
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Label (Eyebrow)</Label>
                  <Input 
                    value={hero.servicesLabel || ""} 
                    onChange={(e) => handleHeroChange("servicesLabel", e.target.value)}
                    placeholder="Our Dental Care"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Textarea 
                    value={hero.servicesHeading || ""} 
                    onChange={(e) => handleHeroChange("servicesHeading", e.target.value)}
                    placeholder="Comprehensive treatments designed around your needs."
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                Team Section
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Label (Eyebrow)</Label>
                  <Input 
                    value={hero.teamLabel || ""} 
                    onChange={(e) => handleHeroChange("teamLabel", e.target.value)}
                    placeholder="Our Team"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input 
                    value={hero.teamHeading || ""} 
                    onChange={(e) => handleHeroChange("teamHeading", e.target.value)}
                    placeholder="Meet our experts"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={hero.teamDescription || ""} 
                    onChange={(e) => handleHeroChange("teamDescription", e.target.value)}
                    placeholder="A multidisciplinary team dedicated to your oral health..."
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                Blog Section
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Label (Eyebrow)</Label>
                  <Input 
                    value={hero.blogLabel || ""} 
                    onChange={(e) => handleHeroChange("blogLabel", e.target.value)}
                    placeholder="Blog"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input 
                    value={hero.blogHeading || ""} 
                    onChange={(e) => handleHeroChange("blogHeading", e.target.value)}
                    placeholder="Latest from our blog"
                  />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="testimonials" className="mt-6 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Testimonials Display Settings
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="testimonial-style">Display Style</Label>
                <Select 
                  value={(hero as any).testimonialStyle || "grid"} 
                  onValueChange={(val) => handleGlobalConfigChange("testimonialStyle", val)}
                >
                  <SelectTrigger id="testimonial-style">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid (Modern List)</SelectItem>
                    <SelectItem value="carousel">Carousel (Premium Slider)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose how patient reviews are presented on the homepage.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="testimonial-limit">Display Limit</Label>
                  <span className="text-xs font-mono">{(hero as any).testimonialLimit || 3} items</span>
                </div>
                <Slider 
                  id="testimonial-limit"
                  value={[(hero as any).testimonialLimit || 3]} 
                  min={1}
                  max={12}
                  step={1} 
                  onValueChange={([val]) => handleGlobalConfigChange("testimonialLimit", val)}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of testimonials to show in this section.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/testimonials">
                  Manage Testimonial Content
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="mt-6 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">SEO & Search Performance</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title">SEO Browser Title</Label>
                <Input 
                  id="seo-title" 
                  value={page?.seo_title || ""} 
                  onChange={(e) => setPage(page ? { ...page, seo_title: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-desc">Meta Description</Label>
                <Textarea 
                  id="seo-desc" 
                  rows={4}
                  value={page?.seo_description || ""} 
                  onChange={(e) => setPage(page ? { ...page, seo_description: e.target.value } : null)}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">CMS Configuration</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Maintenance Mode</h4>
                  <p className="text-sm text-muted-foreground">Show a maintenance page instead of the landing page.</p>
                </div>
                <Switch disabled />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Direct Publishing</h4>
                  <p className="text-sm text-muted-foreground">Changes go live immediately without draft phase.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLandingPage;
