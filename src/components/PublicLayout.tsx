import { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { TopHeader } from "./TopHeader";

interface PublicLayoutProps {
  children: ReactNode;
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="relative flex min-h-screen w-full flex-1 flex-col overflow-x-hidden bg-background">
      <TopHeader />
      <SiteHeader />
      <main className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
};

export default PublicLayout;
