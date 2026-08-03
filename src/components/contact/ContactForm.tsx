import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Send,
  ArrowRight,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { TrustBadge } from "./TrustBadge";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Merci d'indiquer votre nom complet (2 caractères minimum).")
    .max(100, "Le nom ne peut pas dépasser 100 caractères."),
  email: z
    .string()
    .trim()
    .min(1, "L'adresse email est requise.")
    .email("Format d'email invalide — exemple : vous@email.com.")
    .max(255, "L'email ne peut pas dépasser 255 caractères."),
  phone: z
    .string()
    .trim()
    .max(30, "Le numéro ne peut pas dépasser 30 caractères.")
    .refine((v) => v === "" || /^[+0-9 ().-]{6,30}$/.test(v), "Numéro invalide — chiffres, espaces et + uniquement.")
    .optional(),
  subject: z.string().trim().max(120, "Le sujet ne peut pas dépasser 120 caractères.").optional(),
  message: z
    .string()
    .trim()
    .min(10, "Décrivez votre demande en 10 caractères minimum.")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères."),
  date: z
    .string()
    .refine((v) => {
      if (!v) return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(v) >= today;
    }, "La date souhaitée ne peut pas être dans le passé.")
    .optional(),
  time: z.string().optional(),
  doctor: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;
type FieldName = keyof FormValues;

const EMPTY: Record<FieldName, string> = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  date: "",
  time: "",
  doctor: "",
};

const MESSAGE_MAX = 2000;

const baseField =
  "h-14 w-full rounded-2xl border bg-muted/70 px-4 text-base text-foreground placeholder:text-muted-foreground/70 transition-all duration-250 focus:bg-card focus:outline-none focus:ring-4";
const validField = "border-transparent focus:border-primary focus:ring-primary/15";
const errorField = "border-destructive/70 bg-destructive/5 focus:border-destructive focus:ring-destructive/15";

const labelClass = "text-sm font-medium text-foreground";

const FieldError = ({ id, message }: { id: string; message?: string }) =>
  message ? (
    <p id={id} role="alert" className="flex items-start gap-1.5 text-xs font-medium text-destructive">
      <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  ) : null;

interface ContactFormProps {
  phone: string;
}

