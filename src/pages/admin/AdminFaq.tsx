import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  published: boolean;
}

const emptyDraft = { question: "", answer: "", published: true };

const AdminFaq = () => {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<FaqItem | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) toast({ title: "Loading failed", description: error.message, variant: "destructive" });
    setItems((data as FaqItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setDraft(emptyDraft); setOpen(true); };
  const openEdit = (f: FaqItem) => {
    setEditing(f);
    setDraft({ question: f.question, answer: f.answer, published: f.published });
    setOpen(true);
  };

  const save = async () => {
    if (!draft.question.trim() || !draft.answer.trim()) {
      toast({ title: "Question and answer are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    let error;
    if (editing) {
      ({ error } = await supabase.from("faqs").update({
        question: draft.question.trim(),
        answer: draft.answer.trim(),
        published: draft.published,
      }).eq("id", editing.id));
    } else {
      const nextOrder = items.length ? Math.max(...items.map((i) => i.sort_order)) + 1 : 1;
      ({ error } = await supabase.from("faqs").insert({
        question: draft.question.trim(),
        answer: draft.answer.trim(),
        published: draft.published,
        sort_order: nextOrder,
      }));
    }
    setSaving(false);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Question updated" : "Question added" });
    setOpen(false);
    load();
  };

  const togglePublished = async (f: FaqItem) => {
    const { error } = await supabase.from("faqs").update({ published: !f.published }).eq("id", f.id);
    if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
    load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = items[index + dir];
    const current = items[index];
    if (!target) return;
    await supabase.from("faqs").update({ sort_order: target.sort_order }).eq("id", current.id);
    await supabase.from("faqs").update({ sort_order: current.sort_order }).eq("id", target.id);
    load();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("faqs").delete().eq("id", toDelete.id);
    setToDelete(null);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Question deleted" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">FAQ</h1>
          <p className="text-muted-foreground text-sm">
            Manage the questions shown on the public FAQ page.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/faq" target="_blank"><ExternalLink className="h-4 w-4 mr-2" />View page</Link>
          </Button>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />New question</Button>
        </div>
      </div>

      {loading ? (
        <Card className="p-10 text-center text-muted-foreground">Loading…</Card>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground border-dashed">
          No questions yet — add your first one.
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((f, i) => (
            <Card key={f.id} className="p-4 flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex sm:flex-col gap-1">
                <Button size="icon" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold">{f.question}</h2>
                  <Badge variant={f.published ? "default" : "secondary"}>
                    {f.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{f.answer}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={f.published} onCheckedChange={() => togglePublished(f)} aria-label="Toggle published" />
                <Button size="icon" variant="ghost" onClick={() => openEdit(f)} aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setToDelete(f)} aria-label="Delete">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit question" : "New question"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="faq-q">Question</Label>
              <Input id="faq-q" value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faq-a">Answer</Label>
              <Textarea id="faq-a" rows={6} value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="faq-pub" checked={draft.published} onCheckedChange={(v) => setDraft({ ...draft, published: v })} />
              <Label htmlFor="faq-pub">Published on the website</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this question?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes it from the public FAQ page permanently.
            </AlertDialogDescription>
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

export default AdminFaq;
