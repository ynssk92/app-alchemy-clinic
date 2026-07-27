import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { FormEvent, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAppSettings } from "@/hooks/useAppSettings";

const schema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(100),
  email: z.string().trim().email("Email invalide").max(255),
  message: z.string().trim().min(1, "Message requis").max(2000),
});

const Contact = () => {
  const [busy, setBusy] = useState(false);
  const { settings } = useAppSettings();

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
    const { error } = await supabase.from("contact_messages").insert({ name: name!, email: email!, message: message! });
    setBusy(false);
    if (error) return toast.error("Envoi impossible. Réessayez plus tard.");
    toast.success("Message envoyé ! Nous vous répondrons rapidement.");
    form.reset();
  };

  return (
    <PageShell
      title="Contact — La Dune Clinique Dentaire"
      description="Contactez La Dune Clinique Dentaire : adresse, téléphone, horaires et formulaire."
      path="/contact"
      eyebrow="Nous joindre"
      heading="Contact"
      subheading="Une question, un rendez-vous ? Notre équipe est à votre écoute."
    >
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {[
            { icon: MapPin, title: "Adresse", text: settings.contact_address },
            { icon: Phone, title: "Téléphone", text: settings.contact_phone },
            { icon: Mail, title: "Email", text: settings.contact_email },
            {
              icon: Clock,
              title: "Horaires",
              text: `Lun-Ven : ${settings.hours_weekdays} · Sam : ${settings.hours_saturday}`,
            },
          ].map((c) => (
            <Card key={c.title} className="p-5 flex items-start gap-4 hover:shadow-medium transition-shadow">
              <div className="w-11 h-11 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
                <c.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold">{c.title}</h3>
                <p className="text-muted-foreground">{c.text}</p>
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nom complet</Label>
              <Input id="name" name="name" required maxLength={100} placeholder="Votre nom" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required maxLength={255} placeholder="vous@email.com" />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" required rows={5} maxLength={2000} placeholder="Comment pouvons-nous vous aider ?" />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Envoi..." : "Envoyer le message"}
            </Button>
          </form>
        </Card>
      </div>
    </PageShell>
  );
};

export default Contact;
