import { Link } from "react-router-dom";
import { useAppSettings } from "@/hooks/useAppSettings";
import { Mail, Phone, MapPin } from "lucide-react";

const APP_VERSION = "1.1.0";

export const SiteFooter = () => {
  const { settings, logoUrl } = useAppSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-4">
        <div className="space-y-4">
          <Link to="/" className="inline-flex items-center" aria-label="Home">
            <img src={logoUrl} alt={settings.site_name} className="h-10 w-auto object-contain" loading="lazy" />
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            {settings.site_name} — modern, patient-first dental care with easy online appointment management.
          </p>
        </div>

        <nav aria-labelledby="footer-legal" className="space-y-3">
          <h2 id="footer-legal" className="text-sm font-semibold text-foreground">Legal</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/privacy" className="transition-colors hover:text-primary">Privacy Policy</Link></li>
            <li><Link to="/terms" className="transition-colors hover:text-primary">Terms of Service</Link></li>
            <li><Link to="/cookies" className="transition-colors hover:text-primary">Cookie Policy</Link></li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-support" className="space-y-3">
          <h2 id="footer-support" className="text-sm font-semibold text-foreground">Support</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/contact" className="transition-colors hover:text-primary">Contact</Link></li>
            <li><Link to="/faq" className="transition-colors hover:text-primary">Help &amp; FAQ</Link></li>
            <li><Link to="/booking" className="transition-colors hover:text-primary">Book an appointment</Link></li>
          </ul>
        </nav>

        <address className="space-y-3 not-italic text-sm text-muted-foreground">
          <h2 className="text-sm font-semibold text-foreground">Get in touch</h2>
          {settings.contact_email && (
            <p className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <a href={`mailto:${settings.contact_email}`} className="hover:text-primary">{settings.contact_email}</a>
            </p>
          )}
          {settings.contact_phone && (
            <p className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <a href={`tel:${settings.contact_phone.replace(/\s/g, "")}`} className="hover:text-primary">{settings.contact_phone}</a>
            </p>
          )}
          {settings.contact_address && (
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{settings.contact_address}</span>
            </p>
          )}
        </address>
      </div>

      <div className="border-t border-border">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row">
          <span>© {year} {settings.site_name}. All rights reserved.</span>
          <span>Version {APP_VERSION}</span>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
