/**
 * Générateur HTML LOCAMEX - Génère un HTML éditable depuis les données analysées
 * L'HTML peut ensuite être modifié avec un éditeur WYSIWYG puis converti en PDF
 *
 * VERSION COMPLÈTE avec tous les éléments de branding :
 * - Hero Section (HeroSectionRapport.png)
 * - 3 blocs arrondis
 * - Header/Footer images (hautdepage.png et pieddepage.png)
 * - Page de fin (pagedefin.png)
 */

import { RapportAnalyse, ImageData, StatutConformite } from "@/types";
import fs from "fs";
import path from "path";

// Couleurs LOCAMEX (identiques au PDF)
const COLORS = {
  darkTeal: "#5B949A",    // Bleu-vert foncé (titres principaux)
  lightBlue: "#7CAEB8",   // Bleu pâle (sous-titres)
  lightGreen: "#B6D1A3",  // Vert pâle (sections, bilan)
  white: "#FFFFFF",
  black: "#000000",
  darkGray: "#333333",
  lightGray: "#F5F5F5",
  red: "#DC3545",         // Rouge pour non-conforme
  green: "#228B22",       // Vert pour conforme
};

/**
 * Charge une image depuis le dossier public et la retourne en base64
 * (Fonction côté serveur - Node.js uniquement)
 */
function loadImageAsBase64(imageName: string): string | null {
  try {
    const imagePath = path.join(process.cwd(), "public", imageName);
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString("base64");
    const ext = path.extname(imageName).toLowerCase();
    const mimeType = ext === ".png" ? "image/png" : "image/jpeg";
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`❌ Impossible de charger l'image ${imageName}:`, error);
    return null;
  }
}

/**
 * Vérifie si un statut est non-conforme
 */
function isNonConforme(statut: string): boolean {
  const s = statut.toLowerCase();
  return s.includes("non conforme") || s.includes("non-conforme") || s.includes("défaut") || s.includes("fuite");
}

/**
 * Génère les styles CSS pour le document HTML
 */
