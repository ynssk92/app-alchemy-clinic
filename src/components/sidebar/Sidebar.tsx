import { ReactNode } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  useSidebar,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
} from "./SidebarContext";

type SidebarProps = {
  header: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

const SidebarShell = ({ header, footer, children }: SidebarProps) => {
  const { collapsed } = useSidebar();
  return (
    <aside
      aria-label="Primary"
      style={{
        width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
      }}
      className={cn(
        "hidden md:flex flex-col shrink-0 bg-card border-r border-border overflow-hidden",
        "transition-[width] duration-300 ease-in-out will-change-[width]",
      )}
    >
      <div className="shrink-0">{header}</div>
      <nav
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-5",
          collapsed ? "px-2" : "px-3",
        )}
      >
        {children}
      </nav>
      {footer && <div className="shrink-0">{footer}</div>}
    </aside>
  );
};

const SidebarDrawer = ({ header, footer, children }: SidebarProps) => {
  const { mobileOpen, setMobileOpen } = useSidebar();
  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent
        side="bottom"
        className="p-0 h-[85vh] rounded-t-2xl border-t border-border bg-card flex flex-col"
      >
        <div className="relative shrink-0 pt-3">
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-2 -translate-x-1/2 h-1.5 w-12 rounded-full bg-muted"
          />
          {header}
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-base [&_a]:min-h-12 [&_button]:min-h-12">
          {children}
        </nav>
        {footer && (
          <div className="shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export const Sidebar = (props: SidebarProps) => {
  return (
    <>
      <SidebarShell {...props} />
      <SidebarDrawer {...props} />
    </>
  );
};

export * from "./SidebarContext";
export { SidebarGroup } from "./SidebarGroup";
export { SidebarItem } from "./SidebarItem";
export { SidebarFooter } from "./SidebarFooter";
export { SidebarToggle } from "./SidebarToggle";
export { SidebarTooltip } from "./SidebarTooltip";
