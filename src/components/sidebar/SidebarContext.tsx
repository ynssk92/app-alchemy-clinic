import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

type Device = "mobile" | "tablet" | "desktop";

type Ctx = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggle: () => void;
  device: Device;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
};

const STORAGE_KEY = "sidebarCollapsed";

const SidebarCtx = createContext<Ctx | null>(null);

const getDevice = (): Device => {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
};

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [device, setDevice] = useState<Device>(getDevice);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsedState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "true";
    return getDevice() === "tablet"; // tablet defaults to collapsed
  });

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const setCollapsed = useCallback((v: boolean) => {
    setCollapsedState(v);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(v));
    } catch {}
  }, []);

  const toggle = useCallback(() => setCollapsed(!collapsed), [collapsed, setCollapsed]);

  return (
    <SidebarCtx.Provider
      value={{ collapsed, setCollapsed, toggle, device, mobileOpen, setMobileOpen }}
    >
      {children}
    </SidebarCtx.Provider>
  );
};

export const useSidebar = () => {
  const ctx = useContext(SidebarCtx);
  if (!ctx) throw new Error("useSidebar must be used inside SidebarProvider");
  return ctx;
};

export const SIDEBAR_WIDTH_EXPANDED = 280;
export const SIDEBAR_WIDTH_COLLAPSED = 72;
