import { Card } from "@/components/ui/card";
import { Lock, Eye, Download, Trash2, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface PrivacyProps {
  settings: any;
  onChange: (key: string, value: any) => void;
}

export const PrivacySettingsCard = ({ settings, onChange }: PrivacyProps) => {
  return (
    <Card className="p-8 border-border bg-card shadow-sm rounded-[24px] mt-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Shield className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold">Privacy Settings</h3>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-bold">Profile Visibility</Label>
            <p className="text-xs text-muted-foreground">Who can see your medical profile information</p>
          </div>
          <Select 
            value={settings?.profile_visibility || "private"} 
            onValueChange={(val) => onChange("profile_visibility", val)}
          >
            <SelectTrigger className="w-[140px] rounded-xl h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="authorized">Clinicians only</SelectItem>
              <SelectItem value="public">Public</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-bold">Data Sharing</Label>
            <p className="text-xs text-muted-foreground">Allow sharing anonymized data for health research</p>
          </div>
          <Switch 
            checked={settings?.data_sharing ?? false} 
            onCheckedChange={(val) => onChange("data_sharing", val)}
          />
        </div>

        <div className="pt-6 border-t border-border flex flex-col sm:flex-row gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
            <Download className="w-4 h-4" />
            Download My Data
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-rose-100 text-rose-600 bg-rose-50/50 text-sm font-medium hover:bg-rose-50 transition-colors">
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>
    </Card>
  );
};
