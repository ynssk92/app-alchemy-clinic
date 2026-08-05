import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Bell, Mail, Smartphone, Globe, MessageSquare, Clock } from "lucide-react";

interface NotificationProps {
  preferences: any;
  onChange: (key: string, value: boolean) => void;
}

export const NotificationSettingsCard = ({ preferences, onChange }: NotificationProps) => {
  const settings = [
    { key: "appointment_reminders", label: "Appointment Reminders", desc: "Receive alerts about upcoming bookings", icon: MessageSquare },
    { key: "reminder_lead_time_hours", label: "Reminder Lead Time (Hours)", desc: "Hours before appointment to send reminder", icon: Clock, type: 'slider', min: 1, max: 72 },
    { key: "email_notifications", label: "Email Notifications", desc: "Important updates sent to your inbox", icon: Mail },
    { key: "sms_notifications", label: "SMS Notifications", desc: "Fast alerts directly to your phone", icon: Smartphone },
    { key: "marketing_emails", label: "Marketing Emails", desc: "New services and exclusive health tips", icon: Globe },
    { key: "browser_notifications", label: "Browser Notifications", desc: "In-app alerts while you're browsing", icon: Bell },
  ];

  return (
    <Card className="p-8 border-border bg-card shadow-sm rounded-[24px] mt-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold">Notification Preferences</h3>
      </div>

      <div className="space-y-6">
        {settings.map((item) => (
          <div key={item.key} className="flex items-center justify-between py-2">
            <div className="flex items-start gap-4">
              <div className="mt-1 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                <item.icon className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-sm font-bold cursor-pointer" htmlFor={item.key}>{item.label}</Label>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
            {item.type === 'slider' ? (
              <div className="w-32 pt-2">
                <Slider
                  value={[preferences?.[item.key] ?? 24]}
                  min={item.min}
                  max={item.max}
                  step={1}
                  onValueChange={(val) => onChange(item.key, val[0])}
                />
                <div className="text-[10px] text-right mt-1 text-muted-foreground">{preferences?.[item.key] ?? 24}h</div>
              </div>
            ) : (
              <Switch 
                id={item.key} 
                checked={preferences?.[item.key] ?? false} 
                onCheckedChange={(val) => onChange(item.key, val)}
              />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
