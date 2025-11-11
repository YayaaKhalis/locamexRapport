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
  teal: "#6096A5",      // Bleu-vert pour cartes principales
  green: "#A8C391",     // Vert clair pour sections importantes
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

/**
 * Ajoute une carte de section principale (grande, arrondie, colorée)
 * CORRECTIONS : Centrage vertical parfait, hauteur compacte (28mm), espacement 12mm
 */
function addSectionCard(
  doc: any,
  text: string,
  yPosition: number,
  pageWidth: number,
  margin: number,
  colorHex: string
): number {
  const cardWidth = pageWidth - 2 * margin;
  const cardHeight = 28;  // Hauteur compacte (était 35)
  const radius = 5;

  // Dessiner le rectangle arrondi avec fond coloré
  const [r, g, b] = hexToRgb(colorHex);
  doc.setFillColor(r, g, b);
  doc.roundedRect(margin, yPosition, cardWidth, cardHeight, radius, radius, "F");

  // Configurer le style du texte
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");

  // Calculer la position Y pour centrer le texte verticalement
  // Formule : Y carte + (Hauteur carte / 2) + (Taille police / 3)
  const textCenterY = yPosition + (cardHeight / 2) + 5;

  // Calculer la position X pour centrer le texte horizontalement
  const textCenterX = pageWidth / 2;

  // Dessiner le texte centré
  doc.text(text, textCenterX, textCenterY, {
    align: "center",
    baseline: "middle"
  });

  // Reset couleur texte
  const [tr, tg, tb] = hexToRgb(COLORS.textDark);
  doc.setTextColor(tr, tg, tb);

  // Retourner la nouvelle position Y (après la carte + espacement de 12mm)
  return yPosition + cardHeight + 12;
}

/**
 * Ajoute une barre de sous-section (plus petite, pour sous-titres)
 * CORRECTION : Centrage vertical du texte dans la barre
 */
function addSubSectionBar(
  doc: any,
  text: string,
  yPosition: number,
  pageWidth: number,
  margin: number
): number {
  const barWidth = pageWidth - 2 * margin;
  const barHeight = 15;
  const radius = 3;

  // Barre avec fond bleu LOCAMEX
  const [r, g, b] = hexToRgb(COLORS.blue);
  doc.setFillColor(r, g, b);
  doc.roundedRect(margin, yPosition, barWidth, barHeight, radius, radius, "F");

  // Texte blanc aligné à gauche, centré verticalement
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");

  // Calculer la position Y pour centrer le texte verticalement dans la barre
  const textY = yPosition + (barHeight / 2) + 3.5;
  doc.text(text, margin + 5, textY);

  // Reset couleur texte
  const [tr, tg, tb] = hexToRgb(COLORS.textDark);
  doc.setTextColor(tr, tg, tb);

  return yPosition + barHeight + 10;
}

/**
 * Ajoute un tableau générique au PDF
 */
