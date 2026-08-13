import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Plus, Trash2, Pencil, X, Check, Tag, Stethoscope, 
  Search, Info, HeartPulse, ShieldAlert, Activity, 
  Microscope, Thermometer, UserCog, Building2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Props = {
  table: "specialties" | "clinics";
  title: string;
  subtitle: string;
  fields: { key: string; label: string; placeholder?: string }[];
};

const SimpleCrud = ({ table, title, subtitle, fields }: Props) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState<Record<string, string>>(Object.fromEntries(fields.map((f) => [f.key, ""])));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from(table).select("*").order("created_at", { ascending: false });
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [table]);

  const add = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.name?.trim()) return toast.error("Name required");
    
    const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v || null]));
    const { error } = await supabase.from(table).insert(payload as any);
    
    if (error) return toast.error(error.message);
    
    toast.success(`${table === "specialties" ? "Specialty" : "Clinic"} added successfully`);
    setForm(Object.fromEntries(fields.map((f) => [f.key, ""])));
    setShowAddForm(false);
    load();
  };

  const startEdit = (r: any) => {
    setEditingId(r.id);
    setEditForm(Object.fromEntries(fields.map((f) => [f.key, r[f.key] ?? ""])));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id: string) => {
    if (!editForm.name?.trim()) return toast.error("Name required");
    const payload = Object.fromEntries(Object.entries(editForm).map(([k, v]) => [k, v || null]));
    const { error } = await supabase.from(table).update(payload as any).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated successfully");
    cancelEdit();
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted successfully");
    load();
  };

  const filteredRows = rows.filter(r => 
    r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.address?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getIcon = () => {
    if (table === "clinics") return <Building2 className="w-5 h-5 text-primary" />;
    return <Stethoscope className="w-5 h-5 text-primary" />;
  };

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-[10px] bg-primary hover:bg-primary/90 text-white shadow-sm transition-all duration-200"
          >
            {showAddForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showAddForm ? "Cancel" : `Add ${table === "specialties" ? "Specialty" : "Clinic"}`}
          </Button>
        </div>

        {/* Add Form Section */}
        {showAddForm && (
          <Card className="p-6 border-border bg-card shadow-sm rounded-[14px] animate-in slide-in-from-top-4 duration-300">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add {table === "specialties" ? "a specialty" : "a clinic"}</h2>
              <p className="text-sm text-slate-500">
                {table === "specialties" 
                  ? "Create a specialty that can be assigned to doctors."
                  : "Add a new clinic location to your network."}
              </p>
            </div>
            <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              {fields.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{f.label}</label>
                  <Input 
                    placeholder={f.placeholder} 
                    value={form[f.key] || ""}
                    className="rounded-[10px] border-slate-200 focus:ring-primary/20"
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} 
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 rounded-[10px]">
                  <Check className="w-4 h-4 mr-2" /> Confirm
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                  className="rounded-[10px]"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Search Toolbar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder={`Search ${table}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-[10px] bg-white dark:bg-slate-900 border-slate-200 focus:ring-primary/20"
          />
        </div>

        {/* Grid Display */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6 h-32 animate-pulse bg-slate-100 dark:bg-slate-800 border-none rounded-[14px]" />
            ))}
          </div>
        ) : filteredRows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRows.map((r) => (
              <Card 
                key={r.id} 
                className={cn(
                  "p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-card shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-[14px]",
                  editingId === r.id && "ring-2 ring-primary/20 border-primary/30"
                )}
              >
                {editingId === r.id ? (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {fields.map((f) => (
                      <div key={f.key} className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{f.label}</label>
                        <Input 
                          placeholder={f.placeholder} 
                          value={editForm[f.key] || ""}
                          className="rounded-[8px]"
                          onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })} 
                        />
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={() => saveEdit(r.id)} className="flex-1 rounded-[8px]">
                        <Check className="w-4 h-4 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit} className="rounded-[8px]">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                        {getIcon()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white truncate">{r.name}</h3>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter">
                          {table === "specialties" ? "Medical Specialty" : "Clinic Location"}
                        </p>
                      </div>
                    </div>

                    {(r.address || r.phone) && (
                      <div className="space-y-1">
                        {r.address && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-slate-300" /> {r.address}
                          </p>
                        )}
                        {r.phone && (
                          <p className="text-sm text-slate-500 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-slate-300" /> {r.phone}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-1 mt-2 pt-3 border-t border-slate-50 dark:border-slate-800/50">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full"
                            onClick={() => startEdit(r)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit {table === "specialties" ? "specialty" : "clinic"}</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/5 rounded-full"
                            onClick={() => remove(r.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete {table === "specialties" ? "specialty" : "clinic"}</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-card rounded-[20px] border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-4">
              {getIcon()}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No {table} found</h3>
            <p className="text-slate-500 max-w-xs mt-1">
              {searchQuery 
                ? `We couldn't find any ${table} matching your search query.`
                : `Add your first ${table === "specialties" ? "medical specialty" : "clinic location"} to get started.`}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => setShowAddForm(true)}
                className="mt-6 rounded-[10px]"
              >
                <Plus className="w-4 h-4 mr-2" /> Add first {table === "specialties" ? "specialty" : "clinic"}
              </Button>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export const AdminSpecialties = () => (
  <SimpleCrud 
    table="specialties" 
    title="Specialties" 
    subtitle="Medical specialties available for doctors"
    fields={[{ key: "name", label: "Specialty Name", placeholder: "e.g. Implantology" }]} 
  />
);

export const AdminClinics = () => (
  <SimpleCrud 
    table="clinics" 
    title="Clinics" 
    subtitle="Clinic locations shown to patients"
    fields={[
      { key: "name", label: "Clinic Name", placeholder: "e.g. Downtown Medical Center" },
      { key: "address", label: "Address", placeholder: "123 Main St, City" },
      { key: "phone", label: "Phone", placeholder: "555-0101" },
    ]} 
  />
);