function generateStyles(): string {
  return `
    <style>
      /* Reset et base */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Helvetica', 'Arial', sans-serif;
        font-size: 11pt;
        line-height: 1.6;
        color: ${COLORS.darkGray};
        background: white;
        max-width: 210mm;
        margin: 0 auto;
        padding: 20mm;
      }

      /* Titres de section */
      .section-title {
        background: ${COLORS.lightGreen};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 16pt;
        font-weight: bold;
        text-align: center;
        text-transform: uppercase;
        margin: 20px 0 15px 0;
      }

      .section-title.intervention { background: ${COLORS.lightGreen}; }
      .section-title.descriptif { background: ${COLORS.lightGreen}; }
      .section-title.local { background: ${COLORS.lightGreen}; }
      .section-title.tests { background: ${COLORS.lightGreen}; }
      .section-title.bilan { background: ${COLORS.lightGreen}; }
      .section-title.responsabilites { background: ${COLORS.darkTeal}; }

      /* Sous-titres */
      .subtitle {
        background: ${COLORS.lightBlue};
        color: white;
        padding: 8px 15px;
        border-radius: 5px;
        font-size: 12pt;
        font-weight: bold;
        margin: 15px 0 10px 0;
      }

      /* Tableaux */
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
        font-size: 11pt;
      }

      thead {
        background: ${COLORS.darkTeal};
        color: white;
        font-weight: bold;
      }

      th {
        padding: 10px;
        text-align: center;
        border: 1px solid #ddd;
      }

      td {
        padding: 10px;
        border: 1px solid #ddd;
      }

      tbody tr:nth-child(even) {
        background: ${COLORS.lightGray};
      }

      tbody tr:nth-child(odd) {
        background: white;
      }

      /* Statuts de conformité */
      .statut-conforme {
        color: ${COLORS.green};
        font-weight: bold;
        text-align: center;
      }

      .statut-non-conforme {
        color: ${COLORS.red};
        font-weight: bold;
        text-align: center;
      }

      /* Images */
      .image-container {
        margin: 20px auto;
        text-align: center;
      }

      .image-container img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      .image-caption {
        font-style: italic;
        color: ${COLORS.darkGray};
        font-size: 10pt;
        margin-top: 8px;
      }

      /* Conteneur d'images en grille (pour manomètres) */
      .image-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
        margin: 20px 0;
      }

      .image-grid .image-container {
        margin: 0;
      }

      .image-grid img {
        max-height: 300px;
        object-fit: contain;
      }

      /* Listes */
      ul {
        margin: 10px 0 10px 25px;
      }

      li {
        margin: 8px 0;
      }

      /* Paragraphes */
      p {
        margin: 10px 0;
      }

      /* Espacements */
      .spacer {
        height: 20px;
      }

      .spacer-large {
        height: 40px;
      }

      /* Pages avec branding */
      .page {
        position: relative;
        page-break-after: always;
        min-height: 297mm;
        background: white;
      }

      .page-cover {
        position: relative;
        width: 210mm;
        height: 297mm;
        overflow: hidden;
        page-break-after: always;
      }

      .page-cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cover-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        width: 100%;
        padding: 0 40px;
      }

      /* Page avec 3 blocs */
      .three-blocks-section {
        display: flex;
        justify-content: center;
        gap: 10mm;
        margin: 30mm 0 20mm 0;
        flex-wrap: wrap;
      }

      .block {
        width: 50mm;
        height: 45mm;
        border-radius: 5mm;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: white;
        font-weight: bold;
        font-size: 11pt;
        padding: 10mm;
        box-sizing: border-box;
      }

      .block-1 { background: ${COLORS.darkTeal}; }
      .block-2 { background: ${COLORS.lightBlue}; }
      .block-3 { background: ${COLORS.lightGreen}; }

      /* Header et Footer */
      .page-header {
        width: 100%;
        height: 30mm;
        margin-bottom: 10mm;
      }

      .page-header img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .page-footer {
        width: 100%;
        height: 40mm;
        margin-top: 10mm;
      }

      .page-footer img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .content-with-header-footer {
        min-height: calc(297mm - 30mm - 40mm - 20mm);
        padding: 0 20mm;
      }

      /* Impression */
      @media print {
        body {
          padding: 0;
          margin: 0;
        }

        .page {
          page-break-after: always;
        }

        .section-title, .subtitle {
          page-break-after: avoid;
        }

        table {
          page-break-inside: avoid;
        }

        .image-container {
          page-break-inside: avoid;
        }
      }

      /* Édition */
      [contenteditable="true"] {
        outline: 2px dashed transparent;
        transition: outline 0.2s;
      }

      [contenteditable="true"]:focus {
        outline: 2px dashed ${COLORS.lightBlue};
        outline-offset: 2px;
      }
    </style>
  `;
}

/**
 * Génère la section Intervention
 */
function generateInterventionSection(rapport: RapportAnalyse): string {
  return `
    <div class="section" id="section-intervention">
      <h1 class="section-title intervention">INTERVENTION</h1>

      <table>
        <thead>
          <tr>
            <th>Information</th>
            <th>Détails</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Client</strong></td>
            <td contenteditable="true">${rapport.client.nom || "-"}</td>
          </tr>
          <tr>
            <td><strong>Adresse</strong></td>
            <td contenteditable="true">${rapport.client.adresse_complete || "-"}</td>
          </tr>
          <tr>
            <td><strong>Téléphone</strong></td>
            <td contenteditable="true">${rapport.client.telephone || "-"}</td>
          </tr>
          <tr>
            <td><strong>Email</strong></td>
            <td contenteditable="true">${rapport.client.email || "-"}</td>
          </tr>
          <tr>
            <td><strong>Date d'intervention</strong></td>
            <td contenteditable="true">${rapport.inspection.date}</td>
          </tr>
          <tr>
            <td><strong>Technicien</strong></td>
            <td contenteditable="true">${rapport.inspection.technicien.nom_complet || "-"}</td>
          </tr>
        </tbody>
      </table>

      <h3 style="color: ${COLORS.darkTeal}; margin: 20px 0 10px 0; font-size: 12pt;">Services effectués :</h3>
      <ul contenteditable="true">
        ${generateServicesList(rapport)}
      </ul>
    </div>
  `;
}

