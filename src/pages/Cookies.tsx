import { LegalPage } from "@/components/legal/LegalPage";
import { COOKIES_DEFAULT } from "@/content/legalDefaults";

const Cookies = () => (
  <LegalPage
    slug="cookie-policy"
    path="/cookies"
    seoTitle="Cookie Policy — HealthBook"
    seoDescription="Which cookies HealthBook uses — necessary, preference and analytics — and how you can manage them in your browser."
    defaults={COOKIES_DEFAULT}
  />
);

export default Cookies;
