import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type GalleryImage = { 
  id: string; 
  image_url: string; 
  title: string; 
  display_order: number; 
  status: 'draft' | 'published';
  category?: string;
  description?: string;
};

export const AdminGallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [draft, setDraft] = useState({ image_url: "", title: "", status: 'published' as 'draft' | 'published', category: "", description: "" });
  const [toDelete, setToDelete] = useState<GalleryImage | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("display_order", { ascending: true });
    
    if (error) {
      toast({ title: "Load failed", description: error.message, variant: "destructive" });
    } else {
      setImages((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!draft.image_url) { toast({ title: "Image URL required", variant: "destructive" }); return; }
    
    const payload = {
      image_url: draft.image_url,
      title: draft.title,
      status: draft.status,
      category: draft.category || null,
      description: draft.description || null,
    };

    if (editing) {
      const { error } = await supabase.from("gallery_images").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      const display_order = images.length ? Math.max(...images.map(i => i.display_order || 0)) + 1 : 1;
      const { error } = await supabase.from("gallery_images").insert({ ...payload, display_order });
      if (error) toast({ title: "Insert failed", description: error.message, variant: "destructive" });
    }
    
    toast({ title: "Gallery updated" });
    setOpen(false);
    load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const curr = images[index];
    const next = images[index + dir];
    if (!next) return;
    
    const { error: err1 } = await supabase.from("gallery_images").update({ display_order: next.display_order }).eq("id", curr.id);
    const { error: err2 } = await supabase.from("gallery_images").update({ display_order: curr.display_order }).eq("id", next.id);
    
    if (err1 || err2) toast({ title: "Move failed", variant: "destructive" });
    load();
  };

  const toggleStatus = async (i: GalleryImage) => {
    const newStatus = i.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from("gallery_images").update({ status: newStatus }).eq("id", i.id);
    if (error) toast({ title: "Toggle failed", variant: "destructive" });
    load();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("gallery_images").delete().eq("id", toDelete.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Image deleted" });
      load();
    }
    setToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gallery Management</h1>
          <p className="text-muted-foreground text-sm">Manage the images shown in the clinic gallery.</p>
        </div>
        <Button onClick={() => { setEditing(null); setDraft({ image_url: "", title: "", status: 'published', category: "", description: "" }); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Image
        </Button>
      </div>

      {loading ? (
        <Card className="p-10 text-center">Loading gallery images...</Card>
      ) : images.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground border-dashed">No images in gallery yet.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, i) => (
            <Card key={img.id} className="overflow-hidden group">
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img src={img.image_url} alt={img.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Switch checked={img.status === 'published'} onCheckedChange={() => toggleStatus(img)} />
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{img.title || "Untitled Image"}</h3>
                    {img.category && <p className="text-xs text-muted-foreground">{img.category}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" disabled={i === images.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(img); setDraft({ image_url: img.image_url, title: img.title || "", status: img.status, category: img.category || "", description: img.description || "" }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setToDelete(img)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Gallery Image" : "Add Gallery Image"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="img-url">Image URL</Label>
              <Input id="img-url" value={draft.image_url} onChange={e => setDraft({...draft, image_url: e.target.value})} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="img-title">Title</Label>
              <Input id="img-title" value={draft.title} onChange={e => setDraft({...draft, title: e.target.value})} placeholder="e.g. Modern Treatment Room" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="img-category">Category</Label>
                <Input id="img-category" value={draft.category} onChange={e => setDraft({...draft, category: e.target.value})} placeholder="e.g. Clinic" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="img-status">Status</Label>
                <div className="flex items-center h-10 gap-2">
                  <Switch checked={draft.status === 'published'} onCheckedChange={v => setDraft({...draft, status: v ? 'published' : 'draft'})} />
                  <span className="text-sm">{draft.status === 'published' ? 'Published' : 'Draft'}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={o => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete image?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove this image from the gallery.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