/**
 * Génère la liste des services effectués
 */
function generateServicesList(rapport: RapportAnalyse): string {
  if (rapport.inspection.services_effectues && rapport.inspection.services_effectues.length > 0) {
    return rapport.inspection.services_effectues
      .map(service => `<li>${service}</li>`)
      .join("\n        ");
  } else if (rapport.inspection.description_services) {
    const services = rapport.inspection.description_services.split("|").map(s => s.trim());
    return services.map(service => `<li>${service}</li>`).join("\n        ");
  }
  return "<li>Aucun service spécifié</li>";
}

/**
 * Génère la section Descriptif Technique
 */
function generateDescriptifSection(rapport: RapportAnalyse): string {
  const descriptionText = `Le revêtement est de type : ${rapport.piscine.revetement.type || "-"}.\n\nÂge : ${rapport.piscine.revetement.age || "-"}\n\n\nLa filtration est de type : ${rapport.piscine.filtration.type || "-"}`;
  const etatText = `Remplissage : ${rapport.piscine.etat_des_lieux.remplissage || "-"}\n\n\nÉtat de l'eau : ${rapport.piscine.etat_des_lieux.etat_eau || "-"}`;

  return `
    <div class="section" id="section-descriptif">
      <h1 class="section-title descriptif">DESCRIPTIF TECHNIQUE</h1>

      <h2 class="subtitle">Description & État des lieux</h2>

      <table>
        <thead>
          <tr>
            <th>DESCRIPTION</th>
            <th>ÉTAT DES LIEUX</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td contenteditable="true" style="white-space: pre-wrap;">${descriptionText}</td>
            <td contenteditable="true" style="white-space: pre-wrap;">${etatText}</td>
          </tr>
        </tbody>
      </table>

      <h2 class="subtitle">Équipements</h2>

      <table>
        <thead>
          <tr>
            <th>Équipement</th>
            <th>Quantité</th>
          </tr>
        </thead>
        <tbody>
          ${generateEquipementsRows(rapport)}
        </tbody>
      </table>

      ${rapport.observations_techniques?.descriptif_technique ? `
        <div class="spacer"></div>
        <p contenteditable="true">${rapport.observations_techniques.descriptif_technique}</p>
      ` : ''}
    </div>
  `;
}

/**
 * Génère les lignes du tableau d'équipements
 */
function generateEquipementsRows(rapport: RapportAnalyse): string {
  const equipList = [
    { nom: "Skimmer", quantite: rapport.equipements.skimmer.quantite },
    { nom: "Prise balai", quantite: rapport.equipements.prise_balai.quantite },
    { nom: "Bonde de fond", quantite: rapport.equipements.bonde_fond.quantite },
    { nom: "Refoulement", quantite: rapport.equipements.refoulement.quantite },
    { nom: "Bonde de bac volet", quantite: rapport.equipements.bonde_bac_volet.quantite },
    { nom: "Spot", quantite: rapport.equipements.spot.quantite },
  ];

  return equipList
    .filter(equip => equip.quantite && equip.quantite > 0)
    .map(equip => `
      <tr>
        <td contenteditable="true">${equip.nom}</td>
        <td contenteditable="true" style="text-align: center;">${equip.quantite}</td>
      </tr>
    `)
    .join("\n    ");
}

/**
 * Génère la section Local Technique
 */
