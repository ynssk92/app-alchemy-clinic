import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Props = {
  table: "specialties" | "clinics";
  title: string;
  subtitle: string;
  fields: { key: string; label: string; placeholder?: string }[];
};

const SimpleCrud = ({ table, title, subtitle, fields }: Props) => {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, string>>(Object.fromEntries(fields.map((f) => [f.key, ""])));

  const load = async () => {
    const { data } = await supabase.from(table).select("*").order("created_at", { ascending: false });
    setRows(data || []);
  };
  useEffect(() => { load(); }, [table]);

  const add = async () => {
    if (!form.name?.trim()) return toast.error("Name required");
    const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v || null]));
    const { error } = await supabase.from(table).insert(payload as any);
    if (error) return toast.error(error.message);
    toast.success("Added");
    setForm(Object.fromEntries(fields.map((f) => [f.key, ""])));
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-1">{title}</h1>
      <p className="text-muted-foreground mb-8">{subtitle}</p>

      <Card className="p-4 mb-6 border-border bg-card">
        <div className="flex gap-2 items-end flex-wrap">
          {fields.map((f) => (
            <div key={f.key} className="flex-1 min-w-40">
              <label className="text-sm font-medium mb-1 block">{f.label}</label>
              <Input placeholder={f.placeholder} value={form[f.key] || ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
            </div>
          ))}
          <Button onClick={add}><Plus className="w-4 h-4 mr-2" />Add</Button>
        </div>
      </Card>

      <div className="grid gap-3">
        {rows.map((r) => (
          <Card key={r.id} className="p-4 flex items-center gap-4 border-border bg-card">
            <div className="flex-1">
              <h3 className="font-bold">{r.name}</h3>
              {(r.address || r.phone) && (
                <p className="text-sm text-muted-foreground">
                  {[r.address, r.phone].filter(Boolean).join(" • ")}
                </p>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4" /></Button>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-muted-foreground text-center py-8">Nothing yet.</p>}
      </div>
    </div>
  );
};

export const AdminSpecialties = () => (
  <SimpleCrud table="specialties" title="Specialties" subtitle="Medical specialties available for doctors"
    fields={[{ key: "name", label: "Name", placeholder: "Cardiologist" }]} />
);

export const AdminClinics = () => (
  <SimpleCrud table="clinics" title="Clinics" subtitle="Clinic locations shown to patients"
    fields={[
      { key: "name", label: "Name", placeholder: "Downtown Medical Center" },
      { key: "address", label: "Address", placeholder: "123 Main St" },
      { key: "phone", label: "Phone", placeholder: "555-0101" },
    ]} />
);
