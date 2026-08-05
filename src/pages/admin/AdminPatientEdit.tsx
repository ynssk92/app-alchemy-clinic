import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PatientWizard from "@/components/admin/patient/PatientWizard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const AdminPatientEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          toast.error("Patient not found");
          navigate("/admin/patients");
          return;
        }
        setPatient(data);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading patient record...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <PatientWizard initialData={patient} isEditing={true} />
    </div>
  );
};

export default AdminPatientEdit;
