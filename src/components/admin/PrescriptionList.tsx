import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Plus, Search, FileText, Pill, Calendar, User, 
  Trash2, Download, Printer, Loader2, PlusCircle, X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { generatePrescriptionPDF } from "@/utils/prescriptionPdf";
import { useAppSettings } from "@/hooks/useAppSettings";

interface PrescriptionListProps {
  patientId: string;
}

const PrescriptionList = ({ patientId }: PrescriptionListProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const { settings, logoUrl } = useAppSettings();
  
  // New Prescription State
  const [newPrescription, setNewPrescription] = useState({
    notes: "",
    items: [{ medication_name: "", dosage: "", frequency: "", duration: "", instructions: "" }]
  });

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*, prescription_items(*)")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrescriptions(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setNewPrescription(prev => ({
      ...prev,
      items: [...prev.items, { medication_name: "", dosage: "", frequency: "", duration: "", instructions: "" }]
    }));
  };

  const removeItem = (index: number) => {
    setNewPrescription(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const updatedItems = [...newPrescription.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setNewPrescription(prev => ({ ...prev, items: updatedItems }));
  };

  const handleSave = async () => {
    if (newPrescription.items.some(item => !item.medication_name)) {
      toast({ title: "Error", description: "Medication name is required for all items", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      const { data: prescription, error: pError } = await supabase
        .from("prescriptions")
        .insert({
          patient_id: patientId,
          notes: newPrescription.notes
        })
        .select()
        .single();

      if (pError) throw pError;

      const items = newPrescription.items.map(item => ({
        ...item,
        prescription_id: prescription.id
      }));

      const { error: iError } = await supabase
        .from("prescription_items")
        .insert(items);

      if (iError) throw iError;

      // Log timeline event
      await supabase.from("patient_events").insert({
        patient_id: patientId,
        event_type: "prescription_created",
        title: "New Prescription",
        description: `Prescribed ${items.length} medication(s)`,
        metadata: { prescription_id: prescription.id }
      });

      toast({ title: "Success", description: "Prescription saved successfully" });
      setIsAddOpen(false);
      setNewPrescription({ notes: "", items: [{ medication_name: "", dosage: "", frequency: "", duration: "", instructions: "" }] });
      fetchPrescriptions();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async (p: any) => {
    try {
      setGeneratingPdf(p.id);
      
      // Fetch patient details
      const { data: patient, error: patientError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", patientId)
        .maybeSingle();
      
      if (patientError) throw patientError;
      
      // If profile not found, it might be an intake/guest
      let finalPatient = patient;
      if (!finalPatient) {
        const { data: intake, error: intakeError } = await supabase
          .from("patient_intake")
          .select("*")
          .eq("id", patientId)
          .maybeSingle();
        if (intakeError) throw intakeError;
        finalPatient = intake;
      }

      if (!finalPatient) {
        throw new Error("Patient not found");
      }

      // Fetch doctor details if prescription has doctor_id
      let doctor = null;
      if (p.doctor_id) {
        const { data: doc, error: docError } = await supabase
          .from("profiles")
          .select("*, specialties(*)")
          .eq("id", p.doctor_id)
          .maybeSingle();
        if (docError) throw docError;
        doctor = doc;
      }

      await generatePrescriptionPDF({
        prescription: p,
        patient: finalPatient,
        doctor: doctor,
        items: p.prescription_items || [],
        settings,
        logoUrl
      });

      toast({ title: "Succès", description: "Ordonnance générée avec succès" });
    } catch (error: any) {
      console.error("PDF generation error:", error);
      toast({ title: "Erreur", description: "Impossible de générer le PDF", variant: "destructive" });
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handlePrint = (p: any) => {
    // Basic print functionality for now, triggers browser print
    window.print();
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Historique des Ordonnances</h3>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Ordonnance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouvelle Ordonnance</DialogTitle>
              <DialogDescription>
                Ajoutez les médicaments et instructions pour le patient.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-4">
                {newPrescription.items.map((item, index) => (
                  <div key={index} className="p-4 rounded-xl border bg-muted/20 relative space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Médicament</Label>
                        <Input 
                          placeholder="Nom du médicament" 
                          value={item.medication_name}
                          onChange={(e) => updateItem(index, "medication_name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Dosage</Label>
                        <Input 
                          placeholder="Ex: 500mg" 
                          value={item.dosage}
                          onChange={(e) => updateItem(index, "dosage", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fréquence</Label>
                        <Input 
                          placeholder="Ex: 2 fois par jour" 
                          value={item.frequency}
                          onChange={(e) => updateItem(index, "frequency", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Durée</Label>
                        <Input 
                          placeholder="Ex: 7 jours" 
                          value={item.duration}
                          onChange={(e) => updateItem(index, "duration", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Instructions</Label>
                      <Input 
                        placeholder="Instructions particulières..." 
                        value={item.instructions}
                        onChange={(e) => updateItem(index, "instructions", e.target.value)}
                      />
                    </div>
                    {newPrescription.items.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute -top-2 -right-2 h-8 w-8 bg-background border rounded-full shadow-sm"
                        onClick={() => removeItem(index)}
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button variant="outline" className="w-full border-dashed" onClick={addItem}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Ajouter un médicament
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Notes supplémentaires</Label>
                <textarea 
                  className="w-full h-24 p-2 rounded-md border text-sm bg-transparent"
                  placeholder="Notes générales pour cette ordonnance..."
                  value={newPrescription.notes}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button>
              <Button 
                className="bg-gradient-primary" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enregistrer l'ordonnance
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24" />
            </Card>
          ))
        ) : prescriptions.length > 0 ? (
          prescriptions.map((p) => (
            <Card key={p.id} className="border-[#E2E8F0]">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Ordonnance #{p.id.split("-")[0].toUpperCase()}</h4>
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(p.created_at), "dd MMMM yyyy")}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {p.prescription_items?.map((item: any) => (
                        <div key={item.id} className="text-sm p-3 rounded-lg bg-muted/30 border border-muted/50">
                          <p className="font-medium text-primary">{item.medication_name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.dosage} • {item.frequency} • {item.duration}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="h-9" onClick={() => handlePrint(p)}>
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimer
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9" 
                      onClick={() => handleDownloadPdf(p)}
                      disabled={generatingPdf === p.id}
                    >
                      {generatingPdf === p.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed">
            <FileText className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">Aucune ordonnance</p>
            <p className="text-sm">Créez la première ordonnance pour ce patient.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionList;
