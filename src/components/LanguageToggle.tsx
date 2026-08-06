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
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || "fr").slice(0, 2).toUpperCase();

  const change = (lng: "fr" | "en") => {
    i18n.changeLanguage(lng);
    localStorage.setItem("ladune_lang", lng);
    document.documentElement.lang = lng;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className={`gap-1.5 font-semibold ${className ?? ""}`} title="## Create Professional Legal Pages (Terms of Service & Privacy Policy)

Create two complete legal pages for the HealthBook application.

Pages:

- /terms

- /privacy

The design must be premium, clean, responsive and consistent with the rest of the application.

Use the existing design system:

- White cards

- Soft shadows

- Large spacing

- Rounded corners (16px)

- Primary Blue

- Light gray background

- Smooth fade animations

- Responsive Desktop / Tablet / Mobile

========================================================

PAGE 1

Terms of Service

========================================================

Hero Section

Title:

Terms of Service

Subtitle:

Please read these Terms carefully before using HealthBook.

Display:

Last updated:

Version

Estimated reading time

-----------------------------------

Create sections:

1. Acceptance of Terms

Explain that by accessing HealthBook users agree to the terms.

-----------------------------------

2. Medical Disclaimer

HealthBook is an appointment management platform.

It does not replace professional medical advice.

Emergency cases should contact emergency services.

-----------------------------------

3. User Accounts

Users must:

Provide accurate information

Keep password secure

Not share their account

Respect other users

-----------------------------------

4. Appointment Booking

Appointments are subject to clinic availability.

Clinics may:

Approve

Reschedule

Cancel appointments.

-----------------------------------

5. Cancellation Policy

Explain cancellation rules.

Late cancellations.

Missed appointments.

Possible fees.

-----------------------------------

6. Patient Responsibilities

Accurate medical information.

Respect appointment times.

Respect clinic rules.

-----------------------------------

7. Doctor Responsibilities

Maintain schedule.

Provide accurate information.

Respect patient confidentiality.

-----------------------------------

8. Payments

If online payments are enabled:

Invoices

Refund policy

Accepted payment methods

-----------------------------------

9. Intellectual Property

All logos

UI

Brand

Software

remain property of HealthBook.

-----------------------------------

10. Limitation of Liability

HealthBook is not responsible for:

Medical decisions

External services

Internet outages

Third-party failures

-----------------------------------

11. Suspension

Accounts violating policies may be suspended.

-----------------------------------

12. Contact

Support Email

Clinic Address

Phone

Contact button

========================================================

PAGE 2

Privacy Policy

========================================================

Hero Section

Title:

Privacy Policy

Subtitle:

Your privacy and personal data are important to us.

Display:

Last Updated

GDPR Ready badge

Secure Platform badge

-----------------------------------

Sections

1. Information We Collect

Personal information

Contact details

Medical information

Appointments

Device information

Login history

-----------------------------------

2. Why We Collect Data

Appointment management

Patient records

Notifications

Security

Analytics

Improving services

-----------------------------------

3. Medical Information

Explain that medical records are confidential.

Accessible only to authorized healthcare professionals.

-----------------------------------

4. Data Storage

Encrypted database

Secure servers

Backups

Authentication

-----------------------------------

5. Cookies

Necessary cookies

Analytics cookies

Preference cookies

-----------------------------------

6. Data Sharing

Never sell personal information.

Data shared only with:

Authorized clinic staff

Doctors

Legal authorities when required

-----------------------------------

7. User Rights

Access data

Correct data

Delete account

Export personal data

Withdraw consent

-----------------------------------

8. Data Retention

Explain retention period.

Medical records retained according to local regulations.

-----------------------------------

9. Security

Encryption

Authentication

Role permissions

Audit logs

Secure API

-----------------------------------

10. Contact

Privacy Officer

Support Email

Clinic Address

========================================================

EXTRA COMPONENTS

========================================================

Add:

Table of Contents

Sticky right sidebar navigation

Smooth scrolling

Back to top button

Estimated reading time

Print button

Download PDF button (placeholder)

Share button

========================================================

FOOTER

========================================================

Footer must contain:

Privacy Policy

Terms of Service

Cookie Policy

Contact

Support

Version

Copyright

========================================================

ADMIN READY

========================================================

Create database-ready architecture.

Each page content must be editable later from the Admin Panel.

Create a legal_pages table structure:

id

page_type

title

slug

content

version

last_updated

is_published

created_at

updated_at

Load page content dynamically from the database.

If no content exists, display the default content.

========================================================

SEO

========================================================

Generate:

Meta Title

Meta Description

Open Graph tags

Canonical URL

Structured Data (Organization)

========================================================

PERFORMANCE

========================================================

Lazy loading

Accessible typography

Semantic HTML

WCAG AA accessibility

Responsive layout

Dark mode support

========================================================

IMPORTANT

Do not use Lorem Ipsum.

Generate complete professional legal content in English.

Keep the design premium, modern, lightweight and fully responsive.

The pages must integrate seamlessly with the existing HealthBook UI.">
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
