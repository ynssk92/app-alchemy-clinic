import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type PermAction = "view" | "create" | "edit" | "delete";
export type PermMap = Record<string, Partial<Record<PermAction, boolean>>>;

export const usePermissions = () => {
  const { isAdmin, permissions, loading: authLoading } = useAuth();

  const can = useCallback(
    (module: string, action: PermAction = "view") => {
      if (isAdmin) return true;
      
      // Map module and action to the new backend permission string format
      // Format: module.action (e.g., patients.view)
      const permKey = `${module.toLowerCase()}.${action}`;
      return permissions.includes(permKey);
    },
    [isAdmin, permissions]
  );

  return { can, perms: permissions, loading: authLoading, isAdmin };
};
