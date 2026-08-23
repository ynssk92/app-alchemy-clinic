import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, User, Stethoscope, Briefcase, RefreshCw, Key } from "lucide-react";
import { toast } from "sonner";

export const RoleVerification = () => {
  const { user, permissions } = useAuth();
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRole = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setCurrentRole(data?.role || "patient");
    } catch (error) {
      console.error("Error fetching role:", error);
      toast.error("Failed to fetch current role");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRole();
  }, [user]);

  const switchRole = async (role: "admin" | "doctor" | "assistant" | "user") => {
    if (!user) return;
    setLoading(true);
    try {
      // Delete existing roles first
      await supabase.from("user_roles").delete().eq("user_id", user.id);
      
      if (role !== "user") {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: user.id, role });
        if (error) throw error;
      }

      toast.success(`Role switched to ${role}. Refreshing permissions...`);
      // Force refresh to update useAuth state across the app
      window.location.reload();
    } catch (error: any) {
      console.error("Error switching role:", error);
      toast.error(`Failed to switch role: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" />
                Role Verification Tool
              </CardTitle>
              <CardDescription>
                Test dynamic role-based permissions by switching your current account's role.
              </CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={fetchRole} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin w-4 h-4" : "w-4 h-4"} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current User</span>
              <p className="font-medium">{user.email}</p>
            </div>
            <div className="text-right space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Role</span>
              <div>
                <Badge variant={currentRole === "admin" ? "default" : "secondary"} className="capitalize">
                  {currentRole || "Patient"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant={currentRole === "admin" ? "default" : "outline"}
              className="h-24 flex-col gap-2 rounded-2xl"
              onClick={() => switchRole("admin")}
              disabled={loading}
            >
              <ShieldCheck className="w-6 h-6" />
              <span>Admin</span>
            </Button>
            
            <Button 
              variant={currentRole === "doctor" ? "default" : "outline"}
              className="h-24 flex-col gap-2 rounded-2xl"
              onClick={() => switchRole("doctor")}
              disabled={loading}
            >
              <Stethoscope className="w-6 h-6" />
              <span>Doctor</span>
            </Button>
            
            <Button 
              variant={currentRole === "assistant" ? "default" : "outline"}
              className="h-24 flex-col gap-2 rounded-2xl"
              onClick={() => switchRole("assistant")}
              disabled={loading}
            >
              <Briefcase className="w-6 h-6" />
              <span>Assistant</span>
            </Button>
            
            <Button 
              variant={!currentRole || currentRole === "patient" ? "default" : "outline"}
              className="h-24 flex-col gap-2 rounded-2xl"
              onClick={() => switchRole("user")}
              disabled={loading}
            >
              <User className="w-6 h-6" />
              <span>Patient</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Active Permissions
          </CardTitle>
          <CardDescription>
            These permissions are inherited from your current role and enforced by the backend.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {permissions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {permissions.sort().map((perm) => (
                <Badge key={perm} variant="outline" className="bg-primary/5 border-primary/20 text-primary font-mono text-[11px]">
                  {perm}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center italic">
              No specific staff permissions assigned (Patient access only).
            </p>
          )}
        </CardContent>
      </Card>
      
      <div className="text-[11px] text-muted-foreground bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900/50">
        <strong>Security Warning:</strong> This tool modifies the <code>user_roles</code> table in the real database. 
        Backend RLS policies will immediately begin enforcing permissions based on your selection.
        Administrators have full access (bypass) regardless of mapped permissions.
      </div>
    </div>
  );
};

export default RoleVerification;