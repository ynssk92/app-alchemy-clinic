import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown, ExternalLink, Save } from "lucide-react";
import { Link } from "react-router-dom";
import type { PageBlock, SitePage } from "@/hooks/usePageContent";
import { resolveIcon, resolveImage } from "@/lib/pageContent";

const PAGES = [
  { slug: "home", label: "Accueil", path: "/", kinds: ["step", "department", "stat"] },
  { slug: "about", label: "À Propos", path: "/about", kinds: ["mission", "value"] },
  { slug: "soins", label: "Nos Soins", path: "/soins", kinds: ["category"] },
  { slug: "expertise", label: "Expertise", path: "/expertise", kinds: ["feature", "stat"] },
];

const emptyBlock = {
  kind: "card",
  title: "",
  subtitle: "",
  body: "",
  image_url: "",
  icon: "",
  items: "",
  published: true,
};

const AdminPages = () => {
  const [slug, setSlug] = useState(PAGES[0].slug);
  const config = PAGES.find((p) => p.slug === slug)!;
  const [page, setPage] = useState<SitePage | null>(null);
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPage, setSavingPage] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PageBlock | null>(null);
  const [draft, setDraft] = useState(emptyBlock);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<PageBlock | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: p }, { data: b, error }] = await Promise.all([
      supabase.from("site_pages").select("*").eq("slug", slug).maybeSingle(),
      supabase.from("page_blocks").select("*").eq("page_slug", slug).order("sort_order", { ascending: true }),
    ]);
    if (error) toast({ title: "Loading failed", description: error.message, variant: "destructive" });
    setPage((p as SitePage) || null);
    setBlocks((b as PageBlock[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [slug]);

  const savePage = async () => {
    if (!page) return;
    setSavingPage(true);
    const { error } = await supabase.from("site_pages").update({
      seo_title: page.seo_title,
      seo_description: page.seo_description,
      eyebrow: page.eyebrow,
      heading: page.heading,
      subheading: page.subheading,
      intro: page.intro,
    }).eq("slug", page.slug);
    setSavingPage(false);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Page updated" });
  };

  const openNew = () => {
    setEditing(null);
    setDraft({ ...emptyBlock, kind: config.kinds[0] });
    setOpen(true);
  };

  const openEdit = (b: PageBlock) => {
    setEditing(b);
    setDraft({
      kind: b.kind,
      title: b.title || "",
      subtitle: b.subtitle || "",
      body: b.body || "",
      image_url: b.image_url || "",
      icon: b.icon || "",
      items: (b.items || []).join("\n"),
      published: b.published,
    });
    setOpen(true);
  };

  const saveBlock = async () => {
    if (!draft.title.trim()) {
      toast({ title: "A title is required", variant: "destructive" });
      return;
    }
    const payload = {
      page_slug: slug,
      kind: draft.kind,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim() || null,
      body: draft.body.trim() || null,
      image_url: draft.image_url.trim() || null,
      icon: draft.icon.trim() || null,
      items: draft.items.split("\n").map((s) => s.trim()).filter(Boolean),
      published: draft.published,
    };
    setSaving(true);
    let error;
    if (editing) {
      ({ error } = await supabase.from("page_blocks").update(payload).eq("id", editing.id));
    } else {
      const nextOrder = blocks.length ? Math.max(...blocks.map((b) => b.sort_order)) + 1 : 1;
      ({ error } = await supabase.from("page_blocks").insert({ ...payload, sort_order: nextOrder }));
    }
    setSaving(false);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Block updated" : "Block added" });
    setOpen(false);
    load();
  };

  const togglePublished = async (b: PageBlock) => {
    const { error } = await supabase.from("page_blocks").update({ published: !b.published }).eq("id", b.id);
    if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
    load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const current = blocks[index];
    const target = blocks[index + dir];
    if (!target) return;
    await supabase.from("page_blocks").update({ sort_order: target.sort_order }).eq("id", current.id);
    await supabase.from("page_blocks").update({ sort_order: current.sort_order }).eq("id", target.id);
    load();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("page_blocks").delete().eq("id", toDelete.id);
    setToDelete(null);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Block deleted" });
    load();
  };

  const uploadImage = async (file: File) => {
    const path = `pages/${slug}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "-")}`;
    const { error } = await supabase.storage.from("branding").upload(path, file, { upsert: true });
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
    const { data } = supabase.storage.from("branding").getPublicUrl(path);
    setDraft((d) => ({ ...d, image_url: data.publicUrl }));
    toast({ title: "Image uploaded" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-muted-foreground text-sm">
            Edit the content of the public website pages.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={config.path} target="_blank"><ExternalLink className="h-4 w-4 mr-2" />View page</Link>
          </Button>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />New block</Button>
        </div>
      </div>

      <Tabs value={slug} onValueChange={setSlug}>
        <TabsList>
          {PAGES.map((p) => <TabsTrigger key={p.slug} value={p.slug}>{p.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      {loading ? (
        <Card className="p-10 text-center text-muted-foreground">Loading…</Card>
      ) : (
        <>
          {page && (
            <Card className="p-6 space-y-4">
              <h2 className="font-semibold">Header & SEO</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seo-title">SEO title</Label>
                  <Input id="seo-title" value={page.seo_title} onChange={(e) => setPage({ ...page, seo_title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eyebrow">Eyebrow</Label>
                  <Input id="eyebrow" value={page.eyebrow || ""} onChange={(e) => setPage({ ...page, eyebrow: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heading">Heading</Label>
                  <Input id="heading" value={page.heading} onChange={(e) => setPage({ ...page, heading: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subheading">Subheading</Label>
                  <Input id="subheading" value={page.subheading || ""} onChange={(e) => setPage({ ...page, subheading: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-desc">SEO description</Label>
                <Textarea id="seo-desc" rows={2} value={page.seo_description} onChange={(e) => setPage({ ...page, seo_description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="intro">Intro text (one paragraph per blank line)</Label>
                <Textarea id="intro" rows={5} value={page.intro || ""} onChange={(e) => setPage({ ...page, intro: e.target.value })} />
              </div>
              <Button onClick={savePage} disabled={savingPage}>
                <Save className="h-4 w-4 mr-2" />{savingPage ? "Saving…" : "Save page"}
              </Button>
            </Card>
          )}

          <div className="space-y-3">
            {blocks.length === 0 ? (
              <Card className="p-10 text-center text-muted-foreground border-dashed">
                No content blocks yet — add your first one.
              </Card>
            ) : blocks.map((b, i) => {
              const Icon = resolveIcon(b.icon);
              return (
                <Card key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex sm:flex-col gap-1">
                    <Button size="icon" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" disabled={i === blocks.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  {resolveImage(b.image_url) ? (
                    <img src={resolveImage(b.image_url)} alt={b.title || ""} className="h-16 w-16 rounded-lg object-cover" />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{b.title}</h3>
                      <Badge variant="outline">{b.kind}</Badge>
                      <Badge variant={b.published ? "default" : "secondary"}>{b.published ? "Published" : "Hidden"}</Badge>
                    </div>
                    {b.body && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{b.body}</p>}
                    {b.items?.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">• {b.items.join(" • ")}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={b.published} onCheckedChange={() => togglePublished(b)} aria-label="Toggle published" />
                    <Button size="icon" variant="ghost" onClick={() => openEdit(b)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setToDelete(b)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit block" : "New block"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex flex-wrap gap-2">
                {config.kinds.map((k) => (
                  <Button key={k} type="button" size="sm" variant={draft.kind === k ? "default" : "outline"} onClick={() => setDraft({ ...draft, kind: k })}>
                    {k}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-title">Title</Label>
              <Input id="b-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-sub">Subtitle (optional)</Label>
              <Input id="b-sub" value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-body">Text</Label>
              <Textarea id="b-body" rows={4} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-items">Bullet list (one per line)</Label>
              <Textarea id="b-items" rows={3} value={draft.items} onChange={(e) => setDraft({ ...draft, items: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-icon">Icon name (lucide, e.g. Heart, Award, ScanLine)</Label>
              <Input id="b-icon" value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-img">Image</Label>
              <Input id="b-img" placeholder="https://…" value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} />
              <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="b-pub" checked={draft.published} onCheckedChange={(v) => setDraft({ ...draft, published: v })} />
              <Label htmlFor="b-pub">Published on the website</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={saveBlock} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this block?</AlertDialogTitle>
            <AlertDialogDescription>It will be removed from the public page permanently.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPages;
