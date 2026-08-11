import type { LegalDefaults } from "@/hooks/useLegalPage";

export const TERMS_DEFAULT: LegalDefaults = {
  title: "Terms of Service",
  subtitle: "Please read these Terms carefully before using HealthBook.",
  version: "1.1.0",
  readingTime: "8 min read",
  sections: [
    {
      title: "1. Acceptance of Terms",
      content:
        "By accessing or using HealthBook, you acknowledge that you have read, understood and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use the platform.",
    },
    {
      title: "2. Medical Disclaimer",
      content:
        "HealthBook is an appointment management platform that connects patients with healthcare providers. It does not provide medical advice, diagnosis or treatment and never replaces a consultation with a qualified professional. In a medical emergency, contact your local emergency services immediately.",
    },
    {
      title: "3. User Accounts",
      content:
        "To use certain features you must create an account. You agree to provide accurate and current information, keep your password secure, never share your account with anyone else, and treat other users and clinic staff with respect. You are responsible for all activity carried out under your account.",
    },
    {
      title: "4. Appointment Booking",
      content:
        "Appointments requested through HealthBook are subject to clinic availability. Clinics may approve, reschedule or cancel an appointment based on clinical priorities and operational capacity. You will be notified of any change through the platform and by email.",
    },
    {
      title: "5. Cancellation Policy",
      content:
        "Please cancel or reschedule at least 24 hours before your appointment so the slot can be offered to another patient. Late cancellations and missed appointments may be recorded on your file and, where the clinic policy provides for it, may incur a fee. Repeated no-shows can lead to booking restrictions.",
    },
    {
      title: "6. Patient Responsibilities",
      content:
        "Patients must provide accurate medical information, including allergies, medication and relevant history, arrive on time for their appointments, and respect clinic rules, staff and other patients.",
    },
    {
      title: "7. Doctor Responsibilities",
      content:
        "Practitioners agree to maintain accurate availability and schedules, provide truthful professional information about their qualifications and services, and protect patient confidentiality in line with applicable medical and data protection laws.",
    },
    {
      title: "8. Payments and Billing",
      content:
        "When online payments are enabled, invoices are issued electronically and remain available in your dashboard. Accepted methods include cash, card, bank transfer, insurance coverage and supported online payments. Refunds for prepaid services that were not delivered are returned to the original payment method, typically within fourteen business days of an approved request.",
    },
    {
      title: "9. Intellectual Property",
      content:
        "All logos, interfaces, branding, text and software that make up HealthBook remain the exclusive property of the clinic and its licensors. You may not copy, reproduce or redistribute any part of the platform without written permission.",
    },
    {
      title: "10. Limitation of Liability",
      content:
        "To the extent permitted by law, HealthBook is not liable for medical decisions taken by practitioners, failures of external services, internet outages, or defects in third-party software or hardware that affect access to the platform.",
    },
    {
      title: "11. Suspension and Termination",
      content:
        "Accounts that breach these Terms, submit fraudulent information, abuse staff or other users, or repeatedly miss appointments without notice may be suspended or closed. Where the law allows, we will explain the reason and give you a chance to respond. You may close your account at any time from your profile settings.",
    },
    {
      title: "12. Contact",
      content:
        "For any question about these Terms, contact our support team by email or phone, or visit the clinic during opening hours. Our full contact details are listed at the end of this page.",
    },
  ],
};

export const PRIVACY_DEFAULT: LegalDefaults = {
  title: "Privacy Policy",
  subtitle: "Your privacy and personal data are important to us.",
  version: "1.1.0",
  readingTime: "7 min read",
  sections: [
    {
      title: "1. Information We Collect",
      content:
        "We collect the personal information you give us (name, date of birth, gender), your contact details, the medical information required for your care, your appointment history, device and browser information, and your login history.",
    },
    {
      title: "2. Why We Collect Data",
      content:
        "Your data is used to manage appointments, maintain accurate patient records, send reminders and notifications, protect the security of the platform, produce anonymised analytics and continuously improve the quality of our services.",
    },
    {
      title: "3. Medical Information",
      content:
        "Medical records are strictly confidential. They are visible only to the authorised healthcare professionals involved in your care and to the administrative staff who need them to run your appointments, and they are protected by medical secrecy laws.",
    },
    {
      title: "4. Data Storage",
      content:
        "Data is stored in encrypted databases on secure, access-controlled servers. Backups are taken regularly and encrypted, and access requires authenticated accounts with limited, logged permissions.",
    },
    {
      title: "5. Cookies",
      content:
        "We use necessary cookies to keep you signed in and secure, preference cookies to remember settings such as your language, and analytics cookies to understand anonymous usage patterns. You can manage cookies from your browser settings; disabling necessary cookies may break parts of the platform.",
    },
    {
      title: "6. Data Sharing",
      content:
        "We never sell your personal information. Data is shared only with authorised clinic staff, the doctors involved in your treatment, and legal or health authorities when we are required to do so by law.",
    },
    {
      title: "7. Your Rights",
      content:
        "You can access the data we hold about you, ask for corrections, request deletion of your account, export your personal data in a portable format, and withdraw consent for optional processing at any time.",
    },
    {
      title: "8. Data Retention",
      content:
        "We keep personal data only for as long as it is needed for the purposes described here. Medical records are retained for the statutory periods set by local health regulations, after which they are securely deleted or anonymised.",
    },
    {
      title: "9. Security",
      content:
        "We protect your information with encryption in transit and at rest, strong authentication, role-based permissions limited to what each staff member needs, audit logs of sensitive actions, and a secured API protected by row-level access rules.",
    },
    {
      title: "10. Contact",
      content:
        "To exercise your rights or raise a concern, contact our Privacy Officer by email or write to us at the clinic address below. We respond to verified requests within thirty days.",
    },
  ],
};

export const COOKIES_DEFAULT: LegalDefaults = {
  title: "Cookie Policy",
  subtitle: "How we use cookies to improve your experience.",
  version: "1.0.0",
  readingTime: "4 min read",
  sections: [
    {
      title: "1. What Are Cookies?",
      content:
        "Cookies are small text files stored on your device when you visit a website. They help us keep you signed in, remember your preferences and understand how the platform is used.",
    },
    {
      title: "2. Necessary Cookies",
      content:
        "These cookies are required for HealthBook to work: authentication, security, load balancing and accessibility. They cannot be switched off from within the platform.",
    },
    {
      title: "3. Preference Cookies",
      content:
        "Preference cookies remember choices such as your language or display settings so the interface behaves the way you expect on your next visit.",
    },
    {
      title: "4. Analytics Cookies",
      content:
        "Analytics cookies collect anonymous information about how visitors use the site, helping us detect technical problems and improve the booking experience.",
    },
    {
      title: "5. Managing Cookies",
      content:
        "Most browsers let you block or delete cookies from their settings. Blocking necessary cookies will prevent parts of HealthBook, including sign-in and booking, from working correctly.",
    },
  ],
};
