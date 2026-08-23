import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ShieldCheck, 
  User, 
  Stethoscope, 
  Briefcase, 
  RefreshCw, 
  Key, 
  Search, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
};

export const RoleVerification = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedUserRole, setSelectedUserRole] = useState<string | null>(null);
  const [selectedUserPermissions, setSelectedUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      // Search in profiles and join with user_roles
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          user_roles (role)
        `)
        .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(5);

      if (error) throw error;
      
      const formattedUsers: UserProfile[] = (data || []).map((u: any) => ({
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        role: u.user_roles?.[0]?.role || "patient"
      }));
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const selectUser = async (user: UserProfile) => {
    setSelectedUser(user);
    setSelectedUserRole(user.role);
    fetchUserPermissions(user.role || "patient");
  };

  const fetchUserPermissions = async (role: string) => {
    try {
      if (role === "admin") {
        setSelectedUserPermissions(["Full System Access (Bypass)"]);
        return;
      }
      const { data, error } = await supabase
        .from("role_permissions" as any)
        .select("permission")
        .eq("role", role);

      if (error) throw error;
      setSelectedUserPermissions((data || []).map((p: any) => p.permission));
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const handleSwitchRole = (role: string) => {
    if (!selectedUser) return;
    if (selectedUser.id === currentUser?.id) {
      toast.error("You cannot change your own role through this tool.");
      return;
    }
    setPendingRole(role);
    setConfirmDialogOpen(true);
  };

  const confirmRoleSwitch = async () => {
    if (!selectedUser || !pendingRole) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc("manage_user_role", {
        target_user_id: selectedUser.id,
        new_role: pendingRole
      });

      if (error) throw error;

      toast.success(`Role for ${selectedUser.email} updated to ${pendingRole}`);
      
      // Update local state
      const updatedUser = { ...selectedUser, role: pendingRole };
      setSelectedUser(updatedUser);
      setSelectedUserRole(pendingRole);
      fetchUserPermissions(pendingRole);
      
      // Refresh search results to show updated role
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
      
    } catch (error: any) {
      console.error("Error switching role:", error);
      toast.error(error.message || "Failed to switch role");
    } finally {
      setLoading(false);
      setConfirmDialogOpen(false);
      setPendingRole(null);
    }
  };

  if (!isAdmin) {
    return (
      <Card className="max-w-md mx-auto mt-20 border-destructive/20 shadow-xl">
        <CardHeader className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription>
            Only administrators are authorized to access this tool.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-primary" />
          Role Management & Verification
        </h1>
        <p className="text-slate-500 font-medium max-w-2xl">
          Authorized Admin Interface for managing user roles and auditing inherited permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search and Select */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-sm border-slate-200 rounded-[24px] overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                Find User
              </CardTitle>
              <CardDescription>Search by name or email address</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. John Doe or user@example.com" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                  className="rounded-xl border-slate-200"
                />
                <Button onClick={searchUsers} disabled={loading} className="rounded-xl">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>

              <div className="space-y-2 mt-4">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => selectUser(u)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      selectedUser?.id === u.id 
                      ? "bg-primary/5 border-primary shadow-sm" 
                      : "bg-white border-slate-100 hover:border-primary/40 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-bold text-slate-900">{u.full_name || "Unnamed"}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize px-3">
                      {u.role}
                    </Badge>
                  </button>
                ))}
                {users.length === 0 && searchQuery && !loading && (
                  <p className="text-sm text-center py-6 text-slate-400 italic">No users found matching your search.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {currentUser && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex gap-3 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Self-Protection Enabled:</strong> You are currently logged in as <strong>{currentUser.email}</strong>. 
                You cannot modify your own role through this interface to prevent accidental lockout.
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Manage Selected User */}
        <div className="lg:col-span-7 space-y-6">
          {selectedUser ? (
            <>
              <Card className="shadow-md border-primary/10 rounded-[24px] overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Manage Role: {selectedUser.full_name || selectedUser.email}
                      </CardTitle>
                      <CardDescription>{selectedUser.email}</CardDescription>
                    </div>
                    <Badge variant={selectedUserRole === "admin" ? "default" : "secondary"} className="text-sm px-4 py-1 rounded-full capitalize">
                      Active: {selectedUserRole || "Patient"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-8 space-y-8">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { id: "admin", icon: ShieldCheck, label: "Admin" },
                      { id: "doctor", icon: Stethoscope, label: "Doctor" },
                      { id: "assistant", icon: Briefcase, label: "Assistant" },
                      { id: "patient", icon: User, label: "Patient" },
                    ].map((role) => (
                      <Button
                        key={role.id}
                        variant={selectedUserRole === role.id ? "default" : "outline"}
                        className={`h-28 flex-col gap-3 rounded-[24px] transition-all border-2 ${
                          selectedUserRole === role.id 
                          ? "border-primary shadow-lg scale-105" 
                          : "border-slate-100 hover:border-primary/40"
                        }`}
                        onClick={() => handleSwitchRole(role.id)}
                        disabled={loading || selectedUser.id === currentUser?.id}
                      >
                        <role.icon className={`w-8 h-8 ${selectedUserRole === role.id ? "text-white" : "text-primary"}`} />
                        <span className="font-bold">{role.label}</span>
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Key className="w-4 h-4 text-primary" />
                        Inherited Permissions
                      </h3>
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-slate-200">
                        Read Only
                      </Badge>
                    </div>
                    
                    <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-100">
                      {selectedUserPermissions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedUserPermissions.sort().map((perm) => (
                            <Badge key={perm} variant="outline" className="bg-white border-primary/20 text-primary font-mono text-[11px] px-2 py-1">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic py-2">
                          No specific staff permissions assigned for the Patient role.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 bg-blue-50/50 rounded-[24px] border border-blue-100 flex gap-4 text-sm text-blue-700 leading-relaxed">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  <strong>Role Management Audit:</strong> Changing a user's role will immediately update their access levels across the entire application. 
                  Role permissions are globally defined — changing a role for this user will not affect other users with the same role, but it will change which role-based permissions this specific user inherits.
                </p>
              </div>
            </>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200 p-8 text-center animate-in fade-in">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-slate-100">
                <User className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Select a User to Manage</h3>
              <p className="text-slate-500 max-w-xs mx-auto">
                Search for a user by name or email on the left to view their current role and permissions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-md rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Confirm Role Change</DialogTitle>
            <DialogDescription>
              You are about to modify the system access for this user.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <div className="p-4 bg-muted/50 rounded-2xl space-y-2 border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">User:</span>
                <span className="font-bold">{selectedUser?.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Role:</span>
                <Badge variant="outline" className="capitalize">{selectedUserRole}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-bold text-primary">New Role:</span>
                <Badge className="capitalize bg-primary">{pendingRole}</Badge>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground italic">
              * This change will be logged and applied immediately.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setConfirmDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={confirmRoleSwitch} disabled={loading} className="rounded-xl px-8 shadow-lg shadow-primary/20">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm Role Switch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleVerification;
