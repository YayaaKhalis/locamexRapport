/**
 * Générateur DOCX SIMPLE - Copie le template et remplace uniquement le texte
 * Garantit une cohérence visuelle PARFAITE car la structure reste intacte
 */

import PizZip from "pizzip";
import fs from "fs";
import path from "path";
import { RapportAnalyse, ImageData } from "@/types";

/**
 * Remplace toutes les occurrences d'un texte dans le XML
 */
function replaceAll(xml: string, search: string, replace: string): string {
  return xml.split(search).join(replace);
}

/**
 * Échappe les caractères spéciaux XML
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Génère un DOCX en copiant le template et en remplaçant le texte
 */
export async function generateDOCXSimple(
  rapport: RapportAnalyse,
  images: ImageData[]
): Promise<Blob> {
  console.log("\n=== GÉNÉRATION DOCX SIMPLE (COPIE DU TEMPLATE) ===");
  console.log(`Client: ${rapport.client.nom || "Non spécifié"}`);
  console.log(`Date inspection: ${rapport.inspection.date}`);

  // Charger le template
  const templatePath = path.join(process.cwd(), "public", "Rapport_06-11-2025_Cholat.docx");
  const templateContent = fs.readFileSync(templatePath, "binary");

  // Créer un zip à partir du template
  const zip = new PizZip(templateContent);

  // Extraire le document.xml
  let documentXml = zip.file("word/document.xml")?.asText();

  if (!documentXml) {
    throw new Error("Impossible d'extraire le document.xml du template");
  }

  console.log("✅ Template chargé, taille XML:", documentXml.length);

  // ===========================================
  // REMPLACEMENTS DE TEXTE (données du rapport)
  // ===========================================

  // Client
  documentXml = replaceAll(documentXml, "Cholat", escapeXml(rapport.client.nom || ""));

  // Date
  const dateFormatted = rapport.inspection.date || "";
  documentXml = replaceAll(documentXml, "06/11/2025", dateFormatted);

  // Adresse
  const adresse = rapport.client.adresse || "";
  documentXml = replaceAll(
    documentXml,
    "248 Allée de garenne, 73230 Barby",
    escapeXml(adresse)
  );

  // Intervenant
  const intervenant = rapport.inspection.intervenant || "LOCAMEX";
  documentXml = replaceAll(documentXml, "Agence LOCAMEX73", escapeXml(intervenant));

  // Description piscine
  const descriptionPiscine = rapport.piscine?.description || "";
  if (descriptionPiscine) {
    // Rechercher et remplacer la section description du template
    // Le template contient probablement un texte générique qu'on peut remplacer
    documentXml = replaceAll(
      documentXml,
      "Piscine enterrée avec revêtement liner",
      escapeXml(descriptionPiscine)
    );
  }

  // État des lieux
  const etatLieux = rapport.piscine?.etatLieux || "";
  if (etatLieux) {
    documentXml = replaceAll(
      documentXml,
      "Bon état général",
      escapeXml(etatLieux)
    );
  }

  // Équipements - Skimmers
  const skimmers = rapport.piscine?.equipements?.skimmers;
  if (skimmers !== undefined && skimmers !== null) {
    documentXml = replaceAll(documentXml, ">2<", `>${skimmers}<`);
  }

  // Équipements - Bondes de fond
  const bondes = rapport.piscine?.equipements?.bondesDeFond;
  if (bondes !== undefined && bondes !== null) {
    documentXml = replaceAll(documentXml, ">1<", `>${bondes}<`);
  }

  // Équipements - Refoulements
  const refoulements = rapport.piscine?.equipements?.refoulements;
  if (refoulements !== undefined && refoulements !== null) {
    documentXml = replaceAll(documentXml, ">3<", `>${refoulements}<`);
  }

  // Équipements - Prises balai
  const prisesBalai = rapport.piscine?.equipements?.prisesBalai;
  if (prisesBalai !== undefined && prisesBalai !== null) {
    documentXml = replaceAll(documentXml, ">1<", `>${prisesBalai}<`);
  }

  // Revêtement
  const revetement = rapport.piscine?.revetement || "";
  if (revetement) {
    documentXml = replaceAll(documentXml, "Liner", escapeXml(revetement));
  }

  // Dimensions
  const dimensions = rapport.piscine?.dimensions || "";
  if (dimensions) {
    documentXml = replaceAll(documentXml, "8m x 4m", escapeXml(dimensions));
  }

  // Forme
  const forme = rapport.piscine?.forme || "";
  if (forme) {
    documentXml = replaceAll(documentXml, "Rectangulaire", escapeXml(forme));
  }

  // Volume
  const volume = rapport.piscine?.volume || "";
  if (volume) {
    documentXml = replaceAll(documentXml, "40m³", escapeXml(volume));
  }

  // Local technique
  const localTechnique = rapport.localTechnique?.description || "";
  if (localTechnique) {
    documentXml = replaceAll(
      documentXml,
      "Local technique bien organisé et accessible",
      escapeXml(localTechnique)
    );
  }

  // Canalisations
  rapport.conformite?.canalisations?.forEach((canalisation, index) => {
    const nom = canalisation.nom || "";
    const statut = canalisation.conforme ? "CONFORME" : "NON CONFORME";
    const observation = canalisation.observation || "";

    // Remplacer dans le XML (exemple basique, à adapter selon structure réelle)
    if (nom) {
      documentXml = replaceAll(documentXml, `Canalisation ${index + 1}`, escapeXml(nom));
    }
  });

  // Pièces à sceller
  rapport.conformite?.piecesASceller?.forEach((piece) => {
    const nom = piece.nom || "";
    const statut = piece.conforme ? "CONFORME" : "NON CONFORME";
    const observation = piece.observation || "";

    // Remplacer dans le XML
    if (nom && observation) {
      documentXml = replaceAll(documentXml, nom, `${escapeXml(nom)} - ${escapeXml(statut)}`);
    }
  });

  // Conclusion
  const conclusion = rapport.conclusion || "";
  if (conclusion) {
    documentXml = replaceAll(
      documentXml,
      "La piscine présente une fuite au niveau du skimmer gauche",
      escapeXml(conclusion)
    );
  }

  console.log("✅ Remplacements effectués");

  // Remettre le document.xml modifié dans le zip
  zip.file("word/document.xml", documentXml);

  // Générer le nouveau fichier DOCX
  const buffer = zip.generate({
    type: "nodebuffer",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  console.log("✅ DOCX généré, taille:", buffer.length);

  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

/**
 * AVANTAGES DE CETTE APPROCHE :
 *
 * ✅ Cohérence visuelle PARFAITE (100% identique au template)
 * ✅ Aucun risque de casser la mise en page
 * ✅ Polices, couleurs, espacements automatiquement respectés
 * ✅ Images du template préservées
 * ✅ Structure complexe (en-têtes, pieds de page, styles) intacte
 * ✅ Simple à maintenir
 *
 * ⚠️ LIMITES :
 *
 * - Les images dynamiques ne sont pas encore intégrées (nécessite docxtemplater-image-module)
 * - Les tableaux dynamiques ne sont pas encore gérés (nécessite des boucles)
 * - Fonctionne bien pour les rapports avec structure similaire au template
 *
 * PROCHAINES ÉTAPES POUR UNE VERSION COMPLÈTE :
 *
 * 1. Convertir le template en vrai template docxtemplater avec placeholders
 * 2. Utiliser docxtemplater pour remplir les placeholders
 * 3. Utiliser docxtemplater-image-module pour les images
 */
