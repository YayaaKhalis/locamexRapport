import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { RapportAnalyse, ImageData } from "@/types";
import fs from "fs";
import path from "path";

// Nouvelle palette de couleurs selon les spécifications
const COLORS = {
  darkTeal: "#5B949A",    // Bleu-vert foncé (titres principaux)
  lightBlue: "#7CAEB8",   // Bleu pâle (sous-titres)
  lightGreen: "#B6D1A3",  // Vert pâle (sections, bilan)
  white: "#FFFFFF",
  black: "#000000",
  darkGray: "#333333",
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

// Charger une image depuis le dossier public
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
 * Ajoute le header image (hautdepage.png) en taille réelle
 */
function addHeaderImage(doc: jsPDF, pageWidth: number): number {
  const headerImage = loadImageAsBase64("hautdepage.png");
  if (headerImage) {
    try {
      const headerHeight = 30; // Augmenté à 30mm pour meilleure visibilité et symétrie avec footer
      doc.addImage(headerImage, "PNG", 0, 0, pageWidth, headerHeight);
      console.log(`   ✓ Header ajouté (${headerHeight}mm)`);
      return headerHeight;
    } catch (error) {
      console.error("❌ Erreur header:", error);
    }
  } else {
    console.error("❌ Image hautdepage.png non trouvée !");
  }
  return 0;
}

/**
 * Ajoute le footer image (pieddepage.png) en taille réelle
 */
function addFooterImage(doc: jsPDF, pageWidth: number, pageHeight: number): number {
  const footerImage = loadImageAsBase64("pieddepage.png");
  if (footerImage) {
    try {
      const footerHeight = 35; // Augmenté de 25 à 35mm pour meilleure visibilité
      const footerY = pageHeight - footerHeight;
      doc.addImage(footerImage, "PNG", 0, footerY, pageWidth, footerHeight);
      console.log(`   ✓ Footer ajouté (${footerHeight}mm à y=${footerY})`);
      return footerHeight;
    } catch (error) {
      console.error("❌ Erreur footer:", error);
    }
  } else {
    console.error("❌ Image pieddepage.png non trouvée !");
  }
  return 0;
}

/**
 * Ajoute un titre de section sur fond pastel arrondi
 */
function addPastelSectionTitle(
  doc: jsPDF,
  title: string,
  yPosition: number,
  pageWidth: number,
  margin: number,
  color: string = COLORS.lightGreen
): number {
  const [r, g, b] = hexToRgb(color);
  const titleHeight = 12;
  const cornerRadius = 5; // Coins arrondis (en mm, équivalent ~25-35px)

  // Rectangle arrondi avec fond pastel
  doc.setFillColor(r, g, b);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, titleHeight, cornerRadius, cornerRadius, "F");

  // Texte blanc en majuscules, centré
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), pageWidth / 2, yPosition + 8, { align: "center" });

  // Reset couleur texte
  doc.setTextColor(0, 0, 0);

  return yPosition + titleHeight + 8; // Position après le titre + espacement augmenté
}

/**
 * Ajoute un sous-titre sur fond pastel
 */
function addPastelSubtitle(
  doc: jsPDF,
  subtitle: string,
  yPosition: number,
  pageWidth: number,
  margin: number,
  color: string = COLORS.lightBlue
): number {
  const [r, g, b] = hexToRgb(color);
  const subtitleHeight = 8;
  const cornerRadius = 3;

  doc.setFillColor(r, g, b);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, subtitleHeight, cornerRadius, cornerRadius, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(subtitle, margin + 5, yPosition + 6);

  doc.setTextColor(0, 0, 0);

  return yPosition + subtitleHeight + 6; // Espacement augmenté
}

/**
 * Ajoute une image sans déformation (garde le ratio) avec bordure arrondie
 */
