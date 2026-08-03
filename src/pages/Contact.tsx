import { PageShell } from "@/components/PageShell";
import { ContactInfoCard } from "@/components/contact/ContactInfoCard";
import { ContactForm } from "@/components/contact/ContactForm";
import { Mail } from "lucide-react";
import { useAppSettings } from "@/hooks/useAppSettings";

const Contact = () => {
  const { settings } = useAppSettings();

  return (
    <PageShell
      title="Contact — La Dune Clinique Dentaire"
      description="Contactez La Dune Clinique Dentaire : adresse, téléphone, horaires et formulaire."
      path="/contact"
      heading="Contact"
      hideHero
    >
      <section className="relative -mx-4 overflow-hidden px-4 py-16 md:py-[120px]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="pointer-events-none absolute -top-24 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative mx-auto w-full max-w-[1280px]">
          <header className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <Mail className="h-3.5 w-3.5" />
              Contactez notre clinique
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[54px]">
              Parlons de votre{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">sourire</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Une question, un devis, une urgence ou un rendez-vous ? Notre équipe vous accompagne avec
              écoute et discrétion, et vous répond dans les meilleurs délais.
            </p>
          </header>

          <div className="mt-14 grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <ContactInfoCard
                address={settings.contact_address}
                phone={settings.contact_phone}
                phoneSecondary={settings.contact_phone_secondary}
                email={settings.contact_email}
                hoursWeekdays={settings.hours_weekdays}
                hoursSaturday={settings.hours_saturday}
                hoursSunday={settings.hours_sunday}
                emergencyPhone={settings.emergency_phone}
                mapUrl={settings.map_url}
              />
            </div>
            <div className="lg:col-span-3">
              <ContactForm phone={settings.contact_phone} />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Contact;
