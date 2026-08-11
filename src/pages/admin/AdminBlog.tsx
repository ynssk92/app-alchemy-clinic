import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, ExternalLink, Upload, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

const emptyDraft = { title: "", slug: "", excerpt: "", content: "", cover_image_url: "", published: false };

const AdminBlog = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<{ name: string; url: string }[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts((data as Post[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setDraft(emptyDraft);
    setOpen(true);
  };

  const openEdit = (p: Post) => {
    setEditing(p);
    setDraft({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || "",
      content: p.content,
      cover_image_url: p.cover_image_url || "",
      published: p.published,
    });
    setOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("blog-covers").upload(path, file, { upsert: false });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("blog-covers").getPublicUrl(path);
    setDraft((d) => ({ ...d, cover_image_url: data.publicUrl }));
    setUploading(false);
  };

  const openMedia = async () => {
    setMediaOpen(true);
    setLoadingMedia(true);
    const { data } = await supabase.storage.from("branding").list();
    if (data) {
      const items = data.map((f) => ({
        name: f.name,
        url: supabase.storage.from("branding").getPublicUrl(f.name).data.publicUrl,
      }));
      setMediaFiles(items);
    }
    setLoadingMedia(false);
  };

  const save = async () => {
    if (!draft.title || !draft.content) {
      toast({ title: "Champs requis", description: "Titre et contenu obligatoires", variant: "destructive" });
      return;
    }
    setSaving(true);
    const slug = draft.slug ? slugify(draft.slug) : slugify(draft.title);
    const payload = {
      title: draft.title,
      slug,
      excerpt: draft.excerpt || null,
      content: draft.content,
      cover_image_url: draft.cover_image_url || null,
      published: draft.published,
      published_at: draft.published ? (editing?.published_at || new Date().toISOString()) : null,
      author_id: user?.id,
    };
    const { error } = editing
      ? await supabase.from("blog_posts").update(payload).eq("id", editing.id)
      : await supabase.from("blog_posts").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing ? "Article mis à jour" : "Article créé" });
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    toast({ title: "Article supprimé" });
    load();
  };

  const togglePublish = async (p: Post) => {
    const next = !p.published;
    const { error } = await supabase.from("blog_posts").update({
      published: next,
      published_at: next ? (p.published_at || new Date().toISOString()) : null,
    }).eq("id", p.id);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="text-muted-foreground">Créez et gérez les articles publiés sur le site.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" />Nouvel article</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : posts.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          Aucun article. Cliquez sur « Nouvel article » pour commencer.
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((p) => (
            <Card key={p.id} className="p-4 flex items-center gap-4">
              {p.cover_image_url ? (
                <img src={p.cover_image_url} alt="" className="w-20 h-20 rounded-lg object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-muted" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold truncate">{p.title}</h3>
                  <Badge variant={p.published ? "default" : "secondary"}>
                    {p.published ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">/{p.slug}</p>
                {p.excerpt && <p className="text-sm text-muted-foreground truncate">{p.excerpt}</p>}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 pr-2">
                  <Switch checked={p.published} onCheckedChange={() => togglePublish(p)} />
                  <span className="text-xs text-muted-foreground">Publier</span>
                </div>
                {p.published && (
                  <Link to={`/blog/${p.slug}`} target="_blank">
                    <Button size="sm" variant="ghost"><ExternalLink className="w-4 h-4" /></Button>
                  </Link>
                )}
                <Button size="sm" variant="outline" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier l'article" : "Nouvel article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre *</Label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value, slug: editing ? draft.slug : slugify(e.target.value) })}
              />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder="ex: 5-gestes-bouche-saine" />
            </div>
            <div>
              <Label>Extrait</Label>
              <Textarea rows={2} value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} />
            </div>
            <div>
              <Label>Image de couverture</Label>
              <div className="flex items-center gap-2">
                <Input value={draft.cover_image_url} onChange={(e) => setDraft({ ...draft, cover_image_url: e.target.value })} placeholder="URL ou upload" />
                <Button type="button" variant="outline" onClick={openMedia} title="Media Library">
                  <FolderOpen className="w-4 h-4" />
                </Button>
                <label>
                  <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                  <Button type="button" variant="outline" asChild disabled={uploading}>
                    <span className="cursor-pointer"><Upload className="w-4 h-4 mr-1" />{uploading ? "..." : "Upload"}</span>
                  </Button>
                </label>
              </div>
              {draft.cover_image_url && <img src={draft.cover_image_url} alt="" className="mt-2 max-h-40 rounded-lg" />}
            </div>
            <div>
              <Label>Contenu * (texte brut, sauts de ligne préservés)</Label>
              <Textarea rows={12} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={draft.published} onCheckedChange={(v) => setDraft({ ...draft, published: v })} />
              <Label>Publier immédiatement</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={save} disabled={saving}>{saving ? "..." : "Enregistrer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={mediaOpen} onOpenChange={setMediaOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Médiathèque</DialogTitle>
          </DialogHeader>
          {loadingMedia ? (
            <div className="p-10 text-center">Chargement...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {mediaFiles.map((f) => (
                <button
                  key={f.name}
                  className="group relative border rounded-md overflow-hidden hover:border-primary transition-colors text-left"
                  onClick={() => {
                    setDraft((d) => ({ ...d, cover_image_url: f.url }));
                    setMediaOpen(false);
                  }}
                >
                  <img src={f.url} alt={f.name} className="w-full h-24 object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium px-2 py-1 bg-primary rounded">Sélectionner</span>
                  </div>
                  <div className="p-1 text-[10px] truncate">{f.name}</div>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlog;
