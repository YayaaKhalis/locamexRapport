/**
 * Générateur DOCX PARFAIT - Version finale basée sur la logique du PDF V3
 * Qualité PROFESSIONNELLE - Branding LOCAMEX 100% respecté
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ImageRun,
  VerticalAlign,
  PageBreak,
  ShadingType,
  Header,
  Footer,
  HeadingLevel,
} from "docx";
import { RapportAnalyse, ImageData } from "@/types";
import fs from "fs";
import path from "path";

// COULEURS LOCAMEX - Identiques au PDF V3
const COLORS = {
  darkTeal: "5B949A",     // Bleu-vert foncé (titres principaux)
  lightBlue: "7CAEB8",    // Bleu pâle (sous-titres)
  lightGreen: "B6D1A3",   // Vert pâle (sections, bilan)
  white: "FFFFFF",
  black: "000000",
  darkGray: "333333",
  lightGray: "F2F2F2",
  red: "DC3545",          // Rouge pour non-conforme
  green: "228B22",        // Vert pour conforme
};

// TAILLES DE POLICE (en half-points pour docx)
const FONT_SIZES = {
  title: 16 * 2,          // 32 half-points = 16pt
  sectionTitle: 14 * 2,   // 28 half-points = 14pt
  subtitle: 12 * 2,       // 24 half-points = 12pt
  normal: 11 * 2,         // 22 half-points = 11pt
  small: 10 * 2,          // 20 half-points = 10pt
  tiny: 9 * 2,            // 18 half-points = 9pt
};

// POLICES
const FONTS = {
  main: "Calibri",
  title: "Calibri",
  heading: "Calibri",
};

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
 * Charge une image depuis public/
 */
function loadImage(imageName: string): Buffer | null {
  try {
    const imagePath = path.join(process.cwd(), "public", imageName);
    return fs.readFileSync(imagePath);
  } catch (error) {
    console.error(`❌ Impossible de charger ${imageName}:`, error);
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
 * Crée un paragraphe de titre de section avec fond coloré
 */
function createSectionTitle(text: string, color: string = COLORS.lightGreen): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: text.toUpperCase(),
        font: FONTS.heading,
        size: FONT_SIZES.sectionTitle,
        bold: true,
        color: COLORS.white,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 300 },
    shading: {
      type: ShadingType.SOLID,
      fill: color,
    },
  });
}

/**
 * Crée un paragraphe de sous-titre avec fond coloré
 */
function createSubtitle(text: string, color: string = COLORS.lightBlue): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        font: FONTS.heading,
        size: FONT_SIZES.subtitle,
        bold: true,
        color: COLORS.white,
      }),
    ],
    spacing: { before: 300, after: 200 },
    shading: {
      type: ShadingType.SOLID,
      fill: color,
    },
  });
}

/**
 * Crée un paragraphe de texte normal
 */
function createTextParagraph(text: string, bold: boolean = false): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        font: FONTS.main,
        size: FONT_SIZES.normal,
        bold,
      }),
    ],
    spacing: { before: 100, after: 100 },
  });
}

/**
 * Génère un DOCX professionnel LOCAMEX
 * QUALITÉ IDENTIQUE AU PDF V3
 */
