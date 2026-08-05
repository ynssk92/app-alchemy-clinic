import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Shield, Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

interface ProfileOverviewProps {
  user: any;
  profile: any;
  avatarUrl: string | null;
  onUploadClick: () => void;
  uploading: boolean;
}

export const ProfileOverviewCard = ({ user, profile, avatarUrl, onUploadClick, uploading }: ProfileOverviewProps) => {
  const initials = (profile?.full_name || user?.email || "?").slice(0, 2).toUpperCase();

  return (
    <Card className="p-6 border-border bg-card shadow-sm rounded-[24px]">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <Avatar className="w-24 h-24 border-4 border-white shadow-medium">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="Avatar" /> : null}
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <h2 className="text-xl font-bold">{profile?.full_name || "User"}</h2>
        <p className="text-muted-foreground text-sm mb-6">{user?.email}</p>
        
        <button 
          onClick={onUploadClick}
          disabled={uploading}
          className="w-full py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          {uploading ? "Uploading..." : "Change Photo"}
        </button>
      </div>

      <div className="mt-8 space-y-4 pt-6 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <span className="font-medium text-emerald-600 capitalize">{profile?.status || "Active"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Joined</span>
          <span className="font-medium">{format(new Date(profile?.created_at || new Date()), "MMM d, yyyy")}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">User ID</span>
          <span className="font-mono text-xs opacity-70">{user?.id.slice(0, 8)}</span>
        </div>
      </div>
    </Card>
  );
};
