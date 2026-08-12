import { useEffect, useState, useMemo } from "react";
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
import { Plus, Pencil, Trash2, Stethoscope, Search, Filter, MoreHorizontal, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Svc = { id?: string; name: string; code: string; description: string; duration: number; price: number; cost: number; tax_rate: number; active: boolean; category_id: string | null; clinic_id?: string | null; category?: { name: string; color: string } | null };

const empty: Svc = { name: "", code: "", description: "", duration: 30, price: 0, cost: 0, tax_rate: 0, active: true, category_id: null };

export default function Services() {
  const [rows, setRows] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Svc>(empty);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const [{ data: s, error: sErr }, { data: c, error: cErr }] = await Promise.all([
      supabase.from("services").select("*, category:service_categories!services_category_id_fkey(name, color)").order("name"),
      supabase.from("service_categories").select("*").order("name"),
    ]);
    
    if (sErr) console.error("Error loading services:", sErr);
    if (cErr) console.error("Error loading categories:", cErr);

    setRows(s || []);
    setCats(c || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.code?.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === "all" || r.category_id === catFilter;
      const matchStatus = statusFilter === "all" || (statusFilter === "active" ? r.active : !r.active);
      return matchSearch && matchCat && matchStatus;
    });
  }, [rows, search, catFilter, statusFilter]);

  const save = async () => {
    if (!editing.name) return toast.error("Name required");
    const { id, clinic_id, category, ...updateData } = editing;
    const payload = { ...updateData, category_id: editing.category_id || null };
    
    const { error } = editing.id
      ? await supabase.from("services").update(payload).eq("id", editing.id)
      : await supabase.from("services").insert(payload);
    
    if (error) {
      console.error("Service save error:", error);
      return toast.error(error.message);
    }
    toast.success("Service saved successfully");
    setOpen(false); setEditing(empty); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Service deleted"); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">Manage catalog of billable dental services.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(empty)} className="gap-2"><Plus className="w-4 h-4" />New Service</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>{editing.id ? "Edit Service" : "New Service"}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label>Service Name *</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>Category</Label>
                <Select value={editing.category_id || "none"} onValueChange={(v) => setEditing({ ...editing, category_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Service Code</Label><Input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} /></div>
              <div><Label>Duration (min)</Label><Input type="number" value={editing.duration} onChange={(e) => setEditing({ ...editing, duration: Number(e.target.value) })} /></div>
              <div><Label>Price (MAD)</Label><Input type="number" step="0.01" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></div>
              <div><Label>Tax Rate (%)</Label><Input type="number" step="0.01" value={editing.tax_rate} onChange={(e) => setEditing({ ...editing, tax_rate: Number(e.target.value) })} /></div>
              <div className="col-span-2"><Label>Description</Label><Textarea rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="flex items-center gap-2 pt-2"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /><Label>Active Service</Label></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save Service</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" /><Input className="pl-10" placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Categories</SelectItem>{cats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-32"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
        </Select>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr className="border-b"><th className="p-4 text-left">Name</th><th className="p-4 text-left">Category</th><th className="p-4 text-left">Code</th><th className="p-4 text-left">Duration</th><th className="p-4 text-right">Price</th><th className="p-4 text-right">Tax</th><th className="p-4 text-center">Status</th><th className="p-4" /></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="p-8"><Skeleton className="h-12 w-full" /></td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={8} className="p-12 text-center text-muted-foreground">No services found matching your criteria.</td></tr>}
            {filtered.map((r) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="p-4 font-medium">{r.name}<div className="text-xs text-muted-foreground">{r.description}</div></td>
                <td className="p-4">{r.category ? <Badge variant="outline" style={{ borderColor: r.category.color, color: r.category.color }}>{r.category.name}</Badge> : "—"}</td>
                <td className="p-4 font-mono text-xs">{r.code || "—"}</td>
                <td className="p-4">{r.duration} min</td>
                <td className="p-4 text-right font-medium">{r.price.toFixed(2)} MAD</td>
                <td className="p-4 text-right">{r.tax_rate}%</td>
                <td className="p-4 text-center">{r.active ? <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-0">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</td>
                <td className="p-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
