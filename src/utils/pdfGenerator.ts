import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getPdfTemplate } from "./pdfTemplateService";

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 32, g: 48, b: 128 };
}

export const generatePatientEMR = async (patient: any) => {
  const template = await getPdfTemplate();
  const doc = new jsPDF() as any;
  const fullName = `${patient.first_name} ${patient.last_name}`;
  const patientCode = patient.patient_number || `#PT-${patient.id.slice(0, 4).toUpperCase()}`;

  const primaryColor = template.primaryColor || "#203080";
  const rgb = hexToRgb(primaryColor);

  // Header
  doc.setFontSize(template.headerFontSize);
  doc.setTextColor(rgb.r, rgb.g, rgb.b);
  doc.text(template.title, 14, 20);
  
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Patient ID: ${patientCode}`, 150, 20);

  let currentY = 40;
  let sectionIndex = 1;

  // Render sections based on order and enabled status
  for (const section of template.sectionsOrder) {
    if (!template.enabledSections.includes(section)) continue;

    if (section === "personal") {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(`${sectionIndex}. Personal Information`, 14, currentY);
      
      const personalData = [
        ["Name", fullName, "DOB", patient.dob || "—"],
        ["Gender", patient.gender || "—", "Marital Status", patient.marital_status || "—"],
        ["Email", patient.email || "—", "Phone", patient.phone || "—"],
        ["Occupation", patient.occupation || "—", "Nationality", patient.nationality || "—"],
      ];

      doc.autoTable({
        startY: currentY + 5,
        body: personalData,
        theme: 'plain',
        styles: { fontSize: template.bodyFontSize, cellPadding: 2 },
        columnStyles: { 
          0: { fontStyle: 'bold', textColor: [100, 100, 100], width: 30 },
          2: { fontStyle: 'bold', textColor: [100, 100, 100], width: 30 }
        }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
      sectionIndex++;
    }

    if (section === "medical") {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(`${sectionIndex}. Medical Summary`, 14, currentY);
      
      const medical = patient.patient_medical_history?.[0] || {};
      const medicalData = [
        ["Blood Group", medical.blood_group || "—", "BMI", medical.bmi || "—"],
        ["Height", medical.height_cm ? `${medical.height_cm} cm` : "—", "Weight", medical.weight_kg ? `${medical.weight_kg} kg` : "—"],
        ["Conditions", medical.conditions?.join(", ") || "None listed", "", ""],
      ];

      doc.autoTable({
        startY: currentY + 5,
        body: medicalData,
        theme: 'plain',
        styles: { fontSize: template.bodyFontSize, cellPadding: 2 },
        columnStyles: { 
          0: { fontStyle: 'bold', textColor: [100, 100, 100], width: 30 },
          2: { fontStyle: 'bold', textColor: [100, 100, 100], width: 30 }
        }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
      sectionIndex++;
    }

    if (section === "allergies") {
      const allergies = patient.patient_allergies?.[0]?.allergies || [];
      if (allergies.length > 0) {
        doc.setTextColor(220, 38, 38);
        doc.text("ALLERGIES:", 14, currentY);
        doc.setFontSize(template.bodyFontSize);
        doc.text(allergies.join(", "), 45, currentY);
        doc.setTextColor(0);
        currentY += 10;
      }
    }

    if (section === "medications") {
      doc.setFontSize(14);
      doc.text(`${sectionIndex}. Current Medications`, 14, currentY);
      
      const medications = patient.patient_medications || [];
      if (medications.length > 0) {
        doc.autoTable({
          startY: currentY + 5,
          head: [['Medication', 'Dose', 'Frequency', 'Notes']],
          body: medications.map((m: any) => [m.medication, m.dose, m.frequency, m.notes || "—"]),
          headStyles: { fillColor: [rgb.r, rgb.g, rgb.b] }
        });
      } else {
        doc.setFontSize(template.bodyFontSize);
        doc.text("No active medications listed.", 14, currentY + 10);
        (doc as any).lastAutoTable = { finalY: currentY + 10 };
      }
      currentY = (doc as any).lastAutoTable.finalY + 15;
      sectionIndex++;
    }

    if (section === "notes") {
      doc.setFontSize(14);
      doc.text(`${sectionIndex}. Clinical Notes`, 14, currentY);
      const notes = patient.patient_notes?.[0];
      doc.setFontSize(template.bodyFontSize);
      doc.text(notes?.doctor_notes || "No clinical notes recorded.", 14, currentY + 10, { maxWidth: 180 });
      currentY += 20;
    }
  }

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