function generateLocalTechniqueSection(rapport: RapportAnalyse, images: ImageData[]): string {
  // Filtrer les images du local technique (SANS manomètres)
  const localImages = images.filter(img => {
    const type = img.analysis?.type?.toLowerCase() || "";
    const desc = img.analysis?.description?.toLowerCase() || "";

    const isLocal = (type === "local_technique" ||
                    desc.includes("local technique") ||
                    desc.includes("filtre") ||
                    desc.includes("pompe"));

    const isManometre = desc.includes("manomètre") ||
                       desc.includes("manometre") ||
                       desc.includes("pression");

    return isLocal && !isManometre;
  });

  return `
    <div class="section" id="section-local-technique">
      <h1 class="section-title local">LOCAL TECHNIQUE</h1>

      ${rapport.local_technique?.etat_general || rapport.local_technique?.observations ? `
        <p contenteditable="true">${rapport.local_technique.observations || rapport.local_technique.etat_general || "Aucune fuite apparente"}</p>
      ` : ''}

      ${localImages.length > 0 ? `
        <div class="spacer"></div>
        ${localImages.map((img, idx) => `
          <div class="image-container">
            <img src="data:${img.contentType || "image/png"};base64,${img.base64}" alt="Local technique ${idx + 1}" />
          </div>
        `).join('\n        ')}
      ` : ''}
    </div>
  `;
}

/**
 * Génère la section Tests Réalisés
 */
function generateTestsSection(rapport: RapportAnalyse, images: ImageData[]): string {
  const hasCanalisations = rapport.conformite.canalisations && rapport.conformite.canalisations.length > 0;
  const hasPiecesSceller = rapport.conformite.pieces_sceller && rapport.conformite.pieces_sceller.length > 0;
  const hasEtancheite = rapport.conformite.etancheite && rapport.conformite.etancheite.revetement;

  // Filtrer les images de manomètre
  const manometreImages = images.filter(img => {
    const desc = img.analysis?.description?.toLowerCase() || "";
    const type = img.analysis?.type?.toLowerCase() || "";
    return desc.includes("manomètre") || desc.includes("manometre") ||
           desc.includes("pression") || type.includes("manometre");
  });

  // Filtrer les images d'équipement
  const equipementImages = images.filter(img => {
    const type = img.analysis?.type?.toLowerCase() || "";
    const desc = img.analysis?.description?.toLowerCase() || "";
    return type === "equipement" ||
           desc.includes("skimmer") ||
           desc.includes("bonde") ||
           desc.includes("refoulement");
  });

  return `
    <div class="section" id="section-tests">
      <h1 class="section-title tests">TESTS RÉALISÉS</h1>

      ${hasCanalisations ? `
        <h2 class="subtitle">Tests de pression - Canalisations</h2>
        <table>
          <thead>
            <tr>
              <th>Canalisation</th>
              <th>Conformité</th>
            </tr>
          </thead>
          <tbody>
            ${rapport.conformite.canalisations.map(item => `
              <tr>
                <td contenteditable="true">${item.element}</td>
                <td contenteditable="true" class="${isNonConforme(item.statut) ? 'statut-non-conforme' : 'statut-conforme'}">
                  ${item.statut}
                </td>
              </tr>
            `).join('\n            ')}
          </tbody>
        </table>
      ` : ''}

      ${manometreImages.length > 0 ? `
        <h2 class="subtitle">Mise en pression des canalisations</h2>
        <div class="image-grid">
          ${manometreImages.map((img, idx) => `
            <div class="image-container">
              <img src="data:${img.contentType || "image/png"};base64,${img.base64}" alt="Manomètre ${idx + 1}" />
            </div>
          `).join('\n          ')}
        </div>
      ` : ''}

      ${hasPiecesSceller ? `
        <h2 class="subtitle">Tests d'étanchéité - Pièces à sceller</h2>
        <table>
          <thead>
            <tr>
              <th>Pièce à sceller</th>
              <th>Conformité</th>
            </tr>
          </thead>
          <tbody>
            ${rapport.conformite.pieces_sceller.map(item => `
              <tr>
                <td contenteditable="true">${item.element}</td>
                <td contenteditable="true" class="${isNonConforme(item.statut) ? 'statut-non-conforme' : 'statut-conforme'}">
                  ${item.statut}
                </td>
              </tr>
            `).join('\n            ')}
          </tbody>
        </table>
      ` : ''}

      ${equipementImages.length > 0 ? `
        <div class="spacer"></div>
        ${equipementImages.map((img, idx) => `
          <div class="image-container">
            <img src="data:${img.contentType || "image/png"};base64,${img.base64}" alt="Équipement ${idx + 1}" />
          </div>
        `).join('\n        ')}
      ` : ''}

      ${hasEtancheite ? `
        <h2 class="subtitle">Test d'étanchéité du revêtement</h2>
        <table>
          <thead>
            <tr>
              <th>Élément</th>
              <th>Conformité</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td contenteditable="true">Étanchéité du revêtement</td>
              <td contenteditable="true" class="${isNonConforme(rapport.conformite.etancheite.revetement || 'Conforme') ? 'statut-non-conforme' : 'statut-conforme'}">
                ${rapport.conformite.etancheite.revetement || "Conforme"}
              </td>
            </tr>
          </tbody>
        </table>
      ` : ''}
    </div>
  `;
}

