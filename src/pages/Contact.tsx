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
      <section className="relative -mx-4 -mt-8 overflow-hidden px-4 py-10 sm:py-14 md:-mt-10 lg:py-20">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="pointer-events-none absolute -top-16 left-0 -z-10 h-48 w-48 rounded-full bg-primary/10 blur-2xl sm:-top-20 sm:left-1/4 sm:h-64 sm:w-64 sm:blur-3xl lg:-top-24 lg:h-72 lg:w-72" />
        <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-52 w-52 rounded-full bg-secondary/10 blur-2xl sm:h-72 sm:w-72 sm:blur-3xl lg:h-80 lg:w-80" />

        <div className="relative mx-auto w-full max-w-[1280px]">
          <header className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary sm:px-4 sm:text-xs">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              Contactez notre clinique
            </span>
            <h1 className="mt-4 text-[1.9rem] font-bold leading-[1.12] tracking-tight text-foreground xs:text-4xl sm:mt-6 sm:text-5xl lg:text-[3.25rem]">
              Parlons de votre{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">sourire</span>
            </h1>
            <p className="mt-3 max-w-prose text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
              Une question, un devis, une urgence ou un rendez-vous ? Notre équipe vous accompagne avec
              écoute et discrétion, et vous répond dans les meilleurs délais.
            </p>
          </header>

          <div className="mt-10 grid gap-6 sm:mt-12 sm:gap-8 lg:mt-14 lg:grid-cols-5">

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
