import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Bell, Mail, Clock, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function NotificationSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    email_enabled: true,
    app_dm_enabled: true,
    reminder_lead_time_hours: 24,
  });

  useEffect(() => {
    if (!user) return;

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("notification_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setSettings({
            email_enabled: data.email_enabled,
            app_dm_enabled: data.app_dm_enabled,
            reminder_lead_time_hours: data.reminder_lead_time_hours,
          });
        }
      } catch (error: any) {
        toast.error("Failed to load notification settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const updateSettings = async (patch: Partial<typeof settings>) => {
    if (!user) return;
    
    const next = { ...settings, ...patch };
    setSettings(next);

    try {
      const { error } = await supabase
        .from("notification_settings")
        .upsert({
          user_id: user.id,
          ...next,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success("Notification settings updated");
    } catch (error: any) {
      toast.error("Failed to save settings");
      // Revert on error
      setSettings(settings);
    }
  };

  if (loading) return <div className="p-4 space-y-4 animate-pulse">
    <div className="h-32 bg-muted rounded-xl" />
    <div className="h-32 bg-muted rounded-xl" />
  </div>;

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle>Canaux de notification</CardTitle>
          </div>
          <CardDescription>
            Choisissez comment vous souhaitez être informé de vos rendez-vous.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Notifications par Email
              </Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des rappels par courriel.
              </p>
            </div>
            <Switch 
              checked={settings.email_enabled} 
              onCheckedChange={(checked) => updateSettings({ email_enabled: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Messages In-App (DM)
              </Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des notifications directement dans l'application.
              </p>
            </div>
            <Switch 
              checked={settings.app_dm_enabled} 
              onCheckedChange={(checked) => updateSettings({ app_dm_enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <CardTitle>Délai de rappel</CardTitle>
          </div>
          <CardDescription>
            Configurez le moment où vous recevrez votre rappel automatique.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Envoyer le rappel {settings.reminder_lead_time_hours} heures avant</Label>
            </div>
            <Slider
              value={[settings.reminder_lead_time_hours]}
              min={1}
              max={72}
              step={1}
              onValueChange={(val) => setSettings(s => ({ ...s, reminder_lead_time_hours: val[0] }))}
              onValueCommit={(val) => updateSettings({ reminder_lead_time_hours: val[0] })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 heure</span>
              <span>24 heures (1 jour)</span>
              <span>72 heures (3 jours)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
