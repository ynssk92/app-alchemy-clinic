import { LegalPage } from "@/components/legal/LegalPage";
import { TERMS_DEFAULT } from "@/content/legalDefaults";

const Terms = () => (
  <LegalPage
    slug="terms"
    path="/terms"
    seoTitle="Terms of Service — HealthBook"
    seoDescription="Read the HealthBook Terms of Service: accounts, appointment booking, cancellations, payments, liability and contact information."
    defaults={TERMS_DEFAULT}
  />
);

export default Terms;
