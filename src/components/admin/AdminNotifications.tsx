import { useEffect, useState } from "react";
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

type Notif = {
  id: string;
  type: "appointment" | "message" | "drift";
  title: string;
  subtitle: string;
  created_at: string;
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
  const [unreadAppts, setUnreadAppts] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);

  const [unreadDrift, setUnreadDrift] = useState(0);

  const load = async () => {
    const [msgs, appts, drift] = await Promise.all([
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
    ]);

    const n: Notif[] = [];
    (msgs.data || []).forEach((m: any) =>
      n.push({
        id: `m-${m.id}`,
        type: "message",
        title: `Nouveau message — ${m.name}`,
        subtitle: m.message?.slice(0, 60) || m.email,
        created_at: m.created_at,
      })
    );
    (appts.data || []).forEach((a: any) =>
      n.push({
        id: `a-${a.id}`,
        type: "appointment",
        title: `RDV — ${a.doctors?.full_name || "Docteur"}`,
        subtitle: `${a.appointment_date} à ${a.appointment_time}`,
        created_at: a.created_at,
      })
    );
    (drift.data || []).forEach((d: any) =>
      n.push({
        id: `d-${d.id}`,
        type: "drift",
        title: `${DRIFT_LABEL[d.kind] || "Alerte permissions"}${d.user_name ? ` — ${d.user_name}` : ""}`,
        subtitle: d.detail || "",
        created_at: d.created_at,
      })
    );
    n.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    setItems(n.slice(0, 15));

    setUnreadMsgs((msgs.data || []).filter((m: any) => !m.read).length);
    setUnreadDrift((drift.data || []).filter((d: any) => !d.acknowledged_at).length);
    const { count } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "upcoming");
    setUnreadAppts(count || 0);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contact_messages" },
        (payload: any) => {
          toast.success(`Nouveau message de ${payload.new.name}`);
          load();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "appointments" },
        () => {
          toast.success("Nouveau rendez-vous réservé");
          load();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "assistant_verification_alerts" },
        (payload: any) => {
          toast.warning(DRIFT_LABEL[payload.new.kind] || "Alerte permissions assistant");
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const total = unreadAppts + unreadMsgs + unreadDrift;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {total > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
              {total > 99 ? "99+" : total}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-popover">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex gap-1">
            {unreadDrift > 0 && <Badge variant="destructive">{unreadDrift} drift</Badge>}
            {unreadMsgs > 0 && <Badge variant="secondary">{unreadMsgs} msg</Badge>}
            {unreadAppts > 0 && <Badge>{unreadAppts} RDV</Badge>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground text-center">
            Aucune notification
          </div>
        )}
        <div className="max-h-96 overflow-auto">
          {items.map((n) => (
            <DropdownMenuItem
              key={n.id}
              onClick={() =>
                navigate(
                  n.type === "message"
                    ? "/admin/messages"
                    : n.type === "drift"
                    ? "/admin/verify-assistants"
                    : "/admin/appointments"
                )
              }
              className="flex items-start gap-3 py-3 cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  n.type === "message"
                    ? "bg-primary/10 text-primary"
                    : n.type === "drift"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-accent/10 text-accent"
                }`}
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
                <div className="font-medium text-sm truncate">{n.title}</div>
                <div className="text-xs text-muted-foreground truncate">{n.subtitle}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/admin/messages")}>
          <Mail className="w-4 h-4 mr-2" />Voir tous les messages
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/admin/appointments")}>
          <Calendar className="w-4 h-4 mr-2" />Voir tous les rendez-vous
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminNotifications;
