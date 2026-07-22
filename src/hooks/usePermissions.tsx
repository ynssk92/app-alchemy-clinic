import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type PermAction = "view" | "create" | "edit" | "delete";
export type PermMap = Record<string, Partial<Record<PermAction, boolean>>>;

export const usePermissions = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [perms, setPerms] = useState<PermMap>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setPerms({});
      setLoading(false);
      return;
    }
    if (isAdmin) {
      setPerms({});
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("user_role_assignments")
      .select("roles(status, permissions)")
      .eq("user_id", user.id);
    const merged: PermMap = {};
    (data || []).forEach((row: any) => {
      const r = row.roles;
      if (!r || r.status !== "active") return;
      const p = (r.permissions || {}) as PermMap;
      Object.entries(p).forEach(([mod, actions]) => {
        merged[mod] = { ...(merged[mod] || {}), ...actions };
      });
    });
    setPerms(merged);
    setLoading(false);
  }, [user, isAdmin]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  const can = useCallback(
    (module: string, action: PermAction = "view") => {
      if (isAdmin) return true;
      return !!perms[module]?.[action];
    },
    [isAdmin, perms]
  );

  return { can, perms, loading: loading || authLoading, isAdmin };
};