/**
 * Génère la section Bilan
 */
function generateBilanSection(rapport: RapportAnalyse): string {
  let items: string[] = [];

  if (rapport.bilan && rapport.bilan.conclusion_generale && rapport.bilan.conclusion_generale.trim().length > 0) {
    const bilanText = rapport.bilan.conclusion_generale;

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
  }

  return `
    <div class="section" id="section-bilan">
      <h1 class="section-title bilan">BILAN DE L'INSPECTION</h1>

      <ul contenteditable="true">
        ${items.map(item => {
          const displayItem = item.endsWith('.') || item.endsWith('!') ? item : item + '.';
          return `<li>${displayItem}</li>`;
        }).join('\n        ')}
      </ul>
    </div>
  `;
}

/**
 * Génère la section Responsabilités
 */
function generateResponsabilitesSection(): string {
  const responsabilites = `La mission ne porte pas sur l'étude ou le calcul des résistances des différents matériaux.

La responsabilité de LOCAMEX se limite à l'objet de la présente mission sous réserve des vices cachés.

Les mesures conservatoires mises en place ne sont pas garanties et sont uniquement destinées à vous donner le temps nécessaire pour procéder aux réparations. Aucune nouvelle intervention ne sera programmée avant la mise en œuvre de la réparation définitive. Par ailleurs, la pose de patchs n'est ni obligatoire ni garantie : leur efficacité peut varier et ils peuvent perdre leur efficacité après quelques jours ou semaines.

En ce qui concerne les piscines en béton, une réparation localisée ne permet pas de résoudre les problèmes de fuite liés au revêtement. Dans ces cas, une reprise complète de l'étanchéité du bassin est nécessaire.

Pour les localisations effectuées avec le gaz traceur, la précision peut être inférieure à celle obtenue par caméra, mais c'est le seul moyen de repérer une zone de fuite, avec une marge d'erreur d'environ 1 à 2 mètres.

Notre intervention a permis un diagnostic des réseaux jugé comme vrai uniquement au moment de nos tests. Si d'autres anomalies, sans rapport avec l'objet, ont été détectées et mises sur ce rapport, elles l'ont été au titre d'un devoir d'information.

La société procédant à la réparation des fuites sur canalisation devra effectuer un test après réparation sous sa responsabilité. Si une autre fuite subsistait, il s'agirait d'une nouvelle mission pour LOCAMEX.`;

  return `
    <div class="section" id="section-responsabilites">
      <h1 class="section-title responsabilites">RESPONSABILITÉS</h1>

      <div contenteditable="true" style="white-space: pre-wrap; line-height: 1.8;">
        ${responsabilites}
      </div>
    </div>
  `;
}

