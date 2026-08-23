import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Pencil, Trash2, Plus, ExternalLink, Upload, FolderOpen, 
  Search, Filter, Calendar, Clock, FileText, ChevronRight,
  MoreVertical, Eye, CheckCircle2, AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts((data as Post[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filteredPosts = useMemo(() => {
    return posts
      .filter((p) => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (p.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        const matchesStatus = statusFilter === "all" ? true : 
                             statusFilter === "published" ? p.published : !p.published;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortBy === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [posts, searchQuery, statusFilter, sortBy]);

  const featuredPost = useMemo(() => {
    if (statusFilter !== "all" || searchQuery !== "") return null;
    return filteredPosts[0];
  }, [filteredPosts, statusFilter, searchQuery]);

  const otherPosts = useMemo(() => {
    if (featuredPost) return filteredPosts.slice(1);
    return filteredPosts;
  }, [filteredPosts, featuredPost]);

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

  const PostCard = ({ post, featured = false }: { post: Post; featured?: boolean }) => (
    <Card className={cn(
      "group overflow-hidden transition-all duration-300 hover:shadow-xl border-slate-200/60 bg-white",
      featured ? "col-span-full grid md:grid-cols-2 gap-0" : "flex flex-col h-full"
    )}>
      <div className={cn(
        "relative overflow-hidden",
        featured ? "h-[300px] md:h-full" : "aspect-video"
      )}>
        {post.cover_image_url ? (
          <img 
            src={post.cover_image_url} 
            alt={post.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <FileText className="w-12 h-12 text-slate-300" />
          </div>
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className={cn(
            "shadow-sm",
            post.published ? "bg-emerald-500 hover:bg-emerald-600" : "bg-amber-500 hover:bg-amber-600"
          )}>
            {post.published ? "Publié" : "Brouillon"}
          </Badge>
        </div>
      </div>
      
      <div className={cn(
        "flex flex-col p-6",
        featured ? "justify-center" : "flex-1"
      )}>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          <span className="mx-1">•</span>
          <Clock className="w-3.5 h-3.5" />
          {post.slug}
        </div>
        
        <h3 className={cn(
          "font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors line-clamp-2",
          featured ? "text-2xl md:text-3xl" : "text-xl"
        )}>
          {post.title}
        </h3>
        
        {post.excerpt && (
          <p className={cn(
            "text-slate-600 mb-6 line-clamp-3 leading-relaxed",
            featured ? "text-lg" : "text-sm"
          )}>
            {post.excerpt}
          </p>
        )}
        
        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => openEdit(post)}
              className="h-9 w-9 p-0 rounded-full border-slate-200 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => remove(post.id)}
              className="h-9 w-9 p-0 rounded-full border-slate-200 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            {post.published && (
              <Button 
                size="sm" 
                variant="outline" 
                asChild
                className="h-9 w-9 p-0 rounded-full border-slate-200 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all"
              >
                <Link to={`/blog/${post.slug}`} target="_blank">
                  <Eye className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Switch 
              checked={post.published} 
              onCheckedChange={() => togglePublish(post)}
              className="scale-75" 
            />
            <span className="text-xs font-medium text-slate-500">
              {post.published ? "En ligne" : "Hors ligne"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Blog</h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            Créez et gérez les articles publiés sur le site pour informer vos patients.
          </p>
        </div>
        <Button 
          onClick={openNew} 
          className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-6 py-6 rounded-xl text-lg font-semibold transition-all hover:translate-y-[-2px]"
        >
          <Plus className="w-6 h-6" />
          Nouvel article
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Rechercher un article..." 
            className="pl-10 h-11 border-slate-200 focus:border-primary transition-all rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button 
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
            className="rounded-lg h-10 px-4"
          >
            Tous
          </Button>
          <Button 
            variant={statusFilter === "published" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("published")}
            className="rounded-lg h-10 px-4"
          >
            Publiés
          </Button>
          <Button 
            variant={statusFilter === "draft" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("draft")}
            className="rounded-lg h-10 px-4"
          >
            Brouillons
          </Button>
        </div>

        <div className="md:ml-auto flex items-center gap-2">
          <Label className="text-slate-500 text-sm whitespace-nowrap">Trier par :</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 px-4 gap-2 rounded-lg border-slate-200">
                {sortBy === "newest" ? "Plus récents" : "Plus anciens"}
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => setSortBy("newest")}>Plus récents</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>Plus anciens</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-[400px] animate-pulse bg-slate-50 border-slate-200" />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card className="p-20 flex flex-col items-center text-center space-y-4 border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-3xl">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
            <FileText className="w-10 h-10 text-slate-300" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">Aucun article trouvé</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              {searchQuery ? "Aucun article ne correspond à votre recherche." : "Votre blog est vide. Commencez par créer votre premier article."}
            </p>
          </div>
          <Button onClick={openNew} variant="outline" className="mt-4 gap-2 border-slate-300 hover:border-primary hover:text-primary rounded-xl px-6">
            <Plus className="w-4 h-4" />
            Créer un article
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPost && <PostCard post={featuredPost} featured={true} />}
          {otherPosts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}

      {/* Dialogs remain functional but slightly styled */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none shadow-2xl">
          <div className="bg-primary/5 px-8 py-6 border-b border-primary/10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                {editing ? "Modifier l'article" : "Créer un nouvel article"}
              </DialogTitle>
            </DialogHeader>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Titre de l'article *</Label>
                <Input
                  placeholder="Ex: L'importance du brossage"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value, slug: editing ? draft.slug : slugify(e.target.value) })}
                  className="rounded-xl h-12 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Slug (URL personnalisée)</Label>
                <Input 
                  value={draft.slug} 
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })} 
                  placeholder="ex: 5-gestes-bouche-saine" 
                  className="rounded-xl h-12 border-slate-200 bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Extrait / Résumé</Label>
              <Textarea 
                placeholder="Un bref résumé qui apparaîtra sur la liste des articles..."
                rows={3} 
                value={draft.excerpt} 
                onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} 
                className="rounded-xl border-slate-200 resize-none"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-slate-700 font-semibold">Image de couverture</Label>
              <div className="flex flex-col md:flex-row items-stretch gap-3">
                <Input 
                  value={draft.cover_image_url} 
                  onChange={(e) => setDraft({ ...draft, cover_image_url: e.target.value })} 
                  placeholder="URL de l'image ou utilisez l'upload" 
                  className="rounded-xl h-12 border-slate-200"
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={openMedia} title="Media Library" className="h-12 w-12 p-0 rounded-xl border-slate-200">
                    <FolderOpen className="w-5 h-5 text-slate-600" />
                  </Button>
                  <label className="flex-1 md:flex-none">
                    <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                    <Button type="button" variant="outline" asChild disabled={uploading} className="h-12 px-6 rounded-xl border-slate-200 w-full">
                      <span className="cursor-pointer flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        {uploading ? "..." : "Upload"}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
              {draft.cover_image_url && (
                <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-200">
                  <img src={draft.cover_image_url} alt="" className="w-full h-full object-cover" />
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
                    onClick={() => setDraft({ ...draft, cover_image_url: "" })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Contenu principal *</Label>
              <Textarea 
                placeholder="Rédigez votre article ici..."
                rows={12} 
                value={draft.content} 
                onChange={(e) => setDraft({ ...draft, content: e.target.value })} 
                className="rounded-xl border-slate-200"
              />
              <p className="text-xs text-slate-400">Le formatage simple est préservé.</p>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <Switch checked={draft.published} onCheckedChange={(v) => setDraft({ ...draft, published: v })} />
              <div className="space-y-0.5">
                <Label className="text-slate-900 font-semibold cursor-pointer">Publier immédiatement</Label>
                <p className="text-xs text-slate-500">L'article sera visible par les patients dès l'enregistrement.</p>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl">
            <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl h-12 px-8 font-medium">
              Annuler
            </Button>
            <Button 
              onClick={save} 
              disabled={saving}
              className="rounded-xl h-12 px-10 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
            >
              {saving ? "Enregistrement..." : (editing ? "Mettre à jour" : "Créer l'article")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={mediaOpen} onOpenChange={setMediaOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl p-0 border-none shadow-2xl flex flex-col">
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-primary" />
                Médiathèque
              </DialogTitle>
            </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8">
            {loadingMedia ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Clock className="w-10 h-10 text-slate-300 animate-spin" />
                <p className="text-slate-500">Chargement de la bibliothèque...</p>
              </div>
            ) : mediaFiles.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                Aucun fichier média disponible dans le dossier branding.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mediaFiles.map((f) => (
                  <button
                    key={f.name}
                    className="group relative border border-slate-200 rounded-2xl overflow-hidden hover:border-primary hover:shadow-md transition-all text-left bg-white"
                    onClick={() => {
                      setDraft((d) => ({ ...d, cover_image_url: f.url }));
                      setMediaOpen(false);
                      toast({ title: "Image sélectionnée" });
                    }}
                  >
                    <div className="aspect-square w-full">
                      <img src={f.url} alt={f.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div className="absolute inset-0 bg-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        Choisir
                      </div>
                    </div>
                    <div className="p-2 border-t border-slate-50">
                      <p className="text-[10px] font-medium text-slate-600 truncate">{f.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-slate-100 bg-slate-50 text-right">
            <Button variant="outline" onClick={() => setMediaOpen(false)} className="rounded-xl">
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlog;
