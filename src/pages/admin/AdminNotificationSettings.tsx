import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Shield, UserPlus, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Preference = {
  notification_type: string;
  in_app_enabled: boolean;
  email_enabled: boolean;
};

const AdminNotificationSettings = () => {
  const [prefs, setPrefs] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrefs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notification_preferences")
      .select("notification_type, in_app_enabled, email_enabled")
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to load preferences");
    } else {
      setPrefs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrefs();
  }, []);

  const toggle = async (type: string, channel: 'in_app' | 'email', currentVal: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const update = channel === 'in_app' 
      ? { in_app_enabled: !currentVal } 
      : { email_enabled: !currentVal };

    const { error } = await supabase
      .from("notification_preferences")
      .upsert({
        user_id: user.id,
        notification_type: type,
        ...update
      }, { onConflict: 'user_id,notification_type' });

    if (error) {
      toast.error("Failed to update preference");
    } else {
      setPrefs(prev => {
        const existing = prev.find(p => p.notification_type === type);
        if (existing) {
          return prev.map(p => p.notification_type === type ? { ...p, ...update } : p);
        }
        return [...prev, { notification_type: type, in_app_enabled: true, email_enabled: false, ...update }];
      });
      toast.success("Preference updated");
    }
  };

  const getPref = (type: string) => {
    return prefs.find(p => p.notification_type === type) || { notification_type: type, in_app_enabled: true, email_enabled: false };
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Notification Settings</h1>
        <p className="text-muted-foreground">Manage how and when you receive alerts.</p>
      </div>

      <div className="grid gap-6">
        {/* Invitations Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle>Staff Management</CardTitle>
            </div>
            <CardDescription>Alerts regarding invitations and role assignments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* New Invite */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <Label className="text-base font-semibold">New Invitation Created</Label>
                  <p className="text-sm text-muted-foreground">When an admin invites a new user.</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <Switch 
                    checked={getPref('invitation_created').in_app_enabled} 
                    onCheckedChange={() => toggle('invitation_created', 'in_app', getPref('invitation_created').in_app_enabled)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <Switch 
                    checked={getPref('invitation_created').email_enabled}
                    onCheckedChange={() => toggle('invitation_created', 'email', getPref('invitation_created').email_enabled)}
                  />
                </div>
              </div>
            </div>

            {/* Invite Accepted */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <Label className="text-base font-semibold">Invitation Accepted</Label>
                  <p className="text-sm text-muted-foreground">When an invited user completes registration.</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <Switch 
                    checked={getPref('invitation_accepted').in_app_enabled}
                    onCheckedChange={() => toggle('invitation_accepted', 'in_app', getPref('invitation_accepted').in_app_enabled)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <Switch 
                    checked={getPref('invitation_accepted').email_enabled}
                    onCheckedChange={() => toggle('invitation_accepted', 'email', getPref('invitation_accepted').email_enabled)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminNotificationSettings;