import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard, Stethoscope, Calendar, Users, Tag, Building2, LogOut, Home,
  ShieldCheck, Zap, Mail, CalendarCheck, UserPlus, History, FileText, Inbox,
  UserCheck, Search, Moon, Sun, User, BarChart3,
  FileStack, MapPin, MessageSquareQuote, HelpCircle, Receipt, Menu, Settings,
  FolderOpen, Globe, Layers, MessageSquare, Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppSettings } from "@/hooks/useAppSettings";
import { cn } from "@/lib/utils";
import AdminNotifications from "@/components/admin/AdminNotifications";
import LanguageToggle from "@/components/LanguageToggle";
import { usePermissions } from "@/hooks/usePermissions";
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

type LinkItem = { to: string; icon: any; label: string; end?: boolean; staff?: boolean; adminOnly?: boolean; module?: string; action?: "view" | "create" | "edit" | "delete"; children?: { to: string; label: string; end?: boolean }[] };
type Section = { title: string; items: LinkItem[] };

const sections: Section[] = [
  {
    title: "Main",
    items: [
      { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true, staff: true },
      { to: "/admin/pages", icon: FileStack, label: "Website CMS (Pages)", adminOnly: true },
      { to: "/admin/media", icon: FolderOpen, label: "Media Library", adminOnly: true },

    ],
  },
  {
    title: "Clinic",
    items: [
      {
        to: "/admin/doctors", icon: Stethoscope, label: "Doctors", module: "Doctors",
        children: [
          { to: "/admin/doctors", label: "Doctors" },
          { to: "/admin/doctors/details", label: "Doctor Details" },
          { to: "/admin/doctors/new", label: "Add Doctor" },
          { to: "/admin/doctors/schedule", label: "Doctor Schedule" },
        ],
      },
      {
        to: "/admin/patients", icon: Users, label: "Patients", module: "Patients",
        children: [
          { to: "/admin/patients", label: "Patients" },
          { to: "/admin/patients/details", label: "Patient Details" },
          { to: "/admin/patients/create", label: "Create Patient" },
          { to: "/admin/patients/approvals", label: "Approvals" },
        ],
      },
      {
        to: "/admin/appointments", icon: Calendar, label: "Appointments", module: "Appointments", staff: true,
        children: [
          { to: "/admin/appointments", label: "Appointments" },
          { to: "/admin/appointments/new", label: "New Appointment" },
          { to: "/admin/appointments/calendar", label: "Calendar" },
          { to: "/admin/appointments/kanban", label: "Kanban View" },
          { to: "/admin/appointments/requests", label: "Requests" },
        ],
      },
      { to: "/admin/specialties", icon: Tag, label: "Specialties", module: "Specialties" },
      { to: "/admin/clinics", icon: Building2, label: "Clinics", module: "Clinics" },
      { to: "/admin/clinics/audit", icon: History, label: "Clinic Audit", module: "Clinics" },
    ],
  },
  {
    title: "Billing",
    items: [
      {
        to: "/admin/billing", icon: Receipt, label: "Billing & Services", module: "Billing",
        children: [
          { to: "/admin/billing", label: "Dashboard", end: true },
          { to: "/admin/billing/services", label: "Services Catalog" },
          { to: "/admin/billing/categories", label: "Service Categories" },
          { to: "/admin/billing/invoices", label: "Invoices" },
          { to: "/admin/billing/invoices/new", label: "New Invoice" },
          { to: "/admin/billing/payments", label: "Payments" },
        ],
      },
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
          { to: "/admin/users", label: "Users" },
          { to: "/admin/roles", label: "Roles & Permissions" },
          { to: "/admin/delete-requests", label: "Delete Requests" },
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
      { to: "/admin/settings", icon: Settings, label: "Settings", module: "settings", action: "edit" },
      { to: "/admin/verify-assistants", icon: UserCheck, label: "Verify Assistants", adminOnly: true },
    ],
  },
];

