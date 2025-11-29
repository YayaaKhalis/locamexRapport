/**
 * Générateur DOCX V3 - Utilise directement le template LOCAMEX original
 * pour garantir une cohérence visuelle PARFAITE (pixel-perfect)
 */

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import fs from "fs";
import path from "path";
import { RapportAnalyse, ImageData } from "@/types";
import ImageModule from "docxtemplater-image-module-free";

/**
 * Élimine les doublons d'images
 */
function removeDuplicateImages(images: ImageData[]): ImageData[] {
  const seen = new Set<string>();
  const uniqueImages: ImageData[] = [];

  for (const img of images) {
    const imageId = img.base64.substring(0, 1000);
    if (!seen.has(imageId)) {
      seen.add(imageId);
      uniqueImages.push(img);
    }
  }

  return uniqueImages;
}

/**
 * Convertit base64 en Buffer
 */
function base64ToBuffer(base64: string): Buffer {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64Data, "base64");
}

/**
 * Génère un DOCX en utilisant le template original LOCAMEX comme base
 * Garantit une cohérence visuelle PARFAITE car on part du vrai template
 */
export async function generateDOCXV3Template(
  rapport: RapportAnalyse,
  images: ImageData[]
): Promise<Blob> {
  console.log("\n=== GÉNÉRATION DOCX V3 (TEMPLATE ORIGINAL) ===");
  console.log(`Client: ${rapport.client.nom || "Non spécifié"}`);
  console.log(`Date inspection: ${rapport.inspection.date}`);

  const uniqueImages = removeDuplicateImages(images);
  console.log(`Images uniques: ${uniqueImages.length}`);

  // Classification des images
  const manometreImages = uniqueImages.filter(img => {
    const desc = img.analysis?.description?.toLowerCase() || "";
    const type = img.analysis?.type?.toLowerCase() || "";
    return desc.includes("manomètre") || desc.includes("manometre") ||
           desc.includes("pression") || type.includes("manometre");
  });

  const usedImages = new Set(manometreImages);

  const piscineImages = uniqueImages.filter(img => {
    if (usedImages.has(img)) return false;
    const isPiscine = img.analysis?.type === "piscine" ||
                     img.analysis?.description?.toLowerCase().includes("bassin") ||
                     img.analysis?.description?.toLowerCase().includes("vue d'ensemble") ||
                     img.analysis?.displayPriority === 1;
    if (isPiscine) usedImages.add(img);
    return isPiscine;
  });

  const localTechniqueImages = uniqueImages.filter(img => {
    if (usedImages.has(img)) return false;
    const isLocal = (img.analysis?.type === "local_technique" ||
                    img.analysis?.description?.toLowerCase().includes("local technique")) &&
                   !img.analysis?.description?.toLowerCase().includes("manomètre");
    if (isLocal) usedImages.add(img);
    return isLocal;
  });

  const equipementImages = uniqueImages.filter(img => {
    if (usedImages.has(img)) return false;
    const isEquip = img.analysis?.type === "equipement" ||
                   img.analysis?.description?.toLowerCase().includes("skimmer") ||
                   img.analysis?.description?.toLowerCase().includes("bonde");
    if (isEquip) usedImages.add(img);
    return isEquip;
  });

  console.log(`Piscine: ${piscineImages.length}, Manomètre: ${manometreImages.length}, Local: ${localTechniqueImages.length}, Équipement: ${equipementImages.length}`);

  // Pour l'instant, on utilise le générateur V2 classique
  // TODO: Implémenter la vraie copie du template avec docxtemplater
  // Le template LOCAMEX devra être converti en template avec des placeholders {{...}}

  console.log("⚠️  V3 Template: En cours de développement");
  console.log("   Utilisation du générateur V2 en attendant");

  // Import dynamique pour éviter les erreurs circulaires
  const { generateDOCXV2 } = await import("./docx-generator-v2");
  return generateDOCXV2(rapport, images);
}

/**
 * NOTE IMPORTANTE POUR LE DÉVELOPPEMENT FUTUR:
 *
 * Pour implémenter la vraie copie du template:
 *
 * 1. Convertir Rapport_06-11-2025_Cholat.docx en template avec placeholders:
 *    - {{client.nom}} au lieu de "Cholat"
 *    - {{inspection.date}} au lieu de "06/11/2025"
 *    - {{#canalisations}} ... {{/canalisations}} pour les tableaux
 *    - etc.
 *
 * 2. Utiliser docxtemplater pour remplir le template:
 *    ```typescript
 *    const templatePath = path.join(process.cwd(), "public", "template-locamex.docx");
 *    const templateContent = fs.readFileSync(templatePath, "binary");
 *    const zip = new PizZip(templateContent);
 *
 *    const doc = new Docxtemplater(zip, {
 *      paragraphLoop: true,
 *      linebreaks: true,
 *    });
 *
 *    doc.render({
 *      client: rapport.client,
 *      inspection: rapport.inspection,
 *      canalisations: rapport.conformite.canalisations,
 *      // ... toutes les données
 *    });
 *
 *    const buf = doc.getZip().generate({ type: "nodebuffer" });
 *    return new Blob([buf]);
 *    ```
 *
 * 3. Avantages:
 *    - Cohérence visuelle PARFAITE (100% identique au template original)
 *    - Pas besoin de recréer les styles manuellement
 *    - Si le template change, il suffit de le remplacer
 *    - Polices, couleurs, espacements automatiquement respectés
 */
