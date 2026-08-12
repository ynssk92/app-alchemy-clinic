import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Calendar, Mail, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Notif = {
  id: string;
  db_id: string;
  type: "appointment" | "message" | "drift" | "app";
  title: string;
  subtitle: string;
  created_at: string;
  is_read: boolean;
  table: "contact_messages" | "appointments" | "assistant_verification_alerts" | "notifications";
};

const DRIFT_LABEL: Record<string, string> = {
  assistant_also_admin: "Escalade admin détectée",
  missing_profile: "Profil assistant manquant",
  appointments_unreachable: "Rendez-vous inaccessibles",
  messages_unreachable: "Messages inaccessibles",
};

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [msgs, appts, drift, appNotifs] = await Promise.all([
      supabase
        .from("contact_messages")
        .select("id, name, email, message, created_at, read")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("appointments")
        .select("id, appointment_date, appointment_time, status, reason, created_at, doctors(full_name)")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("assistant_verification_alerts")
        .select("id, kind, detail, user_name, created_at, acknowledged_at")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(15)
    ]);

    const n: Notif[] = [];
    
    (msgs.data || []).forEach((m: any) =>
      n.push({
        id: `m-${m.id}`,
        db_id: m.id,
        type: "message",
        title: `Nouveau message — ${m.name}`,
        subtitle: m.message?.slice(0, 60) || m.email,
        created_at: m.created_at,
        is_read: !!m.read,
        table: "contact_messages"
      })
    );
    
    (appts.data || []).forEach((a: any) =>
      n.push({
        id: `a-${a.id}`,
        db_id: a.id,
        type: "appointment",
        title: `RDV — ${a.doctors?.full_name || "Docteur"}`,
        subtitle: `${a.appointment_date} à ${a.appointment_time}`,
        created_at: a.created_at,
        is_read: a.status !== "upcoming", // Following existing logic where upcoming are considered unread
        table: "appointments"
      })
    );
    
    (drift.data || []).forEach((d: any) =>
      n.push({
        id: `d-${d.id}`,
        db_id: d.id,
        type: "drift",
        title: `${DRIFT_LABEL[d.kind] || "Alerte permissions"}${d.user_name ? ` — ${d.user_name}` : ""}`,
        subtitle: d.detail || "",
        created_at: d.created_at,
        is_read: !!d.acknowledged_at,
        table: "assistant_verification_alerts"
      })
    );

    (appNotifs.data || []).forEach((an: any) => 
      n.push({
        id: `an-${an.id}`,
        db_id: an.id,
        type: "app",
        title: an.title,
        subtitle: an.body || "",
        created_at: an.created_at,
        is_read: !!an.read,
        table: "notifications"
      })
    );

    n.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    setItems(n.slice(0, 20));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channels = [
      supabase.channel("admin-msgs").on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, () => load()).subscribe(),
      supabase.channel("admin-appts").on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => load()).subscribe(),
      supabase.channel("admin-alerts").on("postgres_changes", { event: "*", schema: "public", table: "assistant_verification_alerts" }, () => load()).subscribe(),
      supabase.channel("admin-notifs").on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => load()).subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [load]);

  const markAsRead = async (n: Notif) => {
    if (n.is_read) return;

    // Optimistic UI
    setItems(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item));

    let error;
    try {
      if (n.table === "contact_messages") {
        ({ error } = await supabase.from("contact_messages").update({ read: true }).eq("id", n.db_id));
      } else if (n.table === "assistant_verification_alerts") {
        ({ error } = await supabase.from("assistant_verification_alerts").update({ acknowledged_at: new Date().toISOString() }).eq("id", n.db_id));
      } else if (n.table === "notifications") {
        ({ error } = await supabase.from("notifications").update({ read: true }).eq("id", n.db_id));
      }
      // Note: Appointments don't have a simple 'read' boolean, they use status. 
      // We don't change status just by clicking a notification as per instructions "DO NOT change appointment logic".
    } catch (err) {
      error = err;
    }

    if (error) {
      toast.error("Erreur lors du marquage comme lu");
      // Rollback
      setItems(prev => prev.map(item => item.id === n.id ? { ...item, is_read: false } : item));
    }
  };

  const handleItemClick = async (n: Notif) => {
    await markAsRead(n);
    
    const paths = {
      message: "/admin/messages",
      drift: "/admin/verify-assistants",
      appointment: "/admin/appointments",
      app: "/admin/appointments" // Default path for app notifications usually related to appts
    };
    
    navigate(paths[n.type]);
  };

  const unreadCount = items.filter(n => !n.is_read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-9 w-9 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:bg-background">
          <Bell className={cn("w-4 h-4 transition-colors", unreadCount > 0 ? "text-primary" : "text-muted-foreground")} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-sm animate-in zoom-in duration-300">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-popover/95 backdrop-blur-md border-border shadow-2xl rounded-2xl p-0 overflow-hidden">
        <DropdownMenuLabel className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
          <span className="font-bold text-sm tracking-tight">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px] bg-primary/10 text-primary border-none">
              {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
            </Badge>
          )}
        </DropdownMenuLabel>
        
        <div className="max-h-[400px] overflow-auto custom-scrollbar">
          {items.length === 0 ? (
            <div className="p-10 text-sm text-muted-foreground text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Bell className="w-5 h-5 opacity-20" />
              </div>
              Aucune notification
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {items.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors focus:bg-accent/50 outline-none",
                    !n.is_read ? "bg-primary/[0.03] relative" : "opacity-75"
                  )}
                >
                  {!n.is_read && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                  )}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                      n.type === "message"
                        ? "bg-blue-500/10 text-blue-600"
                        : n.type === "drift"
                        ? "bg-rose-500/10 text-rose-600"
                        : "bg-amber-500/10 text-amber-600"
                    )}
                  >
                    {n.type === "message" ? (
                      <Mail className="w-4 h-4" />
                    ) : n.type === "drift" ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn("text-[13px] leading-snug truncate", !n.is_read ? "font-bold text-foreground" : "font-medium text-muted-foreground")}>
                      {n.title}
                    </div>
                    <div className="text-xs text-muted-foreground/80 mt-1 line-clamp-1">{n.subtitle}</div>
                    <div className="text-[10px] text-muted-foreground/60 mt-1.5 font-medium">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </div>
        
        <DropdownMenuSeparator className="m-0" />
        <div className="p-2 grid grid-cols-2 gap-2 bg-muted/10">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/messages")} className="text-[11px] font-bold h-8 rounded-lg">
            <Mail className="w-3 h-3 mr-2" />Messages
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/appointments")} className="text-[11px] font-bold h-8 rounded-lg">
            <Calendar className="w-3 h-3 mr-2" />Rendez-vous
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminNotifications;