export async function generateDOCXPerfect(
  rapport: RapportAnalyse,
  images: ImageData[]
): Promise<Blob> {
  console.log("\n=== GÉNÉRATION DOCX PROFESSIONNELLE (VERSION PARFAITE) ===");
  console.log(`Client: ${rapport.client.nom || "Non spécifié"}`);
  console.log(`Date inspection: ${rapport.inspection.date}`);
  console.log(`Nombre d'images reçues: ${images.length}`);

  // Éliminer les doublons
  const uniqueImages = removeDuplicateImages(images);
  console.log(`Images uniques: ${uniqueImages.length}`);

  // Classification des images (comme dans PDF V3)
  console.log("\n🗂️  Classification des images...");

  // 1. Manomètres (priorité haute)
  const manometreImages = uniqueImages.filter(img => {
    const desc = img.analysis?.description?.toLowerCase() || "";
    const type = img.analysis?.type?.toLowerCase() || "";
    return desc.includes("manomètre") || desc.includes("manometre") ||
           desc.includes("pression") || type.includes("manometre");
  });

  const usedImages = new Set(manometreImages);

  // 2. Piscine (vue d'ensemble)
  const piscineImages = uniqueImages.filter(img => {
    if (usedImages.has(img)) return false;
    const isPiscine = img.analysis?.type === "piscine" ||
                     img.analysis?.description?.toLowerCase().includes("bassin") ||
                     img.analysis?.description?.toLowerCase().includes("vue d'ensemble") ||
                     img.analysis?.displayPriority === 1;
    if (isPiscine) usedImages.add(img);
    return isPiscine;
  });

  // 3. Local technique
  const localTechniqueImages = uniqueImages.filter(img => {
    if (usedImages.has(img)) return false;
    const isLocal = (img.analysis?.type === "local_technique" ||
                    img.analysis?.description?.toLowerCase().includes("local technique")) &&
                   !img.analysis?.description?.toLowerCase().includes("manomètre");
    if (isLocal) usedImages.add(img);
    return isLocal;
  });

  // 4. Équipements
  const equipementImages = uniqueImages.filter(img => {
    if (usedImages.has(img)) return false;
    const isEquip = img.analysis?.type === "equipement" ||
                   img.analysis?.description?.toLowerCase().includes("skimmer") ||
                   img.analysis?.description?.toLowerCase().includes("bonde");
    if (isEquip) usedImages.add(img);
    return isEquip;
  });

  console.log(`Piscine: ${piscineImages.length}, Manomètre: ${manometreImages.length}, Local: ${localTechniqueImages.length}, Équipement: ${equipementImages.length}`);

  // ============================================
  // CONSTRUCTION DU DOCUMENT
  // ============================================

  const sections = [];

  // ============================
  // PAGE DE COUVERTURE
  // ============================
  const coverPage = [];

  // Logo header
  const headerImage = loadImage("hautdepage.png");
  if (headerImage) {
    coverPage.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: headerImage,
            transformation: {
              width: 595,
              height: 113,
            },
          }),
        ],
        spacing: { after: 400 },
      })
    );
  }

  // Titre du rapport
  coverPage.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "RAPPORT D'INSPECTION",
          font: FONTS.title,
          size: FONT_SIZES.title,
          bold: true,
          color: COLORS.darkTeal,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 400 },
    })
  );

  // Client
  coverPage.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Pour le compte de : `,
          font: FONTS.main,
          size: FONT_SIZES.normal,
        }),
        new TextRun({
          text: rapport.client.nom || "Non spécifié",
          font: FONTS.main,
          size: FONT_SIZES.normal,
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
    })
  );

  // Date
  coverPage.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Date d'inspection : `,
          font: FONTS.main,
          size: FONT_SIZES.normal,
        }),
        new TextRun({
          text: rapport.inspection.date || "",
          font: FONTS.main,
          size: FONT_SIZES.normal,
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 600 },
    })
  );

  // Image piscine principale
  if (piscineImages.length > 0) {
    const piscineBuffer = base64ToBuffer(piscineImages[0].base64);
    coverPage.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: piscineBuffer,
            transformation: {
              width: 400,
              height: 300,
            },
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 400 },
      })
    );
  }

  // Footer
  const footerImage = loadImage("pieddepage.png");
  if (footerImage) {
    coverPage.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: footerImage,
            transformation: {
              width: 595,
              height: 150,
            },
          }),
        ],
        spacing: { before: 800 },
      })
    );
  }

  coverPage.push(new Paragraph({ children: [new PageBreak()] }));

  // ============================
  // SECTION INTERVENTION
  // ============================
  coverPage.push(createSectionTitle("INTERVENTION", COLORS.darkTeal));

  // Tableau intervention
  const interventionTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.darkGray },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.darkGray },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.darkGray },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.darkGray },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: COLORS.lightGray },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: COLORS.lightGray },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [createTextParagraph("Piscine de Mme/M", true)],
            shading: { fill: COLORS.lightGray },
            width: { size: 40, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [createTextParagraph(rapport.client.nom || "-")],
            width: { size: 60, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createTextParagraph("Date de l'inspection", true)],
            shading: { fill: COLORS.lightGray },
          }),
          new TableCell({
            children: [createTextParagraph(rapport.inspection.date || "-")],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createTextParagraph("Adresse", true)],
            shading: { fill: COLORS.lightGray },
          }),
          new TableCell({
            children: [createTextParagraph(rapport.client.adresse || "-")],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createTextParagraph("Intervenant", true)],
            shading: { fill: COLORS.lightGray },
          }),
          new TableCell({
            children: [createTextParagraph(rapport.inspection.intervenant || "LOCAMEX")],
          }),
        ],
      }),
    ],
  });

  coverPage.push(new Paragraph({ children: [] }));
  coverPage.push(interventionTable);
  coverPage.push(new Paragraph({ children: [], spacing: { after: 400 } }));

  // ============================
  // SECTION DESCRIPTIF TECHNIQUE
  // ============================
  coverPage.push(createSectionTitle("DESCRIPTIF TECHNIQUE", COLORS.darkTeal));

  // Description
  if (rapport.piscine?.description) {
    coverPage.push(createSubtitle("DESCRIPTION", COLORS.lightBlue));
    coverPage.push(createTextParagraph(rapport.piscine.description));
  }

  // État des lieux
  if (rapport.piscine?.etatLieux) {
    coverPage.push(createSubtitle("ÉTAT DES LIEUX", COLORS.lightBlue));
    coverPage.push(createTextParagraph(rapport.piscine.etatLieux));
  }

  // Équipements
  coverPage.push(createSubtitle("ÉQUIPEMENTS", COLORS.lightBlue));

  const equipementsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [createTextParagraph("Skimmers", true)],
            shading: { fill: COLORS.lightGray },
            width: { size: 50, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [createTextParagraph(String(rapport.piscine?.equipements?.skimmers || 0))],
            width: { size: 50, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createTextParagraph("Bondes de fond", true)],
            shading: { fill: COLORS.lightGray },
          }),
          new TableCell({
            children: [createTextParagraph(String(rapport.piscine?.equipements?.bondesDeFond || 0))],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createTextParagraph("Refoulements", true)],
            shading: { fill: COLORS.lightGray },
          }),
          new TableCell({
            children: [createTextParagraph(String(rapport.piscine?.equipements?.refoulements || 0))],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [createTextParagraph("Prises balai", true)],
            shading: { fill: COLORS.lightGray },
          }),
          new TableCell({
            children: [createTextParagraph(String(rapport.piscine?.equipements?.prisesBalai || 0))],
          }),
        ],
      }),
    ],
  });

  coverPage.push(new Paragraph({ children: [], spacing: { after: 200 } }));
  coverPage.push(equipementsTable);
  coverPage.push(new Paragraph({ children: [], spacing: { after: 400 } }));

  // ============================
  // SECTION LOCAL TECHNIQUE
  // ============================
  coverPage.push(createSectionTitle("LOCAL TECHNIQUE", COLORS.darkTeal));

  if (rapport.localTechnique?.description) {
    coverPage.push(createTextParagraph(rapport.localTechnique.description));
  }

  // Images local technique
  if (localTechniqueImages.length > 0) {
    localTechniqueImages.forEach((img, idx) => {
      const buffer = base64ToBuffer(img.base64);
      coverPage.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: buffer,
              transformation: {
                width: 400,
                height: 300,
              },
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
        })
      );
      if (img.analysis?.description) {
        coverPage.push(
          new Paragraph({
            children: [
              new TextRun({
                text: img.analysis.description,
                font: FONTS.main,
                size: FONT_SIZES.small,
                italics: true,
                color: COLORS.darkGray,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          })
        );
      }
    });
  }

  // ============================
  // SECTION TESTS RÉALISÉS
  // ============================
  coverPage.push(new Paragraph({ children: [new PageBreak()] }));
  coverPage.push(createSectionTitle("TESTS RÉALISÉS", COLORS.darkTeal));

  // Canalisations
  if (rapport.conformite?.canalisations && rapport.conformite.canalisations.length > 0) {
    coverPage.push(createSubtitle("CANALISATIONS", COLORS.lightBlue));

    const canalisationsRows = rapport.conformite.canalisations.map(
      (canalisation) =>
        new TableRow({
          children: [
            new TableCell({
              children: [createTextParagraph(canalisation.nom || "-")],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: canalisation.conforme ? "CONFORME" : "NON CONFORME",
                      font: FONTS.main,
                      size: FONT_SIZES.normal,
                      bold: true,
                      color: canalisation.conforme ? COLORS.green : COLORS.red,
                    }),
                  ],
                }),
              ],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        })
    );

    const canalisationsTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [createTextParagraph("CANALISATION", true)],
              shading: { fill: COLORS.darkTeal },
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [createTextParagraph("CONFORMITÉ", true)],
              shading: { fill: COLORS.darkTeal },
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        ...canalisationsRows,
      ],
    });

    coverPage.push(new Paragraph({ children: [], spacing: { after: 200 } }));
    coverPage.push(canalisationsTable);
    coverPage.push(new Paragraph({ children: [], spacing: { after: 400 } }));
  }

  // Images manomètres
  if (manometreImages.length > 0) {
    coverPage.push(createSubtitle("MANOMÈTRES", COLORS.lightBlue));
    manometreImages.forEach((img, idx) => {
      const buffer = base64ToBuffer(img.base64);
      coverPage.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: buffer,
              transformation: {
                width: 350,
                height: 250,
              },
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
        })
      );
      if (img.analysis?.description) {
        coverPage.push(
          new Paragraph({
            children: [
              new TextRun({
                text: img.analysis.description,
                font: FONTS.main,
                size: FONT_SIZES.small,
                italics: true,
                color: COLORS.darkGray,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          })
        );
      }
    });
  }

  // Pièces à sceller
  if (rapport.conformite?.piecesASceller && rapport.conformite.piecesASceller.length > 0) {
    coverPage.push(createSubtitle("PIÈCES À SCELLER", COLORS.lightBlue));

    const piecesRows = rapport.conformite.piecesASceller.map(
      (piece) =>
        new TableRow({
          children: [
            new TableCell({
              children: [createTextParagraph(piece.nom || "-")],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: piece.conforme ? "CONFORME" : "NON CONFORME",
                      font: FONTS.main,
                      size: FONT_SIZES.normal,
                      bold: true,
                      color: piece.conforme ? COLORS.green : COLORS.red,
                    }),
                  ],
                }),
              ],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        })
    );

    const piecesTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [createTextParagraph("PIÈCE", true)],
              shading: { fill: COLORS.darkTeal },
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [createTextParagraph("CONFORMITÉ", true)],
              shading: { fill: COLORS.darkTeal },
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        ...piecesRows,
      ],
    });

    coverPage.push(new Paragraph({ children: [], spacing: { after: 200 } }));
    coverPage.push(piecesTable);
    coverPage.push(new Paragraph({ children: [], spacing: { after: 400 } }));
  }

  // ============================
  // SECTION BILAN
  // ============================
  coverPage.push(new Paragraph({ children: [new PageBreak()] }));
  coverPage.push(createSectionTitle("BILAN", COLORS.lightGreen));

  if (rapport.conclusion) {
    coverPage.push(createTextParagraph(rapport.conclusion));
  }

  // ============================
  // MENTIONS LÉGALES
  // ============================
  if (rapport.mentionsLegales?.responsabilite) {
    coverPage.push(new Paragraph({ children: [], spacing: { before: 600 } }));
    coverPage.push(createSectionTitle("RESPONSABILITÉS", COLORS.darkGray));
    coverPage.push(
      new Paragraph({
        children: [
          new TextRun({
            text: rapport.mentionsLegales.responsabilite,
            font: FONTS.main,
            size: FONT_SIZES.tiny,
            color: COLORS.darkGray,
            italics: true,
          }),
        ],
        spacing: { before: 200 },
      })
    );
  }

  // ============================
  // CRÉATION DU DOCUMENT FINAL
  // ============================
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: coverPage,
      },
    ],
  });

  // Générer le blob
  return Packer.toBlob(doc);
}
