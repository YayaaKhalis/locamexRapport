import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableCell,
  TableRow,
  ImageRun,
  AlignmentType,
  VerticalAlign,
  WidthType,
  HeadingLevel,
  BorderStyle,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  PageBreak,
  convertInchesToTwip,
} from "docx";
import { RapportAnalyse, ImageData } from "@/types";
import fs from "fs";
import path from "path";

// Couleurs LOCAMEX (en hexadécimal)
const COLORS = {
  darkTeal: "5B949A",    // Bleu-vert foncé
  lightBlue: "7CAEB8",   // Bleu pâle
  lightGreen: "B6D1A3",  // Vert pâle
  white: "FFFFFF",
  black: "000000",
  darkGray: "333333",
  lightGray: "F5F5F5",
  mediumGray: "CCCCCC",
  red: "DC3545",
  green: "228B22",       // Vert pour conforme
};

/**
 * Charger une image depuis le dossier public et la convertir en Buffer
 */
function loadImageAsBuffer(imageName: string): Buffer | null {
  try {
    const imagePath = path.join(process.cwd(), "public", imageName);
    return fs.readFileSync(imagePath);
  } catch (error) {
    console.error(`Impossible de charger l'image ${imageName}:`, error);
    return null;
  }
}

/**
 * Convertir base64 en Buffer
 */
function base64ToBuffer(base64: string): Buffer {
  // Enlever le préfixe data:image/...;base64,
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64Data, "base64");
}

/**
 * Vérifie si un statut est non-conforme
 */
function isNonConforme(statut: string): boolean {
  const s = statut.toLowerCase();
  return s.includes("non conforme") || s.includes("non-conforme") || s.includes("défaut") || s.includes("fuite");
}

/**
 * Créer une cellule de tableau stylisée
 */
function createTableCell(
  text: string,
  options: {
    bold?: boolean;
    color?: string;
    shading?: string;
    align?: AlignmentType;
    verticalAlign?: VerticalAlign;
    fontSize?: number;
  } = {}
): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: options.bold || false,
            color: options.color || COLORS.darkGray,
            size: (options.fontSize || 11) * 2, // docx utilise des demi-points
          }),
        ],
        alignment: options.align || AlignmentType.LEFT,
      }),
    ],
    shading: options.shading
      ? {
          fill: options.shading,
          type: ShadingType.SOLID,
        }
      : undefined,
    verticalAlign: options.verticalAlign || VerticalAlign.CENTER,
    margins: {
      top: convertInchesToTwip(0.08),
      bottom: convertInchesToTwip(0.08),
      left: convertInchesToTwip(0.15),
      right: convertInchesToTwip(0.15),
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.mediumGray },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.mediumGray },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.mediumGray },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.mediumGray },
    },
  });
}

/**
 * Créer le header avec logo LOCAMEX
 */
function createHeader(): Header {
  const logoBuffer = loadImageAsBuffer("logo.png");

  return new Header({
    children: [
      new Paragraph({
        children: logoBuffer
          ? [
              new ImageRun({
                data: logoBuffer,
                transformation: {
                  width: 150,
                  height: 40,
                },
              }),
            ]
          : [
              new TextRun({
                text: "LOCAMEX",
                bold: true,
                size: 32,
                color: COLORS.darkTeal,
              }),
            ],
        alignment: AlignmentType.LEFT,
      }),
    ],
  });
}

/**
 * Créer le footer avec numérotation et info LOCAMEX
 */
function createFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: "LOCAMEX - 1er Réseau d'experts en recherche de fuites piscine | Page ",
            size: 18,
            color: COLORS.darkGray,
          }),
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 18,
            color: COLORS.darkGray,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: {
          before: 200,
        },
        border: {
          top: {
            color: COLORS.darkTeal,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      }),
    ],
  });
}

/**
 * Créer un titre de section avec fond coloré
 */
