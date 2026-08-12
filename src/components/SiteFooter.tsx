import { Link } from "react-router-dom";
import { useAppSettings } from "@/hooks/useAppSettings";
import { Mail, Phone, MapPin } from "lucide-react";

const APP_VERSION = "1.1.0";

export const SiteFooter = () => {
  const { settings, logoUrl } = useAppSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-100 bg-white pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center" aria-label="Home">
              <img src={logoUrl} alt={settings.site_name} className="h-10 w-auto object-contain" loading="lazy" />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-500">
              {settings.site_name} — Exceptional dental care with a personalized approach, combining advanced technology and human expertise.
            </p>
          </div>

          <nav aria-labelledby="footer-nav" className="space-y-6">
            <h2 id="footer-nav" className="text-xs font-bold uppercase tracking-widest text-slate-900">Navigation</h2>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link to="/about" className="transition-colors hover:text-primary">About</Link></li>
              <li><Link to="/soins" className="transition-colors hover:text-primary">Our Care</Link></li>
              <li><Link to="/expertise" className="transition-colors hover:text-primary">Expertise</Link></li>
              <li><Link to="/equipe" className="transition-colors hover:text-primary">Our Team</Link></li>
              <li><Link to="/faq" className="transition-colors hover:text-primary">FAQ</Link></li>
              <li><Link to="/blog" className="transition-colors hover:text-primary">Blog</Link></li>
              <li><Link to="/contact" className="transition-colors hover:text-primary">Contact</Link></li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-legal" className="space-y-6">
            <h2 id="footer-legal" className="text-xs font-bold uppercase tracking-widest text-slate-900">Legal</h2>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link to="/privacy" className="transition-colors hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/terms" className="transition-colors hover:text-primary">Terms & Conditions</Link></li>
              <li><Link to="/cookies" className="transition-colors hover:text-primary">Cookie Policy</Link></li>
            </ul>
          </nav>

          <address className="space-y-6 not-italic">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">Contact</h2>
            <div className="space-y-4 text-sm text-slate-500">
              {settings.contact_email && (
                <p className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-primary">{settings.contact_email}</a>
                </p>
              )}
              {settings.contact_phone && (
                <p className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <a href={`tel:${settings.contact_phone.replace(/\s/g, "")}`} className="hover:text-primary">{settings.contact_phone}</a>
                </p>
              )}
              {settings.contact_address && (
                <p className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{settings.contact_address}</span>
                </p>
              )}
            </div>
          </address>
        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            © {year} {settings.site_name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase">Version {APP_VERSION}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