function addRoundedImage(
  doc: jsPDF,
  imgDataUrl: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
  cornerRadius: number = 3
): { width: number; height: number } {
  // Calculer les dimensions réelles de l'image à partir du base64
  // Pour préserver le ratio, on doit connaître les dimensions originales
  const imgProps = doc.getImageProperties(imgDataUrl);
  const imgOriginalWidth = imgProps.width;
  const imgOriginalHeight = imgProps.height;
  const aspectRatio = imgOriginalWidth / imgOriginalHeight;

  // Calculer les dimensions finales en préservant le ratio
  let imgWidth = maxWidth;
  let imgHeight = maxWidth / aspectRatio;

  // Si la hauteur dépasse maxHeight, recalculer à partir de la hauteur
  if (imgHeight > maxHeight) {
    imgHeight = maxHeight;
    imgWidth = maxHeight * aspectRatio;
  }

  // Centrer l'image horizontalement si elle est plus petite que maxWidth
  const finalX = x + (maxWidth - imgWidth) / 2;

  // Ajouter l'image avec les bonnes proportions
  doc.addImage(imgDataUrl, "JPEG", finalX, y, imgWidth, imgHeight);

  return { width: imgWidth, height: imgHeight };
}

/**
 * Génère un PDF professionnel LOCAMEX v3
 * Nouvelle structure selon les spécifications client
 */
