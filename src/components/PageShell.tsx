import { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { Seo } from "./Seo";

interface PageShellProps {
  title: string;
  description: string;
  path: string;
  eyebrow?: string;
  heading: string;
  subheading?: string;
  children: ReactNode;
}

export const PageShell = ({ title, description, path, eyebrow, heading, subheading, children }: PageShellProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Seo title={title} description={description} path={path} />
      <SiteHeader />
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-hero opacity-60" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          {eyebrow && (
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary mb-4">
              {eyebrow}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{heading}</h1>
          {subheading && (
            <p className="text-lg text-muted-foreground max-w-2xl">{subheading}</p>
          )}
        </div>
      </section>
      <main className="container mx-auto px-4 py-16">{children}</main>
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} La Dune Clinique Dentaire. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default PageShell;
