import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Mail, 
  Trash2, 
  CheckCircle2, 
  RotateCcw, 
  Inbox, 
  MessageSquare, 
  Clock,
  User,
  Reply
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

  const unreadCount = rows.filter((r) => !r.read).length;
  const totalCount = rows.length;
  const lastMessageDate = rows.length > 0 ? rows[0].created_at : null;

  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    }
    return format(date, "d MMMM", { locale: fr });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Messages de contact
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Consultez et gérez les demandes reçues via votre site.
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={load}
          className="bg-white hover:bg-slate-50 border-slate-200 text-slate-600 transition-all active:scale-95"
          disabled={loading}
        >
          <RotateCcw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Rafraîchir
        </Button>
      </div>

      {/* SUMMARY SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-100 shadow-sm bg-white/50 backdrop-blur-sm flex items-center gap-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Inbox className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total messages</p>
            <p className="text-xl font-bold text-slate-900">{totalCount}</p>
          </div>
        </Card>
        <Card className="p-4 border-slate-100 shadow-sm bg-white/50 backdrop-blur-sm flex items-center gap-4">
          <div className="p-2 bg-amber-50 rounded-lg">
            <MessageSquare className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Non lus</p>
            <p className="text-xl font-bold text-slate-900">{unreadCount}</p>
          </div>
        </Card>
        <Card className="p-4 border-slate-100 shadow-sm bg-white/50 backdrop-blur-sm flex items-center gap-4">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Clock className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Dernier message</p>
            <p className="text-xl font-bold text-slate-900">
              {lastMessageDate ? formatDateLabel(lastMessageDate) : "--"}
            </p>
          </div>
        </Card>
      </div>

      {/* MESSAGE LIST SECTION */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in duration-300">
            <div className="p-6 bg-slate-50 rounded-full mb-4">
              <Mail className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Aucun message</h3>
            <p className="text-slate-500 max-w-xs mt-1">
              Les demandes envoyées depuis votre site apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {rows.map((m) => (
              <Card 
                key={m.id} 
                className={`group relative overflow-hidden transition-all duration-200 border-slate-200/60 hover:border-primary/30 hover:shadow-md ${
                  !m.read ? "bg-white ring-1 ring-primary/20" : "bg-white/70"
                }`}
              >
                {!m.read && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                )}
                
                <div className="p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`p-2 rounded-full shrink-0 ${!m.read ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"}`}>
                        <User className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-bold text-slate-900 truncate ${!m.read ? "text-base" : "text-sm"}`}>
                            {m.name}
                          </h4>
                          {!m.read && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] h-5 px-2">
                              NON LU
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 truncate hover:text-primary transition-colors cursor-default">
                          {m.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0 md:pt-1">
                      <p className="text-xs font-medium text-slate-400">
                        {format(new Date(m.created_at), "HH:mm", { locale: fr })}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {format(new Date(m.created_at), "d MMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pl-0 md:pl-12">
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${!m.read ? "text-slate-800 font-medium" : "text-slate-600"}`}>
                      {m.message}
                    </p>
                  </div>

                  <div className="mt-6 pl-0 md:pl-12 flex flex-wrap items-center gap-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => toggleRead(m)}
                      className="h-8 text-[11px] font-semibold border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 mr-1.5 ${!m.read ? "text-slate-400" : "text-emerald-500"}`} />
                      {m.read ? "Marquer non lu" : "Marquer lu"}
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      asChild
                      className="h-8 text-[11px] font-semibold border-primary/20 bg-primary/5 hover:bg-primary hover:text-white text-primary transition-all"
                    >
                      <a href={`mailto:${m.email}?subject=Re: votre message`}>
                        <Reply className="w-3.5 h-3.5 mr-1.5" />
                        Répondre
                      </a>
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => remove(m.id)} 
                      className="h-8 text-[11px] font-semibold text-slate-400 hover:text-destructive hover:bg-destructive/5 ml-auto transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