export function generatePDFV2(
  rapport: RapportAnalyse,
  images: ImageData[]
): Blob {
  console.log("\n=== GÉNÉRATION PDF PROFESSIONNELLE V3 ===");
  console.log(`Client: ${rapport.client.nom || "Non spécifié"}`);
  console.log(`Date inspection: ${rapport.inspection.date}`);
  console.log(`Nombre d'images reçues: ${images.length}`);

  // Log des images pour debug
  if (images.length > 0) {
    console.log("\n📸 LISTE DES IMAGES:");
    images.forEach((img, idx) => {
      console.log(`   ${idx + 1}. Type: ${img.analysis?.type || "non analysé"} | Description: ${img.analysis?.description || "N/A"}`);
    });
  } else {
    console.warn("⚠️  AUCUNE IMAGE REÇUE !");
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const headerHeight = 30; // Augmenté à 30mm pour meilleure visibilité
  const footerHeight = 35; // Augmenté à 35mm pour meilleure visibilité (légèrement plus grand pour compenser la position)
  let yPos = 0;

  // ===================
  // PAGE 1 : Hero Section
  // ===================
  console.log("\n📄 Page 1: Hero section");
  const heroImage = loadImageAsBase64("HeroSectionRapport.png");
  if (heroImage) {
    try {
      doc.addImage(heroImage, "PNG", 0, 0, pageWidth, pageHeight);

      // Ajouter le nom du client et la date
      const offsetY = 7;
      const [blueR, blueG, blueB] = hexToRgb(COLORS.darkTeal);
      doc.setTextColor(blueR, blueG, blueB);

      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text("Pour le compte de :", pageWidth / 2, pageHeight / 2 - 5 + offsetY, {
        align: "center",
      });

      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(rapport.client.nom || "Client", pageWidth / 2, pageHeight / 2 + 10 + offsetY, {
        align: "center",
      });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Date d'inspection :", pageWidth / 2, pageHeight / 2 + 25 + offsetY, {
        align: "center",
      });

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(rapport.inspection.date, pageWidth / 2, pageHeight / 2 + 35 + offsetY, {
        align: "center",
      });
    } catch (error) {
      console.error("Erreur hero:", error);
    }
  }

  // ===================
  // PAGE 2 : 3 blocs + Image globale piscine
  // ===================
  console.log("\n📄 Page 2: 3 blocs + Image piscine");
  doc.addPage();

  // Fond blanc
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // --- 3 BLOCS ARRONDIS ---
  const blockWidth = 50;
  const blockHeight = 45;
  const blockSpacing = 10;
  const totalWidth = 3 * blockWidth + 2 * blockSpacing;
  const startX = (pageWidth - totalWidth) / 2;
  const startY = 30;
  const cornerRadius = 5;

  const block1Color = hexToRgb(COLORS.darkTeal);
  const block2Color = hexToRgb(COLORS.lightBlue);
  const block3Color = hexToRgb(COLORS.lightGreen);

  const drawRoundedBlock = (x: number, y: number, color: [number, number, number], text: string[]) => {
    doc.setFillColor(...color);
    doc.roundedRect(x, y, blockWidth, blockHeight, cornerRadius, cornerRadius, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");

    const lineHeight = 6;
    const totalTextHeight = text.length * lineHeight;
    let textY = y + (blockHeight - totalTextHeight) / 2 + lineHeight;

    text.forEach((line) => {
      doc.text(line, x + blockWidth / 2, textY, { align: "center" });
      textY += lineHeight;
    });
  };

  drawRoundedBlock(startX, startY, block1Color, ["Les informations", "générales"]);
  drawRoundedBlock(startX + blockWidth + blockSpacing, startY, block2Color, ["Plusieurs vues", "intégrées"]);
  drawRoundedBlock(startX + 2 * (blockWidth + blockSpacing), startY, block3Color, ["Un bilan général", "de l'inspection"]);

  // --- IMAGE GLOBALE DE LA PISCINE ---
  yPos = startY + blockHeight + 20;

  // Trouver la première image de piscine (vue globale)
  const piscineImage = images.find(img =>
    img.analysis?.type === "piscine_vue_ensemble" ||
    img.analysis?.type === "piscine_generale" ||
    img.analysis?.displayPriority === 1
  ) || images[0]; // Prendre la première si pas trouvée

  if (piscineImage) {
    try {
      const imgDataUrl = `data:${piscineImage.contentType || "image/png"};base64,${piscineImage.base64}`;
      const maxImgWidth = pageWidth - 2 * margin - 20;
      const maxImgHeight = 110; // Augmenté de 80 à 110
      const xPos = (pageWidth - maxImgWidth) / 2;

      const dimensions = addRoundedImage(doc, imgDataUrl, xPos, yPos, maxImgWidth, maxImgHeight, 4);

      yPos += dimensions.height + 5;

      // Ajouter la description de l'image de la piscine
      if (piscineImage.analysis?.description) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(...hexToRgb(COLORS.darkGray));
        const captionLines = doc.splitTextToSize(piscineImage.analysis.description, maxImgWidth);
        captionLines.forEach((line: string) => {
          doc.text(line, pageWidth / 2, yPos, { align: "center" });
          yPos += 5;
        });
        yPos += 3;
      }
    } catch (error) {
      console.error("Erreur image piscine:", error);
    }
  }

  // ===================
  // PAGE 3+ : Sections avec header/footer
  // ===================
  console.log("\n📄 Pages suivantes: Sections du rapport");

  // --- NOUVELLE PAGE : INTERVENTION ---
  doc.addPage();
  addHeaderImage(doc, pageWidth);
  addFooterImage(doc, pageWidth, pageHeight);
  yPos = headerHeight + 10;

  yPos = addPastelSectionTitle(doc, "INTERVENTION", yPos, pageWidth, margin, COLORS.lightGreen);

  // Tableau informations client
  autoTable(doc, {
    startY: yPos,
    head: [["Information", "Détails"]],
    body: [
      ["Client", rapport.client.nom || "-"],
      ["Adresse", rapport.client.adresse_complete || "-"],
      ["Téléphone", rapport.client.telephone || "-"],
      ["Email", rapport.client.email || "-"],
      ["Date d'intervention", rapport.inspection.date],
      ["Technicien", rapport.inspection.technicien.nom_complet || "-"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: hexToRgb(COLORS.darkTeal),
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 10,
    },
    bodyStyles: {
      textColor: hexToRgb(COLORS.darkGray),
      fontSize: 11,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Services effectués
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(COLORS.darkTeal));
  doc.text("Services effectués :", margin, yPos);
  yPos += 6;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(COLORS.darkGray));
  doc.setFontSize(12);

  if (rapport.inspection.services_effectues && rapport.inspection.services_effectues.length > 0) {
    rapport.inspection.services_effectues.forEach((service) => {
      doc.text(`• ${service}`, margin + 5, yPos);
      yPos += 6;
    });
  } else if (rapport.inspection.description_services) {
    const services = rapport.inspection.description_services.split("|").map(s => s.trim());
    services.forEach((service) => {
      doc.text(`• ${service}`, margin + 5, yPos);
      yPos += 6;
    });
  }

  yPos += 8; // Espace après services effectués

  // --- NOUVELLE PAGE : DESCRIPTIF TECHNIQUE ---
  doc.addPage();
  addHeaderImage(doc, pageWidth);
  addFooterImage(doc, pageWidth, pageHeight);
  yPos = headerHeight + 10;

  yPos = addPastelSectionTitle(doc, "DESCRIPTIF TECHNIQUE", yPos, pageWidth, margin, COLORS.lightGreen);

  // Tableau Description & État des lieux
  const descriptionText = `Le revêtement est de type : ${rapport.piscine.revetement.type || "-"}.\nÂge : ${rapport.piscine.revetement.age || "-"}\n\nLa filtration est de type : ${rapport.piscine.filtration.type || "-"}`;
  const etatText = `Remplissage : ${rapport.piscine.etat_des_lieux.remplissage || "-"}\n\nÉtat de l'eau : ${rapport.piscine.etat_des_lieux.etat_eau || "-"}`;

  yPos = addPastelSubtitle(doc, "Description & État des lieux", yPos, pageWidth, margin, COLORS.lightBlue);

  autoTable(doc, {
    startY: yPos,
    head: [["DESCRIPTION", "ÉTAT DES LIEUX"]],
    body: [[descriptionText, etatText]],
    theme: "grid",
    headStyles: {
      fillColor: hexToRgb(COLORS.darkTeal),
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 10,
    },
    bodyStyles: {
      textColor: hexToRgb(COLORS.darkGray),
      fontSize: 11,
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Tableau Équipements
  yPos = addPastelSubtitle(doc, "Équipements", yPos, pageWidth, margin, COLORS.lightBlue);

  const equipRows: string[][] = [];
  const equipList = [
    { nom: "Skimmer", quantite: rapport.equipements.skimmer.quantite },
    { nom: "Prise balai", quantite: rapport.equipements.prise_balai.quantite },
    { nom: "Bonde de fond", quantite: rapport.equipements.bonde_fond.quantite },
    { nom: "Refoulement", quantite: rapport.equipements.refoulement.quantite },
    { nom: "Bonde de bac volet", quantite: rapport.equipements.bonde_bac_volet.quantite },
    { nom: "Spot", quantite: rapport.equipements.spot.quantite },
  ];

  equipList.forEach((equip) => {
    if (equip.quantite && equip.quantite > 0) {
      equipRows.push([equip.nom, equip.quantite.toString()]);
    }
  });

  autoTable(doc, {
    startY: yPos,
    head: [["Équipement", "Quantité"]],
    body: equipRows,
    theme: "grid",
    headStyles: {
      fillColor: hexToRgb(COLORS.darkTeal),
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 10,
    },
    bodyStyles: {
      textColor: hexToRgb(COLORS.darkGray),
      fontSize: 11,
    },
    columnStyles: {
      1: { halign: "center" }
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Texte descriptif technique
  if (rapport.observations_techniques?.descriptif_technique) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(COLORS.darkGray));

    const lines = doc.splitTextToSize(
      rapport.observations_techniques.descriptif_technique,
      pageWidth - 2 * margin
    );

    lines.forEach((line: string) => {
      if (yPos > pageHeight - footerHeight - 20) {
        doc.addPage();
        addHeaderImage(doc, pageWidth);
        addFooterImage(doc, pageWidth, pageHeight);
        yPos = headerHeight + 10;
      }
      doc.text(line, margin, yPos);
      yPos += 6;
    });
  }

  // --- NOUVELLE PAGE : LOCAL TECHNIQUE ---
  doc.addPage();
  addHeaderImage(doc, pageWidth);
  addFooterImage(doc, pageWidth, pageHeight);
  yPos = headerHeight + 10;

  yPos = addPastelSectionTitle(doc, "LOCAL TECHNIQUE", yPos, pageWidth, margin, COLORS.lightGreen);

  if (rapport.local_technique?.etat_general || rapport.local_technique?.observations) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(COLORS.darkGray));

    const localText = rapport.local_technique.observations || rapport.local_technique.etat_general || "Aucune fuite apparente";
    const lines = doc.splitTextToSize(localText, pageWidth - 2 * margin);

    lines.forEach((line: string) => {
      doc.text(line, margin, yPos);
      yPos += 6;
    });

    yPos += 10;
  }

  // Images du local technique
  const localImages = images.filter(img =>
    img.analysis?.type === "local_technique" ||
    img.analysis?.description?.toLowerCase().includes("local") ||
    img.analysis?.description?.toLowerCase().includes("technique") ||
    img.analysis?.description?.toLowerCase().includes("filtre") ||
    img.analysis?.description?.toLowerCase().includes("pompe")
  );

  if (localImages.length > 0) {
    console.log(`   ${localImages.length} image(s) du local technique`);
    localImages.forEach((img, index) => {
      try {
        const imgDataUrl = `data:${img.contentType || "image/png"};base64,${img.base64}`;
        const maxImgWidth = pageWidth - 2 * margin - 20;
        const maxImgHeight = 100; // Augmenté de 70 à 100
        const xPos = (pageWidth - maxImgWidth) / 2;

        if (yPos + maxImgHeight + 15 > pageHeight - footerHeight - 10) {
          doc.addPage();
          addHeaderImage(doc, pageWidth);
          addFooterImage(doc, pageWidth, pageHeight);
          yPos = headerHeight + 10;
        }

        const dimensions = addRoundedImage(doc, imgDataUrl, xPos, yPos, maxImgWidth, maxImgHeight, 4);
        yPos += dimensions.height + 5;

        // Ajouter la description de l'image du local technique
        if (img.analysis?.description) {
          doc.setFontSize(11);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(...hexToRgb(COLORS.darkGray));
          const captionLines = doc.splitTextToSize(img.analysis.description, maxImgWidth);
          captionLines.forEach((line: string) => {
            doc.text(line, pageWidth / 2, yPos, { align: "center" });
            yPos += 5;
          });
          yPos += 3;
        }

        yPos += 5;
      } catch (error) {
        console.error(`Erreur image local ${index}:`, error);
      }
    });
  }

  // --- NOUVELLE PAGE : TESTS RÉALISÉS ---
  doc.addPage();
  addHeaderImage(doc, pageWidth);
  addFooterImage(doc, pageWidth, pageHeight);
  yPos = headerHeight + 10;

  yPos = addPastelSectionTitle(doc, "TESTS RÉALISÉS", yPos, pageWidth, margin, COLORS.lightGreen);

  // Tableaux de conformité avec sous-titres
  const hasCanalisations = rapport.conformite.canalisations && rapport.conformite.canalisations.length > 0;
  const hasPiecesSceller = rapport.conformite.pieces_sceller && rapport.conformite.pieces_sceller.length > 0;
  const hasEtancheite = rapport.conformite.etancheite && rapport.conformite.etancheite.revetement;

  if (hasCanalisations) {
    yPos = addPastelSubtitle(doc, "Tests de pression - Canalisations", yPos, pageWidth, margin, COLORS.lightBlue);

    const canalisationsRows: string[][] = [];
    rapport.conformite.canalisations.forEach((item) => {
      canalisationsRows.push([item.element, item.statut]);
    });

    autoTable(doc, {
      startY: yPos,
      head: [["Canalisation", "Conformité"]],
      body: canalisationsRows,
      theme: "grid",
      headStyles: {
        fillColor: hexToRgb(COLORS.darkTeal),
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        fontSize: 10,
      },
      bodyStyles: {
        textColor: hexToRgb(COLORS.darkGray),
        fontSize: 9,
      },
      columnStyles: {
        1: { halign: "center", textColor: [34, 139, 34], fontStyle: "bold" }
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: margin, right: margin },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  if (hasPiecesSceller) {
    if (yPos > pageHeight - footerHeight - 60) {
      doc.addPage();
      addHeaderImage(doc, pageWidth);
      addFooterImage(doc, pageWidth, pageHeight);
      yPos = headerHeight + 10;
    }

    yPos = addPastelSubtitle(doc, "Tests d'étanchéité - Pièces à sceller", yPos, pageWidth, margin, COLORS.lightBlue);

    const piecesRows: string[][] = [];
    rapport.conformite.pieces_sceller.forEach((item) => {
      piecesRows.push([item.element, item.statut]);
    });

    autoTable(doc, {
      startY: yPos,
      head: [["Pièce à sceller", "Conformité"]],
      body: piecesRows,
      theme: "grid",
      headStyles: {
        fillColor: hexToRgb(COLORS.darkTeal),
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        fontSize: 10,
      },
      bodyStyles: {
        textColor: hexToRgb(COLORS.darkGray),
        fontSize: 9,
      },
      columnStyles: {
        1: { halign: "center", textColor: [34, 139, 34], fontStyle: "bold" }
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: margin, right: margin },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  if (hasEtancheite) {
    if (yPos > pageHeight - footerHeight - 40) {
      doc.addPage();
      addHeaderImage(doc, pageWidth);
      addFooterImage(doc, pageWidth, pageHeight);
      yPos = headerHeight + 10;
    }

    yPos = addPastelSubtitle(doc, "Test d'étanchéité du revêtement", yPos, pageWidth, margin, COLORS.lightBlue);

    autoTable(doc, {
      startY: yPos,
      head: [["Élément", "Conformité"]],
      body: [["Étanchéité du revêtement", rapport.conformite.etancheite.revetement || "Conforme"]],
      theme: "grid",
      headStyles: {
        fillColor: hexToRgb(COLORS.darkTeal),
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        fontSize: 10,
      },
      bodyStyles: {
        textColor: hexToRgb(COLORS.darkGray),
        fontSize: 9,
      },
      columnStyles: {
        1: { halign: "center", textColor: [34, 139, 34], fontStyle: "bold" }
      },
      margin: { left: margin, right: margin },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Séparer les images : manomètres vs autres tests
  const usedImages = [...localImages];
  if (piscineImage) {
    usedImages.push(piscineImage);
  }

  const allTestImages = images.filter(img => {
    if (usedImages.includes(img)) return false;
    if (img.analysis?.type === 'couverture_rapport') return false;
    return true;
  });

  // Séparer les images de manomètres/pression des autres
  const manometreImages = allTestImages.filter(img => {
    const desc = img.analysis?.description?.toLowerCase() || "";
    const type = img.analysis?.type?.toLowerCase() || "";
    return desc.includes("manomètre") || desc.includes("pression") || type.includes("pression");
  });

  const otherTestImages = allTestImages.filter(img => !manometreImages.includes(img));

  console.log(`\n=== IMAGES POUR SECTION TESTS ===`);
  console.log(`Total images: ${images.length}`);
  console.log(`Images manomètres: ${manometreImages.length}`);
  console.log(`Autres images tests: ${otherTestImages.length}`);

  // Section spéciale pour les manomètres (mise en pression)
  if (manometreImages.length > 0) {
    if (yPos > pageHeight - footerHeight - 60) {
      doc.addPage();
      addHeaderImage(doc, pageWidth);
      addFooterImage(doc, pageWidth, pageHeight);
      yPos = headerHeight + 10;
    }

    yPos = addPastelSubtitle(doc, "Mise en pression des canalisations", yPos, pageWidth, margin, COLORS.lightBlue);

    // Afficher toutes les images de manomètres sans légende individuelle
    manometreImages.forEach((img, index) => {
      try {
        if (yPos > pageHeight - footerHeight - 120) {
          doc.addPage();
          addHeaderImage(doc, pageWidth);
          addFooterImage(doc, pageWidth, pageHeight);
          yPos = headerHeight + 10;
        }

        const imgDataUrl = `data:${img.contentType || "image/png"};base64,${img.base64}`;
        const maxImgWidth = pageWidth - 2 * margin - 20;
        const maxImgHeight = 100; // Augmenté pour les manomètres
        const xPos = (pageWidth - maxImgWidth) / 2;

        const dimensions = addRoundedImage(doc, imgDataUrl, xPos, yPos, maxImgWidth, maxImgHeight, 4);
        yPos += dimensions.height + 8; // Plus d'espace entre les images

        console.log(`   ✓ Image manomètre ${index + 1}/${manometreImages.length}`);
      } catch (error) {
        console.error(`   ❌ Erreur image manomètre ${index}:`, error);
      }
    });

    yPos += 5;
  }

  // Autres images de tests avec descriptions
  if (otherTestImages.length > 0) {
    otherTestImages.forEach((img, index) => {
      try {
        if (yPos > pageHeight - footerHeight - 120) {
          doc.addPage();
          addHeaderImage(doc, pageWidth);
          addFooterImage(doc, pageWidth, pageHeight);
          yPos = headerHeight + 10;
        }

        const imgDataUrl = `data:${img.contentType || "image/png"};base64,${img.base64}`;
        const maxImgWidth = pageWidth - 2 * margin - 20;
        const maxImgHeight = 100; // Augmenté pour toutes les images
        const xPos = (pageWidth - maxImgWidth) / 2;

        const dimensions = addRoundedImage(doc, imgDataUrl, xPos, yPos, maxImgWidth, maxImgHeight, 4);
        yPos += dimensions.height + 3;

        // Déterminer le nom du test
        let testName = "";
        const desc = img.analysis?.description?.toLowerCase() || "";
        const type = img.analysis?.type?.toLowerCase() || "";

        if (desc.includes("skimmer") || type.includes("skimmer")) {
          testName = "Test skimmer";
        } else if (desc.includes("bonde") || type.includes("bonde")) {
          testName = "Test bonde de fond";
        } else if (desc.includes("refoulement") || type.includes("refoulement")) {
          testName = "Test refoulement";
        } else if (desc.includes("étanchéité") || desc.includes("revêtement") || type.includes("etancheite")) {
          testName = "Test d'étanchéité";
        } else if (desc.includes("fluorescéine") || type.includes("fluoresceine")) {
          testName = "Test fluorescéine";
        }

        // Afficher le nom du test en gras si identifié
        if (testName) {
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...hexToRgb(COLORS.darkGray));
          doc.text(testName, pageWidth / 2, yPos, { align: "center" });
          yPos += 6;
        }

        // Toujours afficher la description complète de l'image
        if (img.analysis?.description) {
          doc.setFontSize(11);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(...hexToRgb(COLORS.darkGray));
          const captionLines = doc.splitTextToSize(img.analysis.description, maxImgWidth);
          captionLines.forEach((line: string) => {
            doc.text(line, pageWidth / 2, yPos, { align: "center" });
            yPos += 5;
          });
          yPos += 3;
        }

        yPos += 4;

        console.log(`   ✓ Image ${index + 1}/${otherTestImages.length}: ${testName || "sans légende"}`);
      } catch (error) {
        console.error(`   ❌ Erreur image test ${index}:`, error);
      }
    });
  }

  if (allTestImages.length === 0) {
    console.log(`   ⚠️  Aucune image pour la section tests`);
  }

  // --- NOUVELLE PAGE : BILAN ---
  doc.addPage();
  addHeaderImage(doc, pageWidth);
  addFooterImage(doc, pageWidth, pageHeight);
  yPos = headerHeight + 10;

  yPos = addPastelSectionTitle(doc, "BILAN DE L'INSPECTION", yPos, pageWidth, margin, COLORS.lightGreen);

  if (rapport.bilan && rapport.bilan.conclusion_generale && rapport.bilan.conclusion_generale.trim().length > 0) {
    const bilanText = rapport.bilan.conclusion_generale;
    const items: string[] = [];

    if (bilanText.includes("|")) {
      const parts = bilanText.split("|").map(s => s.trim());
      parts.forEach(part => {
        if (part.length > 0) {
          const sentences = part.split(/\.\s+/).filter(s => s.trim().length > 0);
          items.push(...sentences.map(s => s.trim()));
        }
      });
    } else {
      const sentences = bilanText.split(/\.\s+/).filter(s => s.trim().length > 0);
      items.push(...sentences.map(s => s.trim()));
    }

    // Afficher comme liste à puces
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(COLORS.darkGray));

    items.forEach((item) => {
      const displayItem = item.endsWith('.') || item.endsWith('!') ? item : item + '.';
      const bulletText = `• ${displayItem}`;
      const lines = doc.splitTextToSize(bulletText, pageWidth - 2 * margin - 10);

      lines.forEach((line: string) => {
        if (yPos > pageHeight - footerHeight - 15) {
          doc.addPage();
          addHeaderImage(doc, pageWidth);
          addFooterImage(doc, pageWidth, pageHeight);
          yPos = headerHeight + 10;
        }
        doc.text(line, margin + 5, yPos);
        yPos += 6;
      });
    });
  }

  // --- NOUVELLE PAGE : RESPONSABILITÉS ---
  // Note: Pas de footer sur cette page (avant-dernière page)
  doc.addPage();
  addHeaderImage(doc, pageWidth);
  yPos = headerHeight + 10;

  yPos = addPastelSectionTitle(doc, "RESPONSABILITÉS", yPos, pageWidth, margin, COLORS.darkTeal);

  const responsabilites = `La mission ne porte pas sur l'étude ou le calcul des résistances des différents matériaux.

La responsabilité de LOCAMEX se limite à l'objet de la présente mission sous réserve des vices cachés.

Les mesures conservatoires mises en place ne sont pas garanties et sont uniquement destinées à vous donner le temps nécessaire pour procéder aux réparations. Aucune nouvelle intervention ne sera programmée avant la mise en œuvre de la réparation définitive. Par ailleurs, la pose de patchs n'est ni obligatoire ni garantie : leur efficacité peut varier et ils peuvent perdre leur efficacité après quelques jours ou semaines.

En ce qui concerne les piscines en béton, une réparation localisée ne permet pas de résoudre les problèmes de fuite liés au revêtement. Dans ces cas, une reprise complète de l'étanchéité du bassin est nécessaire.

Pour les localisations effectuées avec le gaz traceur, la précision peut être inférieure à celle obtenue par caméra, mais c'est le seul moyen de repérer une zone de fuite, avec une marge d'erreur d'environ 1 à 2 mètres.

Notre intervention a permis un diagnostic des réseaux jugé comme vrai uniquement au moment de nos tests. Si d'autres anomalies, sans rapport avec l'objet, ont été détectées et mises sur ce rapport, elles l'ont été au titre d'un devoir d'information.

La société procédant à la réparation des fuites sur canalisation devra effectuer un test après réparation sous sa responsabilité. Si une autre fuite subsistait, il s'agirait d'une nouvelle mission pour LOCAMEX.`;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(COLORS.darkGray));

  const responsLines = doc.splitTextToSize(responsabilites, pageWidth - 2 * margin);

  responsLines.forEach((line: string) => {
    if (yPos > pageHeight - 40) { // Pas de footer, donc plus d'espace disponible
      doc.addPage();
      addHeaderImage(doc, pageWidth);
      // Pas de footer sur les pages de responsabilités
      yPos = headerHeight + 10;
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  });

  // ===================
  // DERNIÈRE PAGE : Page de fin
  // ===================
  console.log("\n📄 Dernière page: Page de fin");
  const finalImage = loadImageAsBase64("pagedefin.png");
  if (finalImage) {
    try {
      doc.addPage();
      doc.addImage(finalImage, "PNG", 0, 0, pageWidth, pageHeight);
      console.log("   ✓ Page de fin ajoutée");
    } catch (error) {
      console.error("Erreur page de fin:", error);
    }
  }

  console.log("\n✅ PDF V3 généré avec succès!");
  console.log(`   Total de pages: ${doc.getNumberOfPages()}`);
  console.log("=== FIN GÉNÉRATION PDF ===\n");

  return doc.output("blob");
}
