import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Stethoscope, Calendar, Users, Tag, Building2, LogOut, Home, ShieldCheck, Zap, Mail, CalendarCheck, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";


const links = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/admin/doctors", icon: Stethoscope, label: "Doctors" },
  { to: "/admin/appointments", icon: Calendar, label: "Appointments" },
  { to: "/admin/patients", icon: Users, label: "Patients" },
  { to: "/admin/specialties", icon: Tag, label: "Specialties" },
  { to: "/admin/clinics", icon: Building2, label: "Clinics" },
];

const AdminLayout = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
      .then(({ data }) => setAdminName(data?.full_name || user.email?.split("@")[0] || "Admin"));
  }, [user]);

  return (
    <div className="min-h-screen flex bg-muted/20">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <Link to="/" className="p-6 border-b border-border flex items-center gap-3">
          <img src={logo} alt="HealthBook" className="h-8" />
        </Link>


        <nav className="flex-1 p-4 space-y-1">
          {links.map((l) => (
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
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span className="font-semibold truncate" title={adminName}>{adminName}</span>
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
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
