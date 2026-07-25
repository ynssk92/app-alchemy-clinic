import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import LanguageToggle from "@/components/LanguageToggle";
import { useAppSettings } from "@/hooks/useAppSettings";

export const SiteHeader = () => {
  const { t } = useTranslation();
  const { logoUrl } = useAppSettings();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: t("nav.about"), to: "/about" },
    { label: t("nav.soins"), to: "/soins" },
    { label: t("nav.expertise"), to: "/expertise" },
    { label: t("nav.team"), to: "/equipe" },
    { label: t("nav.faq"), to: "/faq" },
    { label: t("nav.blog"), to: "/blog" },
    { label: t("nav.contact"), to: "/contact" },
  ];

  // Close mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-3 transition-transform duration-300 hover:scale-105">
          <img src={logoUrl} alt="La Dune Clinique Dentaire" className="h-10" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative text-sm font-bold transition-colors duration-300 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-gradient-primary after:transition-transform after:duration-300 hover:text-primary hover:after:scale-x-100 hover:after:origin-left ${
                  isActive
                    ? "text-primary after:scale-x-100"
                    : "text-foreground after:scale-x-0 after:origin-right"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <LanguageToggle />
            <Link to="/auth">
              <Button className="shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5">
                {t("nav.signIn")}
              </Button>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background/60 text-foreground active:scale-95 transition"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="p-0 rounded-t-2xl border-t border-border bg-background h-[85vh] flex flex-col"
            >
              <SheetHeader className="px-5 pt-3 pb-2 flex-row items-center justify-between space-y-0">
                <div className="mx-auto h-1.5 w-12 rounded-full bg-muted absolute left-1/2 -translate-x-1/2 top-2" />
                <SheetTitle className="text-left flex items-center gap-2 pt-3">
                  <img src={logoUrl} alt="" className="h-8" />
                </SheetTitle>
                <SheetClose asChild>
                  <button
                    type="button"
                    aria-label="Close menu"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </SheetClose>
              </SheetHeader>

              <nav className="flex-1 overflow-y-auto px-4 pb-4">
                <ul className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between rounded-xl px-4 min-h-14 text-base font-semibold transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted"
                          }`
                        }
                      >
                        <span>{item.label}</span>
                        <span
                          aria-hidden="true"
                          className="h-2 w-2 rounded-full bg-current opacity-40"
                        />
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-3 bg-card">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("nav.language", { defaultValue: "Language" })}
                  </span>
                  <LanguageToggle />
                </div>
                <Link to="/auth" onClick={() => setOpen(false)} className="block">
                  <Button className="w-full h-12 text-base shadow-soft">
                    {t("nav.signIn")}
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default SiteHeader;
