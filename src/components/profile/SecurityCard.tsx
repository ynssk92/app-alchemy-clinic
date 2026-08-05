import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, ShieldCheck, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SecurityCardProps {
  onUpdatePassword: (password: string) => void;
  loading: boolean;
}

export const SecurityCard = ({ onUpdatePassword, loading }: SecurityCardProps) => {
  const [showPass, setShowPass] = useState(false);
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleUpdate = () => {
    if (pass !== confirm) return; // Should be handled by parent or local validation
    onUpdatePassword(pass);
  };

  const strength = pass.length === 0 ? 0 : pass.length < 6 ? 25 : pass.length < 10 ? 60 : 100;
  const strengthColor = strength < 40 ? "bg-rose-500" : strength < 70 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <Card className="p-8 border-border bg-card shadow-sm rounded-[24px] mt-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold">Security & Password</h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              type={showPass ? "text" : "password"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="pl-11 pr-11 h-[52px] rounded-2xl bg-muted/30 border-border/50" 
              placeholder="••••••••"
            />
            <button 
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="px-1 pt-1">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${strengthColor}`} 
                style={{ width: `${strength}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last updated: Never
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              type={showPass ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="pl-11 h-[52px] rounded-2xl bg-muted/30 border-border/50" 
              placeholder="••••••••"
            />
          </div>
        </div>

        <Button 
          onClick={handleUpdate}
          disabled={loading || !pass || pass !== confirm}
          className="w-full sm:w-auto px-8 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
        >
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </Card>
  );
};
