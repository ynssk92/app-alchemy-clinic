
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface PrescriptionPDFData {
  prescription: any;
  patient: any;
  doctor: any;
  items: any[];
  settings: any;
  logoUrl?: string;
}

export async function generatePrescriptionPDF(data: PrescriptionPDFData) {
  const { prescription, patient, doctor, items, settings, logoUrl } = data;
  
  const { jsPDF } = await import("jspdf");
  
  // A4: 595.28 x 841.89 pts
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
    orientation: "portrait"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = pageWidth - (margin * 2);
  
  // Colors - Royal Blue aesthetic
  const primaryColor = [32, 48, 128]; // Deep royal blue
  const textDark = [30, 41, 59]; // Slate 800
  const textGray = [100, 116, 139]; // Slate 500
  const lightGray = [241, 245, 249]; // Slate 100
  
  // Helper: Header & Footer for each page
  const addSkeleton = (pageNum: number, totalPages: number) => {
    // Top blue bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 6, "F");
    
    // Clinic Info Header
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("CLINIQUE LA DUNE DENTAIRE", margin, 50);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    
    let headerY = 65;
    if (settings.contact_address) {
      doc.text(settings.contact_address, margin, headerY);
      headerY += 12;
    }
    const contactParts = [];
    if (settings.contact_phone) contactParts.push(settings.contact_phone);
    if (settings.contact_email) contactParts.push(settings.contact_email);
    
    if (contactParts.length > 0) {
      doc.text(contactParts.join("  |  "), margin, headerY);
    }
    
    // Page number
    doc.setFontSize(8);
    doc.text(`Page ${pageNum} / ${totalPages}`, pageWidth - margin, 50, { align: "right" });
    
    // Footer
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.line(margin, pageHeight - 60, pageWidth - margin, pageHeight - 60);
    
    doc.setFontSize(8);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    const footerText = `Ordonnance générée le ${format(new Date(), "dd/MM/yyyy HH:mm")}  •  ${settings.site_name || "La Dune Clinique Dentaire"}`;
    doc.text(footerText, margin, pageHeight - 45);
  };

  // Prepare logo if exists
  let logoBase64 = "";
  if (logoUrl) {
    try {
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Logo fetch failed", err);
    }
  }

  // --- Start Content Generation ---
  
  let currentY = 130;
  
  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("ORDONNANCE", margin, currentY);
  
  doc.setFontSize(10);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  const prescriptionRef = `N° ${prescription.id.split("-")[0].toUpperCase()}`;
  doc.text(prescriptionRef, margin, currentY + 16);
  
  currentY += 50;
  
  // Patient & Date info box
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(margin, currentY, contentWidth, 75, 8, 8, "F");
  
  let boxY = currentY + 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text("PATIENT", margin + 25, boxY);
  doc.text("DATE", margin + (contentWidth / 2) + 25, boxY);
  
  boxY += 20;
  doc.setFontSize(13);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(patient.full_name?.toUpperCase() || "PATIENT", margin + 25, boxY);
  doc.text(format(new Date(prescription.created_at), "dd MMMM yyyy"), margin + (contentWidth / 2) + 25, boxY);
  
  if (patient.dob) {
    boxY += 16;
    doc.setFontSize(9);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();
    doc.text(`Né(e) le ${format(new Date(patient.dob), "dd/MM/yyyy")} (${age} ans)`, margin + 25, boxY);
  }
  
  currentY += 110;
  
  // Medications Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("MÉDICAMENTS ET POSOLOGIE", margin, currentY);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.line(margin, currentY + 6, margin + 185, currentY + 6);
  
  currentY += 40;
  
  // Medication list
  items.forEach((item, index) => {
    // Check for page overflow - Approximate block height
    let blockHeight = 30; // Medication name
    if (item.dosage) blockHeight += 16;
    if (item.frequency) blockHeight += 16;
    if (item.duration) blockHeight += 16;
    if (item.instructions) {
      const instrLines = doc.splitTextToSize(`Instructions: ${item.instructions}`, contentWidth - 100);
      blockHeight += (instrLines.length * 14) + 5;
    }
    blockHeight += 20; // Spacing

    if (currentY + blockHeight > pageHeight - 120) {
      doc.addPage();
      currentY = 130;
    }
    
    // Medication Number & Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`${index + 1}. ${item.medication_name.toUpperCase()}`, margin + 5, currentY);
    
    currentY += 22;
    
    // Structured Details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const labelX = margin + 25;
    const valueX = margin + 100;
    
    if (item.dosage) {
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.text("Dosage", labelX, currentY);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(item.dosage, valueX, currentY);
      currentY += 16;
    }
    
    if (item.frequency) {
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.text("Fréquence", labelX, currentY);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(item.frequency, valueX, currentY);
      currentY += 16;
    }

    if (item.duration) {
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.text("Durée", labelX, currentY);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(item.duration, valueX, currentY);
      currentY += 16;
    }
    
    if (item.instructions) {
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.text("Instructions", labelX, currentY);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      const instrLines = doc.splitTextToSize(item.instructions, contentWidth - 100);
      doc.text(instrLines, valueX, currentY);
      currentY += (instrLines.length * 14);
    }
    
    currentY += 25;
  });
  
  // General Notes if any
  if (prescription.notes) {
    if (currentY > pageHeight - 160) {
      doc.addPage();
      currentY = 130;
    }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text("NOTES COMPLÉMENTAIRES", margin, currentY);
    currentY += 18;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    const noteLines = doc.splitTextToSize(prescription.notes, contentWidth);
    doc.text(noteLines, margin, currentY);
    currentY += (noteLines.length * 14) + 25;
  }
  
  // Signature Area
  if (currentY > pageHeight - 180) {
    doc.addPage();
    currentY = 130;
  } else {
    currentY += 40;
  }
  
  const sigX = pageWidth - margin - 200;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text("Médecin prescripteur", sigX, currentY);
  
  currentY += 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  
  if (doctor) {
    doc.text(`Dr. ${doctor.full_name}`, sigX, currentY);
    if (doctor.specialties?.name) {
      currentY += 15;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.text(doctor.specialties.name, sigX, currentY);
    }
  } else {
    doc.setFont("helvetica", "italic");
    doc.text("Non renseigné", sigX, currentY);
  }

  currentY += 35;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text("Signature du médecin", sigX, currentY);
  currentY += 5;
  doc.setDrawColor(textGray[0], textGray[1], textGray[2]);
  doc.setLineWidth(0.5);
  doc.line(sigX, currentY + 40, sigX + 180, currentY + 40);
  
  // Add skeleton to all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addSkeleton(i, totalPages);
    
    if (logoBase64 && i === 1) {
      // Add logo on first page only (top right)
      try {
        doc.addImage(logoBase64, "PNG", pageWidth - margin - 100, 60, 100, 50, undefined, "FAST");
      } catch (e) {
        console.warn("Could not add logo to PDF", e);
      }
    }
  }
  
  // Download
  const cleanName = patient.full_name?.replace(/[^a-z0-9]/gi, "_") || "Patient";
  const ref = prescription.id.split("-")[0].toUpperCase();
  const filename = `Ordonnance-${cleanName}-${ref}.pdf`;
  doc.save(filename);
}
