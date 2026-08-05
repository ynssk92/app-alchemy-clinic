import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 32, g: 48, b: 128 };
}
import { toast } from "sonner";

export const generatePatientEMR = async (patient: any) => {
  const doc = new jsPDF() as any;
  const fullName = `${patient.first_name} ${patient.last_name}`;
  const patientCode = patient.patient_number || `#PT-${patient.id.slice(0, 4).toUpperCase()}`;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(32, 48, 128); // Primary Blue
  doc.text("Electronic Medical Record", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Patient ID: ${patientCode}`, 150, 20);

  // 1. Personal Information
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("1. Personal Information", 14, 40);
  
  const personalData = [
    ["Name", fullName, "DOB", patient.dob || "—"],
    ["Gender", patient.gender || "—", "Marital Status", patient.marital_status || "—"],
    ["Email", patient.email || "—", "Phone", patient.phone || "—"],
    ["Occupation", patient.occupation || "—", "Nationality", patient.nationality || "—"],
  ];

  doc.autoTable({
    startY: 45,
    body: personalData,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 
      0: { fontStyle: 'bold', textColor: [100, 100, 100], width: 30 },
      2: { fontStyle: 'bold', textColor: [100, 100, 100], width: 30 }
    }
  });

  // 2. Medical History
  const historyY = (doc as any).lastAutoTable.finalY + 15;
  doc.text("2. Medical Summary", 14, historyY);
  
  const medical = patient.patient_medical_history?.[0] || {};
  const medicalData = [
    ["Blood Group", medical.blood_group || "—", "BMI", medical.bmi || "—"],
    ["Height", medical.height_cm ? `${medical.height_cm} cm` : "—", "Weight", medical.weight_kg ? `${medical.weight_kg} kg` : "—"],
    ["Conditions", medical.conditions?.join(", ") || "None listed", "", ""],
  ];

  doc.autoTable({
    startY: historyY + 5,
    body: medicalData,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 
      0: { fontStyle: 'bold', textColor: [100, 100, 100], width: 30 },
      2: { fontStyle: 'bold', textColor: [100, 100, 100], width: 30 }
    }
  });

  // 3. Allergies (Highlighted)
  const allergiesY = (doc as any).lastAutoTable.finalY + 10;
  const allergies = patient.patient_allergies?.[0]?.allergies || [];
  if (allergies.length > 0) {
    doc.setTextColor(220, 38, 38); // Red
    doc.text("ALLERGIES:", 14, allergiesY);
    doc.setFontSize(10);
    doc.text(allergies.join(", "), 45, allergiesY);
    doc.setTextColor(0);
  }

  // 4. Medications
  const medY = allergiesY + 10;
  doc.setFontSize(14);
  doc.text("3. Current Medications", 14, medY);
  
  const medications = patient.patient_medications || [];
  if (medications.length > 0) {
    doc.autoTable({
      startY: medY + 5,
      head: [['Medication', 'Dose', 'Frequency', 'Notes']],
      body: medications.map((m: any) => [m.medication, m.dose, m.frequency, m.notes || "—"]),
      headStyles: { fillColor: [32, 48, 128] }
    });
  } else {
    doc.setFontSize(10);
    doc.text("No active medications listed.", 14, medY + 10);
    (doc as any).lastAutoTable = { finalY: medY + 10 };
  }

  // 5. Clinical Notes
  const notesY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text("4. Clinical Notes", 14, notesY);
  const notes = patient.patient_notes?.[0];
  doc.setFontSize(10);
  doc.text(notes?.doctor_notes || "No clinical notes recorded.", 14, notesY + 10, { maxWidth: 180 });

  // Convert to Blob
  const pdfBlob = doc.output('blob');
  const fileName = `EMR_${patientCode}_${new Date().getTime()}.pdf`;
  const filePath = `${patient.id}/${fileName}`;

  // Upload to Supabase
  const { error: uploadError } = await supabase.storage
    .from('patient_documents')
    .upload(filePath, pdfBlob, {
      contentType: 'application/pdf'
    });

  if (uploadError) throw uploadError;

  // Save record in DB
  const { error: dbError } = await supabase.from("patient_documents").insert({
    patient_id: patient.id,
    document_name: `EMR Summary - ${new Date().toLocaleDateString()}`,
    document_type: 'application/pdf',
    category: 'medical_record',
    file_path: filePath
  });

  if (dbError) throw dbError;

  return { fileName, filePath };
};
