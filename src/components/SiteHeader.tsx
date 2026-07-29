import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarPlus, Menu, Stethoscope, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import LanguageToggle from "@/components/LanguageToggle";
import { useAppSettings } from "@/hooks/useAppSettings";
import { cn } from "@/lib/utils";



export const SiteHeader = () => {
  const { t } = useTranslation();
  const { logoUrl } = useAppSettings();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: t("nav.about"), to: "/about" },
    { label: t("nav.soins"), to: "/soins" },
    { label: t("nav.expertise"), to: "/expertise" },
    { label: t("nav.team"), to: "/equipe", alsoMatch: ["/doctors"] },
    { label: t("nav.faq"), to: "/faq" },
    { label: t("nav.blog"), to: "/blog" },
    { label: t("nav.contact"), to: "/contact" },
  ];

  const matches = (to: string, alsoMatch?: string[]) =>
    [to, ...(alsoMatch ?? [])].some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    );

  const bookingActive = matches("/booking");

  // Close mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);


  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-3 shrink-0 transition-transform duration-300 hover:scale-105">
          <img src={logoUrl} alt="La Dune Clinique Dentaire" className="h-8 md:h-10" />
        </Link>

        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navItems.map((item) => {
            const active = matches(item.to, item.alsoMatch);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative text-sm font-bold transition-colors duration-300 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-gradient-primary after:transition-transform after:duration-300 hover:text-primary hover:after:scale-x-100 hover:after:origin-left",
                  active
                    ? "text-primary after:scale-x-100 after:origin-left"
                    : "text-foreground after:scale-x-0 after:origin-right",
                )}
              >
                {item.label}
              </NavLink>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2">
            <LanguageToggle />
          </div>
          <Link to="/booking" aria-current={bookingActive ? "page" : undefined} className="shrink-0">
            <Button
              className={cn(
                "shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5 h-11 px-3 text-sm md:h-10 md:px-4",
                bookingActive && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background shadow-medium",
              )}
            >
              Rendez-vous
            </Button>
          </Link>



          {/* Mobile menu trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-nav-sheet"
                className="md:hidden inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background/60 text-foreground active:scale-95 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </SheetTrigger>

            <SheetContent
              id="mobile-nav-sheet"
              side="bottom"
              aria-label="Main navigation"
              onOpenAutoFocus={(e) => {
                // Radix traps focus; keep initial focus on the close button
                // instead of the first nav link so users don't accidentally
                // trigger navigation when opening the drawer.
                e.preventDefault();
                const el = document.getElementById("mobile-nav-close");
                el?.focus();
              }}
              className={cn(
                "p-0 rounded-t-2xl border-t border-border bg-background h-[85dvh] flex flex-col",
                // Smoother, spring-like slide + fade for the drawer itself
                "data-[state=open]:duration-400 data-[state=closed]:duration-250",
                "data-[state=open]:ease-[cubic-bezier(0.22,1,0.36,1)]",
                "data-[state=closed]:ease-[cubic-bezier(0.4,0,1,1)]",
                "motion-reduce:transition-none motion-reduce:animate-none",
              )}
            >
              <SheetHeader className="px-5 pt-5 pb-2 flex-row items-center justify-between space-y-0">
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-2 -translate-x-1/2 h-1.5 w-12 rounded-full bg-muted"
                />
                <SheetTitle className="text-left flex items-center gap-2">
                  <img src={logoUrl} alt="" className="h-8" />
                  <VisuallyHidden>Menu</VisuallyHidden>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Site navigation and quick actions
                </SheetDescription>
                <SheetClose asChild>
                  <button
                    id="mobile-nav-close"
                    type="button"
                    aria-label="Close menu"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </SheetClose>
              </SheetHeader>

              <nav
                aria-label="Mobile"
                className="flex-1 overflow-y-auto px-4 pb-4"
              >
                <div className="grid grid-cols-2 gap-3 pb-4">
                  <Link
                    to="/booking"
                    onClick={() => setOpen(false)}
                    aria-current={bookingActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border border-border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      bookingActive
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "bg-card text-foreground hover:bg-muted",
                    )}
                  >
                    <CalendarPlus className="h-5 w-5" aria-hidden="true" />
                    Rendez-vous
                  </Link>
                  <Link
                    to="/doctors"
                    onClick={() => setOpen(false)}
                    aria-current={matches("/doctors") ? "page" : undefined}
                    className={cn(
                      "flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border border-border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      matches("/doctors")
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "bg-card text-foreground hover:bg-muted",
                    )}
                  >
                    <Stethoscope className="h-5 w-5" aria-hidden="true" />
                    {t("nav.doctors", { defaultValue: "Médecins" })}
                  </Link>
                </div>
                <ul className="flex flex-col gap-1">

                  {navItems.map((item, i) => {
                    const active = matches(item.to, item.alsoMatch);
                    return (
                      <li
                        key={item.to}
                        className="opacity-0 animate-fade-in motion-reduce:animate-none motion-reduce:opacity-100"
                        style={{
                          animationDelay: `${80 + i * 40}ms`,
                          animationFillMode: "forwards",
                        }}
                      >
                        <NavLink
                          to={item.to}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "relative flex items-center justify-between rounded-xl px-4 min-h-14 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            active
                              ? "bg-primary/10 text-primary before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:rounded-full before:bg-primary"
                              : "text-foreground hover:bg-muted",
                          )}
                        >
                          <span>{item.label}</span>
                          <span
                            aria-hidden="true"
                            className={cn(
                              "h-2 w-2 rounded-full bg-current",
                              active ? "opacity-100" : "opacity-40",
                            )}
                          />
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-3 bg-card">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("nav.language", { defaultValue: "Language" })}
                  </span>
                  <LanguageToggle />
                </div>
                <Link
                  to="/booking"
                  onClick={() => setOpen(false)}
                  aria-current={bookingActive ? "page" : undefined}
                  className="block"
                >
                  <Button
                    className={cn(
                      "w-full h-12 text-base shadow-soft",
                      bookingActive && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background",
                    )}
                  >
                    Rendez-vous
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
