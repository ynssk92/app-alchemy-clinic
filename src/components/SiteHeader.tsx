import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const navItems = [
  { label: "À Propos", to: "/about" },
  { label: "Nos Soins", to: "/soins" },
  { label: "Expertise", to: "/expertise" },
  { label: "L'Équipe", to: "/equipe" },
  { label: "FAQ", to: "/faq" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

export const SiteHeader = () => {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 transition-transform duration-300 hover:scale-105">
          <img src={logo} alt="La Dune Clinique Dentaire" className="h-10" />
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
        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button className="shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default SiteHeader;