const SidebarHeader = () => {
  const { collapsed } = useSidebar();
  const { logoUrl } = useAppSettings();
  const contentMenuItems = [
    { icon: Globe, label: "Landing Page", path: "/admin/landing-page" },
    { icon: FileText, label: "CMS Pages", path: "/admin/pages" },
    { icon: Layers, label: "Blog", path: "/admin/blog" },
    { icon: MessageSquare, label: "Testimonials", path: "/admin/testimonials" },
    { icon: ImageIcon, label: "Media Library", path: "/admin/media" },
  ];

  return (
    <div
      className={cn(
        "flex items-center border-b py-3 gap-2",
        collapsed
          ? "flex-col px-2 border-slate-800/80"
          : "px-3 border-border",
      )}
    >
      {collapsed ? (
        <>
          <Link
            to="/"
            aria-label="La Dune home"
            className="flex items-center justify-center h-10 w-10 rounded-[12px] transition-transform duration-200 motion-safe:hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
          >
            <img
              src={logoUrl}
              alt="La Dune Clinique Dentaire"
              className="h-8 w-8 object-contain"
            />
          </Link>
          <SidebarToggle />
        </>
      ) : (
        <>
          <Link
            to="/"
            aria-label="La Dune home"
            className="flex items-center gap-2 min-w-0 flex-1 rounded-md px-1 py-1 hover:bg-muted transition-colors"
          >
            <img
              src={logoUrl}
              alt="La Dune Clinique Dentaire"
              className="shrink-0 object-contain h-10 w-auto max-w-full"
            />
          </Link>
          <SidebarToggle />
        </>
      )}
    </div>
  );
};

const SidebarFooterContent = ({
  adminName,
  avatarUrl,
  initials,
  isAdmin,
}: {
  adminName: string;
  avatarUrl: string | null;
  initials: string;
  isAdmin: boolean;
}) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { collapsed } = useSidebar();

  // Collapsed rail: Settings, Profile avatar (tooltip = name), Logout
  if (collapsed) {
    return (
      <SidebarFooter>
        {isAdmin && (
          <SidebarTooltip label="Settings">
            <button
              type="button"
              onClick={() => navigate("/admin/settings")}
              aria-label="Settings"
              className="group relative flex items-center justify-center w-12 h-12 rounded-[14px] text-slate-400 hover:bg-slate-700 hover:text-white transition-[transform,background-color,color] duration-200 ease-out motion-safe:hover:scale-105 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            >
              <Settings className="h-5 w-5" strokeWidth={2} />
            </button>
          </SidebarTooltip>
        )}
        <SidebarTooltip label={adminName || "Profile"}>
          <Link
            to="/profile"
            aria-label={`Profile — ${adminName}`}
            className="group flex items-center justify-center w-12 h-12 rounded-full transition-transform duration-200 ease-out motion-safe:hover:scale-105 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
          >
            <Avatar className="w-10 h-10 ring-2 ring-slate-700 group-hover:ring-primary transition-colors">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={adminName} />}
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
        </SidebarTooltip>
        <SidebarTooltip label="Sign out">
          <button
            type="button"
            onClick={async () => { await signOut(); navigate("/"); }}
            aria-label="Sign out"
            className="group flex items-center justify-center w-12 h-12 rounded-[14px] text-slate-400 hover:bg-destructive/20 hover:text-destructive transition-[transform,background-color,color] duration-200 ease-out motion-safe:hover:scale-105 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/70"
          >
            <LogOut className="h-5 w-5" strokeWidth={2} />
          </button>
        </SidebarTooltip>
      </SidebarFooter>
    );
  }

  // Expanded: unchanged behavior
  const Btn = ({
    icon: Icon, label, onClick, destructive,
  }: { icon: any; label: string; onClick: () => void; destructive?: boolean }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "w-full justify-start transition-colors",
        destructive && "text-destructive hover:text-destructive",
      )}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );

  return (
    <SidebarFooter>
      {isAdmin && <Btn icon={Settings} label="Settings" onClick={() => navigate("/admin/settings")} />}
      <Btn icon={User} label="Profile" onClick={() => navigate("/profile")} />
      <Btn icon={Home} label="View Site" onClick={() => navigate("/")} />
      <Btn icon={LogOut} label="Sign Out" destructive onClick={async () => { await signOut(); navigate("/"); }} />
    </SidebarFooter>
  );
};

