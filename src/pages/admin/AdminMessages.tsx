import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Mail, Trash2, CheckCircle2, RotateCcw } from "lucide-react";

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
};

const AdminMessages = () => {
  const [rows, setRows] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) return toast.error(error.message);
    setRows(data as Message[]);
  };

  useEffect(() => { load(); }, []);

  const toggleRead = async (m: Message) => {
    const newRead = !m.read;
    // Optimistic UI update
    setRows((r) => r.map((x) => (x.id === m.id ? { ...x, read: newRead } : x)));
    
    const { error } = await supabase
      .from("contact_messages")
      .update({ read: newRead })
      .eq("id", m.id);
      
    if (error) {
      toast.error(error.message);
      // Rollback
      setRows((r) => r.map((x) => (x.id === m.id ? { ...x, read: m.read } : x)));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((r) => r.filter((x) => x.id !== id));
    toast.success("Message supprimé");
  };

  const unread = rows.filter((r) => !r.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Mail className="w-7 h-7 text-primary" />
            Messages de contact
          </h1>
          <p className="text-muted-foreground mt-1">
            {unread > 0 ? `${unread} non lu${unread > 1 ? "s" : ""}` : "Tout est lu"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RotateCcw className="w-4 h-4 mr-2" />Rafraîchir
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          Aucun message pour le moment.
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((m) => (
            <Card key={m.id} className={`p-5 ${!m.read ? "border-primary/50 bg-primary/5" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{m.name}</span>
                    <a href={`mailto:${m.email}`} className="text-sm text-primary hover:underline">
                      {m.email}
                    </a>
                    {!m.read && <Badge>Nouveau</Badge>}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(m.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => toggleRead(m)}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {m.read ? "Marquer non lu" : "Marquer lu"}
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={`mailto:${m.email}?subject=Re: votre message`}>
                    <Mail className="w-4 h-4 mr-2" />Répondre
                  </a>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(m.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />Supprimer
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
