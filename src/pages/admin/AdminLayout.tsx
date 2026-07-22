import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard, Stethoscope, Calendar, Users, Tag, Building2, LogOut, Home,
  ShieldCheck, Zap, Mail, CalendarCheck, UserPlus, History, FileText, Inbox,
  UserCheck, Search, Moon, Sun, Plus, ChevronDown, User, UserX, BarChart3,
  FileStack, MapPin, MessageSquareQuote, HelpCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import AdminNotifications from "@/components/admin/AdminNotifications";
import { usePermissions } from "@/hooks/usePermissions";

type LinkItem = { to: string; icon: any; label: string; end?: boolean; staff?: boolean; adminOnly?: boolean; module?: string; children?: { to: string; label: string; end?: boolean }[] };
type Section = { title: string; items: LinkItem[] };

const sections: Section[] = [
  {
    title: "Main Menu",
    items: [
      { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true, staff: true },
    ],
  },
  {
    title: "Clinic",
    items: [
      {
        to: "/admin/doctors", icon: Stethoscope, label: "Doctors", module: "Doctors",
        children: [
          { to: "/admin/doctors", label: "Doctors", end: true },
          { to: "/admin/doctors/details", label: "Doctor Details" },
          { to: "/admin/doctors/new", label: "Add Doctor" },
          { to: "/admin/doctors/schedule", label: "Doctor Schedule" },
        ],
      },
      {
        to: "/admin/patients", icon: Users, label: "Patients", module: "Patients",
        children: [
          { to: "/admin/patients", label: "Patients", end: true },
          { to: "/admin/patients/details", label: "Patient Details" },
          { to: "/admin/patients/create", label: "Create Patient" },
        ],
      },
      {
        to: "/admin/appointments", icon: Calendar, label: "Appointments", module: "Appointments", staff: true,
        children: [
          { to: "/admin/appointments", label: "Appointments", end: true },
          { to: "/admin/appointments/new", label: "New Appointment" },
          { to: "/admin/appointments/calendar", label: "Calendar" },
          { to: "/admin/appointments/kanban", label: "Kanban View" },
          { to: "/admin/appointments/requests", label: "Appointment Requests" },
        ],
      },
      { to: "/admin/specialties", icon: Tag, label: "Specialties", module: "Specialties" },
      { to: "/admin/clinics", icon: Building2, label: "Clinics", module: "Clinics" },
      { to: "/admin/clinics/audit", icon: History, label: "Clinic Audit", module: "Clinics" },
    ],
  },
  {
    title: "Content & Comms",
    items: [
      { to: "/admin/blog", icon: FileText, label: "Blog", module: "Blog" },
      { to: "/admin/messages", icon: Inbox, label: "Messages", module: "Messages", staff: true },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        to: "/admin/users", icon: User, label: "Users", adminOnly: true,
        children: [
          { to: "/admin/roles", label: "Roles & Permissions" },
          { to: "/admin/delete-requests", label: "Delete Account Request" },
        ],
      },
      { to: "/admin/reports", icon: BarChart3, label: "Reports", module: "Reports" },
    ],
  },
  {
    title: "Content",
    items: [
      { to: "/admin/pages", icon: FileStack, label: "Pages", adminOnly: true },
      { to: "/admin/location", icon: MapPin, label: "Location", adminOnly: true },
      { to: "/admin/testimonials", icon: MessageSquareQuote, label: "Testimonials", adminOnly: true },
      { to: "/admin/faq", icon: HelpCircle, label: "FAQ", adminOnly: true },
    ],
  },
  {
    title: "System",
    items: [
      { to: "/admin/verify-assistants", icon: UserCheck, label: "Verify Assistants", adminOnly: true },
    ],
  },
];

const AdminLayout = () => {
  const { signOut, user, isAdmin, isAssistant } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (label: string) =>
    setOpenGroups((g) => ({ ...g, [label]: !g[label] }));
  const [adminName, setAdminName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [dark, setDark] = useState<boolean>(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

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

  const toggleTheme = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    setDark(next);
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <Link to="/" className="p-5 flex items-center gap-3">
          <img src={logo} alt="La Dune" className="h-9" />
        </Link>

        {/* Clinic switcher card */}
        <div className="mx-4 mb-4 p-3 rounded-xl border border-border bg-muted/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
            LD
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">La Dune Clinic</div>
            <div className="text-[11px] text-muted-foreground truncate">Dental Care</div>
          </div>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto pb-4 space-y-5">
          {sections.map((section) => {
            const visible = section.items.filter((l) => isAdmin || l.staff);
            if (visible.length === 0) return null;
            return (
              <div key={section.title}>
                <div className="px-3 mb-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  {section.title}
                </div>
                <div className="space-y-1">
                  {visible.map((l) => {
                    if (l.children && l.children.length) {
                      const groupActive = l.children.some((c) =>
                        c.end ? location.pathname === c.to : location.pathname.startsWith(c.to)
                      );
                      const open = openGroups[l.label] ?? groupActive;
                      return (
                        <div key={l.to}>
                          <button
                            type="button"
                            onClick={() => toggleGroup(l.label)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                              groupActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <l.icon className="w-4 h-4" />
                            <span className="flex-1 text-left">{l.label}</span>
                            <ChevronDown
                              className={cn("w-4 h-4 transition-transform", open && "rotate-180")}
                            />
                          </button>
                          {open && (
                            <div className="mt-1 ml-4 pl-4 border-l border-border space-y-0.5">
                              {l.children.map((c) => (
                                <NavLink
                                  key={c.to}
                                  to={c.to}
                                  end={c.end}
                                  className={({ isActive }) =>
                                    cn(
                                      "flex items-center gap-3 pl-3 pr-3 py-1.5 rounded-md text-sm transition-colors relative",
                                      isActive
                                        ? "text-primary font-semibold"
                                        : "text-muted-foreground hover:text-foreground"
                                    )
                                  }
                                >
                                  {({ isActive }) => (
                                    <>
                                      <span
                                        className={cn(
                                          "w-1.5 h-1.5 rounded-full",
                                          isActive ? "bg-primary" : "bg-muted-foreground/30"
                                        )}
                                      />
                                      {c.label}
                                    </>
                                  )}
                                </NavLink>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return (
                      <NavLink
                        key={l.to}
                        to={l.to}
                        end={l.end}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-soft"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )
                        }
                      >
                        <l.icon className="w-4 h-4" />
                        {l.label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate("/")}>
            <Home className="w-4 h-4 mr-2" />View Site
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-destructive hover:text-destructive"
            onClick={async () => { await signOut(); navigate("/"); }}>
            <LogOut className="w-4 h-4 mr-2" />Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-10 bg-card/90 backdrop-blur border-b border-border px-6 py-3 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patients, doctors, appointments…" className="pl-9 bg-muted/50 border-0" />
          </div>
          <div className="flex-1" />
          <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <AdminNotifications />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2 bg-gradient-primary text-primary-foreground">
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
              <DropdownMenuItem onClick={() => (window.location.href = "mailto:")}>
                <Mail className="w-4 h-4 mr-2" />Email support
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/profile" className="flex items-center gap-2 pl-2 border-l border-border ml-1" title="Edit profile">
            <Avatar className="w-9 h-9 border border-border">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={adminName} />}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-sm font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                {adminName}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {isAdmin ? "Admin" : isAssistant ? "Assistant" : ""}
              </span>
            </div>
          </Link>
        </header>

        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