const AdminShell = () => {
  const { signOut, user, isAdmin, isAssistant } = useAuth();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const { setMobileOpen } = useSidebar();
  const { logoUrl, mobileLogoUrl } = useAppSettings();
  const [adminName, setAdminName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof document === "undefined") return false;
    const stored = localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

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
  const toggleTheme = () => setDark((d) => !d);

  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Sidebar
        header={<SidebarHeader />}
        footer={
          <SidebarFooterContent
            adminName={adminName}
            avatarUrl={avatarUrl}
            initials={initials}
            isAdmin={isAdmin}
          />
        }
      >
        {sections.map((section) => {
          const visible = section.items.filter((l) => {
            if (isAdmin) return true;
            if (l.adminOnly) return false;
            if (l.module) return can(l.module, l.action ?? "view");
            return !!l.staff;
          });
          if (visible.length === 0) return null;
          return (
            <SidebarGroup key={section.title} title={section.title}>
              {visible.map((l) => 
                l.to === "/admin/pages" || l.to === "/admin/media" || l.to === "/admin/testimonials" || l.to === "/admin/blog" || l.to === "/admin/faq" ? null : (
                  <SidebarItem
                    key={l.to}
                    to={l.to}
                    icon={l.icon}
                    label={l.label}
                    end={l.end}
                    children={l.children}
                  />
                )
              )}
            </SidebarGroup>
          );
        })}

        {isAdmin && (
          <SidebarGroup title="Website & Content">
            <SidebarItem
              icon={Globe}
              label="Landing Page"
              to="/admin/landing-page"
              active={location.pathname === "/admin/landing-page"}
            />
            <SidebarItem
              icon={FileText}
              label="CMS Pages"
              to="/admin/pages"
              active={location.pathname === "/admin/pages"}
            />
            <SidebarItem
              icon={Layers}
              label="Blog"
              to="/admin/blog"
              active={location.pathname === "/admin/blog"}
            />
            <SidebarItem
              icon={MessageSquare}
              label="Testimonials"
              to="/admin/testimonials"
              active={location.pathname === "/admin/testimonials"}
            />
            <SidebarItem
              icon={ImageIcon}
              label="Media Library"
              to="/admin/media"
              active={location.pathname === "/admin/media"}
            />
          </SidebarGroup>
        )}
      </Sidebar>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="sticky top-0 z-10 bg-card/90 backdrop-blur border-b border-border px-4 md:px-6 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </Button>
          <Link to="/" aria-label="La Dune home" className="md:hidden flex items-center shrink-0">
            <img src={mobileLogoUrl} alt="La Dune Clinique Dentaire" className="h-8 w-auto object-contain" />
          </Link>
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patients, doctors, appointments…" className="pl-9 bg-muted/50 border-0" />
          </div>
          <div className="flex-1" />
          <LanguageToggle />
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <AdminNotifications />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2 bg-gradient-primary text-primary-foreground">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Quick Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover">
              <DropdownMenuLabel>Common tasks</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isAdmin && (
                <>
                  <DropdownMenuItem onClick={() => navigate("/admin/users")}>
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

          <Link to="/profile" className="flex items-center gap-2 pl-2 border-l border-border ml-1" aria-label="Edit profile">
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

const AdminLayout = () => (
  <SidebarProvider>
    <AdminShell />
  </SidebarProvider>
);

export default AdminLayout;
