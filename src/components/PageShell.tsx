import { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Seo } from "./Seo";

interface PageShellProps {
  title: string;
  description: string;
  path: string;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  hideHero?: boolean;
  children: ReactNode;
}

export const PageShell = ({ title, description, path, eyebrow, heading, subheading, hideHero, children }: PageShellProps) => {
  return (
    <div className="flex min-h-screen w-full flex-1 flex-col overflow-x-hidden bg-background">
      <Seo title={title} description={description} path={path} />
      <SiteHeader />
      {!hideHero && (
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
      )}

      <main className="container mx-auto w-full max-w-7xl flex-1 px-4 py-16">{children}</main>
      <SiteFooter />
    </div>
  );
};

export default PageShell;