export const ContactForm = ({ phone }: ContactFormProps) => {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [values, setValues] = useState<Record<FieldName, string>>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
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

  const validateAll = (v: Record<FieldName, string>) => {
    const parsed = schema.safeParse(v);
    if (parsed.success) return {};
    const next: Partial<Record<FieldName, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as FieldName;
      if (key && !next[key]) next[key] = issue.message;
    }
    return next;
  };

  const setField = (field: FieldName, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateAll(next)[field] }));
    }
  };

  const onBlur = (field: FieldName) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateAll(values)[field] }));
  };

  const fieldProps = (field: FieldName) => ({
    value: values[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setField(field, e.target.value),
    onBlur: () => onBlur(field),
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
    className: cn(baseField, errors[field] ? errorField : validField),
  });

  const errorCount = useMemo(() => Object.values(errors).filter(Boolean).length, [errors]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validateAll(values);
    setTouched({ name: true, email: true, phone: true, subject: true, message: true, date: true });
    setErrors(found);

    const firstError = (Object.keys(found) as FieldName[])[0];
    if (firstError) {
      toast.error("Merci de corriger les champs en rouge.");
      document.getElementById(firstError)?.focus();
      return;
    }

    setBusy(true);
    const extras = [
      values.phone ? `Téléphone : ${values.phone}` : "",
      values.subject ? `Sujet : ${values.subject}` : "",
      values.date ? `Date souhaitée : ${values.date}` : "",
      values.time ? `Heure souhaitée : ${values.time}` : "",
      values.doctor ? `Praticien souhaité : ${values.doctor}` : "",
    ].filter(Boolean);

    const fullMessage = extras.length
      ? `${values.message.trim()}\n\n---\n${extras.join("\n")}`
      : values.message.trim();

    const { error } = await supabase.from("contact_messages").insert({
      name: values.name.trim(),
      email: values.email.trim(),
      message: fullMessage.slice(0, MESSAGE_MAX),
    });
    setBusy(false);
    if (error) return toast.error("Envoi impossible. Réessayez plus tard ou appelez la clinique.");
    toast.success("Message envoyé ! Nous vous répondrons rapidement.");
    setSent(true);
  };

  const resetForm = () => {
    setValues(EMPTY);
    setTouched({});
    setErrors({});
    setSent(false);
  };

  const tel = phone.replace(/\s/g, "");
  const wa = phone.replace(/[^\d]/g, "");

  if (sent) {
    return (
      <div className="rounded-[28px] border border-border/60 bg-card p-6 text-center shadow-large sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-foreground">Message bien reçu, merci {values.name.trim().split(" ")[0]} !</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Notre équipe a bien reçu votre demande et vous répondra à{" "}
          <span className="font-medium text-foreground">{values.email.trim()}</span> sous 24 heures ouvrées.
          Pour une urgence, appelez-nous directement.
        </p>

        <div className="mx-auto mt-8 max-w-md space-y-3 text-left">
          <TrustBadge icon={Clock} label="Réponse sous 24 heures ouvrées" />
          <TrustBadge icon={ShieldCheck} label="Vos données restent confidentielles" />
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button asChild variant="outline" className="h-14 rounded-2xl text-base font-semibold">
            <a href={`tel:${tel}`}>
              <Phone className="mr-2 h-4 w-4" />
              Appeler la clinique
            </a>
          </Button>
          <Button
            onClick={resetForm}
            className="h-14 rounded-2xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-medium transition-all duration-250 hover:-translate-y-0.5 hover:shadow-large"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Envoyer un autre message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-border/60 bg-card p-6 shadow-large sm:p-10">
      <h2 className="text-[22px] font-semibold text-foreground">Envoyez-nous un message</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Remplissez le formulaire, notre équipe vous recontacte sous 24 heures.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className={labelClass} htmlFor="name">Nom complet</Label>
            <input id="name" name="name" maxLength={100} placeholder="Votre nom" {...fieldProps("name")} />
            <FieldError id="name-error" message={errors.name} />
          </div>
          <div className="space-y-2">
            <Label className={labelClass} htmlFor="email">Adresse email</Label>
            <input id="email" name="email" type="email" maxLength={255} placeholder="vous@email.com" {...fieldProps("email")} />
            <FieldError id="email-error" message={errors.email} />
          </div>
          <div className="space-y-2">
            <Label className={labelClass} htmlFor="phone">Téléphone (optionnel)</Label>
            <input id="phone" name="phone" type="tel" maxLength={30} placeholder="+212 6 00 00 00 00" {...fieldProps("phone")} />
            <FieldError id="phone-error" message={errors.phone} />
          </div>
          <div className="space-y-2">
            <Label className={labelClass} htmlFor="subject">Sujet (optionnel)</Label>
            <input id="subject" name="subject" maxLength={120} placeholder="Ex : Consultation, devis…" {...fieldProps("subject")} />
            <FieldError id="subject-error" message={errors.subject} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label className={labelClass} htmlFor="message">Message</Label>
            <span
              className={cn(
                "text-xs tabular-nums",
                values.message.length > MESSAGE_MAX - 100 ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {values.message.length} / {MESSAGE_MAX}
            </span>
          </div>
          <textarea
            id="message"
            name="message"
            maxLength={MESSAGE_MAX}
            placeholder="Comment pouvons-nous vous aider ?"
            {...fieldProps("message")}
            className={cn(fieldProps("message").className, "h-[180px] resize-none py-4 leading-relaxed")}
          />
          <FieldError id="message-error" message={errors.message} />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label className={labelClass} htmlFor="date">Date de RDV (optionnel)</Label>
            <input id="date" name="date" type="date" {...fieldProps("date")} />
            <FieldError id="date-error" message={errors.date} />
          </div>
          <div className="space-y-2">
            <Label className={labelClass} htmlFor="time">Heure préférée</Label>
            <input id="time" name="time" type="time" {...fieldProps("time")} />
          </div>
          <div className="space-y-2">
            <Label className={labelClass} htmlFor="doctor">Praticien (optionnel)</Label>
            <div className="relative">
              <select
                id="doctor"
                name="doctor"
                value={values.doctor}
                onChange={(e) => setField("doctor", e.target.value)}
                className={cn(baseField, validField, "appearance-none pr-10")}
              >
                <option value="">Sans préférence</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.full_name}>{d.full_name}</option>
                ))}
              </select>
              <Stethoscope className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        {errorCount > 0 && (
          <p role="status" className="flex items-center gap-2 rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorCount} champ{errorCount > 1 ? "s" : ""} à corriger avant l'envoi.
          </p>
        )}

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
