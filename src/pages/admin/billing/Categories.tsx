import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type Cat = { id?: string; name: string; color: string };
const empty: Cat = { name: "", color: "#3b82f6" };

export default function Categories() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cat>(empty);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("service_categories").select("*").order("name");
    setRows(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.name) return toast.error("Name required");
    const { error } = editing.id
      ? await supabase.from("service_categories").update(editing).eq("id", editing.id)
      : await supabase.from("service_categories").insert(editing);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false); setEditing(empty); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("service_categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Service Categories</h1>
          <p className="text-sm text-muted-foreground">Group your services for reporting and filtering.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={() => setEditing(empty)}><Plus className="w-4 h-4 mr-2" />New Category</Button></DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{editing.id ? "Edit Category" : "New Category"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name *</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>Color</Label><Input type="color" value={editing.color} onChange={(e) => setEditing({ ...editing, color: e.target.value })} className="h-10 w-20 p-1" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="p-3">Name</th><th className="p-3">Color</th><th className="p-3" /></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={3} className="p-2"><Skeleton className="h-24" /></td></tr>}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={3} className="p-12 text-center">
                <Tag className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No categories yet</p>
              </td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3"><Badge style={{ background: r.color + "22", color: r.color }} className="border-0">{r.name}</Badge></td>
                <td className="p-3 font-mono text-xs">{r.color}</td>
                <td className="p-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