/**
 * Génère la page de couverture avec l'image HeroSectionRapport.png
 */
function generateCoverPage(rapport: RapportAnalyse): string {
  const heroImage = loadImageAsBase64("HeroSectionRapport.png");

  if (!heroImage) {
    console.warn("⚠️  Image HeroSectionRapport.png non trouvée, utilisation du design CSS de secours");
    return `
      <div class="page" id="cover-page" style="text-align: center; padding: 100px 20px;">
        <h1 style="color: ${COLORS.darkTeal}; font-size: 32pt; margin-bottom: 30px;">
          RAPPORT D'INSPECTION
        </h1>
        <h2 style="color: ${COLORS.lightBlue}; font-size: 18pt; margin-bottom: 50px;">
          LOCAMEX - Expert en recherche de fuites
        </h2>
        <div style="margin: 50px 0;">
          <p style="font-size: 14pt; color: ${COLORS.darkGray}; margin: 15px 0;">
            <strong>Pour le compte de :</strong>
          </p>
          <p style="font-size: 22pt; color: ${COLORS.darkTeal}; font-weight: bold; margin: 15px 0;" contenteditable="true">
            ${rapport.client.nom || "Client"}
          </p>
        </div>
        <div style="margin: 50px 0;">
          <p style="font-size: 12pt; color: ${COLORS.darkGray}; margin: 15px 0;">
            <strong>Date d'inspection :</strong>
          </p>
          <p style="font-size: 14pt; color: ${COLORS.darkTeal}; font-weight: bold; margin: 15px 0;" contenteditable="true">
            ${rapport.inspection.date}
          </p>
        </div>
      </div>
    `;
  }

  return `
    <div class="page page-cover" id="cover-page">
      <img src="${heroImage}" alt="LOCAMEX Hero Section" />
      <div class="cover-overlay">
        <p style="font-size: 14pt; color: ${COLORS.darkTeal}; margin-bottom: 10px;">
          Pour le compte de :
        </p>
        <p style="font-size: 22pt; color: ${COLORS.darkTeal}; font-weight: bold; margin-bottom: 30px;" contenteditable="true">
          ${rapport.client.nom || "Client"}
        </p>
        <p style="font-size: 12pt; color: ${COLORS.darkTeal}; margin-bottom: 10px;">
          Date d'inspection :
        </p>
        <p style="font-size: 14pt; color: ${COLORS.darkTeal}; font-weight: bold;" contenteditable="true">
          ${rapport.inspection.date}
        </p>
      </div>
    </div>
  `;
}

/**
 * Génère la section avec les 3 blocs arrondis + image principale piscine
 */
function generateThreeBlocksSection(images: ImageData[]): string {
  // Trouver l'image principale de la piscine (displayPriority = 1)
  const piscineImage = images.find(img =>
    img.analysis?.type === "piscine" ||
    img.analysis?.displayPriority === 1 ||
    img.analysis?.description?.toLowerCase().includes("vue d'ensemble")
  );

  const piscineImageHTML = piscineImage ? `
    <div class="image-container" style="max-width: 180mm; margin: 20px auto;">
      <img src="data:${piscineImage.contentType || "image/png"};base64,${piscineImage.base64}"
           alt="Vue d'ensemble de la piscine"
           style="max-width: 100%; height: auto; border-radius: 8px;" />
      ${piscineImage.analysis?.description ? `
        <p class="image-caption">${piscineImage.analysis.description}</p>
      ` : ''}
    </div>
  ` : '';

  return `
    <div class="page" id="three-blocks-page">
      <div class="three-blocks-section">
        <div class="block block-1">
          <div>
            Les informations<br/>générales
          </div>
        </div>
        <div class="block block-2">
          <div>
            Plusieurs vues<br/>intégrées
          </div>
        </div>
        <div class="block block-3">
          <div>
            Un bilan général<br/>de l'inspection
          </div>
        </div>
      </div>

      ${piscineImageHTML}
    </div>
  `;
}

