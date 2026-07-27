import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Calendar as CalendarIcon, Clock, User } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import { Seo } from "@/components/Seo";
import { SiteHeader } from "@/components/SiteHeader";

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
];

const Booking = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [doctorId, setDoctorId] = useState(params.get("doctor") || "");
  const [doctors, setDoctors] = useState<{ id: string; full_name: string }[]>([]);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    supabase.from("doctors").select("id, full_name").eq("is_available", true).then(({ data }) => {
      setDoctors(data || []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!date || !selectedTime || !doctorId) {
      toast.error("Please select a doctor, date, and time");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("appointments").insert({
      patient_id: user.id,
      doctor_id: doctorId,
      appointment_date: date.toISOString().slice(0, 10),
      appointment_time: selectedTime,
      reason,
      status: "upcoming",
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Appointment booked successfully!");
    setTimeout(() => navigate("/patient-dashboard"), 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Book an Appointment — HealthBook"
        description="Choose a doctor, pick a date and time, and confirm your appointment in seconds."
        path="/booking"
      />
      <SiteHeader />

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">Book Your Appointment</h1>
              <p className="text-lg text-muted-foreground">Choose a convenient time and we'll take care of the rest</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6 border-border bg-card">
                  <div className="flex items-center gap-2 mb-6">
                    <User className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-card-foreground">Appointment Details</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Doctor</Label>
                      <Select value={doctorId} onValueChange={setDoctorId}>
                        <SelectTrigger><SelectValue placeholder="Choose a doctor" /></SelectTrigger>
                        <SelectContent>
                          {doctors.map((d) => (
                            <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="reason">Reason for Visit</Label>
                      <Textarea id="reason" required rows={6}
                        value={reason} onChange={(e) => setReason(e.target.value)} />
                    </div>
                  </div>
                </Card>

                <div className="space-y-6">
                  <Card className="p-6 border-border bg-card">
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-bold text-card-foreground">Select Date</h2>
                    </div>
                    <Calendar mode="single" selected={date} onSelect={setDate}
                      className="rounded-md border-border" disabled={(d) => d < new Date()} />
                  </Card>

                  <Card className="p-6 border-border bg-card">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-bold text-card-foreground">Select Time</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <Button key={time} type="button"
                          variant={selectedTime === time ? "default" : "outline"}
                          className="h-12" onClick={() => setSelectedTime(time)}>
                          {time}
                        </Button>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button type="submit" size="lg" className="px-12" disabled={busy}>
                  {busy ? "Booking..." : "Confirm Booking"}
                  <Sparkles className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Booking;
