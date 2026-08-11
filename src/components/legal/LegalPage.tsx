import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUp, Printer, Download, Share2, Mail, Phone, MapPin, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/Seo";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useLegalPage, type LegalDefaults } from "@/hooks/useLegalPage";

const slugify = (s: string) =>
  s.toLowerCase().replace(/^\d+\.\s*/, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

type Props = {
  slug: string;
  path: string;
  seoTitle: string;
  seoDescription: string;
  badges?: { label: string }[];
  defaults: LegalDefaults;
};

export const LegalPage = ({ slug, path, seoTitle, seoDescription, badges = [], defaults }: Props) => {
  const { data } = useLegalPage(slug, defaults);
  const { settings } = useAppSettings();
  const [activeId, setActiveId] = useState<string>("");
  const [showTop, setShowTop] = useState(false);

  const toc = useMemo(
    () => data.sections.map((s) => ({ id: slugify(s.title), title: s.title })),
    [data.sections],
  );

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!toc.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );
    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc]);

  const lastUpdated = data.lastUpdated
    ? new Date(data.lastUpdated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  const handleShare = async () => {
    const url = `${window.location.origin}${path}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: data.title, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-muted/30">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={path}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: settings.site_name,
          email: settings.contact_email || undefined,
          telephone: settings.contact_phone || undefined,
          address: settings.contact_address || undefined,
        }}
      />
      <SiteHeader />

      {/* Hero */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto max-w-6xl px-4 py-14 md:py-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Legal</span>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">{data.title}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{data.subtitle}</p>

            <div className="mt-7 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
                Last updated: <span className="font-semibold text-foreground">{lastUpdated}</span>
              </span>
              <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
                Version <span className="font-semibold text-foreground">{data.version}</span>
              </span>
              <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
                {data.readingTime}
              </span>
              {badges.map((b) => (
                <span
                  key={b.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 font-semibold text-primary"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  {b.label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto w-full max-w-6xl flex-1 px-4 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* Content */}
          <div className="space-y-6">
            {data.sections.map((section, i) => (
              <motion.section
                key={section.title}
                id={slugify(section.title)}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.2) }}
                className="scroll-mt-28 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
              >
                <h2 className="text-xl font-bold text-foreground md:text-2xl">{section.title}</h2>
                <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{section.content}</p>
              </motion.section>
            ))}

            {/* Contact card */}
            <section
              id="contact-details"
              className="scroll-mt-28 rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm md:p-8"
            >
              <h2 className="text-xl font-bold text-foreground md:text-2xl">Contact details</h2>
              <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                {settings.contact_email && (
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <a href={`mailto:${settings.contact_email}`} className="hover:text-primary">{settings.contact_email}</a>
                  </p>
                )}
                {settings.contact_phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <a href={`tel:${settings.contact_phone.replace(/\s/g, "")}`} className="hover:text-primary">{settings.contact_phone}</a>
                  </p>
                )}
                {settings.contact_address && (
                  <p className="flex items-center gap-2 sm:col-span-2">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {settings.contact_address}
                  </p>
                )}
              </div>
              <Button asChild className="mt-6">
                <Link to="/contact">Contact us</Link>
              </Button>
            </section>
          </div>

          {/* Sticky sidebar */}
          <aside className="order-first lg:order-none print:hidden">
            <div className="lg:sticky lg:top-24 space-y-4">
              <nav aria-label="Table of contents" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">On this page</h2>
                <ul className="mt-4 space-y-1">
                  {toc.map(({ id, title }) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        aria-current={activeId === id ? "true" : undefined}
                        className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                          activeId === id
                            ? "bg-primary/10 font-semibold text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="grid gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" aria-hidden="true" />Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.info("PDF export is coming soon — use Print and choose “Save as PDF”.");
                    window.print();
                  }}
                >
                  <Download className="mr-2 h-4 w-4" aria-hidden="true" />Download PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />Share
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />

      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 print:hidden"
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default LegalPage;
