import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  variant?: "ghost" | "outline";
  className?: string;
}

export const LanguageToggle = ({ variant = "ghost", className }: Props) => {
  const { i18n } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || "fr").slice(0, 2).toUpperCase();

  const change = (lng: "fr" | "en") => {
    i18n.changeLanguage(lng);
    localStorage.setItem("ladune_lang", lng);
    document.documentElement.lang = lng;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size="sm" 
          className={`gap-1.5 font-semibold ${className ?? ""}`} 
          title="Add an automated test suite to verify that each role redirects exactly once to the correct dashboard after login, with no redirect loops."
        >
          <Globe className="w-4 h-4" />
          {current}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem] bg-popover">
        <DropdownMenuItem onClick={() => change("fr")} className={current === "FR" ? "font-semibold text-primary" : ""}>
          🇫🇷 Français
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => change("en")} className={current === "EN" ? "font-semibold text-primary" : ""}>
          🇬🇧 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;