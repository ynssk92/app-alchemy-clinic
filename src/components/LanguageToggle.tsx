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
          title="Audit every Storage RLS policy for the patient_documents bucket.

Current problem:

Any authenticated user can read, upload, update and delete every patient's documents.

Fix all Storage policies.

Requirements:

Patients:

- Can only view their own documents.

- Can only upload their own documents.

- Can never access another patient's files.

Doctors:

- Can read documents only for patients assigned to them.

- Can upload documents for assigned patients.

- Can update documents they created.

- Cannot access unrelated patients.

Admins:

- Full access.

Verify ownership using:

- auth.uid()

- patient_id

- doctor_id

- role

Do not allow bucket_id checks alone.

Every policy must verify both role and ownership.

Test:

Patient A

❌ cannot read Patient B files

Patient B

❌ cannot delete Patient A files

Doctor A

✔ only assigned patients

Doctor B

❌ cannot access Doctor A patients

Admin

✔ full access

Keep existing database schema.

Do not delete data."
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