import { useEffect, useState } from "react";
import { Bell, Check, Trash2, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationInbox() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("app_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("inbox-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "app_notifications", filter: `user_id=eq.${user?.id}` },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("app_notifications")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error: any) {
      toast.error("Could not update notification");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("app_notifications")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Notification deleted");
    } catch (error: any) {
      toast.error("Could not delete notification");
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("app_notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success("All marked as read");
    } catch (error: any) {
      toast.error("Operation failed");
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => !n.is_read) 
    : notifications;

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle>Boîte de réception</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <CardDescription>Consultez vos rappels de rendez-vous et messages importants.</CardDescription>
          </div>
          
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl w-fit">
            <Button 
              variant={filter === "all" ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => setFilter("all")}
              className="rounded-lg h-8 text-xs font-semibold"
            >
              Tous
            </Button>
            <Button 
              variant={filter === "unread" ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => setFilter("unread")}
              className="rounded-lg h-8 text-xs font-semibold"
            >
              Non lus {unreadCount > 0 && `(${unreadCount})`}
            </Button>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <div className="flex justify-end mt-2">
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/5">
              Tout marquer comme lu
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {filter === "unread" ? "Aucune notification non lue." : "Aucune notification pour le moment."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`group relative p-4 rounded-2xl border transition-all duration-300 ${
                  notif.is_read 
                    ? "bg-muted/30 border-transparent opacity-80" 
                    : "bg-white border-primary/10 shadow-sm ring-1 ring-primary/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    notif.type === 'appointment_reminder' 
                      ? "bg-blue-50 text-blue-600" 
                      : "bg-primary/10 text-primary"
                  }`}>
                    {notif.type === 'appointment_reminder' ? <Calendar className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-12">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`text-sm font-bold truncate ${!notif.is_read ? "text-slate-900" : "text-slate-500"}`}>
                        {notif.title}
                      </h4>
                      {!notif.is_read && <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-2">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(notif.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </span>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                        onClick={() => markAsRead(notif.id)}
                        title="Marquer comme lu"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                      onClick={() => deleteNotification(notif.id)}
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
