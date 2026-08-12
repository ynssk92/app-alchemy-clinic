import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Tag, Search, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Cat = { id?: string; name: string; color: string };
const empty: Cat = { name: "", color: "#3b82f6" };

export default function Categories() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cat>(empty);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("service_categories").select("*").order("name");
    setRows(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  }, [rows, search]);

  const save = async () => {
    if (!editing.name) return toast.error("Name required");
    const { error } = editing.id
      ? await supabase.from("service_categories").update(editing).eq("id", editing.id)
      : await supabase.from("service_categories").insert(editing);
    if (error) return toast.error(error.message);
    toast.success("Category saved successfully");
    setOpen(false); setEditing(empty); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? This may affect services using it.")) return;
    const { error } = await supabase.from("service_categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Category deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Categories</h1>
          <p className="text-muted-foreground">Group your services for reporting and filtering.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(empty)} className="gap-2"><Plus className="w-4 h-4" />New Category</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editing.id ? "Edit Category" : "New Category"}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Category Name *</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g., Consultation" />
              </div>
              <div className="space-y-2">
                <Label>Label Color</Label>
                <div className="flex gap-3 items-center">
                  <Input type="color" value={editing.color} onChange={(e) => setEditing({ ...editing, color: e.target.value })} className="h-10 w-20 p-1 cursor-pointer" />
                  <Badge style={{ background: editing.color + "22", color: editing.color, borderColor: editing.color }} variant="outline">Preview Label</Badge>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr className="border-b">
              <th className="p-4 text-left">Category Name</th>
              <th className="p-4 text-left">Color Code</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={3} className="p-8"><Skeleton className="h-12 w-full" /></td></tr>}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="p-12 text-center text-muted-foreground">
                  <Tag className="w-10 h-10 mx-auto opacity-20 mb-2" />
                  No categories found.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="p-4">
                  <Badge 
                    style={{ background: r.color + "15", color: r.color, borderColor: r.color }} 
                    className="px-3 py-1 font-medium"
                    variant="outline"
                  >
                    {r.name}
                  </Badge>
                </td>
                <td className="p-4 font-mono text-xs text-muted-foreground uppercase">{r.color}</td>
                <td className="p-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
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