/**
 * Génère la page de fin avec l'image pagedefin.png
 */
function generateFinalPage(): string {
  const finalImage = loadImageAsBase64("pagedefin.png");

  if (!finalImage) {
    console.warn("⚠️  Image pagedefin.png non trouvée");
    return `
      <div class="page" id="final-page" style="text-align: center; padding: 100px 20px;">
        <h2 style="color: ${COLORS.darkTeal}; font-size: 24pt; margin-bottom: 30px;">
          Merci de votre confiance
        </h2>
        <p style="color: ${COLORS.darkGray}; font-size: 14pt;">
          LOCAMEX - 1er Réseau d'experts en recherche de fuites piscine
        </p>
      </div>
    `;
  }

  return `
    <div class="page page-cover" id="final-page">
      <img src="${finalImage}" alt="LOCAMEX - Page de fin" />
    </div>
  `;
}

/**
 * Enveloppe une section avec header et footer
 */
function wrapWithHeaderFooter(content: string, sectionId: string): string {
  const headerImage = loadImageAsBase64("hautdepage.png");
  const footerImage = loadImageAsBase64("pieddepage.png");

  const header = headerImage ? `
    <div class="page-header">
      <img src="${headerImage}" alt="LOCAMEX Header" />
    </div>
  ` : '';

  const footer = footerImage ? `
    <div class="page-footer">
      <img src="${footerImage}" alt="LOCAMEX Footer" />
    </div>
  ` : '';

  return `
    <div class="page" id="${sectionId}">
      ${header}
      <div class="content-with-header-footer">
        ${content}
      </div>
      ${footer}
    </div>
  `;
}

/**
 * Génère le HTML complet du rapport LOCAMEX
 */
export function generateReportHTML(
  rapport: RapportAnalyse,
  images: ImageData[]
): string {
  console.log("\n=== GÉNÉRATION HTML ÉDITABLE AVEC BRANDING COMPLET ===");
  console.log(`Client: ${rapport.client.nom || "Non spécifié"}`);
  console.log(`Date inspection: ${rapport.inspection.date}`);
  console.log(`Nombre d'images: ${images.length}`);
  console.log("\n📸 Chargement des images de branding...");
  console.log("   - HeroSectionRapport.png");
  console.log("   - hautdepage.png");
  console.log("   - pieddepage.png");
  console.log("   - pagedefin.png");

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport LOCAMEX - ${rapport.client.nom || "Client"} - ${rapport.inspection.date}</title>
  ${generateStyles()}
</head>
<body>
  ${generateCoverPage(rapport)}
  ${generateThreeBlocksSection(images)}
  ${wrapWithHeaderFooter(generateInterventionSection(rapport), "section-intervention")}
  ${wrapWithHeaderFooter(generateDescriptifSection(rapport), "section-descriptif")}
  ${wrapWithHeaderFooter(generateLocalTechniqueSection(rapport, images), "section-local-technique")}
  ${wrapWithHeaderFooter(generateTestsSection(rapport, images), "section-tests")}
  ${wrapWithHeaderFooter(generateBilanSection(rapport), "section-bilan")}
  ${wrapWithHeaderFooter(generateResponsabilitesSection(), "section-responsabilites")}
  ${generateFinalPage()}
</body>
</html>
  `;

  console.log("✅ HTML généré avec succès");
  console.log("   ✓ Page de couverture (HeroSectionRapport.png)");
  console.log("   ✓ Page 3 blocs + image piscine");
  console.log("   ✓ 6 sections de contenu avec header/footer");
  console.log("   ✓ Page de fin (pagedefin.png)");
  console.log("=== FIN GÉNÉRATION HTML COMPLÈTE ===\n");

  return html;
}
