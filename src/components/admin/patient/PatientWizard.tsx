import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, Loader2 } from "lucide-react";
import ProgressIndicator from "./ProgressIndicator";
import Step1PersonalInfo from "./Step1PersonalInfo";
import Step2MedicalInfo from "./Step2MedicalInfo";
import Step3EmergencyAdmin from "./Step3EmergencyAdmin";
import StickySaveBar from "./StickySaveBar";

export type PatientFormData = {
  // Personal
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  marital_status: string;
  nationality: string;
  national_id: string;
  email: string;
  phone: string;
  alternative_phone: string;
  preferred_language: string;
  occupation: string;
  avatar_url?: string;
  
  // Address
  country: string;
  city: string;
  region: string;
  postal_code: string;
  street_address: string;
  google_maps_location: string;

  // Medical
  blood_group: string;
  height_cm: string;
  weight_kg: string;
  bmi: string;
  primary_doctor_id: string;
  insurance_provider: string;
  insurance_number: string;
  insurance_expiration: string;
  preferred_pharmacy: string;
  
  // History & Allergies
  medical_history: string[];
  custom_conditions: string;
  allergies: string[];
  custom_allergies: string;
  
  // Medications
  medications: {
    medication: string;
    dose: string;
    frequency: string;
    duration: string;
    notes: string;
  }[];
  
  // Dental
  previous_dentist: string;
  last_visit: string;
  chief_complaint: string;
  reason_for_visit: string;
  dental_treatments: string[];
  
  // Social
  smoking: string;
  alcohol: string;
  drug_use: string;
  exercise: string;
  
  // Emergency
  emergency_name: string;
  emergency_relationship: string;
  emergency_phone: string;
  emergency_alt_phone: string;
  emergency_email: string;
  
  // Consent
  receive_sms: boolean;
  receive_email: boolean;
  marketing_consent: boolean;
  privacy_policy_accepted: boolean;
  treatment_consent: boolean;
  gdpr_consent: boolean;
  
  // Administrative
  status: string;
  lead_source: string;
  
  // Notes
  doctor_notes: string;
  internal_notes: string;
  warnings: string;
  special_instructions: string;
};

const initialData: PatientFormData = {
  first_name: "",
  last_name: "",
  gender: "",
  dob: "",
  marital_status: "",
  nationality: "",
  national_id: "",
  email: "",
  phone: "",
  alternative_phone: "",
  preferred_language: "fr",
  occupation: "",
  country: "",
  city: "",
  region: "",
  postal_code: "",
  street_address: "",
  google_maps_location: "",
  blood_group: "",
  height_cm: "",
  weight_kg: "",
  bmi: "",
  primary_doctor_id: "",
  insurance_provider: "",
  insurance_number: "",
  insurance_expiration: "",
  preferred_pharmacy: "",
  medical_history: [],
  custom_conditions: "",
  allergies: [],
  custom_allergies: "",
  medications: [],
  previous_dentist: "",
  last_visit: "",
  chief_complaint: "",
  reason_for_visit: "",
  dental_treatments: [],
  smoking: "never",
  alcohol: "never",
  drug_use: "",
  exercise: "",
  emergency_name: "",
  emergency_relationship: "",
  emergency_phone: "",
  emergency_alt_phone: "",
  emergency_email: "",
  receive_sms: false,
  receive_email: false,
  marketing_consent: false,
  privacy_policy_accepted: false,
  treatment_consent: false,
  gdpr_consent: false,
  status: "active",
  lead_source: "website",
  doctor_notes: "",
  internal_notes: "",
  warnings: "",
  special_instructions: "",
};

const PatientWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PatientFormData>(initialData);
  const [isBusy, setIsBusy] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateFormData = (data: Partial<PatientFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setHasChanges(true);
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name) {
      toast.error("First name and Last name are required");
      setStep(1);
      return;
    }

    setIsBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Insert into patients
      const { data: patient, error: patientError } = await supabase.from("patients").insert({
        first_name: formData.first_name,
        last_name: formData.last_name,
        gender: formData.gender,
        dob: formData.dob || null,
        marital_status: formData.marital_status,
        nationality: formData.nationality,
        national_id: formData.national_id,
        email: formData.email,
        phone: formData.phone,
        alternative_phone: formData.alternative_phone,
        preferred_language: formData.preferred_language,
        occupation: formData.occupation,
        status: formData.status,
        lead_source: formData.lead_source,
        created_by: user?.id,
      }).select().single();

      if (patientError) throw patientError;

      // 2. Parallel inserts for related data
      await Promise.all([
        supabase.from("patient_addresses").insert({
          patient_id: patient.id,
          country: formData.country,
          city: formData.city,
          region: formData.region,
          postal_code: formData.postal_code,
          street_address: formData.street_address,
          google_maps_location: formData.google_maps_location,
        }),
        supabase.from("patient_medical_history").insert({
          patient_id: patient.id,
          blood_group: formData.blood_group,
          height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
          bmi: formData.bmi ? parseFloat(formData.bmi) : null,
          primary_doctor_id: formData.primary_doctor_id || null,
          conditions: formData.medical_history,
          custom_conditions: formData.custom_conditions,
        }),
        supabase.from("patient_allergies").insert({
          patient_id: patient.id,
          allergies: formData.allergies,
          custom_allergies: formData.custom_allergies,
        }),
        supabase.from("patient_emergency_contacts").insert({
          patient_id: patient.id,
          name: formData.emergency_name,
          relationship: formData.emergency_relationship,
          phone: formData.emergency_phone,
          alternative_phone: formData.emergency_alt_phone,
          email: formData.emergency_email,
        }),
        supabase.from("patient_insurance").insert({
          patient_id: patient.id,
          provider: formData.insurance_provider,
          policy_number: formData.insurance_number,
          expiration_date: formData.insurance_expiration || null,
        }),
        supabase.from("patient_dental_history").insert({
          patient_id: patient.id,
          previous_dentist: formData.previous_dentist,
          last_visit: formData.last_visit || null,
          chief_complaint: formData.chief_complaint,
          reason_for_visit: formData.reason_for_visit,
          treatments: formData.dental_treatments,
        }),
        supabase.from("patient_social_history").insert({
          patient_id: patient.id,
          smoking: formData.smoking,
          alcohol: formData.alcohol,
          drug_use: formData.drug_use,
          exercise: formData.exercise,
        }),
        supabase.from("patient_consent").insert({
          patient_id: patient.id,
          receive_sms: formData.receive_sms,
          receive_email: formData.receive_email,
          marketing_consent: formData.marketing_consent,
          privacy_policy_accepted: formData.privacy_policy_accepted,
          treatment_consent: formData.treatment_consent,
          gdpr_consent: formData.gdpr_consent,
        }),
        supabase.from("patient_notes").insert({
          patient_id: patient.id,
          doctor_notes: formData.doctor_notes,
          internal_notes: formData.internal_notes,
          warnings: formData.warnings,
          special_instructions: formData.special_instructions,
        }),
        // Medications
        formData.medications.length > 0 ? supabase.from("patient_medications").insert(
          formData.medications.map(m => ({ ...m, patient_id: patient.id }))
        ) : Promise.resolve(),
      ]);

      toast.success("Patient created successfully");
      navigate(`/admin/patients/details/${patient.id}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create patient");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 relative pb-32">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Patient</h1>
          <p className="text-muted-foreground mt-1">Create a premium electronic medical record (EMR)</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/patients")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Patients
        </Button>
      </div>

      <ProgressIndicator currentStep={step} />

      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <Step1PersonalInfo formData={formData} onChange={updateFormData} />
            )}
            {step === 2 && (
              <Step2MedicalInfo formData={formData} onChange={updateFormData} />
            )}
            {step === 3 && (
              <Step3EmergencyAdmin formData={formData} onChange={updateFormData} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-10">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={step === 1 || isBusy}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </Button>

        {step < 3 ? (
          <Button
            onClick={handleNext}
            disabled={isBusy}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Next Step <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isBusy}
            className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Finalize & Save
          </Button>
        )}
      </div>

      <StickySaveBar 
        visible={hasChanges} 
        isBusy={isBusy} 
        onSave={handleSubmit} 
        onDiscard={() => {
          setFormData(initialData);
          setHasChanges(false);
          setStep(1);
        }} 
      />
    </div>
  );
};

export default PatientWizard;
