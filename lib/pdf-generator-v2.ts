import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { RapportAnalyse, ImageData } from "@/types";
import fs from "fs";
import path from "path";

// Couleurs LOCAMEX officielles
const COLORS = {
  teal: "#6096A5",      // Bleu-vert principal
  green: "#A8C391",     // Vert clair pour encadré bilan
  white: "#FFFFFF",
  grayLight: "#F5F5F5",
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
 * Ajoute l'en-tête LOCAMEX sur les pages intérieures
 */
function addHeader(doc: jsPDF, pageWidth: number) {
  const [r, g, b] = hexToRgb(COLORS.teal);
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, pageWidth, 10, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("LOCAMEX", 10, 6.5);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Expert en recherche de fuites piscine", pageWidth - 10, 6.5, { align: "right" });
}

/**
 * Ajoute le pied de page
 */
function addFooter(doc: jsPDF, pageNum: number, pageWidth: number, pageHeight: number) {
  const [r, g, b] = hexToRgb(COLORS.teal);
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.5);
  doc.line(10, pageHeight - 15, pageWidth - 10, pageHeight - 15);

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
}

/**
 * Ajoute une section titre (barre pleine largeur)
 */
function addSectionTitle(
  doc: jsPDF,
  title: string,
  yPosition: number,
  pageWidth: number,
  margin: number
): number {
  const [r, g, b] = hexToRgb(COLORS.teal);
  doc.setFillColor(r, g, b);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, yPosition + 6.5, { align: "center" });

  // Reset couleur texte
  const [tr, tg, tb] = hexToRgb(COLORS.textDark);
  doc.setTextColor(tr, tg, tb);

  return yPosition + 10 + 5; // Position après le titre + espacement
}

/**
 * Génère un PDF professionnel LOCAMEX v2 basé sur le modèle de référence
 * Structure du PDF :
 * - Page 1 : Hero section (branding)
 * - Page 2 : Informations générales (CARDS)
 * - Pages suivantes : Vues détaillées (descriptif, local technique, équipements, tableaux)
 * - Ensuite : Bilan de l'inspection
 * - Mentions légales
 * - À la fin : Photos de l'intervention (sans couverture LOCAMEX)
 * - Dernière page : Page de fin (merci)
 */
