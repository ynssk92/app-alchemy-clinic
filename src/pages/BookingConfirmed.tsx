import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CalendarCheck, CalendarDays, Clock, UserRound, MapPin, Phone, Mail,
  CheckCircle2, BellRing, FileText, ArrowRight, Loader2, CalendarPlus, Download,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAppSettings } from "@/hooks/useAppSettings";
import { Seo } from "@/components/Seo";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Appt = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  reason: string | null;
  status: string;
  doctors: { full_name: string; avatar_url: string | null; specialties: { name: string } | null; clinics: { name: string; address: string | null } | null } | null;
};

const nextSteps = [
  { icon: Mail, title: "Confirmation envoyée", text: "Un récapitulatif vous est envoyé par email avec tous les détails de votre visite." },
  { icon: BellRing, title: "Rappel 24h avant", text: "Nous vous enverrons un rappel la veille de votre rendez-vous." },
  { icon: FileText, title: "Préparez vos documents", text: "Munissez-vous de votre carte d'identité, mutuelle et de vos derniers examens." },
  { icon: Clock, title: "Arrivez 10 min en avance", text: "Cela nous permet de finaliser votre dossier sereinement." },
];

const BookingConfirmed = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { settings, logoUrl } = useAppSettings();
  const [appt, setAppt] = useState<Appt | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!id || !user) return;
    supabase
      .from("appointments")
      .select("id, appointment_date, appointment_time, reason, status, doctors(full_name, avatar_url, specialties(name), clinics(name, address))")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setAppt((data as any) ?? null);
        setLoading(false);
      });
  }, [id, user]);

  const dateLabel = appt
    ? new Date(appt.appointment_date + "T00:00:00").toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "";

  const address = appt?.doctors?.clinics?.address || settings.contact_address;

  const loadLogo = async (): Promise<{ data: string; w: number; h: number } | null> => {
    try {
      const res = await fetch(logoUrl);
      const blob = await res.blob();
      const data: string = await new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.onerror = reject;
        fr.readAsDataURL(blob);
      });
      const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = reject;
        img.src = data;
      });
      return { data, ...dims };
    } catch {
      return null;
    }
  };

  const handleDownloadPdf = async () => {
    if (!appt) return;
    setDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const W = doc.internal.pageSize.getWidth();
      const M = 48;
      let y = 64;

      const logo = await loadLogo();
      const headerH = 130;
      doc.setFillColor(32, 48, 128);
      doc.rect(0, 0, W, headerH, "F");

      let textX = M;
      if (logo) {
        const boxH = 64;
        const logoH = 48;
        const logoW = Math.min(160, (logo.w / logo.h) * logoH);
        const boxW = logoW + 28;
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(M, 33, boxW, boxH, 12, 12, "F");
        doc.addImage(logo.data, M + 14, 33 + (boxH - logoH) / 2, logoW, logoH, undefined, "FAST");
        textX = M + boxW + 20;
      }

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold").setFontSize(19);
      doc.text(settings.site_name || "La Dune", textX, 62);
      doc.setFont("helvetica", "normal").setFontSize(12);
      doc.text("Confirmation de rendez-vous", textX, 84);
      doc.setFontSize(10);
      doc.text(`Reference : #${appt.id.slice(0, 8).toUpperCase()}`, W - M, 62, { align: "right" });

      y = headerH + 40;
      doc.setTextColor(20, 20, 20);
      doc.setFont("helvetica", "bold").setFontSize(13);
      doc.text("Details du rendez-vous", M, y);
      y += 10;
      doc.setDrawColor(220, 224, 235);
      doc.line(M, y, W - M, y);
      y += 24;

      const rows: [string, string][] = [
        ["Praticien", appt.doctors?.full_name ?? "-"],
        ["Specialite", appt.doctors?.specialties?.name ?? "-"],
        ["Date", dateLabel],
        ["Heure", appt.appointment_time],
        ["Lieu", appt.doctors?.clinics?.name ?? settings.site_name],
        ["Adresse", address || "-"],
        ["Motif", appt.reason || "-"],
        ["Statut", appt.status],
      ];
      rows.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(110, 116, 135);
        doc.text(label.toUpperCase(), M, y);
        doc.setFont("helvetica", "normal").setFontSize(12).setTextColor(20, 20, 20);
        const lines = doc.splitTextToSize(String(value), W - M - 190);
        doc.text(lines, M + 150, y);
        y += 20 + (lines.length - 1) * 14;
      });

      y += 16;
      doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(20, 20, 20);
      doc.text("Prochaines etapes", M, y);
      y += 10;
      doc.line(M, y, W - M, y);
      y += 24;

      nextSteps.forEach((s, i) => {
        doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(32, 48, 128);
        doc.text(`${i + 1}. ${s.title}`, M, y);
        y += 16;
        doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(70, 74, 90);
        const lines = doc.splitTextToSize(s.text, W - M * 2);
        doc.text(lines, M, y);
        y += lines.length * 13 + 12;
      });

      y += 8;
      doc.setDrawColor(220, 224, 235);
      doc.line(M, y, W - M, y);
      y += 22;
      doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(20, 20, 20);
      doc.text("Contact", M, y);
      y += 16;
      doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(70, 74, 90);
      doc.text(`Telephone : ${settings.contact_phone}`, M, y);
      y += 14;
      doc.text(`Email : ${settings.contact_email}`, M, y);
      y += 14;
      doc.text("Modification ou annulation : merci de nous prevenir au moins 24h a l'avance.", M, y);

      doc.setFontSize(9).setTextColor(150, 154, 168);
      doc.text(
        `Document genere le ${new Date().toLocaleDateString("fr-FR")}`,
        M,
        doc.internal.pageSize.getHeight() - 36,
      );

      doc.save(`rendez-vous-${appt.id.slice(0, 8)}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Rendez-vous confirmé — La Dune"
        description="Récapitulatif de votre rendez-vous et prochaines étapes avant votre visite."
        path="/booking/confirmed"
      />
      <SiteHeader />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 py-14 sm:py-20">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <Badge variant="secondary" className="mb-4">Réservation confirmée</Badge>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Votre rendez-vous est <span className="bg-gradient-primary bg-clip-text text-transparent">confirmé</span>
                </h1>
                <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                  Merci ! Voici le récapitulatif de votre visite et les prochaines étapes.
                </p>
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-5">
                <Card className="rounded-3xl p-6 lg:col-span-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <CalendarCheck className="h-4 w-4" /> Détails du rendez-vous
                  </div>

                  {appt ? (
                    <div className="mt-5 space-y-4">
                      <Row icon={UserRound} label="Praticien" value={appt.doctors?.full_name ?? "—"} hint={appt.doctors?.specialties?.name ?? undefined} />
                      <Row icon={CalendarDays} label="Date" value={dateLabel} />
                      <Row icon={Clock} label="Heure" value={appt.appointment_time} />
                      <Row icon={MapPin} label="Lieu" value={appt.doctors?.clinics?.name ?? settings.site_name} hint={address} />
                      {appt.reason ? <Row icon={FileText} label="Motif" value={appt.reason} /> : null}
                      <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3 text-sm">
                        <span className="text-muted-foreground">Référence</span>
                        <span className="font-mono font-medium">#{appt.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-5 text-sm text-muted-foreground">
                      Rendez-vous introuvable. Consultez votre espace patient pour retrouver vos réservations.
                    </p>
                  )}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button asChild className="h-12 flex-1 rounded-xl">
                      <Link to="/patient-dashboard">
                        Mon espace patient <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 flex-1 rounded-xl"
                      disabled={!appt || downloading}
                      onClick={handleDownloadPdf}
                    >
                      {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                      Télécharger le PDF
                    </Button>
                  </div>
                  <Button asChild variant="ghost" className="mt-3 h-11 w-full rounded-xl">
                    <Link to="/booking">
                      <CalendarPlus className="mr-2 h-4 w-4" /> Nouveau rendez-vous
                    </Link>
                  </Button>

                </Card>

                <Card className="rounded-3xl p-6 lg:col-span-2">
                  <div className="text-sm font-semibold text-muted-foreground">Prochaines étapes</div>
                  <ol className="mt-5 space-y-5">
                    {nextSteps.map((s, i) => (
                      <li key={s.title} className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <s.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{i + 1}. {s.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-6 rounded-2xl border bg-muted/40 p-4">
                    <p className="text-sm font-semibold">Besoin de modifier ou annuler ?</p>
                    <p className="mt-1 text-sm text-muted-foreground">Contactez-nous au moins 24h à l'avance.</p>
                    <div className="mt-3 flex flex-col gap-2 text-sm">
                      <a href={`tel:${settings.contact_phone}`} className="inline-flex items-center gap-2 font-medium text-primary hover:underline">
                        <Phone className="h-4 w-4" /> {settings.contact_phone}
                      </a>
                      <a href={`mailto:${settings.contact_email}`} className="inline-flex items-center gap-2 font-medium text-primary hover:underline">
                        <Mail className="h-4 w-4" /> {settings.contact_email}
                      </a>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const Row = ({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string; hint?: string }) => (
  <div className="flex items-start gap-3 rounded-2xl border p-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate font-semibold capitalize">{value}</p>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  </div>
);

export default BookingConfirmed;
