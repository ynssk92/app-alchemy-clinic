import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  User, 
  Settings, 
  LogOut, 
  Home, 
  Activity,
  Award,
  ShieldCheck,
  Stethoscope,
  Users
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useAppSettings } from "@/hooks/useAppSettings";
import {
  Sidebar,
  SidebarProvider,
  SidebarGroup,
  SidebarItem,
  SidebarFooter,
  SidebarToggle,
  SidebarTooltip,
  useSidebar,
} from "@/components/sidebar/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import LanguageToggle from "@/components/LanguageToggle";

const SidebarHeader = () => {
  const { collapsed } = useSidebar();
  const { logoUrl } = useAppSettings();
  return (
    <div
      className={cn(
        "flex items-center border-b py-3 gap-2",
        collapsed
          ? "flex-col px-2 border-slate-800/80"
          : "px-3 border-border",
      )}
    >
      <Link
        to="/"
        className={cn(
          "flex items-center gap-2 min-w-0 flex-1 rounded-md px-1 py-1 hover:bg-muted transition-colors",
          collapsed && "justify-center"
        )}
      >
        <img
          src={logoUrl}
          alt="La Dune Clinique Dentaire"
          className={cn("shrink-0 object-contain h-10 w-auto", collapsed ? "w-8 h-8" : "max-w-full")}
        />
      </Link>
      {!collapsed && <SidebarToggle />}
    </div>
  );
};

export const PatientDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const [profileName, setProfileName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle()
      .then(async ({ data }) => {
        setProfileName(data?.full_name || user.email?.split("@")[0] || "Patient");
        if (data?.avatar_url) {
          const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(data.avatar_url, 3600);
          setAvatarUrl(signed?.signedUrl ?? null);
        }
      });
  }, [user]);

  const initials = (profileName || "P").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <Sidebar
          header={<SidebarHeader />}
          footer={
            <SidebarFooter>
              <SidebarTooltip label="Settings">
                <Link to="/profile" className="flex items-center justify-center w-12 h-12 rounded-xl hover:bg-muted">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                </Link>
              </SidebarTooltip>
              <SidebarTooltip label="Sign Out">
                <button onClick={() => signOut()} className="flex items-center justify-center w-12 h-12 rounded-xl hover:bg-destructive/10 text-destructive">
                  <LogOut className="w-5 h-5" />
                </button>
              </SidebarTooltip>
            </SidebarFooter>
          }
        >
          <SidebarGroup title="Menu">
            <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" end />
            <SidebarItem to="/doctors" icon={Stethoscope} label="Book Visit" />
            <SidebarItem to="/equipe" icon={Users} label="Our Team" />
          </SidebarGroup>
          <SidebarGroup title="Account">
            <SidebarItem to="/profile" icon={User} label="Profile" />
          </SidebarGroup>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarToggle className="md:hidden" />
              <h2 className="text-sm font-bold tracking-tight text-foreground hidden sm:block">Patient Portal</h2>
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <Link to="/profile" className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-muted transition-colors">
                <Avatar className="w-8 h-8">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={profileName} />}
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-semibold hidden lg:block">{profileName}</span>
              </Link>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
