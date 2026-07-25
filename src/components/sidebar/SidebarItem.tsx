import { LucideIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";
import { SidebarTooltip } from "./SidebarTooltip";

export type SidebarChild = { to: string; label: string; end?: boolean };

export type SidebarItemProps = {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
  children?: SidebarChild[];
};

export const SidebarItem = ({ to, icon: Icon, label, end, children }: SidebarItemProps) => {
  const { collapsed, setMobileOpen, device } = useSidebar();
  const { pathname } = useLocation();

  const matches = (target: string, exact?: boolean) =>
    exact ? pathname === target : pathname === target || pathname.startsWith(target + "/");

  // Pick the single best (longest) matching child so only one child highlights.
  const activeChildTo = useMemo(() => {
    if (!children?.length) return null;
    let best: { to: string; len: number } | null = null;
    for (const c of children) {
      if (!matches(c.to, c.end)) continue;
      if (!best || c.to.length > best.len) best = { to: c.to, len: c.to.length };
    }
    return best?.to ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, pathname]);

  const isChildActive = activeChildTo !== null;
  const [open, setOpen] = useState(isChildActive);


  const closeMobile = () => device === "mobile" && setMobileOpen(false);

  // When collapsed, groups collapse into a single icon link to the parent route.
  if (children && children.length && !collapsed) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            "group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
            isChildActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {isChildActive && (
            <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-primary" />
          )}
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="flex-1 truncate text-left">{label}</span>
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")}
            aria-hidden="true"
          />
        </button>
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-out",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="mt-1 ml-4 space-y-0.5 border-l border-border pl-3">
              {children.map((c) => (
                <NavLink
                  key={c.to}
                  to={c.to}
                  end={c.end}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                      isActive
                        ? "font-semibold text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full transition-colors",
                          isActive ? "bg-primary" : "bg-muted-foreground/30",
                        )}
                      />
                      {c.label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarTooltip label={label}>
      <NavLink
        to={to}
        end={end}
        onClick={closeMobile}
        aria-label={label}
        className={({ isActive }) =>
          cn(
            "group relative flex items-center rounded-lg text-sm font-medium transition-colors duration-200",
            collapsed ? "justify-center px-0 py-2.5 mx-auto w-11 h-11" : "gap-3 px-3 py-2",
            isActive
              ? "bg-primary text-primary-foreground shadow-soft"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && !collapsed && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-primary-foreground/70" />
            )}
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span
              className={cn(
                "truncate transition-[opacity,width] duration-200",
                collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
              )}
            >
              {label}
            </span>
          </>
        )}
      </NavLink>
    </SidebarTooltip>
  );
};
