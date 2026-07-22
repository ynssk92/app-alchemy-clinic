import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Stethoscope, Calendar, Users, Tag, Building2, LogOut, Home, ShieldCheck, Zap, Mail, CalendarCheck, UserPlus, History, FileText, Inbox, UserCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import AdminNotifications from "@/components/admin/AdminNotifications";


const links = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true, staff: true },
  { to: "/admin/doctors", icon: Stethoscope, label: "Doctors" },
  { to: "/admin/appointments", icon: Calendar, label: "Appointments", staff: true },
  { to: "/admin/patients", icon: Users, label: "Patients" },
  { to: "/admin/specialties", icon: Tag, label: "Specialties" },
  { to: "/admin/clinics", icon: Building2, label: "Clinics" },
  { to: "/admin/clinics/audit", icon: History, label: "Clinic Audit" },
  { to: "/admin/blog", icon: FileText, label: "Blog" },
  { to: "/admin/messages", icon: Inbox, label: "Messages", staff: true },
  { to: "/admin/verify-assistants", icon: UserCheck, label: "Verify Assistants" },
];

const AdminLayout = () => {
  const { signOut, user, isAdmin, isAssistant } = useAuth();
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle()
      .then(async ({ data }) => {
        setAdminName(data?.full_name || user.email?.split("@")[0] || "Admin");
        if (data?.avatar_url) {
          const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(data.avatar_url, 3600);
          setAvatarUrl(signed?.signedUrl || null);
        } else {
          setAvatarUrl(null);
        }
      });
  }, [user]);

  const initials = (adminName || "A").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen flex bg-muted/20">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <Link to="/" className="p-6 border-b border-border flex items-center gap-3">
          <img src={logo} alt="HealthBook" className="h-8" />
        </Link>


        <nav className="flex-1 p-4 space-y-1">
          {links.filter((l) => isAdmin || l.staff).map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          {adminName && (
            <div className="flex items-center gap-2 px-2 pb-2 text-sm">
              <Avatar className="w-8 h-8 shrink-0 border border-border">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={adminName} />}
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 min-w-0">
                <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="font-semibold truncate" title={adminName}>{adminName}</span>
                <span className="ml-1 text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">
                  {isAdmin ? "Admin" : isAssistant ? "Assistant" : ""}
                </span>
              </div>
            </div>
          )}
          <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/")}>
            <Home className="w-4 h-4 mr-2" />View Site
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={async () => { await signOut(); navigate("/"); }}>
            <LogOut className="w-4 h-4 mr-2" />Sign Out
          </Button>
        </div>

      </aside>

      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-card/80 backdrop-blur border-b border-border px-8 py-3 flex items-center justify-end gap-3">
          <Link to="/profile" className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity" title="Edit profile">
            <Avatar className="w-8 h-8 border border-border">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={adminName} />}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <span className="font-medium hidden sm:inline">{adminName}</span>
          </Link>
          <AdminNotifications />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2">
                <Zap className="w-4 h-4" />Quick Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover">
              <DropdownMenuLabel>Common tasks</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isAdmin && (
                <>
                  <DropdownMenuItem onClick={() => navigate("/admin/patients")}>
                    <UserPlus className="w-4 h-4 mr-2" />Manage admin invites
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin/patients")}>
                    <Users className="w-4 h-4 mr-2" />View patients
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={() => navigate("/admin/appointments")}>
                <CalendarCheck className="w-4 h-4 mr-2" />Check appointments
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/admin/messages")}>
                <Inbox className="w-4 h-4 mr-2" />View messages
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/admin/doctors")}>
                    <Stethoscope className="w-4 h-4 mr-2" />Add / edit doctors
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={() => window.location.href = "mailto:"}>
                <Mail className="w-4 h-4 mr-2" />Email support
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;
