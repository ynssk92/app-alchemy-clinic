import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "./SidebarContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Wraps a child with a tooltip that appears only when the sidebar is collapsed. */
export const SidebarTooltip = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => {
  const { collapsed, device } = useSidebar();
  const reduced = useReducedMotion();
  if (!collapsed || device === "mobile") return <>{children}</>;
  return (
    <TooltipProvider delayDuration={reduced ? 0 : 80}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={12}
          className="rounded-lg border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-black/40"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
