import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import LanguageToggle from "@/components/LanguageToggle";
import { useAppSettings } from "@/hooks/useAppSettings";

export const SiteHeader = () => {
  const { t } = useTranslation();
  const { logoUrl } = useAppSettings();

  const navItems = [
    { label: t("nav.about"), to: "/about" },
    { label: t("nav.soins"), to: "/soins" },
    { label: t("nav.expertise"), to: "/expertise" },
    { label: t("nav.team"), to: "/equipe" },
    { label: t("nav.faq"), to: "/faq" },
    { label: t("nav.blog"), to: "/blog" },
    { label: t("nav.contact"), to: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 transition-transform duration-300 hover:scale-105">
          <img src={logoUrl} alt="La Dune Clinique Dentaire" className="h-10" />
        </Link>
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
          <LanguageToggle />
          <Link to="/auth">
            <Button className="shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5">
              {t("nav.signIn")}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default SiteHeader;
