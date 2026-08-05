import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft, Phone, MessageSquare, Video, CalendarPlus,
  Cake, Droplet, Mail, Activity, Heart,
  Weight, CalendarDays, Pencil,
  ShieldCheck, ShieldAlert, MapPin, UserCheck, Clock, FileText,
  CreditCard, ClipboardList, Stethoscope, MessageCircle, ListChecks, History, AlertCircle, Info,
  Share2, Loader2, Download
} from "lucide-react";
import { generatePatientEMR } from "@/utils/pdfGenerator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const InfoTile = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-border/50 shadow-sm">
    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-bold text-foreground truncate">{value || "—"}</div>
    </div>
  </div>
);

const AdminPatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("patients")
          .select(`
            *,
            patient_addresses(*),
            patient_medical_history(*),
            patient_emergency_contacts(*),
            patient_insurance(*),
            patient_social_history(*),
            patient_consent(*),
            patient_notes(*)
          `)
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          // Try fetching from legacy patient_intake if not found in new table
          const { data: legacy } = await supabase.from("patient_intake").select("*").eq("id", id).maybeSingle();
          if (legacy) setPatient(legacy);
          else navigate("/admin/patients");
        } else {
          setPatient(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, navigate]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  if (!patient) return null;

  const fullName = `${patient.first_name} ${patient.last_name}`;
  const patientCode = patient.patient_number || `#PT-${patient.id.slice(0, 4).toUpperCase()}`;
  
  const calculateAge = (dob: string) => {
    if (!dob) return "—";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return `${age} yrs`;
  };

  const handleGenerateEMR = async () => {
    setGeneratingPdf(true);
    try {
      await generatePatientEMR(patient);
      toast.success("EMR Summary generated and saved to documents");
      // Refresh patient data to show new document
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to generate EMR Summary");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Header / Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/patients")} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              Patient Details
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">{patientCode}</Badge>
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="rounded-xl h-11 px-6 border-border/50 hover:bg-white/80"
            onClick={handleGenerateEMR}
            disabled={generatingPdf}
          >
            {generatingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
            Generate EMR PDF
          </Button>
          <Button variant="outline" className="rounded-xl h-11 px-6 border-border/50 hover:bg-white/80">
            <Pencil className="w-4 h-4 mr-2" /> Edit Record
          </Button>
          <Button className="bg-gradient-primary text-white rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
            <CalendarPlus className="w-4 h-4 mr-2" /> Book Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Profile Summary */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-xl rounded-[24px] text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-primary opacity-10" />
            
            <div className="relative mt-4">
              <Avatar className="w-32 h-32 mx-auto rounded-[32px] border-4 border-white dark:border-slate-800 shadow-2xl">
                <AvatarImage src={patient.avatar_url} />
                <AvatarFallback className="text-3xl font-bold bg-primary/5 text-primary">
                  {patient.first_name[0]}{patient.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1/2 translate-x-12 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-800" />
            </div>

            <div className="mt-6">
              <h2 className="text-2xl font-bold">{fullName}</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge className={cn(
                  "rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  patient.status === 'active' ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
                )}>
                  {patient.status}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">Joined {new Date(patient.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mt-8">
              <Button size="icon" variant="outline" className="rounded-xl h-12 w-12 border-border/50 hover:bg-primary/5 hover:text-primary transition-all">
                <Phone className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-xl h-12 w-12 border-border/50 hover:bg-primary/5 hover:text-primary transition-all">
                <Mail className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-xl h-12 w-12 border-border/50 hover:bg-primary/5 hover:text-primary transition-all">
                <MessageSquare className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-xl h-12 w-12 border-border/50 hover:bg-primary/5 hover:text-primary transition-all">
                <Video className="w-5 h-5" />
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-xl rounded-[24px] space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="text-primary font-bold text-xl">12</div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Appts</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="text-emerald-600 font-bold text-xl">$1.2k</div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Paid</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Detailed Content */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-1.5 rounded-2xl border border-border/50 h-14 w-full justify-start overflow-x-auto">
              <TabsTrigger value="overview" className="rounded-xl h-11 px-6 font-bold text-sm">Overview</TabsTrigger>
              <TabsTrigger value="medical" className="rounded-xl h-11 px-6 font-bold text-sm">Medical History</TabsTrigger>
              <TabsTrigger value="timeline" className="rounded-xl h-11 px-6 font-bold text-sm">Timeline</TabsTrigger>
              <TabsTrigger value="billing" className="rounded-xl h-11 px-6 font-bold text-sm">Billing</TabsTrigger>
              <TabsTrigger value="documents" className="rounded-xl h-11 px-6 font-bold text-sm">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoTile icon={Cake} label="Age" value={calculateAge(patient.dob)} />
                <InfoTile icon={Droplet} label="Blood Group" value={patient.patient_medical_history?.[0]?.blood_group} />
                <InfoTile icon={Weight} label="BMI" value={patient.patient_medical_history?.[0]?.bmi} />
              </div>

              <Card className="p-8 border-none bg-white dark:bg-slate-900 shadow-xl rounded-[24px]">
                <div className="flex items-center gap-2 mb-6 text-primary">
                  <UserCheck className="w-5 h-5" />
                  <h3 className="font-bold">Personal Information</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Gender</Label>
                    <p className="font-bold capitalize">{patient.gender || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Marital Status</Label>
                    <p className="font-bold capitalize">{patient.marital_status || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Nationality</Label>
                    <p className="font-bold">{patient.nationality || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Phone</Label>
                    <p className="font-bold">{patient.phone || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Email</Label>
                    <p className="font-bold">{patient.email || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Occupation</Label>
                    <p className="font-bold">{patient.occupation || "—"}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-8 border-none bg-white dark:bg-slate-900 shadow-xl rounded-[24px]">
                <div className="flex items-center gap-2 mb-6 text-primary">
                  <MapPin className="w-5 h-5" />
                  <h3 className="font-bold">Contact Address</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Street Address</Label>
                    <p className="font-bold">{patient.patient_addresses?.[0]?.street_address || "—"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">City</Label>
                      <p className="font-bold">{patient.patient_addresses?.[0]?.city || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Postal Code</Label>
                      <p className="font-bold">{patient.patient_addresses?.[0]?.postal_code || "—"}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="medical" className="mt-6 space-y-6">
              <Card className="p-8 border-none bg-white dark:bg-slate-900 shadow-xl rounded-[24px]">
                <div className="flex items-center gap-2 mb-6 text-primary">
                  <Heart className="w-5 h-5 text-red-500" />
                  <h3 className="font-bold">Conditions & Allergies</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-3 block">Current Medical History</Label>
                    <div className="flex flex-wrap gap-2">
                      {patient.patient_medical_history?.[0]?.conditions?.map((c: string) => (
                        <Badge key={c} variant="secondary" className="rounded-xl px-4 py-1.5 font-bold bg-primary/5 text-primary border-none">{c}</Badge>
                      )) || <p className="text-sm text-muted-foreground">No records</p>}
                    </div>
                  </div>
                  <div className="pt-6 border-t border-border/50">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-3 block text-red-600">Known Allergies</Label>
                    <div className="flex flex-wrap gap-2">
                      {patient.patient_allergies?.[0]?.allergies?.map((a: string) => (
                        <Badge key={a} variant="destructive" className="rounded-xl px-4 py-1.5 font-bold">{a}</Badge>
                      )) || <p className="text-sm text-muted-foreground">No allergies listed</p>}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-8 border-none bg-white dark:bg-slate-900 shadow-xl rounded-[24px]">
                <div className="flex items-center gap-2 mb-6 text-primary">
                  <ClipboardList className="w-5 h-5" />
                  <h3 className="font-bold">Medical Notes</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground block mb-2">Doctor Notes</Label>
                      <div className="p-4 rounded-2xl bg-muted/30 text-sm whitespace-pre-wrap">{patient.patient_notes?.[0]?.doctor_notes || "No notes available"}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground block mb-2 text-destructive">Clinical Warnings</Label>
                      <div className="p-4 rounded-2xl bg-destructive/5 text-destructive font-bold text-sm border border-destructive/10">
                        {patient.patient_notes?.[0]?.warnings || "No active warnings"}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-6">
              <Card className="p-8 border-none bg-white dark:bg-slate-900 shadow-xl rounded-[24px]">
                <div className="flex items-center gap-2 mb-8 text-primary">
                  <History className="w-5 h-5" />
                  <h3 className="font-bold">Patient Activity Timeline</h3>
                </div>
                
                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:via-primary/10 before:to-transparent">
                  <div className="relative flex items-center gap-6">
                    <div className="absolute left-0 w-10 h-10 rounded-full bg-primary border-4 border-white dark:border-slate-800 flex items-center justify-center text-white shadow-lg">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="ml-12">
                      <p className="font-bold text-sm">Patient Created</p>
                      <p className="text-xs text-muted-foreground">{new Date(patient.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPatientDetails;