export function generatePDFV2(
  rapport: RapportAnalyse,
  images: ImageData[]
): Blob {
  console.log("\n=== GÉNÉRATION PDF PROFESSIONNELLE V2 ===");
  console.log(`Client: ${rapport.client.nom || "Non spécifié"}`);
  console.log(`Date inspection: ${rapport.inspection.date}`);
  console.log(`Nombre d'images: ${images.length}`);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let currentPage = 1;

  // ===================
  // PAGE 1 : Page de garde
  // ===================
  console.log("\n📄 Page 1: Hero section (branding)");
  const heroImage = loadImageAsBase64("HeroSectionRapport.png");
  if (heroImage) {
    try {
      doc.addImage(heroImage, "PNG", 0, 0, pageWidth, pageHeight);

      // Ajouter le nom du client et la date par-dessus l'image
      // Décalé de 20px vers le bas (20px = ~7mm)
      const offsetY = 7; // 20px ≈ 7mm
      const [blueR, blueG, blueB] = hexToRgb(COLORS.teal);
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
      console.error("Erreur lors de l'ajout de l'image hero:", error);
    }
  }

  // ===================
  // PAGE 2 : Image après hero section
  // ===================
  console.log("\n📄 Page 2: Image apresherosection");
  doc.addPage();
  currentPage++;

  const apresHeroImage = loadImageAsBase64("apresherosection.png");
  if (apresHeroImage) {
    try {
      doc.addImage(apresHeroImage, "PNG", 0, 0, pageWidth, pageHeight);
      console.log("   ✓ Image apresherosection ajoutée");
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'image apresherosection:", error);
    }
  } else {
    console.warn("⚠️  Image apresherosection.png introuvable");
  }

  // ===================
  // PAGE 3 : Informations générales
  // ===================
  console.log("\n📄 Page 3: Informations générales (CARDS)");
  doc.addPage();
  currentPage++;
  addHeader(doc, pageWidth);

  let yPos = 15;

  // Section INFORMATIONS GÉNÉRALES
  console.log("   ✓ Tableau informations client");
  yPos = addSectionTitle(doc, "INFORMATIONS GÉNÉRALES", yPos, pageWidth, margin);

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
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Section Services effectués
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(COLORS.teal));
  doc.text("Services effectués :", margin, yPos);
  yPos += 6;

  // Liste à puces des services
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(COLORS.textDark));
  doc.setFontSize(9);

  if (rapport.inspection.services_effectues && rapport.inspection.services_effectues.length > 0) {
    rapport.inspection.services_effectues.forEach((service) => {
      doc.text(`• ${service}`, margin + 5, yPos);
      yPos += 5;
    });
  } else if (rapport.inspection.description_services) {
    // Si pas de liste, afficher la description
    const services = rapport.inspection.description_services.split("|").map(s => s.trim());
    services.forEach((service) => {
      doc.text(`• ${service}`, margin + 5, yPos);
      yPos += 5;
    });
  }

  yPos += 5;

  // Section DESCRIPTIF TECHNIQUE
  console.log("   ✓ Section descriptif technique");
  if (yPos > pageHeight - 50) {
    addFooter(doc, currentPage, pageWidth, pageHeight);
    doc.addPage();
    currentPage++;
    addHeader(doc, pageWidth);
    yPos = 15;
  }

  yPos = addSectionTitle(doc, "DESCRIPTIF TECHNIQUE", yPos, pageWidth, margin);

  if (rapport.observations_techniques?.descriptif_technique) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(COLORS.textDark));

    const lines = doc.splitTextToSize(
      rapport.observations_techniques.descriptif_technique,
      pageWidth - 2 * margin
    );

    lines.forEach((line: string) => {
      if (yPos > pageHeight - 30) {
        addFooter(doc, currentPage, pageWidth, pageHeight);
        doc.addPage();
        currentPage++;
        addHeader(doc, pageWidth);
        yPos = 15;
      }
      doc.text(line, margin, yPos);
      yPos += 5;
    });
  }

  yPos += 5;

  // Section LOCAL TECHNIQUE
  if (yPos > pageHeight - 50) {
    addFooter(doc, currentPage, pageWidth, pageHeight);
    doc.addPage();
    currentPage++;
    addHeader(doc, pageWidth);
    yPos = 15;
  }

  yPos = addSectionTitle(doc, "LOCAL TECHNIQUE", yPos, pageWidth, margin);

  if (rapport.local_technique?.etat_general || rapport.local_technique?.observations) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(COLORS.textDark));

    const localText = rapport.local_technique.observations || rapport.local_technique.etat_general || "Aucune fuite apparente";
    const lines = doc.splitTextToSize(localText, pageWidth - 2 * margin);

    lines.forEach((line: string) => {
      if (yPos > pageHeight - 30) {
        addFooter(doc, currentPage, pageWidth, pageHeight);
        doc.addPage();
        currentPage++;
        addHeader(doc, pageWidth);
        yPos = 15;
      }
      doc.text(line, margin, yPos);
      yPos += 5;
    });
  }

  addFooter(doc, currentPage, pageWidth, pageHeight);

  // ===================
  // PAGE 3 : Description et équipements
  // ===================
  console.log("\n📄 Page 3: Description et équipements");
  doc.addPage();
  currentPage++;
  addHeader(doc, pageWidth);
  yPos = 15;

  // Tableau DESCRIPTION & ÉTAT DES LIEUX
  console.log("   ✓ Tableau description & état des lieux");
  yPos = addSectionTitle(doc, "DESCRIPTION & ÉTAT DES LIEUX", yPos, pageWidth, margin);

  const descriptionText = `Le revêtement est de type : ${rapport.piscine.revetement.type || "-"}.\nÂge : ${rapport.piscine.revetement.age || "-"}\n\nLa filtration est de type : ${rapport.piscine.filtration.type || "-"}`;
  const etatText = `Remplissage : ${rapport.piscine.etat_des_lieux.remplissage || "-"}\n\nÉtat de l'eau : ${rapport.piscine.etat_des_lieux.etat_eau || "-"}`;

  autoTable(doc, {
    startY: yPos,
    head: [["DESCRIPTION", "ÉTAT DES LIEUX"]],
    body: [[descriptionText, etatText]],
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
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Tableau ÉQUIPEMENTS
  console.log("   ✓ Tableau équipements");
  yPos = addSectionTitle(doc, "ÉQUIPEMENTS", yPos, pageWidth, margin);

  const equipRows: string[][] = [];

  // Ajouter les équipements avec quantité
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
    columnStyles: {
      1: { halign: "center" }
    },
    alternateRowStyles: {
      fillColor: hexToRgb(COLORS.grayLight),
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  addFooter(doc, currentPage, pageWidth, pageHeight);

  // ===================
  // PAGE 4 : Tableaux de conformité
  // ===================
  console.log("\n📄 Page 4: Tableaux de conformité");

  // Vérifier s'il y a des données de conformité à afficher
  const hasCanalisations = rapport.conformite.canalisations && rapport.conformite.canalisations.length > 0;
  const hasPiecesSceller = rapport.conformite.pieces_sceller && rapport.conformite.pieces_sceller.length > 0;
  const hasEtancheite = rapport.conformite.etancheite && rapport.conformite.etancheite.revetement;

  // Ne créer la page que s'il y a au moins une donnée
  if (hasCanalisations || hasPiecesSceller || hasEtancheite) {
    doc.addPage();
    currentPage++;
    addHeader(doc, pageWidth);
    yPos = 15;

    // Tableau CANALISATIONS (seulement si des données existent)
    if (hasCanalisations) {
      console.log("   ✓ Tableau canalisations");
      yPos = addSectionTitle(doc, "CANALISATIONS", yPos, pageWidth, margin);

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
    columnStyles: {
      1: { halign: "center", textColor: [34, 139, 34], fontStyle: "bold" } // Vert pour "Conforme"
    },
    alternateRowStyles: {
      fillColor: hexToRgb(COLORS.grayLight),
    },
    margin: { left: margin, right: margin },
  });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    } else {
      console.log("   ⚠️  Pas de données canalisations (tableau non affiché)");
    }

    // Tableau PIÈCES À SCELLER (seulement si des données existent)
    if (hasPiecesSceller) {
      console.log("   ✓ Tableau pièces à sceller");
      yPos = addSectionTitle(doc, "PIÈCES À SCELLER", yPos, pageWidth, margin);

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
    columnStyles: {
      1: { halign: "center", textColor: [34, 139, 34], fontStyle: "bold" }
    },
    alternateRowStyles: {
      fillColor: hexToRgb(COLORS.grayLight),
    },
    margin: { left: margin, right: margin },
  });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    } else {
      console.log("   ⚠️  Pas de données pièces à sceller (tableau non affiché)");
    }

    // Tableau ÉTANCHÉITÉ DU REVÊTEMENT (seulement si des données existent)
    if (hasEtancheite) {
      console.log("   ✓ Tableau étanchéité du revêtement");
      yPos = addSectionTitle(doc, "ÉTANCHÉITÉ DU REVÊTEMENT", yPos, pageWidth, margin);

      autoTable(doc, {
        startY: yPos,
        head: [["Élément", "Conformité"]],
        body: [["Étanchéité du revêtement", rapport.conformite.etancheite.revetement || "Conforme"]],
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
    columnStyles: {
      1: { halign: "center", textColor: [34, 139, 34], fontStyle: "bold" }
    },
    alternateRowStyles: {
      fillColor: hexToRgb(COLORS.grayLight),
    },
    margin: { left: margin, right: margin },
  });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    } else {
      console.log("   ⚠️  Pas de données étanchéité (tableau non affiché)");
    }

    addFooter(doc, currentPage, pageWidth, pageHeight);
  } else {
    console.log("   ⚠️  Aucune donnée de conformité (page non créée)");
  }

  // ===================
  // PAGE 5 : Tests et bilan
  // ===================
  console.log("\n📄 Page 5: Tests et bilan de l'inspection");
  doc.addPage();
  currentPage++;
  addHeader(doc, pageWidth);
  yPos = 15;

  // Section TESTS EFFECTUÉS
  console.log("   ✓ Section tests effectués");
  yPos = addSectionTitle(doc, "TESTS EFFECTUÉS", yPos, pageWidth, margin);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(COLORS.teal));
  doc.text("Tests pièces à sceller :", margin, yPos);
  yPos += 6;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(COLORS.textDark));
  doc.setFontSize(9);
  doc.text("Tests effectués sur l'ensemble des pièces à sceller.", margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(COLORS.teal));
  doc.text("Tests d'étanchéité revêtement :", margin, yPos);
  yPos += 6;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(COLORS.textDark));
  doc.setFontSize(9);
  doc.text("Tests effectués par électro-induction et injection de fluorescéine.", margin, yPos);
  yPos += 15;

  // Section BILAN DE L'INSPECTION (encadré vert) - seulement si des données existent
  if (rapport.bilan && rapport.bilan.conclusion_generale && rapport.bilan.conclusion_generale.trim().length > 0) {
    console.log("   ✓ Bilan de l'inspection (encadré vert)");
    yPos = addSectionTitle(doc, "BILAN DE L'INSPECTION", yPos, pageWidth, margin);

    // Séparer le texte en items (par "|" ou par points)
    const bilanText = rapport.bilan.conclusion_generale;
    const items: string[] = [];

    // Séparer par "|" s'il y en a
    if (bilanText.includes("|")) {
      const parts = bilanText.split("|").map(s => s.trim());
      parts.forEach(part => {
        if (part.length > 0) {
          // Si la partie contient plusieurs phrases, les séparer
          const sentences = part.split(/\.\s+/).filter(s => s.trim().length > 0);
          items.push(...sentences.map(s => s.trim()));
        }
      });
    } else {
      // Sinon, séparer par points
      const sentences = bilanText.split(/\.\s+/).filter(s => s.trim().length > 0);
      items.push(...sentences.map(s => s.trim()));
    }

    // Calculer la hauteur nécessaire pour l'encadré
    const lineHeight = 5;
    const bilanHeight = Math.max(25, items.length * lineHeight + 15);

    // Encadré vert clair avec bordure
    const [gr, gg, gb] = hexToRgb(COLORS.green);
    doc.setDrawColor(gr, gg, gb);
    doc.setLineWidth(1);
    doc.setFillColor(245, 251, 241); // Vert très clair
    doc.rect(margin, yPos, pageWidth - 2 * margin, bilanHeight, "FD");

    yPos += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(COLORS.textDark));

    // Afficher chaque item avec une puce
    items.forEach((item) => {
      // Ajouter un point final si absent
      const displayItem = item.endsWith('.') || item.endsWith('!') ? item : item + '.';

      // Afficher avec puce
      const bulletText = `• ${displayItem}`;
      const lines = doc.splitTextToSize(bulletText, pageWidth - 2 * margin - 15);

      lines.forEach((line: string) => {
        doc.text(line, margin + 5, yPos);
        yPos += lineHeight;
      });
    });

    yPos += 10;
  } else {
    console.log("   ⚠️  Pas de bilan de l'inspection (section non affichée)");
  }

  addFooter(doc, currentPage, pageWidth, pageHeight);

  // ===================
  // PAGE 6 : Mentions légales (seulement si présentes)
  // ===================
  if (rapport.mentions_legales?.texte_complet && rapport.mentions_legales.texte_complet.trim().length > 0) {
    console.log("\n📄 Page 6: Mentions légales");
    doc.addPage();
    currentPage++;
    addHeader(doc, pageWidth);
    yPos = 15;

    console.log("   ✓ Mentions légales");
    yPos = addSectionTitle(doc, "MENTIONS LÉGALES", yPos, pageWidth, margin);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(COLORS.textDark));

    const mentionsLines = doc.splitTextToSize(
      rapport.mentions_legales.texte_complet,
      pageWidth - 2 * margin
    );

    mentionsLines.forEach((line: string) => {
      if (yPos > pageHeight - 30) {
        addFooter(doc, currentPage, pageWidth, pageHeight);
        doc.addPage();
        currentPage++;
        addHeader(doc, pageWidth);
        yPos = 15;
      }
      doc.text(line, margin, yPos);
      yPos += 5;
    });

    addFooter(doc, currentPage, pageWidth, pageHeight);
  } else {
    console.log("\n⚠️  Pas de mentions légales (page non créée)");
  }

  // ===================
  // PAGES PHOTOS : Documentation photographique
  // ===================
  if (images && images.length > 0) {
    // FILTRER les images de couverture LOCAMEX (ne pas les inclure dans le PDF final)
    const relevantImages = images.filter(img => {
      // Exclure les images de type "couverture_rapport"
      if (img.analysis?.type === 'couverture_rapport') {
        console.log(`❌ Image de couverture exclue: ${img.analysis.description}`);
        return false;
      }
      return true;
    });

    console.log(`📸 ${relevantImages.length} photos pertinentes sur ${images.length} (${images.length - relevantImages.length} exclues)`);

    if (relevantImages.length === 0) {
      console.log("⚠️  Aucune photo pertinente à afficher dans le PDF");
    } else {
      console.log("\n📸 Pages photos: Documentation photographique");
      console.log(`   ${relevantImages.length} photo(s) à afficher`);

      doc.addPage();
      currentPage++;
      addHeader(doc, pageWidth);
      yPos = 15;

      yPos = addSectionTitle(doc, "DOCUMENTATION PHOTOGRAPHIQUE", yPos, pageWidth, margin);

      // Trier les images par priorité (si analysées avec GPT-4 Vision)
      const sortedImages = [...relevantImages].sort((a, b) => {
        const priorityA = a.analysis?.displayPriority || 5;
        const priorityB = b.analysis?.displayPriority || 5;
        return priorityA - priorityB;
      });

      sortedImages.forEach((img, index) => {
        try {
          const imgDataUrl = `data:${img.contentType || "image/png"};base64,${img.base64}`;

          // Afficher 2 images par page
          if (index > 0 && index % 2 === 0) {
            addFooter(doc, currentPage, pageWidth, pageHeight);
            doc.addPage();
            currentPage++;
            addHeader(doc, pageWidth);
            yPos = 15;
          }

          const imgWidth = pageWidth - 2 * margin - 30;
          const imgHeight = 80;
          const xPos = (pageWidth - imgWidth) / 2;

          doc.addImage(imgDataUrl, "PNG", xPos, yPos, imgWidth, imgHeight);

          yPos += imgHeight + 3;

          // Ajouter la légende
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(...hexToRgb(COLORS.textDark));
          const caption = img.analysis?.description || `Photo ${index + 1}`;
          doc.text(caption, pageWidth / 2, yPos, { align: "center" });

          yPos += 15;
        } catch (error) {
          console.error(`Erreur lors de l'ajout de l'image ${index}:`, error);
        }
      });

      addFooter(doc, currentPage, pageWidth, pageHeight);
    }
  }

  // ===================
  // DERNIÈRE PAGE : Merci
  // ===================
  console.log("\n📄 Dernière page: Page de fin");
  const finalImage = loadImageAsBase64("pagedefin.png");
  if (finalImage) {
    try {
      doc.addPage();
      doc.addImage(finalImage, "PNG", 0, 0, pageWidth, pageHeight);
      console.log("   ✓ Page de fin ajoutée");
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'image de fin:", error);
    }
  }

  console.log("\n✅ PDF généré avec succès!");
  console.log(`   Total de pages: ${doc.getNumberOfPages()}`);
  console.log("=== FIN GÉNÉRATION PDF ===\n");

  // Retourner le PDF en tant que Blob
  return doc.output("blob");
}
