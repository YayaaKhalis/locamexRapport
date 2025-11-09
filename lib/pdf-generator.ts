import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ReportData } from "@/types";

// Couleurs LOCAMEX
const COLORS = {
  blue: "#0066CC",
  blueDark: "#004080",
  cyan: "#00A3E0",
  white: "#FFFFFF",
  grayLight: "#F5F5F5",
  grayMedium: "#CCCCCC",
  textDark: "#2C3E50",
};

// Convertir hex en RGB pour jsPDF
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

/**
 * Génère un PDF professionnel avec la charte graphique LOCAMEX
 */
export function generatePDF(data: ReportData): Blob {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  let yPosition = margin;

  // Fonction pour ajouter l'en-tête sur chaque page
  const addHeader = () => {
    const [r, g, b] = hexToRgb(COLORS.blue);
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, pageWidth, 15, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("LOCAMEX", pageWidth / 2, 8, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Expert en recherche de fuites piscine",
      pageWidth / 2,
      12,
      { align: "center" }
    );
  };

  // Fonction pour ajouter le pied de page
  const addFooter = (pageNumber: number) => {
    const [r, g, b] = hexToRgb(COLORS.blue);
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    const [tr, tg, tb] = hexToRgb(COLORS.textDark);
    doc.setTextColor(tr, tg, tb);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    doc.text(
      "LOCAMEX - 1er Réseau d'experts en recherche de fuites piscine",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );

    doc.text(
      `www.locamex.org | contact@locamex.org | Page ${pageNumber}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );
  };

  // Ajouter l'en-tête de la première page
  addHeader();

  // Titre du rapport
  yPosition = 25;
  const [br, bg, bb] = hexToRgb(COLORS.blue);
  doc.setTextColor(br, bg, bb);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Rapport d'Inspection", pageWidth / 2, yPosition, {
    align: "center",
  });

  // Date de génération
  yPosition += 8;
  const [gr, gg, gb] = hexToRgb(COLORS.textDark);
  doc.setTextColor(gr, gg, gb);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const today = new Date().toLocaleDateString("fr-FR");
  doc.text(`Généré le ${today}`, pageWidth / 2, yPosition, {
    align: "center",
  });

  yPosition += 15;

  // Contenu principal
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  // Diviser le texte en lignes pour respecter les marges
  const textLines = doc.splitTextToSize(
    data.correctedText || data.originalText,
    pageWidth - 2 * margin
  );

  // Ajouter le texte ligne par ligne
  for (let i = 0; i < textLines.length; i++) {
    // Vérifier si on doit ajouter une nouvelle page
    if (yPosition > pageHeight - 30) {
      addFooter(1);
      doc.addPage();
      addHeader();
      yPosition = 25;
    }

    doc.text(textLines[i], margin, yPosition);
    yPosition += 6;
  }

  // Ajouter les images s'il y en a
  if (data.images && data.images.length > 0) {
    yPosition += 10;

    data.images.forEach((image, index) => {
      // Vérifier si on a assez de place
      if (yPosition > pageHeight - 80) {
        addFooter(1);
        doc.addPage();
        addHeader();
        yPosition = 25;
      }

      try {
        // Ajouter l'image (max 80mm de large)
        const maxWidth = 80;
        const imgDataUrl = `data:${image.contentType || "image/png"};base64,${image.base64}`;

        doc.addImage(imgDataUrl, "PNG", margin, yPosition, maxWidth, 0);

        // Ajouter une légende
        yPosition += 60; // Estimation de la hauteur de l'image
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        const [gr, gg, gb] = hexToRgb(COLORS.textDark);
        doc.setTextColor(gr, gg, gb);
        doc.text(`Photo ${index + 1}`, pageWidth / 2, yPosition, {
          align: "center",
        });
        yPosition += 10;
      } catch (error) {
        console.error(`Erreur lors de l'ajout de l'image ${index + 1}:`, error);
      }
    });
  }

  // Ajouter les tableaux s'il y en a
  if (data.tables && data.tables.length > 0) {
    yPosition += 5;

    data.tables.forEach((table, index) => {
      if (yPosition > pageHeight - 50) {
        addFooter(1);
        doc.addPage();
        addHeader();
        yPosition = 25;
      }

      const [hbr, hbg, hbb] = hexToRgb(COLORS.blue);

      autoTable(doc, {
        startY: yPosition,
        head: [table.headers],
        body: table.rows,
        theme: "grid",
        headStyles: {
          fillColor: [hbr, hbg, hbb],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          textColor: hexToRgb(COLORS.textDark),
        },
        alternateRowStyles: {
          fillColor: hexToRgb(COLORS.grayLight),
        },
        margin: { left: margin, right: margin },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    });
  }

  // Ajouter le pied de page à la dernière page
  addFooter(1);

  // Retourner le PDF en tant que Blob
  return doc.output("blob");
}
