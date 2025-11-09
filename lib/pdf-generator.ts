import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ReportData, ImageData } from "@/types";
import fs from "fs";
import path from "path";

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

// Charger une image depuis le dossier public et la convertir en base64
function loadImageAsBase64(imageName: string): string | null {
  try {
    const imagePath = path.join(process.cwd(), "public", imageName);
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString("base64");
    const ext = path.extname(imageName).toLowerCase();
    const mimeType = ext === ".png" ? "image/png" : "image/jpeg";
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`Impossible de charger l'image ${imageName}:`, error);
    return null;
  }
}

// Types pour les sections structurées
interface StructuredContent {
  clientName: string;
  reportDate: string;
  intervention?: {
    client: string;
    adresse: string;
    telephone: string;
    email: string;
    dateIntervention: string;
    technicien: string;
  };
  descriptifTechnique?: string;
  localTechnique?: string;
  equipements?: Array<{ equipement: string; marque: string; modele: string }>;
  testsCanalisations?: Array<{ test: string; resultat: string }>;
  testsPiecesSceller?: string;
  testsEtancheite?: string;
  bilan?: string;
  responsabilites?: string;
  photos: ImageData[];
}

/**
 * Parse le texte corrigé pour extraire les sections structurées
 */
function parseStructuredContent(
  data: ReportData
): StructuredContent {
  const text = data.correctedText || data.originalText;
  const lines = text.split("\n").map(l => l.trim()).filter(l => l);

  // Extraction basique - à améliorer selon le format réel
  const content: StructuredContent = {
    clientName: "Client",
    reportDate: new Date().toLocaleDateString("fr-FR"),
    photos: data.images || [],
  };

  // Utiliser le premier tableau pour les informations d'intervention si disponible
  if (data.tables && data.tables.length > 0) {
    const firstTable = data.tables[0];

    // Si le tableau a 2 colonnes, c'est probablement le tableau d'intervention
    if (firstTable.rows.length > 0 && firstTable.rows[0].length === 2) {
      const tableData: Record<string, string> = {};
      firstTable.rows.forEach(row => {
        if (row.length === 2) {
          tableData[row[0].toLowerCase()] = row[1];
        }
      });

      content.intervention = {
        client: tableData["client"] || tableData["nom"] || "N/A",
        adresse: tableData["adresse"] || "N/A",
        telephone: tableData["téléphone"] || tableData["telephone"] || "N/A",
        email: tableData["email"] || tableData["e-mail"] || "N/A",
        dateIntervention: tableData["date"] || tableData["date d'intervention"] || new Date().toLocaleDateString("fr-FR"),
        technicien: tableData["technicien"] || tableData["intervenant"] || "N/A",
      };

      content.clientName = content.intervention.client;
    }
  }

  // Sinon, chercher les informations dans le texte
  if (!content.intervention) {
    const interventionMatch = text.match(/Client\s*:?\s*([^\n]+)/i);
    const adresseMatch = text.match(/Adresse\s*:?\s*([^\n]+)/i);
    const telephoneMatch = text.match(/Téléphone\s*:?\s*([^\n]+)/i);
    const emailMatch = text.match(/Email\s*:?\s*([^\n]+)/i);
    const dateMatch = text.match(/Date\s*:?\s*([^\n]+)/i);
    const technicienMatch = text.match(/Technicien\s*:?\s*([^\n]+)/i);

    if (interventionMatch || adresseMatch) {
      content.intervention = {
        client: interventionMatch?.[1] || "N/A",
        adresse: adresseMatch?.[1] || "N/A",
        telephone: telephoneMatch?.[1] || "N/A",
        email: emailMatch?.[1] || "N/A",
        dateIntervention: dateMatch?.[1] || new Date().toLocaleDateString("fr-FR"),
        technicien: technicienMatch?.[1] || "N/A",
      };
      content.clientName = interventionMatch?.[1] || "Client";
    }
  }

  // Extraire les sections
  const descriptifMatch = text.match(/DESCRIPTIF TECHNIQUE[:\s]*([^]+?)(?=LOCAL TECHNIQUE|ÉQUIPEMENTS|TESTS|BILAN|$)/i);
  if (descriptifMatch) {
    content.descriptifTechnique = descriptifMatch[1].trim();
  }

  const localMatch = text.match(/LOCAL TECHNIQUE[:\s]*([^]+?)(?=ÉQUIPEMENTS|TESTS|BILAN|$)/i);
  if (localMatch) {
    content.localTechnique = localMatch[1].trim();
  }

  const bilanMatch = text.match(/BILAN[:\s]*([^]+?)(?=RESPONSABILITÉS|PHOTOS|$)/i);
  if (bilanMatch) {
    content.bilan = bilanMatch[1].trim();
  }

  const responsabilitesMatch = text.match(/RESPONSABILITÉS[:\s]*([^]+?)(?=PHOTOS|$)/i);
  if (responsabilitesMatch) {
    content.responsabilites = responsabilitesMatch[1].trim();
  }

  return content;
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
  let currentPage = 1;

  // Parser le contenu structuré
  const content = parseStructuredContent(data);

  // Fonction pour ajouter l'en-tête LOCAMEX sur les pages intérieures
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
  const addFooter = (pageNum: number) => {
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
      `www.locamex.org | contact@locamex.org | Page ${pageNum}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );
  };

  // PAGE 1 : Hero Section avec image de fond
  const heroImage = loadImageAsBase64("HeroSectionRapport.png");
  if (heroImage) {
    try {
      doc.addImage(
        heroImage,
        "PNG",
        0,
        0,
        pageWidth,
        pageHeight
      );

      // Ajouter le nom du client et la date sur l'image
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(content.clientName, pageWidth / 2, pageHeight / 2, {
        align: "center",
      });

      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.text(content.reportDate, pageWidth / 2, pageHeight / 2 + 10, {
        align: "center",
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'image hero:", error);
    }
  } else {
    // Fallback si l'image n'est pas disponible
    const [br, bg, bb] = hexToRgb(COLORS.blue);
    doc.setFillColor(br, bg, bb);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(content.clientName, pageWidth / 2, pageHeight / 2, {
      align: "center",
    });

    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text(content.reportDate, pageWidth / 2, pageHeight / 2 + 10, {
      align: "center",
    });
  }

  // PAGE 2+ : Contenu structuré
  doc.addPage();
  currentPage++;
  addHeader();

  let yPosition = 25;

  // Section INTERVENTION
  if (content.intervention) {
    const [br, bg, bb] = hexToRgb(COLORS.blue);
    doc.setTextColor(br, bg, bb);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("INTERVENTION", margin, yPosition);
    yPosition += 8;

    autoTable(doc, {
      startY: yPosition,
      head: [["Information", "Détails"]],
      body: [
        ["Client", content.intervention.client],
        ["Adresse", content.intervention.adresse],
        ["Téléphone", content.intervention.telephone],
        ["Email", content.intervention.email],
        ["Date d'intervention", content.intervention.dateIntervention],
        ["Technicien", content.intervention.technicien],
      ],
      theme: "grid",
      headStyles: {
        fillColor: hexToRgb(COLORS.blue),
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
  }

  // Section DESCRIPTIF TECHNIQUE
  if (content.descriptifTechnique) {
    if (yPosition > pageHeight - 40) {
      addFooter(currentPage);
      doc.addPage();
      currentPage++;
      addHeader();
      yPosition = 25;
    }

    const [br, bg, bb] = hexToRgb(COLORS.blue);
    doc.setTextColor(br, bg, bb);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPTIF TECHNIQUE", margin, yPosition);
    yPosition += 8;

    const [tr, tg, tb] = hexToRgb(COLORS.textDark);
    doc.setTextColor(tr, tg, tb);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const lines = doc.splitTextToSize(
      content.descriptifTechnique,
      pageWidth - 2 * margin
    );

    for (const line of lines) {
      if (yPosition > pageHeight - 30) {
        addFooter(currentPage);
        doc.addPage();
        currentPage++;
        addHeader();
        yPosition = 25;
      }
      doc.text(line, margin, yPosition);
      yPosition += 6;
    }

    yPosition += 5;
  }

  // Section LOCAL TECHNIQUE
  if (content.localTechnique) {
    if (yPosition > pageHeight - 40) {
      addFooter(currentPage);
      doc.addPage();
      currentPage++;
      addHeader();
      yPosition = 25;
    }

    const [br, bg, bb] = hexToRgb(COLORS.blue);
    doc.setTextColor(br, bg, bb);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("LOCAL TECHNIQUE", margin, yPosition);
    yPosition += 8;

    const [tr, tg, tb] = hexToRgb(COLORS.textDark);
    doc.setTextColor(tr, tg, tb);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const lines = doc.splitTextToSize(
      content.localTechnique,
      pageWidth - 2 * margin
    );

    for (const line of lines) {
      if (yPosition > pageHeight - 30) {
        addFooter(currentPage);
        doc.addPage();
        currentPage++;
        addHeader();
        yPosition = 25;
      }
      doc.text(line, margin, yPosition);
      yPosition += 6;
    }

    yPosition += 5;
  }

  // Section BILAN (encadré bleu arrondi)
  if (content.bilan) {
    if (yPosition > pageHeight - 60) {
      addFooter(currentPage);
      doc.addPage();
      currentPage++;
      addHeader();
      yPosition = 25;
    }

    const [br, bg, bb] = hexToRgb(COLORS.blue);
    doc.setTextColor(br, bg, bb);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("BILAN", margin, yPosition);
    yPosition += 8;

    // Calculer la hauteur du contenu
    const bilanLines = doc.splitTextToSize(
      content.bilan,
      pageWidth - 2 * margin - 10
    );
    const boxHeight = bilanLines.length * 6 + 10;

    // Dessiner l'encadré bleu avec coins arrondis
    const [lr, lg, lb] = hexToRgb(COLORS.blue);
    doc.setDrawColor(lr, lg, lb);
    doc.setLineWidth(1);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, boxHeight, 3, 3, "S");

    // Remplissage léger
    doc.setFillColor(240, 247, 255);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, boxHeight, 3, 3, "F");

    // Contour bleu
    doc.setDrawColor(lr, lg, lb);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, boxHeight, 3, 3, "S");

    yPosition += 8;

    const [tr, tg, tb] = hexToRgb(COLORS.textDark);
    doc.setTextColor(tr, tg, tb);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    for (const line of bilanLines) {
      doc.text(line, margin + 5, yPosition);
      yPosition += 6;
    }

    yPosition += 10;
  }

  // Section RESPONSABILITÉS
  if (content.responsabilites) {
    if (yPosition > pageHeight - 40) {
      addFooter(currentPage);
      doc.addPage();
      currentPage++;
      addHeader();
      yPosition = 25;
    }

    const [br, bg, bb] = hexToRgb(COLORS.blue);
    doc.setTextColor(br, bg, bb);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("RESPONSABILITÉS", margin, yPosition);
    yPosition += 8;

    const [tr, tg, tb] = hexToRgb(COLORS.textDark);
    doc.setTextColor(tr, tg, tb);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");

    const lines = doc.splitTextToSize(
      content.responsabilites,
      pageWidth - 2 * margin
    );

    for (const line of lines) {
      if (yPosition > pageHeight - 30) {
        addFooter(currentPage);
        doc.addPage();
        currentPage++;
        addHeader();
        yPosition = 25;
      }
      doc.text(line, margin, yPosition);
      yPosition += 5;
    }

    yPosition += 5;
  }

  // Section PHOTOS
  if (content.photos && content.photos.length > 0) {
    addFooter(currentPage);
    doc.addPage();
    currentPage++;
    addHeader();
    yPosition = 25;

    const [br, bg, bb] = hexToRgb(COLORS.blue);
    doc.setTextColor(br, bg, bb);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PHOTOS", margin, yPosition);
    yPosition += 10;

    // Layout intelligent des images
    const largeImageThreshold = 500 * 1024; // 500KB
    let smallImages: ImageData[] = [];

    for (let i = 0; i < content.photos.length; i++) {
      const image = content.photos[i];
      const imageSize = image.base64.length * 0.75; // Approximation de la taille

      if (imageSize > largeImageThreshold) {
        // Grande image : 1 par page
        doc.addPage();
        currentPage++;
        addHeader();
        yPosition = 25;

        try {
          const imgDataUrl = `data:${image.contentType || "image/png"};base64,${image.base64}`;
          const maxWidth = pageWidth - 2 * margin;
          const maxHeight = pageHeight - 60;
          doc.addImage(imgDataUrl, "PNG", margin, yPosition, maxWidth, 0);

          yPosition += maxHeight;
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          const [gr, gg, gb] = hexToRgb(COLORS.textDark);
          doc.setTextColor(gr, gg, gb);
          doc.text(`Photo ${i + 1}`, pageWidth / 2, yPosition, {
            align: "center",
          });
        } catch (error) {
          console.error(`Erreur lors de l'ajout de l'image ${i + 1}:`, error);
        }
      } else {
        // Petite image : accumuler pour layout 2x2
        smallImages.push(image);

        if (smallImages.length === 4 || i === content.photos.length - 1) {
          // Ajouter une page pour le grid 2x2
          if (smallImages.length > 0) {
            doc.addPage();
            currentPage++;
            addHeader();

            const gridSize = 80;
            const spacing = 10;
            const positions = [
              { x: margin, y: 30 },
              { x: pageWidth / 2 + spacing / 2, y: 30 },
              { x: margin, y: 30 + gridSize + spacing },
              { x: pageWidth / 2 + spacing / 2, y: 30 + gridSize + spacing },
            ];

            smallImages.forEach((img, idx) => {
              if (idx < 4) {
                try {
                  const imgDataUrl = `data:${img.contentType || "image/png"};base64,${img.base64}`;
                  doc.addImage(
                    imgDataUrl,
                    "PNG",
                    positions[idx].x,
                    positions[idx].y,
                    gridSize,
                    gridSize
                  );
                } catch (error) {
                  console.error(`Erreur lors de l'ajout de l'image:`, error);
                }
              }
            });

            smallImages = [];
          }
        }
      }
    }
  }

  // Ajouter le footer sur la dernière page de contenu
  addFooter(currentPage);

  // DERNIÈRE PAGE : pagedefin.png
  const finalImage = loadImageAsBase64("pagedefin.png");
  if (finalImage) {
    try {
      doc.addPage();
      doc.addImage(
        finalImage,
        "PNG",
        0,
        0,
        pageWidth,
        pageHeight
      );
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'image de fin:", error);
    }
  }

  // Retourner le PDF en tant que Blob
  return doc.output("blob");
}
