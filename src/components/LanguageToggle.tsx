import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Props {
  variant?: "ghost" | "outline";
  className?: string;
}

export const LanguageToggle = ({ variant = "ghost", className }: Props) => {
  const { i18n, t } = useTranslation();
  
  const languages = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "ar", label: "العربية", flag: "🇲🇦", dir: "rtl" }
  ];

  const currentLang = i18n.language.slice(0, 2);
  const current = languages.find(l => l.code === currentLang) || languages[0];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("ladune_lang", lng);
    // document.documentElement logic is handled in i18n/index.ts listener
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size="sm" 
          className={cn("gap-1.5 font-semibold h-9 px-3 rounded-full transition-all duration-200 hover:bg-muted", className)} 
          title={t("common.language")}
        >
          <Globe className="w-4 h-4 text-primary" />
          <span className="uppercase text-xs tracking-wider">{current.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem] p-1 bg-popover/95 backdrop-blur-sm border-border shadow-lg animate-in fade-in-0 zoom-in-95">
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => changeLanguage(lang.code)} 
            className={cn(
              "flex items-center justify-between px-3 py-2 cursor-pointer transition-colors rounded-md",
              currentLang === lang.code ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg leading-none">{lang.flag}</span>
              <span className={cn("text-sm", lang.dir === "rtl" && "font-arabic")}>{lang.label}</span>
            </div>
            {currentLang === lang.code && <Check className="w-3.5 h-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;