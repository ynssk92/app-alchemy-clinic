import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { FormEvent } from "react";

const Contact = () => {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast.success("Message envoyé ! Nous vous répondrons rapidement.");
    (e.target as HTMLFormElement).reset();
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
            { icon: MapPin, title: "Adresse", text: "Avenue Mohammed VI, Casablanca" },
            { icon: Phone, title: "Téléphone", text: "+212 5 22 00 00 00" },
            { icon: Mail, title: "Email", text: "contact@ladune-clinique.com" },
            { icon: Clock, title: "Horaires", text: "Lun-Ven : 9h-19h · Sam : 9h-13h" },
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
              <Input id="name" required placeholder="Votre nom" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required placeholder="vous@email.com" />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" required rows={5} placeholder="Comment pouvons-nous vous aider ?" />
            </div>
            <Button type="submit" className="w-full">Envoyer le message</Button>
          </form>
        </Card>
      </div>
    </PageShell>
  );
};

export default Contact;
