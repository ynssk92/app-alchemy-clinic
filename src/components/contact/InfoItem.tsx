import { LucideIcon } from "lucide-react";

interface InfoItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
}

export const InfoItem = ({ icon: Icon, title, description, href }: InfoItemProps) => {
  const content = (
    <div className="group flex items-start gap-4 rounded-2xl p-3 -mx-3 transition-all duration-250 hover:bg-muted/60">
      <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-soft transition-transform duration-250 group-hover:scale-105 group-hover:rotate-6">
        <Icon className="w-5 h-5 text-primary-foreground" />
      </div>
      <div className="min-w-0">
        <h3 className="text-[17px] font-semibold text-foreground leading-tight">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line break-words">{description}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl">
        {content}
      </a>
    );
  }
  return content;
};

export default InfoItem;
