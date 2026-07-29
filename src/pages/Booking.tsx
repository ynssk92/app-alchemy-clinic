import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Clock, UserRound } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
];

const steps = [
  { id: 1, label: "Praticien" },
  { id: 2, label: "Date" },
  { id: 3, label: "Heure" },
  { id: 4, label: "Confirmation" },
];

const Booking = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [doctorId, setDoctorId] = useState(params.get("doctor") || "");
  const [doctors, setDoctors] = useState<BookingDoctor[]>([]);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

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

  const completed = [
    doctorId ? 1 : 0,
    date ? 2 : 0,
    selectedTime ? 3 : 0,
  ].filter(Boolean) as number[];
  const currentStep = !doctorId ? 1 : !date ? 2 : !selectedTime ? 3 : 4;
  const ready = Boolean(doctorId && date && selectedTime);

  const handleSaveForLater = () => {
    localStorage.setItem(
      "booking_draft",
      JSON.stringify({ doctorId, date: date?.toISOString() ?? null, selectedTime, reason })
    );
    toast.success("Sélection enregistrée. Vous pourrez la reprendre plus tard.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!date || !selectedTime || !doctorId) {
      toast.error("Please select a doctor, date, and time");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        patient_id: user.id,
        doctor_id: doctorId,
        appointment_date: date.toISOString().slice(0, 10),
        appointment_time: selectedTime,
        reason,
        status: "upcoming",
      })
      .select("id")
      .single();
    setBusy(false);
    if (error) return toast.error(error.message);
    localStorage.removeItem("booking_draft");
    toast.success("Appointment booked successfully!");
    navigate(data?.id ? `/booking/confirmed/${data.id}` : "/patient-dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Book an Appointment — HealthBook"
        description="Choose a doctor, pick a date and time, and confirm your appointment in seconds."
        path="/booking"
      />
      <SiteHeader />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative mx-auto w-full max-w-[1280px] px-4 py-14 md:py-20">
          <header className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              Rendez-vous en ligne
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              Réservez votre{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">visite</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Choisissez votre praticien, la date et l'heure qui vous conviennent — en quelques clics.
            </p>
          </header>

          <div className="mt-10">
            <BookingStepper steps={steps} current={currentStep} completed={completed} />
          </div>

          <form onSubmit={handleSubmit} className="mt-10 grid gap-6 lg:grid-cols-10">
            {/* Left — doctor */}
            <div className="space-y-6 lg:col-span-3">
              <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
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

              <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
                <Label htmlFor="reason" className="text-sm font-semibold">Motif de la consultation</Label>
                <Textarea
                  id="reason"
                  required
                  rows={5}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Décrivez brièvement votre besoin…"
                  className="mt-2 min-h-[140px] resize-none rounded-2xl border-transparent bg-muted/70 p-4 text-base transition-all duration-250 focus-visible:border-primary focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/15"
                />
              </div>
            </div>

            {/* Center — calendar + slots */}
            <div className="space-y-6 lg:col-span-4">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
                  Choisir une date
                </h2>
                <div className="mt-5">
                  <BookingCalendar
                    date={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
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
        </div>
      </main>
    </div>
  );
};

export default Booking;
