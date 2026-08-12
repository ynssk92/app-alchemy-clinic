import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown, Save, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type GalleryImage = { id: string; image_url: string; title: string; sort_order: number; status: 'draft' | 'published' };

export const AdminGallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [draft, setDraft] = useState({ image_url: "", title: "", status: 'published' as 'draft' | 'published' });
  const [toDelete, setToDelete] = useState<GalleryImage | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("gallery_images").select("*").order("sort_order", { ascending: true });
    setImages((data as GalleryImage[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!draft.image_url) { toast({ title: "Image URL required", variant: "destructive" }); return; }
    if (editing) {
      await supabase.from("gallery_images").update(draft).eq("id", editing.id);
    } else {
      const sort_order = images.length ? Math.max(...images.map(i => i.sort_order)) + 1 : 0;
      await supabase.from("gallery_images").insert({ ...draft, sort_order });
    }
    toast({ title: "Gallery updated" });
    setOpen(false);
    load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const curr = images[index], next = images[index + dir];
    await supabase.from("gallery_images").update({ sort_order: next.sort_order }).eq("id", curr.id);
    await supabase.from("gallery_images").update({ sort_order: curr.sort_order }).eq("id", next.id);
    load();
  };

  const toggle = async (i: GalleryImage) => {
    await supabase.from("gallery_images").update({ status: i.status === 'published' ? 'draft' : 'published' }).eq("id", i.id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gallery Management</h1>
        <Button onClick={() => { setEditing(null); setDraft({ image_url: "", title: "", status: 'published' }); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Image
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img, i) => (
          <Card key={img.id} className="p-4 space-y-2">
            <img src={img.image_url} alt={img.title} className="w-full h-40 object-cover rounded" />
            <div className="flex justify-between items-center">
              <span className="font-medium truncate">{img.title}</span>
              <div className="flex items-center gap-2">
                <Switch checked={img.status === 'published'} onCheckedChange={() => toggle(img)} />
                <Button size="icon" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" disabled={i === images.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => { setEditing(img); setDraft(img); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setToDelete(img)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Image" : "Add Image"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Label>Image URL</Label>
            <Input value={draft.image_url} onChange={e => setDraft({...draft, image_url: e.target.value})} />
            <Label>Title</Label>
            <Input value={draft.title} onChange={e => setDraft({...draft, title: e.target.value})} />
          </div>
          <DialogFooter>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
