import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { formatMoney } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";

type Svc = { id?: string; name: string; code: string; description: string; duration: number; price: number; cost: number; tax_rate: number; active: boolean; category_id: string | null };

const empty: Svc = { name: "", code: "", description: "", duration: 30, price: 0, cost: 0, tax_rate: 0, active: true, category_id: null };

export default function Services() {
  const [rows, setRows] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Svc>(empty);

  const load = async () => {
    setLoading(true);
    const [s, c] = await Promise.all([
      supabase.from("services").select("*, category:service_categories(name, color)").order("name"),
      supabase.from("service_categories").select("*").order("name"),
    ]);
    setRows(s.data || []);
    setCats(c.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.name) return toast.error("Name required");
    const payload = { ...editing, category_id: editing.category_id || null };
    const { error } = editing.id
      ? await supabase.from("services").update(payload).eq("id", editing.id)
      : await supabase.from("services").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false); setEditing(empty); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-sm text-muted-foreground">Manage catalog of billable services.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(empty)}><Plus className="w-4 h-4 mr-2" />New Service</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing.id ? "Edit Service" : "New Service"}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Name *</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>Code</Label><Input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} /></div>
              <div>
                <Label>Category</Label>
                <Select value={editing.category_id || "none"} onValueChange={(v) => setEditing({ ...editing, category_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Duration (min)</Label><Input type="number" value={editing.duration} onChange={(e) => setEditing({ ...editing, duration: Number(e.target.value) })} /></div>
              <div><Label>Price (MAD)</Label><Input type="number" step="0.01" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></div>
              <div><Label>Cost</Label><Input type="number" step="0.01" value={editing.cost} onChange={(e) => setEditing({ ...editing, cost: Number(e.target.value) })} /></div>
              <div><Label>Tax Rate (%)</Label><Input type="number" step="0.01" value={editing.tax_rate} onChange={(e) => setEditing({ ...editing, tax_rate: Number(e.target.value) })} /></div>
              <div className="col-span-2"><Label>Description</Label><Textarea rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="col-span-2 flex items-center gap-2"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /><Label>Active</Label></div>
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
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Code</th>
              <th className="p-3 font-medium">Duration</th>
              <th className="p-3 font-medium text-right">Price</th>
              <th className="p-3 font-medium text-right">Tax</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="p-2"><Skeleton className="h-24" /></td></tr>}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={8} className="p-12 text-center">
                <Stethoscope className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No services yet</p>
              </td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-medium">{r.name}<div className="text-xs text-muted-foreground line-clamp-1">{r.description}</div></td>
                <td className="p-3">{r.category ? <Badge style={{ background: r.category.color + "22", color: r.category.color }} className="border-0">{r.category.name}</Badge> : "—"}</td>
                <td className="p-3 font-mono text-xs">{r.code || "—"}</td>
                <td className="p-3">{r.duration} min</td>
                <td className="p-3 text-right">{formatMoney(r.price)}</td>
                <td className="p-3 text-right">{Number(r.tax_rate)}%</td>
                <td className="p-3">{r.active ? <Badge className="bg-emerald-500/15 text-emerald-600 border-0">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</td>
                <td className="p-3 text-right whitespace-nowrap">
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
