import { MapPin, Phone, Mail, Clock, ShieldCheck, MessageCircle, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoItem } from "./InfoItem";

interface ContactInfoCardProps {
  address: string;
  phone: string;
  phoneSecondary?: string;
  email: string;
  hoursWeekdays: string;
  hoursSaturday: string;
  hoursSunday: string;
  emergencyPhone?: string;
  mapUrl?: string;
}

const toWhatsApp = (phone: string) => phone.replace(/[^\d]/g, "");

export const ContactInfoCard = ({
  address,
  phone,
  phoneSecondary,
  email,
  hoursWeekdays,
  hoursSaturday,
  hoursSunday,
  emergencyPhone,
  mapUrl,
}: ContactInfoCardProps) => {
  const maps = mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="rounded-[28px] bg-card p-6 sm:p-10 shadow-large border border-border/60 transition-all duration-250 hover:-translate-y-1 hover:shadow-large">
      <h2 className="text-[22px] font-semibold text-foreground">Informations de la clinique</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Retrouvez-nous, appelez-nous ou écrivez-nous — nous vous répondons rapidement.
      </p>

      <div className="mt-8 space-y-5">
        <InfoItem icon={MapPin} title="Adresse" description={address} href={maps} />
        <InfoItem
          icon={Phone}
          title="Téléphone"
          description={phoneSecondary ? `${phone}\n${phoneSecondary}` : phone}
          href={`tel:${phone.replace(/\s/g, "")}`}
        />
        <InfoItem icon={Mail} title="Email" description={email} href={`mailto:${email}`} />
        <InfoItem
          icon={Clock}
          title="Horaires d'ouverture"
          description={`Lun – Ven : ${hoursWeekdays}\nSamedi : ${hoursSaturday}\nDimanche : ${hoursSunday}`}
        />
        {emergencyPhone && (
          <InfoItem
            icon={ShieldCheck}
            title="Urgences"
            description={emergencyPhone}
            href={`tel:${emergencyPhone.replace(/\s/g, "")}`}
          />
        )}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Button asChild variant="outline" className="group h-12 rounded-2xl font-semibold">
          <a href={maps} target="_blank" rel="noopener noreferrer">
            <Navigation className="mr-2 h-4 w-4 transition-transform duration-250 group-hover:rotate-12" />
            Google Maps
          </a>
        </Button>
        <Button asChild variant="outline" className="group h-12 rounded-2xl font-semibold">
          <a href={`https://wa.me/${toWhatsApp(phone)}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-4 w-4 transition-transform duration-250 group-hover:rotate-12" />
            WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
};

export default ContactInfoCard;
