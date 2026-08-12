import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Testimonial = {
  id: string;
  name: string;
  content: string;
  role?: string;
  avatar_url?: string;
  rating: number;
  status: 'draft' | 'published';
  sort_order: number;
  active: boolean;
};

export const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    content: "",
    role: "",
    avatar_url: "",
    rating: 5,
    status: 'published' as 'draft' | 'published',
    active: true
  });
  const [toDelete, setToDelete] = useState<Testimonial | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });
    
    if (error) {
      toast({ title: "Load failed", description: error.message, variant: "destructive" });
    } else {
      setTestimonials((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!draft.name || !draft.content) {
      toast({ title: "Name and content required", variant: "destructive" });
      return;
    }
    
    const payload = {
      name: draft.name,
      content: draft.content,
      role: draft.role || null,
      avatar_url: draft.avatar_url || null,
      rating: draft.rating,
      status: draft.status,
      active: draft.active,
    };

    if (editing) {
      const { error } = await supabase.from("testimonials").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      const sort_order = testimonials.length ? Math.max(...testimonials.map(t => t.sort_order || 0)) + 1 : 1;
      const { error } = await supabase.from("testimonials").insert({ ...payload, sort_order });
      if (error) toast({ title: "Insert failed", description: error.message, variant: "destructive" });
    }
    
    toast({ title: "Testimonial saved" });
    setOpen(false);
    load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const curr = testimonials[index];
    const next = testimonials[index + dir];
    if (!next) return;
    
    const { error: err1 } = await supabase.from("testimonials").update({ sort_order: next.sort_order }).eq("id", curr.id);
    const { error: err2 } = await supabase.from("testimonials").update({ sort_order: curr.sort_order }).eq("id", next.id);
    
    if (err1 || err2) toast({ title: "Move failed", variant: "destructive" });
    load();
  };

  const toggleStatus = async (t: Testimonial) => {
    const newStatus = t.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from("testimonials").update({ status: newStatus }).eq("id", t.id);
    if (error) toast({ title: "Toggle failed", variant: "destructive" });
    load();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", toDelete.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Testimonial deleted" });
      load();
    }
    setToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground text-sm">Manage patient testimonials and reviews.</p>
        </div>
        <Button onClick={() => { 
          setEditing(null); 
          setDraft({ name: "", content: "", role: "", avatar_url: "", rating: 5, status: 'published', active: true }); 
          setOpen(true); 
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Testimonial
        </Button>
      </div>

      {loading ? (
        <Card className="p-10 text-center">Loading testimonials...</Card>
      ) : testimonials.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground border-dashed">No testimonials found.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <Card key={t.id} className="p-6 relative">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={t.avatar_url} alt={t.name} />
                  <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold truncate">{t.name}</h3>
                      {t.role && <p className="text-xs text-muted-foreground truncate">{t.role}</p>}
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, star) => (
                        <Star key={star} className={`h-3 w-3 ${star < t.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm italic text-muted-foreground line-clamp-3">"{t.content}"</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-2">
                  <Switch checked={t.status === 'published'} onCheckedChange={() => toggleStatus(t)} />
                  <span className="text-xs font-medium uppercase tracking-wider">{t.status}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" disabled={i === testimonials.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { 
                    setEditing(t); 
                    setDraft({ name: t.name, content: t.content, role: t.role || "", avatar_url: t.avatar_url || "", rating: t.rating, status: t.status, active: t.active }); 
                    setOpen(true); 
                  }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setToDelete(t)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="t-name">Patient Name</Label>
                <Input id="t-name" value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} placeholder="e.g. Jean Dupont" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-role">Role / Subtitle</Label>
                <Input id="t-role" value={draft.role} onChange={e => setDraft({...draft, role: e.target.value})} placeholder="e.g. Patient" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-content">Testimonial Content</Label>
              <Textarea id="t-content" value={draft.content} onChange={e => setDraft({...draft, content: e.target.value})} placeholder="What the patient said..." rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="t-avatar">Avatar URL</Label>
                <Input id="t-avatar" value={draft.avatar_url} onChange={e => setDraft({...draft, avatar_url: e.target.value})} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex items-center h-10 gap-2">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button key={r} onClick={() => setDraft({...draft, rating: r})} className="focus:outline-none">
                      <Star className={`h-6 w-6 ${r <= draft.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch id="t-status" checked={draft.status === 'published'} onCheckedChange={v => setDraft({...draft, status: v ? 'published' : 'draft'})} />
                <Label htmlFor="t-status">Published</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save Testimonial</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={o => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete testimonial?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove this review from the website.</AlertDialogDescription>
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
