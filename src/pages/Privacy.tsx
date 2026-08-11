import { LegalPage } from "@/components/legal/LegalPage";
import { PRIVACY_DEFAULT } from "@/content/legalDefaults";

const Privacy = () => (
  <LegalPage
    slug="privacy"
    path="/privacy"
    seoTitle="Privacy Policy — HealthBook"
    seoDescription="How HealthBook collects, stores, protects and shares your personal and medical data, plus your GDPR rights and how to exercise them."
    badges={[{ label: "GDPR Ready" }, { label: "Secure Platform" }]}
    defaults={PRIVACY_DEFAULT}
  />
);

export default Privacy;
