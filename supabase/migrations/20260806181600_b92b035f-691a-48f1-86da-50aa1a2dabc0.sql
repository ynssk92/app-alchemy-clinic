CREATE TABLE public.legal_pages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    page_type text NOT NULL UNIQUE CHECK (page_type IN ('terms', 'privacy')),
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    content jsonb NOT NULL,
    version text NOT NULL DEFAULT '1.0.0',
    last_updated timestamptz NOT NULL DEFAULT now(),
    is_published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.legal_pages TO anon, authenticated;
GRANT ALL ON public.legal_pages TO service_role;

ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to published legal pages" 
ON public.legal_pages FOR SELECT 
TO anon, authenticated 
USING (is_published = true);

-- Insert initial default content
INSERT INTO public.legal_pages (page_type, title, slug, version, content)
VALUES 
(
  'terms', 
  'Terms of Service', 
  'terms', 
  '1.0.0', 
  '{
    "subtitle": "Please read these Terms carefully before using HealthBook.",
    "estimated_reading_time": "8 min",
    "sections": [
      {
        "title": "1. Acceptance of Terms",
        "content": "By accessing and using HealthBook, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our services."
      },
      {
        "title": "2. Medical Disclaimer",
        "content": "HealthBook is an appointment management platform designed to facilitate the connection between patients and healthcare providers. We do not provide medical advice, diagnosis, or treatment. The content on this platform is for informational purposes only. In case of a medical emergency, please contact emergency services immediately."
      },
      {
        "title": "3. User Accounts",
        "content": "To access certain features, you must create an account. You agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your password and account, and you are fully responsible for all activities that occur under your account."
      },
      {
        "title": "4. Appointment Booking",
        "content": "Appointments booked through HealthBook are subject to clinic availability. Clinics reserve the right to approve, reschedule, or cancel appointments based on their clinical requirements and operational capacity."
      },
      {
        "title": "5. Cancellation Policy",
        "content": "We value the time of both patients and practitioners. Cancellations made less than 24 hours before the appointment may be subject to a cancellation fee. Repeated missed appointments without notice may result in account suspension."
      },
      {
        "title": "6. Patient Responsibilities",
        "content": "Patients are responsible for providing accurate medical history, arriving on time for appointments, and respecting the rules and staff of the clinic they are visiting."
      },
      {
        "title": "7. Doctor Responsibilities",
        "content": "Doctors and clinical staff agree to maintain their schedules accurately, provide professional healthcare services, and respect patient confidentiality in accordance with applicable laws."
      },
      {
        "title": "8. Intellectual Property",
        "content": "All logos, user interfaces, branding, and software components of HealthBook are the exclusive property of La Dune Clinique Dentaire and its licensors. Unauthorized use or reproduction is strictly prohibited."
      },
      {
        "title": "9. Limitation of Liability",
        "content": "HealthBook shall not be liable for any medical decisions made by practitioners, external service failures, internet outages, or any third-party software issues that may affect the platform performance."
      }
    ]
  }'::jsonb
),
(
  'privacy', 
  'Privacy Policy', 
  'privacy', 
  '1.0.0', 
  '{
    "subtitle": "Your privacy and personal data are important to us.",
    "estimated_reading_time": "6 min",
    "sections": [
      {
        "title": "1. Information We Collect",
        "content": "We collect personal information (name, contact details), medical information necessary for your care, appointment history, device information, and login history to provide and improve our services."
      },
      {
        "title": "2. Why We Collect Data",
        "content": "Data is collected for appointment management, maintaining accurate patient records, sending reminders and notifications, ensuring platform security, and performing anonymized analytics to improve our healthcare delivery."
      },
      {
        "title": "3. Medical Information Confidentiality",
        "content": "Your medical records are strictly confidential. They are accessible only to authorized healthcare professionals involved in your care and are protected by medical secrecy laws."
      },
      {
        "title": "4. Data Storage & Security",
        "content": "All data is stored in encrypted databases on secure servers. We employ industry-standard security measures, including multi-factor authentication and regular backups, to protect your information."
      },
      {
        "title": "5. Data Sharing",
        "content": "We never sell your personal information. Data is shared only with authorized clinic staff, your chosen doctors, or legal authorities when required by law."
      },
      {
        "title": "6. User Rights",
        "content": "Under GDPR and local regulations, you have the right to access your data, request corrections, delete your account, export your personal data, and withdraw consent for data processing at any time."
      },
      {
        "title": "7. Data Retention",
        "content": "Personal data is kept only as long as necessary for the purposes outlined. Medical records are retained according to the statutory periods defined by local health regulations."
      }
    ]
  }'::jsonb
);