function createSectionTitle(
  text: string,
  color: string = COLORS.lightGreen
): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        color: COLORS.white,
        size: 32, // 16pt
      }),
    ],
    alignment: AlignmentType.CENTER,
    shading: {
      fill: color,
      type: ShadingType.SOLID,
    },
    spacing: {
      before: 200,
      after: 200,
    },
    border: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
  });
}

/**
 * Créer un sous-titre avec fond coloré
 */
function createSubtitle(
  text: string,
  color: string = COLORS.lightBlue
): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        color: COLORS.white,
        size: 24, // 12pt
      }),
    ],
    shading: {
      fill: color,
      type: ShadingType.SOLID,
    },
    spacing: {
      before: 150,
      after: 150,
    },
  });
}

/**
 * Génère un document DOCX professionnel LOCAMEX
 */
export async function generateDOCX(
  rapport: RapportAnalyse,
  images: ImageData[]
): Promise<Buffer> {
  console.log("\n=== GÉNÉRATION DOCX PROFESSIONNELLE V2 ===");
  console.log(`Client: ${rapport.client.nom || "Non spécifié"}`);
  console.log(`Date inspection: ${rapport.inspection.date}`);
  console.log(`Nombre d'images: ${images.length}`);

  // Filtrer les images inutiles (même logique que PDF)
  let uniqueImages = images.filter((img) => {
    const desc = img.analysis?.description?.toLowerCase() || "";
    const type = img.analysis?.type?.toLowerCase() || "";

    const isUseless =
      desc.includes("schéma") ||
      desc.includes("schema") ||
      desc.includes("diagramme") ||
      desc.includes("étapes du rapport") ||
      desc.includes("etapes du rapport") ||
      desc.includes("informations générales") ||
      desc.includes("informations generales") ||
      desc.includes("données suivantes") ||
      desc.includes("donnees suivantes") ||
      desc.includes("ce rapport comprend") ||
      (type === "couverture_rapport" && desc.includes("couverture")) ||
      (type === "autre" && (desc.includes("schéma") || desc.includes("étapes") || desc.includes("informations") || desc.includes("rapport")));

    return !isUseless;
  });

  console.log(`Images utiles: ${uniqueImages.length}`);

  // Classifier les images (même logique que PDF)
  const usedImages = new Set<ImageData>();

  const manometreImages = uniqueImages.filter(img => {
    const desc = img.analysis?.description?.toLowerCase() || "";
    const type = img.analysis?.type?.toLowerCase() || "";
    return desc.includes("manomètre") || desc.includes("manometre") ||
           desc.includes("pression") || type.includes("manometre") ||
           type.includes("pression");
  });
  manometreImages.forEach(img => usedImages.add(img));

  const piscineImages = uniqueImages.filter((img) => {
    if (usedImages.has(img)) return false;
    const desc = img.analysis?.description?.toLowerCase() || "";

    if (desc.includes("local technique")) return false;

    const isPiscine =
      img.analysis?.type === "piscine" ||
      desc.includes("bassin") ||
      (desc.includes("vue d'ensemble") && !desc.includes("local")) ||
      img.analysis?.displayPriority === 1;
    if (isPiscine) usedImages.add(img);
    return isPiscine;
  });

  const localTechniqueImages = uniqueImages.filter((img) => {
    if (usedImages.has(img)) return false;
    const desc = img.analysis?.description?.toLowerCase() || "";
    const isLocal =
      (img.analysis?.type === "local_technique" ||
        desc.includes("local technique") ||
        desc.includes("filtre") ||
        desc.includes("pompe")) &&
      !desc.includes("manomètre") &&
      !desc.includes("pression");
    if (isLocal) usedImages.add(img);
    return isLocal;
  });

  const equipementImages = uniqueImages.filter(img => {
    if (usedImages.has(img)) return false;
    const isEquip = img.analysis?.type === "equipement" ||
                   img.analysis?.description?.toLowerCase().includes("skimmer") ||
                   img.analysis?.description?.toLowerCase().includes("bonde") ||
                   img.analysis?.description?.toLowerCase().includes("refoulement");
    if (isEquip) usedImages.add(img);
    return isEquip;
  });

  console.log(`Classification: Piscine=${piscineImages.length}, Manomètre=${manometreImages.length}, Local=${localTechniqueImages.length}, Équipement=${equipementImages.length}`);

  // Préparer les éléments du document
  const docChildren: any[] = [];

  // ==========================================
  // PAGE 1: Page de couverture
  // ==========================================
  docChildren.push(
    new Paragraph({
      text: "",
      spacing: { before: convertInchesToTwip(1.5) },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "RAPPORT D'INSPECTION",
          size: 48,
          bold: true,
          color: COLORS.darkTeal,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "LOCAMEX",
          size: 36,
          bold: true,
          color: COLORS.lightBlue,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Expert en recherche de fuites piscine",
          size: 24,
          color: COLORS.darkGray,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: rapport.client.nom || "Client",
          size: 32,
          bold: true,
          color: COLORS.black,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Date d'inspection :",
          size: 24,
          color: COLORS.darkGray,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: rapport.inspection.date,
          size: 28,
          bold: true,
          color: COLORS.darkTeal,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),

          // PAGE BREAK
          new Paragraph({
            pageBreakBefore: true,
          }),

          // PAGE 2: Titre + 3 blocs + Image piscine
          new Paragraph({
            children: [
              new TextRun({
                text: "Ce rapport comprend les données suivantes :",
                size: 24,
                bold: true,
                color: COLORS.darkTeal,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // 3 BLOCS DE COULEUR (via tableau)
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Les informations\ngénérales",
                            bold: true,
                            color: COLORS.white,
                            size: 28,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    shading: {
                      fill: COLORS.darkTeal,
                      type: ShadingType.SOLID,
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    width: { size: 33, type: WidthType.PERCENTAGE },
                    margins: {
                      top: convertInchesToTwip(0.3),
                      bottom: convertInchesToTwip(0.3),
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Plusieurs vues\nintégrées",
                            bold: true,
                            color: COLORS.white,
                            size: 28,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    shading: {
                      fill: COLORS.lightBlue,
                      type: ShadingType.SOLID,
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    width: { size: 33, type: WidthType.PERCENTAGE },
                    margins: {
                      top: convertInchesToTwip(0.3),
                      bottom: convertInchesToTwip(0.3),
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Un bilan général\nde l'inspection",
                            bold: true,
                            color: COLORS.white,
                            size: 28,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    shading: {
                      fill: COLORS.lightGreen,
                      type: ShadingType.SOLID,
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    width: { size: 33, type: WidthType.PERCENTAGE },
                    margins: {
                      top: convertInchesToTwip(0.3),
                      bottom: convertInchesToTwip(0.3),
                    },
                  }),
                ],
              }),
            ],
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
          }),

          new Paragraph({
            text: "",
            spacing: { after: 400 },
          }),

          // IMAGE PRINCIPALE PISCINE
          ...(piscineImages.length > 0 && piscineImages[0]
            ? [
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: base64ToBuffer(piscineImages[0].base64),
                      transformation: {
                        width: 500,
                        height: 350,
                      },
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 200 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: piscineImages[0].analysis?.description || "Vue d'ensemble de la piscine",
                      size: 20,
                      italics: true,
                      color: COLORS.darkGray,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 400 },
                }),
              ]
            : []),

          // PAGE BREAK
          new Paragraph({
            pageBreakBefore: true,
          }),

          // INFORMATIONS GÉNÉRALES
          new Paragraph({
            children: [
              new TextRun({
                text: "INFORMATIONS GÉNÉRALES",
                size: 32,
                bold: true,
                color: COLORS.darkTeal,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),

          // Tableau informations client
          ...(rapport.client.nom
            ? [
                new Table({
                  rows: [
                    new TableRow({
                      children: [
                        createTableCell("Client", {
                          bold: true,
                          shading: COLORS.lightGray,
                        }),
                        createTableCell(rapport.client.nom || ""),
                      ],
                    }),
                    new TableRow({
                      children: [
                        createTableCell("Adresse", {
                          bold: true,
                          shading: COLORS.lightGray,
                        }),
                        createTableCell(rapport.client.adresse || "Non spécifié"),
                      ],
                    }),
                    new TableRow({
                      children: [
                        createTableCell("Date d'inspection", {
                          bold: true,
                          shading: COLORS.lightGray,
                        }),
                        createTableCell(rapport.inspection.date),
                      ],
                    }),
                  ],
                  width: {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                  },
                }),
                new Paragraph({
                  text: "",
                  spacing: { after: 400 },
                }),
              ]
            : []),

          // DESCRIPTION TECHNIQUE
          new Paragraph({
            children: [
              new TextRun({
                text: "DESCRIPTION TECHNIQUE",
                size: 32,
                bold: true,
                color: COLORS.darkTeal,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),

          ...(rapport.piscine?.description
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: rapport.piscine.description,
                      size: 22,
                    }),
                  ],
                  spacing: { after: 300 },
                }),
              ]
            : []),

          // IMAGE LOCAL TECHNIQUE
          ...(localTechniqueImages.length > 0 && localTechniqueImages[0]
            ? [
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: base64ToBuffer(localTechniqueImages[0].base64),
                      transformation: {
                        width: 400,
                        height: 300,
                      },
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 400 },
                }),
              ]
            : []),

          // TABLEAUX DE CONFORMITÉ
          new Paragraph({
            pageBreakBefore: true,
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "RÉSULTATS DES TESTS",
                size: 32,
                bold: true,
                color: COLORS.darkTeal,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),

          // Tableau équipements
          ...(rapport.equipements && rapport.equipements.length > 0
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Équipements",
                      size: 24,
                      bold: true,
                      color: COLORS.lightBlue,
                    }),
                  ],
                  spacing: { after: 200 },
                }),
                new Table({
                  rows: [
                    new TableRow({
                      children: [
                        createTableCell("Type", {
                          bold: true,
                          shading: COLORS.darkTeal,
                          color: COLORS.white,
                        }),
                        createTableCell("Quantité", {
                          bold: true,
                          shading: COLORS.darkTeal,
                          color: COLORS.white,
                          align: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    ...rapport.equipements.map(
                      (eq) =>
                        new TableRow({
                          children: [
                            createTableCell(eq.type || ""),
                            createTableCell(eq.quantite?.toString() || "0", {
                              align: AlignmentType.CENTER,
                            }),
                          ],
                        })
                    ),
                  ],
                  width: {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                  },
                }),
                new Paragraph({
                  text: "",
                  spacing: { after: 400 },
                }),
              ]
            : []),

          // CONCLUSION
          new Paragraph({
            pageBreakBefore: true,
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "CONCLUSION",
                size: 32,
                bold: true,
                color: COLORS.darkTeal,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: rapport.conclusion?.bilan_general || "Rapport d'inspection terminé.",
                size: 22,
              }),
            ],
            spacing: { after: 300 },
            border: {
              top: { style: BorderStyle.SINGLE, color: COLORS.lightGreen, size: 6 },
              bottom: { style: BorderStyle.SINGLE, color: COLORS.lightGreen, size: 6 },
              left: { style: BorderStyle.SINGLE, color: COLORS.lightGreen, size: 6 },
              right: { style: BorderStyle.SINGLE, color: COLORS.lightGreen, size: 6 },
            },
            shading: {
              fill: "F0F8F0",
              type: ShadingType.SOLID,
            },
          }),

          // Footer final
          new Paragraph({
            text: "",
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Document généré automatiquement par LOCAMEX",
                size: 18,
                color: COLORS.darkGray,
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  console.log("✅ Document DOCX créé avec succès");

  // Convertir en buffer
  const buffer = await Packer.toBuffer(doc);
  console.log(`✅ Buffer DOCX généré: ${(buffer.length / 1024).toFixed(2)} KB`);

  return buffer;
}