function addGenericTable(
  doc: any,
  table: { title?: string; headers: string[]; rows: string[][] },
  yPosition: number,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  currentPage: number,
  addHeader: () => void,
  addFooter: (page: number) => void
): { yPosition: number; currentPage: number } {
  // Vérifier s'il y a assez d'espace pour le tableau
  if (yPosition > pageHeight - 80) {
    addFooter(currentPage);
    doc.addPage();
    currentPage++;
    addHeader();
    yPosition = 25;
  }

  // Afficher le titre du tableau si disponible
  if (table.title) {
    yPosition = addSubSectionBar(doc, table.title, yPosition, pageWidth, margin);
  }

  // Afficher le tableau
  autoTable(doc, {
    startY: yPosition,
    head: [table.headers],
    body: table.rows,
    theme: "grid",
    headStyles: {
      fillColor: hexToRgb(COLORS.teal),
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 10,
    },
    bodyStyles: {
      textColor: hexToRgb(COLORS.textDark),
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: hexToRgb(COLORS.grayLight),
    },
    margin: { left: margin, right: margin },
    columnStyles: {},
    didDrawPage: (data: any) => {
      // Si le tableau s'étend sur plusieurs pages
      if (data.pageNumber > currentPage) {
        currentPage = data.pageNumber;
      }
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  return { yPosition, currentPage };
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
  allTables: Array<{ title?: string; headers: string[]; rows: string[][] }>; // Tous les tableaux du document
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
    allTables: [], // Tous les tableaux extraits
  };

  // Utiliser le premier tableau pour les informations d'intervention si disponible
  if (data.tables && data.tables.length > 0) {
    const firstTable = data.tables[0];

    // Extraire le nom du client depuis le header (ex: "Piscine de Mme/M" | "Cholat")
    let clientName = "Client";
    let clientTitle = ""; // M. ou Mme
    if (firstTable.headers.length >= 2) {
      clientName = firstTable.headers[1].trim();
      // Détecter si c'est M. ou Mme dans le premier header
      const firstHeader = firstTable.headers[0].toLowerCase();
      if (firstHeader.includes("mme")) {
        clientTitle = "Mme";
      } else if (firstHeader.includes("m.") || firstHeader.includes("m/")) {
        clientTitle = "M.";
      }
    }

    // Si le tableau a 2 colonnes, c'est probablement le tableau d'intervention
    if (firstTable.rows.length > 0 && firstTable.rows[0].length === 2) {
      const tableData: Record<string, string> = {};
      firstTable.rows.forEach(row => {
        if (row.length === 2) {
          // Normaliser la clé en minuscules et sans accents
          const key = row[0]
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
          tableData[key] = row[1].trim();
        }
      });

      console.log("Données du tableau extraites:", tableData);

      // Fonction pour chercher une valeur avec plusieurs variantes de clés
      const findValue = (keys: string[]): string => {
        for (const key of keys) {
          if (tableData[key]) return tableData[key];
        }
        return "";
      };

      content.intervention = {
        client: clientTitle ? `${clientTitle} ${clientName}` : clientName,
        adresse: findValue(["adresse de l'inspection", "adresse", "adresse du client", "lieu"]) || "-",
        telephone: findValue(["telephone", "tel", "tel.", "n° telephone", "numero de telephone"]) || "-",
        email: findValue(["email", "e-mail", "mail", "adresse email"]) || "-",
        dateIntervention: findValue(["date de l'inspection", "date", "date d'intervention", "date intervention"]) || new Date().toLocaleDateString("fr-FR"),
        technicien: findValue(["nom de l'intervenant", "technicien", "intervenant", "operateur"]) || "-",
      };

      content.clientName = content.intervention.client;
      content.reportDate = content.intervention.dateIntervention;
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
        client: interventionMatch?.[1] || "-",
        adresse: adresseMatch?.[1] || "-",
        telephone: telephoneMatch?.[1] || "-",
        email: emailMatch?.[1] || "-",
        dateIntervention: dateMatch?.[1] || new Date().toLocaleDateString("fr-FR"),
        technicien: technicienMatch?.[1] || "-",
      };
      content.clientName = interventionMatch?.[1] || "Client";
    }
  }

  // Stocker tous les autres tableaux (sauf le premier qui est l'intervention)
  if (data.tables && data.tables.length > 1) {
    // Tous les tableaux après le premier (tableaux techniques, équipements, tests, etc.)
    content.allTables = data.tables.slice(1);
    console.log(`${content.allTables.length} tableaux techniques extraits`);
  }

  // Extraire les sections avec leurs titres
  const descriptifMatch = text.match(/DESCRIPTIF TECHNIQUE[:\s]*([^]+?)(?=LOCAL TECHNIQUE|ÉQUIPEMENTS|TESTS|BILAN|$)/i);
  if (descriptifMatch) {
    content.descriptifTechnique = descriptifMatch[1].trim();
  }

  const localMatch = text.match(/LOCAL TECHNIQUE[:\s]*([^]+?)(?=ÉQUIPEMENTS|TESTS|BILAN|$)/i);
  if (localMatch) {
    content.localTechnique = localMatch[1].trim();
  }

  // Essayer d'extraire la section "Tests des pièces à sceller"
  const piecesMatch = text.match(/(?:TESTS?\s*(?:DES)?\s*PI[EÈ]CES?\s*[AÀ]\s*SCELLER|PI[EÈ]CES?\s*[AÀ]\s*SCELLER)[:\s]*([^]+?)(?=TESTS?\s*(?:D')?[ÉE]TANCH[ÉE]IT[ÉE]|BILAN|RESPONSABILIT[ÉE]S|$)/i);
  if (piecesMatch) {
    content.testsPiecesSceller = piecesMatch[1].trim();
  }

  // Essayer d'extraire la section "Tests d'étanchéité"
  const etancheiteMatch = text.match(/TESTS?\s*(?:D')?[ÉE]TANCH[ÉE]IT[ÉE][:\s]*([^]+?)(?=BILAN|RESPONSABILIT[ÉE]S|PHOTOS|$)/i);
  if (etancheiteMatch) {
    content.testsEtancheite = etancheiteMatch[1].trim();
  }

  const bilanMatch = text.match(/BILAN[:\s]*([^]+?)(?=RESPONSABILIT[ÉE]S|PHOTOS|$)/i);
  if (bilanMatch) {
    content.bilan = bilanMatch[1].trim();
  }

  const responsabilitesMatch = text.match(/RESPONSABILIT[ÉE]S[:\s]*([^]+?)(?=PHOTOS|$)/i);
  if (responsabilitesMatch) {
    content.responsabilites = responsabilitesMatch[1].trim();
  }

  console.log("Sections extraites:", {
    descriptifTechnique: !!content.descriptifTechnique,
    localTechnique: !!content.localTechnique,
    testsPiecesSceller: !!content.testsPiecesSceller,
    testsEtancheite: !!content.testsEtancheite,
    bilan: !!content.bilan,
    responsabilites: !!content.responsabilites,
  });

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
    const [r, g, b] = hexToRgb(COLORS.teal);
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
    const [r, g, b] = hexToRgb(COLORS.teal);
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

      // Ajouter "Pour le compte de :" et le nom du client (décalé de 15px / ~5mm vers le bas)
      const [blueR, blueG, blueB] = hexToRgb(COLORS.teal);
      doc.setTextColor(blueR, blueG, blueB);
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text("Pour le compte de :", pageWidth / 2, pageHeight / 2 - 5, {
        align: "center",
      });

      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(content.clientName, pageWidth / 2, pageHeight / 2 + 10, {
        align: "center",
      });

      // Ajouter "Date d'inspection :" et la date
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Date d'inspection :", pageWidth / 2, pageHeight / 2 + 25, {
        align: "center",
      });

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(content.reportDate, pageWidth / 2, pageHeight / 2 + 35, {
        align: "center",
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'image hero:", error);
    }
  } else {
    // Fallback si l'image n'est pas disponible
    const [br, bg, bb] = hexToRgb(COLORS.grayLight);
    doc.setFillColor(br, bg, bb);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    const [blueR, blueG, blueB] = hexToRgb(COLORS.teal);
    doc.setTextColor(blueR, blueG, blueB);
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Pour le compte de :", pageWidth / 2, pageHeight / 2 - 5, {
      align: "center",
    });

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(content.clientName, pageWidth / 2, pageHeight / 2 + 10, {
      align: "center",
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Date d'inspection :", pageWidth / 2, pageHeight / 2 + 25, {
      align: "center",
    });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(content.reportDate, pageWidth / 2, pageHeight / 2 + 35, {
      align: "center",
    });
  }

  // PAGE 2+ : Contenu structuré
  doc.addPage();
  currentPage++;
  addHeader();

  let yPosition = 25;

  // Section INTERVENTION avec carte moderne
  if (content.intervention) {
    yPosition = addSectionCard(
      doc,
      "INFORMATIONS GÉNÉRALES",
      yPosition,
      pageWidth,
      margin,
      COLORS.teal
    );

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
        fillColor: hexToRgb(COLORS.teal),
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
    if (yPosition > pageHeight - 60) {
      addFooter(currentPage);
      doc.addPage();
      currentPage++;
      addHeader();
      yPosition = 25;
    }

    yPosition = addSectionCard(
      doc,
      "DESCRIPTIF TECHNIQUE",
      yPosition,
      pageWidth,
      margin,
      COLORS.teal
    );

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
    if (yPosition > pageHeight - 60) {
      addFooter(currentPage);
      doc.addPage();
      currentPage++;
      addHeader();
      yPosition = 25;
    }

    yPosition = addSectionCard(
      doc,
      "LOCAL TECHNIQUE",
      yPosition,
      pageWidth,
      margin,
      COLORS.teal
    );

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

  // Afficher tous les tableaux extraits du document
  if (content.allTables && content.allTables.length > 0) {
    console.log(`Affichage de ${content.allTables.length} tableaux dans le PDF`);

    for (const table of content.allTables) {
      if (table.rows.length > 0) {
        const result = addGenericTable(
          doc,
          table,
          yPosition,
          pageWidth,
          pageHeight,
          margin,
          currentPage,
          addHeader,
          addFooter
        );
        yPosition = result.yPosition;
        currentPage = result.currentPage;
      }
    }
  }

  // Section TESTS PIÈCES À SCELLER
  if (content.testsPiecesSceller) {
    if (yPosition > pageHeight - 60) {
      addFooter(currentPage);
      doc.addPage();
      currentPage++;
      addHeader();
      yPosition = 25;
    }

    yPosition = addSubSectionBar(
      doc,
      "TESTS PIÈCES À SCELLER",
      yPosition,
      pageWidth,
      margin
    );

    const [tr, tg, tb] = hexToRgb(COLORS.textDark);
    doc.setTextColor(tr, tg, tb);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const lines = doc.splitTextToSize(
      content.testsPiecesSceller,
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

  // Section TESTS D'ÉTANCHÉITÉ
  if (content.testsEtancheite) {
    if (yPosition > pageHeight - 60) {
      addFooter(currentPage);
      doc.addPage();
      currentPage++;
      addHeader();
      yPosition = 25;
    }

    yPosition = addSubSectionBar(
      doc,
      "TESTS D'ÉTANCHÉITÉ",
      yPosition,
      pageWidth,
      margin
    );

    const [tr, tg, tb] = hexToRgb(COLORS.textDark);
    doc.setTextColor(tr, tg, tb);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const lines = doc.splitTextToSize(
      content.testsEtancheite,
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
    if (yPosition > pageHeight - 80) {
      addFooter(currentPage);
      doc.addPage();
      currentPage++;
      addHeader();
      yPosition = 25;
    }

    yPosition = addSectionCard(
      doc,
      "BILAN DE L'INSPECTION",
      yPosition,
      pageWidth,
      margin,
      COLORS.green  // Vert clair pour section importante
    );

    // Séparer le bilan en phrases/points
    const bilanText = content.bilan;
    const bilanPoints = bilanText
      .split(/\.|;/)
      .map(p => p.trim())
      .filter(p => p.length > 10); // Ignorer les fragments trop courts

    // Calculer la hauteur approximative
    let estimatedHeight = 15;
    bilanPoints.forEach(point => {
      const lines = doc.splitTextToSize(point, pageWidth - 2 * margin - 25);
      estimatedHeight += lines.length * 6 + 3;
    });

    const boxHeight = estimatedHeight + 10;

    // Dessiner l'encadré avec coins arrondis (vert clair)
    const [lr, lg, lb] = hexToRgb(COLORS.green);
    doc.setDrawColor(lr, lg, lb);
    doc.setLineWidth(1.5);

    // Remplissage léger vert
    doc.setFillColor(245, 251, 241);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, boxHeight, 3, 3, "FD");

    yPosition += 10;

    // Afficher le texte avec des puces
    const [tr, tg, tb] = hexToRgb(COLORS.textDark);
    doc.setTextColor(tr, tg, tb);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    bilanPoints.forEach((point, index) => {
      // Ajouter une puce (bullet point)
      doc.setFontSize(14);
      doc.setTextColor(lr, lg, lb); // Puce en vert
      doc.text("•", margin + 8, yPosition);

      // Texte du point
      doc.setFontSize(11);
      doc.setTextColor(tr, tg, tb);
      const lines = doc.splitTextToSize(point, pageWidth - 2 * margin - 25);

      lines.forEach((line: string, lineIdx: number) => {
        doc.text(line, margin + 15, yPosition + lineIdx * 6);
      });

      yPosition += lines.length * 6 + 3;
    });

    yPosition += 10;
  }

  // Section RESPONSABILITÉS
  if (content.responsabilites) {
    if (yPosition > pageHeight - 60) {
      addFooter(currentPage);
      doc.addPage();
      currentPage++;
      addHeader();
      yPosition = 25;
    }

    yPosition = addSectionCard(
      doc,
      "MENTIONS LÉGALES",
      yPosition,
      pageWidth,
      margin,
      COLORS.teal
    );

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

    yPosition = addSectionCard(
      doc,
      "DOCUMENTATION PHOTOGRAPHIQUE",
      yPosition,
      pageWidth,
      margin,
      COLORS.teal
    );

    // Trier les images par priorité d'affichage (1 = afficher en premier)
    const sortedPhotos = [...content.photos].sort((a, b) => {
      const priorityA = a.analysis?.displayPriority || 5;
      const priorityB = b.analysis?.displayPriority || 5;
      return priorityA - priorityB;
    });

    // Séparer les images grandes et petites selon l'analyse IA
    const largeImages = sortedPhotos.filter(
      (img) => img.analysis?.sizeRecommendation === "grande"
    );
    const smallImages = sortedPhotos.filter(
      (img) => img.analysis?.sizeRecommendation !== "grande"
    );

    // Afficher les grandes images (1 par page)
    largeImages.forEach((image, index) => {
      doc.addPage();
      currentPage++;
      addHeader();
      yPosition = 25;

      try {
        const imgDataUrl = `data:${image.contentType || "image/png"};base64,${image.base64}`;
        const maxWidth = pageWidth - 2 * margin;
        const maxHeight = pageHeight - 80;
        doc.addImage(imgDataUrl, "PNG", margin, yPosition, maxWidth, 0);

        yPosition = pageHeight - 50;
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        const [gr, gg, gb] = hexToRgb(COLORS.textDark);
        doc.setTextColor(gr, gg, gb);

        // Utiliser la description de l'analyse IA si disponible
        const caption = image.analysis?.description || `Photo ${index + 1}`;
        const captionLines = doc.splitTextToSize(caption, pageWidth - 2 * margin);
        captionLines.forEach((line: string, lineIdx: number) => {
          doc.text(line, pageWidth / 2, yPosition + lineIdx * 5, {
            align: "center",
          });
        });

        // Afficher le type d'image
        if (image.analysis?.type) {
          yPosition += captionLines.length * 5 + 3;
          doc.setFontSize(8);
          const typeLabel = {
            piscine: "Vue d'ensemble",
            manometre: "Mesure",
            local_technique: "Local technique",
            equipement: "Équipement",
            autre: "Détail",
          }[image.analysis.type];
          doc.text(`[${typeLabel}]`, pageWidth / 2, yPosition, {
            align: "center",
          });
        }
      } catch (error) {
        console.error(`Erreur lors de l'ajout de l'image:`, error);
      }
    });

    // Afficher les petites images (grid 2x2)
    if (smallImages.length > 0) {
      for (let i = 0; i < smallImages.length; i += 4) {
        doc.addPage();
        currentPage++;
        addHeader();

        const batch = smallImages.slice(i, i + 4);
        const gridSize = 80;
        const spacing = 10;
        const positions = [
          { x: margin, y: 30 },
          { x: pageWidth / 2 + spacing / 2, y: 30 },
          { x: margin, y: 30 + gridSize + spacing + 15 },
          { x: pageWidth / 2 + spacing / 2, y: 30 + gridSize + spacing + 15 },
        ];

        batch.forEach((img, idx) => {
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

              // Ajouter la légende sous l'image
              const captionY = positions[idx].y + gridSize + 3;
              doc.setFontSize(7);
              doc.setFont("helvetica", "normal");
              const [gr, gg, gb] = hexToRgb(COLORS.textDark);
              doc.setTextColor(gr, gg, gb);

              let caption = img.analysis?.description || `Photo ${i + idx + 1}`;
              // Limiter la longueur de la description
              if (caption.length > 50) {
                caption = caption.substring(0, 47) + "...";
              }

              const captionLines = doc.splitTextToSize(caption, gridSize - 5);
              captionLines.slice(0, 2).forEach((line: string, lineIdx: number) => {
                doc.text(line, positions[idx].x + gridSize / 2, captionY + lineIdx * 3.5, {
                  align: "center",
                });
              });
            } catch (error) {
              console.error(`Erreur lors de l'ajout de l'image:`, error);
            }
          }
        });
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
