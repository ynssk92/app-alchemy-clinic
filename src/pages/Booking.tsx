import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Clock, UserRound } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Seo } from "@/components/Seo";
import { SiteHeader } from "@/components/SiteHeader";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { DoctorCard, BookingDoctor } from "@/components/booking/DoctorCard";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { TimeSlotGrid } from "@/components/booking/TimeSlotGrid";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { GuestDetailsForm } from "@/components/booking/GuestDetailsForm";
import { ReasonSelect, type ConsultationReason } from "@/components/booking/ReasonSelect";


const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
];

const steps = [
  { id: 1, label: "Coordonnées" },
  { id: 2, label: "Praticien" },
  { id: 3, label: "Date & heure" },
  { id: 4, label: "Confirmation" },
];

const schema = z.object({
  first_name: z.string().trim().min(2, "Prénom requis").max(80),
  last_name: z.string().trim().min(2, "Nom requis").max(80),
  email: z.string().trim().email("Email invalide").max(255),
  phone: z.string().trim().min(6, "Téléphone invalide").max(40),
  dob: z.string().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
  service_id: z.string().uuid("Merci de choisir un motif").optional().or(z.literal("")),
  reason_id: z.string().uuid("Merci de choisir un motif").optional().or(z.literal("")),
  custom_reason: z.string().trim().max(1000).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;


const Booking = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [doctorId, setDoctorId] = useState(params.get("doctor") || "");
  const [doctors, setDoctors] = useState<BookingDoctor[]>([]);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState<ConsultationReason | undefined>();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { first_name: "", last_name: "", email: "", phone: "", dob: "", service_id: "", reason_id: undefined, custom_reason: "" },
    mode: "onBlur",
  });


  // Prefill for signed-in patients
  useEffect(() => {
    if (!user) return;
    methods.setValue("email", user.email ?? "");
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const parts = String((data as any)?.full_name ?? "").trim().split(" ");
        if (parts[0]) methods.setValue("first_name", parts[0]);
        if (parts.length > 1) methods.setValue("last_name", parts.slice(1).join(" "));
        if ((data as any)?.phone) methods.setValue("phone", (data as any).phone);
      });
  }, [user]);

  useEffect(() => {
    supabase
      .from("doctors")
      .select("id, full_name, avatar_url, experience_years, rating, specialties(name), clinics(name)")
      .eq("is_available", true)
      .then(({ data }) => {
        setDoctors(
          ((data as any[]) || []).map((d) => ({
            id: d.id,
            full_name: d.full_name,
            avatar_url: d.avatar_url,
            experience_years: d.experience_years,
            rating: d.rating,
            specialty: d.specialties?.name ?? null,
            clinic: d.clinics?.name ?? null,
          }))
        );
      });
  }, []);

  const selectedDoctor = useMemo(() => doctors.find((d) => d.id === doctorId), [doctors, doctorId]);

  const dateLabel = date
    ? date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : undefined;

  const values = methods.watch();
  const detailsFilled = Boolean(values.first_name && values.last_name && values.email && values.phone);
  const completed = [detailsFilled ? 1 : 0, doctorId ? 2 : 0, date && selectedTime ? 3 : 0].filter(Boolean) as number[];
  const currentStep = !detailsFilled ? 1 : !doctorId ? 2 : !(date && selectedTime) ? 3 : 4;
  const ready = Boolean(detailsFilled && doctorId && date && selectedTime && (values.service_id || values.reason_id));

  const handleSaveForLater = () => {
    localStorage.setItem(
      "booking_draft",
      JSON.stringify({ doctorId, date: date?.toISOString() ?? null, selectedTime, ...methods.getValues() })
    );
    toast.success("Sélection enregistrée. Vous pourrez la reprendre plus tard.");
  };

  const onSubmit = async (v: FormValues) => {
    if (!doctorId || !date || !selectedTime) {
      toast.error("Choisissez un praticien, une date et un horaire");
      return;
    }
    if (reason?.is_other && (v.custom_reason ?? "").trim().length < 3) {
      methods.setError("custom_reason", { message: "Merci de préciser votre motif" });
      return;
    }
    const reasonText = reason?.is_other ? (v.custom_reason ?? "").trim() : reason?.label ?? "";
    setBusy(true);
    const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const { data, error } = await supabase.functions.invoke("guest-booking", {
      body: {
        first_name: v.first_name,
        last_name: v.last_name,
        email: v.email,
        phone: v.phone,
        dob: v.dob || null,
        gender: v.gender ?? null,
        doctor_id: doctorId,
        appointment_date: localDate,
        appointment_time: selectedTime,
        reason: reasonText,
        service_id: reason?.id !== "other" ? reason?.id : null,
        custom_reason: reason?.is_other ? (v.custom_reason ?? "").trim() : null,
        redirect_to: `${window.location.origin}/reset-password`,
      },
    });

    setBusy(false);

    const payload = data as any;
    if (error || payload?.error) {
      const message =
        payload?.error ??
        (error && "context" in (error as any)
          ? await (error as any).context?.text?.().catch(() => null)
          : null);
      toast.error(message || "La réservation a échoué. Merci de réessayer.");
      return;
    }

    localStorage.removeItem("booking_draft");
    toast.success("Rendez-vous enregistré !");
    navigate(`/booking/confirmed/${payload.appointment_id}`, {
      state: {
        guest: {
          reference: payload.reference,
          isNewAccount: payload.is_new_account,
          emailSent: payload.email_sent,
          email: v.email,
          first_name: v.first_name,
          last_name: v.last_name,
          doctorName: payload.doctor_name ?? selectedDoctor?.full_name,
          specialty: selectedDoctor?.specialty ?? null,
          clinic: selectedDoctor?.clinic ?? null,
          appointment_date: localDate,
          appointment_time: selectedTime,
          reason: reasonText,
        },
      },
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-1 flex-col overflow-x-hidden bg-background">
      <Seo
        title="Prendre rendez-vous — La Dune"
        description="Réservez votre consultation en ligne sans créer de compte : choisissez un praticien, une date et un horaire."
        path="/booking"
      />
      <SiteHeader />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="pointer-events-none absolute -top-16 left-0 -z-10 h-48 w-48 rounded-full bg-primary/10 blur-2xl sm:-top-20 sm:left-1/4 sm:h-64 sm:w-64 sm:blur-3xl lg:-top-24 lg:h-72 lg:w-72" />
        <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-52 w-52 rounded-full bg-secondary/10 blur-2xl sm:h-72 sm:w-72 sm:blur-3xl lg:h-80 lg:w-80" />

        <div className="relative mx-auto w-full max-w-[1280px] px-4 py-10 sm:py-14 lg:py-20">
          <header className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary sm:px-4 sm:text-xs">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Rendez-vous en ligne — sans compte
            </span>
            <h1 className="mt-4 text-[1.9rem] font-bold leading-[1.12] tracking-tight text-foreground xs:text-4xl sm:mt-6 sm:text-5xl lg:text-[3.25rem]">
              Réservez votre{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">visite</span>
            </h1>
            <p className="mt-3 max-w-prose text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
              Renseignez vos coordonnées, choisissez votre praticien et votre créneau. Votre espace patient est créé
              automatiquement.
            </p>
          </header>

          <div className="mt-8 sm:mt-10">
            <BookingStepper steps={steps} current={currentStep} completed={completed} />
          </div>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="mt-8 grid gap-6 sm:mt-10 lg:grid-cols-12">

              {/* Left — patient + doctor */}
              <div className="space-y-6 lg:col-span-4">
                <GuestDetailsForm />

                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
                  <Label htmlFor="doctor" className="flex items-center gap-2 text-sm font-semibold">
                    <UserRound className="h-4 w-4 text-primary" aria-hidden="true" />
                    Praticien
                  </Label>
                  <Select value={doctorId} onValueChange={setDoctorId}>
                    <SelectTrigger id="doctor" className="mt-2 h-14 rounded-2xl border-transparent bg-muted/70 text-base focus:ring-4 focus:ring-primary/15">
                      <SelectValue placeholder="Choisir un praticien" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DoctorCard doctor={selectedDoctor} nextAvailable={selectedDoctor ? "Aujourd'hui" : undefined} />

                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
                  <Label htmlFor="reason" className="text-sm font-semibold">Service ou motif de consultation *</Label>
                  <ReasonSelect
                    value={reason?.id}
                    invalid={Boolean(methods.formState.errors.service_id || methods.formState.errors.reason_id)}
                    onChange={(r) => {
                      setReason(r);
                      if (r?.id === "other") {
                        methods.setValue("service_id", "");
                        methods.setValue("reason_id", "");
                      } else {
                        methods.setValue("service_id", r?.id ?? "", { shouldValidate: true });
                      }
                      if (!r?.is_other) methods.setValue("custom_reason", "");
                    }}
                  />
                  {(methods.formState.errors.service_id || methods.formState.errors.reason_id) ? (
                    <p className="mt-1.5 text-xs font-medium text-destructive">
                      {(methods.formState.errors.service_id?.message || methods.formState.errors.reason_id?.message)}
                    </p>
                  ) : null}

                  {reason?.is_other ? (
                    <div className="mt-4 animate-fade-in">
                      <Label htmlFor="custom_reason" className="text-sm font-semibold">
                        Précisez votre motif *
                      </Label>
                      <Textarea
                        id="custom_reason"
                        rows={5}
                        {...methods.register("custom_reason")}
                        placeholder="Décrivez brièvement votre besoin…"
                        className="mt-2 min-h-[140px] resize-none rounded-2xl border-transparent bg-muted/70 p-4 text-base transition-all duration-200 focus-visible:border-primary focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/15"
                      />
                      {methods.formState.errors.custom_reason ? (
                        <p className="mt-1.5 text-xs font-medium text-destructive">
                          {methods.formState.errors.custom_reason.message}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

              </div>

              {/* Center — calendar + slots */}
              <div className="space-y-6 lg:col-span-5">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
                    Choisir une date
                  </h2>
                  <div className="mt-5">
                    <BookingCalendar
                      date={date}
                      onSelect={setDate}
                      disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                      getAvailability={(d) => {
                        const day = d.getDay();
                        if (day === 0) return "none";
                        if (day === 6) return "few";
                        return "many";
                      }}
                    />
                  </div>

                </div>

                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
                      Choisir un horaire
                    </h2>
                    <span className="text-xs font-medium text-muted-foreground">{timeSlots.length} créneaux</span>
                  </div>
                  <div className="mt-5">
                    <TimeSlotGrid slots={timeSlots} selected={selectedTime} onSelect={setSelectedTime} />
                  </div>
                </div>
              </div>

              {/* Right — summary */}
              <div className="lg:col-span-3">
                <div className="lg:sticky lg:top-24">
                  <BookingSummary
                    doctorName={selectedDoctor?.full_name}
                    dateLabel={dateLabel}
                    timeLabel={selectedTime || undefined}
                    clinic={selectedDoctor?.clinic || "La Dune Clinique Dentaire"}
                    ready={ready}
                    busy={busy}
                    onSaveForLater={handleSaveForLater}
                  />
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </main>
    </div>
  );
};

export default Booking;
