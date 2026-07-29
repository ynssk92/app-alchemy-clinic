import { FormEvent, useEffect, useState } from "react";
import { Send, ArrowRight, Phone, MessageCircle, Clock, ShieldCheck, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { TrustBadge } from "./TrustBadge";

const schema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(100),
  email: z.string().trim().email("Email invalide").max(255),
  message: z.string().trim().min(1, "Message requis").max(2000),
});

const fieldClass =
  "h-14 w-full rounded-2xl border border-transparent bg-muted/70 px-4 text-base text-foreground placeholder:text-muted-foreground/70 transition-all duration-250 focus:border-primary focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary/15";

const labelClass = "text-sm font-medium text-foreground";

interface ContactFormProps {
  phone: string;
}

export const ContactForm = ({ phone }: ContactFormProps) => {
  const [busy, setBusy] = useState(false);
  const [doctors, setDoctors] = useState<{ id: string; full_name: string }[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("doctors")
        .select("id, full_name")
        .eq("is_available", true)
        .order("full_name", { ascending: true });
      setDoctors((data as any) || []);
    })();
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      message: fd.get("message"),
    });
    if (!parsed.success) {
      return toast.error(parsed.error.issues[0].message);
    }
    setBusy(true);
    const { name, email, message } = parsed.data;

    const extras = [
      fd.get("phone") ? `Téléphone : ${fd.get("phone")}` : "",
      fd.get("subject") ? `Sujet : ${fd.get("subject")}` : "",
      fd.get("date") ? `Date souhaitée : ${fd.get("date")}` : "",
      fd.get("time") ? `Heure souhaitée : ${fd.get("time")}` : "",
      fd.get("doctor") ? `Praticien souhaité : ${fd.get("doctor")}` : "",
    ].filter(Boolean);

    const fullMessage = extras.length ? `${message}\n\n---\n${extras.join("\n")}` : message;

    const { error } = await supabase
      .from("contact_messages")
      .insert({ name: name!, email: email!, message: fullMessage.slice(0, 2000) });
    setBusy(false);
    if (error) return toast.error("Envoi impossible. Réessayez plus tard.");
    toast.success("Message envoyé ! Nous vous répondrons rapidement.");
    form.reset();
  };

  const tel = phone.replace(/\s/g, "");
  const wa = phone.replace(/[^\d]/g, "");

  return (
    <div className="rounded-[28px] bg-card p-6 sm:p-10 shadow-large border border-border/60">
      <h2 className="text-[22px] font-semibold text-foreground">Envoyez-nous un message</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Remplissez le formulaire, notre équipe vous recontacte sous 24 heures.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className={labelClass} htmlFor="name">Nom complet</Label>
            <input id="name" name="name" required maxLength={100} placeholder="Votre nom" className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label className={labelClass} htmlFor="email">Adresse email</Label>
            <input id="email" name="email" type="email" required maxLength={255} placeholder="vous@email.com" className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label className={labelClass} htmlFor="phone">Téléphone</Label>
            <input id="phone" name="phone" type="tel" maxLength={30} placeholder="+212 6 00 00 00 00" className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label className={labelClass} htmlFor="subject">Sujet</Label>
            <input id="subject" name="subject" maxLength={120} placeholder="Ex : Consultation, devis…" className={fieldClass} />
          </div>
        </div>

        <div className="space-y-2">
          <Label className={labelClass} htmlFor="message">Message</Label>
          <textarea
            id="message"
            name="message"
            required
            maxLength={2000}
            placeholder="Comment pouvons-nous vous aider ?"
            className={`${fieldClass} h-[180px] resize-none py-4 leading-relaxed`}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label className={labelClass} htmlFor="date">Date de RDV (optionnel)</Label>
            <input id="date" name="date" type="date" className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label className={labelClass} htmlFor="time">Heure préférée</Label>
            <input id="time" name="time" type="time" className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label className={labelClass} htmlFor="doctor">Praticien (optionnel)</Label>
            <div className="relative">
              <select id="doctor" name="doctor" className={`${fieldClass} appearance-none pr-10`} defaultValue="">
                <option value="">Sans préférence</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.full_name}>{d.full_name}</option>
                ))}
              </select>
              <Stethoscope className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={busy}
          className="group h-14 w-full rounded-2xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-medium transition-all duration-250 hover:-translate-y-0.5 hover:shadow-large hover:brightness-105 active:scale-[0.98]"
        >
          <Send className="mr-2 h-5 w-5 transition-transform duration-250 group-hover:-rotate-12" />
          {busy ? "Envoi..." : "Envoyer le message"}
          <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-250 group-hover:translate-x-1" />
        </Button>
      </form>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">ou</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button asChild variant="outline" className="group h-14 rounded-2xl text-base font-semibold">
          <a href={`tel:${tel}`}>
            <Phone className="mr-2 h-4 w-4 transition-transform duration-250 group-hover:rotate-12" />
            Appeler la clinique
          </a>
        </Button>
        <Button asChild variant="outline" className="group h-14 rounded-2xl text-base font-semibold">
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-4 w-4 transition-transform duration-250 group-hover:rotate-12" />
            WhatsApp
          </a>
        </Button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <TrustBadge icon={Clock} label="Réponse sous 24 heures" />
        <TrustBadge icon={ShieldCheck} label="Sécurisé & confidentiel" />
        <TrustBadge icon={Stethoscope} label="Équipe médicale experte" />
      </div>
    </div>
  );
};

export default ContactForm;
