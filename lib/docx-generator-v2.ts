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
 * Créer le header avec l'image complète hautdepage.png
 */
function createHeader(): Header {
  const headerImageBuffer = loadImageAsBuffer("hautdepage.png");

  if (headerImageBuffer) {
    return new Header({
      children: [
        new Paragraph({
          children: [
            new ImageRun({
              data: headerImageBuffer,
              transformation: {
                width: 595, // Largeur A4 en points (210mm)
                height: 85,  // Hauteur proportionnelle
              },
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 0 },
        }),
      ],
    });
  } else {
    // Fallback si l'image n'est pas disponible
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
          spacing: { after: 200 },
        }),
      ],
    });
  }
}

/**
 * Créer le footer avec l'image complète pieddepage.png
 */
function createFooter(): Footer {
  const footerImageBuffer = loadImageAsBuffer("pieddepage.png");

  if (footerImageBuffer) {
    return new Footer({
      children: [
        new Paragraph({
          children: [
            new ImageRun({
              data: footerImageBuffer,
              transformation: {
                width: 595, // Largeur A4 en points (210mm)
                height: 113, // Hauteur proportionnelle pour le footer
              },
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 0 },
        }),
      ],
    });
  } else {
    // Fallback si l'image n'est pas disponible
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
}

/**
 * Créer un titre de section avec fond coloré
 */
function createSectionTitle(text: string, color: string = COLORS.lightGreen): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        color: COLORS.white,
        size: 32,
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
  });
}

/**
 * Créer un sous-titre avec fond coloré
 */
function createSubtitle(text: string, color: string = COLORS.lightBlue): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        color: COLORS.white,
        size: 24,
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
 * Créer une cellule de tableau
 */
function createCell(
  text: string,
  isHeader: boolean = false,
  isConformite: boolean = false
): TableCell {
  const conformiteColor = isNonConforme(text) ? COLORS.red : COLORS.green;

  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: isHeader,
            color: isHeader ? COLORS.white : (isConformite ? conformiteColor : COLORS.darkGray),
            size: isHeader ? 20 : 22,
          }),
        ],
        alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
      }),
    ],
    shading: isHeader
      ? { fill: COLORS.darkTeal, type: ShadingType.SOLID }
      : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: {
      top: convertInchesToTwip(0.08),
      bottom: convertInchesToTwip(0.08),
      left: convertInchesToTwip(0.15),
      right: convertInchesToTwip(0.15),
    },
  });
}

/**
 * Génère un document DOCX professionnel LOCAMEX identique au PDF
 */
export async function generateDOCX(
  rapport: RapportAnalyse,
  images: ImageData[]
): Promise<Buffer> {
  console.log("\n=== GÉNÉRATION DOCX PROFESSIONNELLE V2 (identique au PDF) ===");
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
    const type = img.analysis?.type?.toLowerCase() || "";

    // EXCLURE si contient "local technique" dans description OU type
    if (desc.includes("local technique") || type === "local_technique") return false;
    // EXCLURE si c'est clairement du matériel de filtration
    if (desc.includes("filtre") || desc.includes("pompe") || desc.includes("local")) return false;

    const isPiscine =
      type === "piscine" ||
      desc.includes("bassin") ||
      desc.includes("piscine") ||
      (desc.includes("vue d'ensemble") && !desc.includes("local")) ||
      img.analysis?.displayPriority === 1;
    if (isPiscine) usedImages.add(img);
    return isPiscine;
  });

  const localTechniqueImages = uniqueImages.filter((img) => {
    if (usedImages.has(img)) return false;
    const desc = img.analysis?.description?.toLowerCase() || "";
    const type = img.analysis?.type?.toLowerCase() || "";

    // EXCLURE si c'est une image de manomètre (déjà traitée)
    if (desc.includes("manomètre") || desc.includes("pression")) return false;
    // EXCLURE si c'est une image de piscine/bassin
    if (type === "piscine" || desc.includes("bassin") || desc.includes("piscine")) return false;

    const isLocal =
      type === "local_technique" ||
      desc.includes("local technique") ||
      desc.includes("filtre") ||
      desc.includes("pompe");
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
  // PAGE 1: Hero Section avec image complète (comme le PDF)
  // ==========================================
  const heroImageBuffer = loadImageAsBuffer("HeroSectionRapport.png");

  if (heroImageBuffer) {
    // Image Hero pleine page
    docChildren.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: heroImageBuffer,
            transformation: {
              width: 595,  // Largeur A4
              height: 842, // Hauteur A4
            },
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
      }),
      // PAGE BREAK
      new Paragraph({ pageBreakBefore: true })
    );
    console.log("   ✓ Page Hero ajoutée avec HeroSectionRapport.png");
  } else {
    // Fallback: version texte si l'image n'est pas disponible
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
      new Paragraph({ pageBreakBefore: true })
    );
    console.log("   ⚠️  HeroSectionRapport.png non trouvée, version texte utilisée");
  }

  // ==========================================
  // PAGE 2: Titre + 3 blocs colorés + Image piscine (comme PDF)
  // ==========================================
  docChildren.push(
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
      spacing: { before: 200, after: 300 },
    }),

    // Les 3 blocs colorés (tableau pour les aligner horizontalement)
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
      spacing: { after: 300 },
    })
  );

  // Image principale de la piscine (plus grande, comme dans le PDF)
  if (piscineImages.length > 0 && piscineImages[0]) {
    try {
      docChildren.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: base64ToBuffer(piscineImages[0].base64),
              transformation: {
                width: 550,
                height: 380,
              },
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 150 },
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
        })
      );
    } catch (error) {
      console.error("Erreur image piscine:", error);
    }
  }

  // ==========================================
  // PAGE 3: INTERVENTION
  // ==========================================
  docChildren.push(
    new Paragraph({ pageBreakBefore: true }),
    createSectionTitle("INTERVENTION"),

    new Table({
      rows: [
        new TableRow({
          children: [
            createCell("Information", true),
            createCell("Détails", true),
          ],
        }),
        new TableRow({
          children: [
            createCell("Client"),
            createCell(rapport.client.nom || "-"),
          ],
        }),
        new TableRow({
          children: [
            createCell("Adresse"),
            createCell(rapport.client.adresse_complete || "-"),
          ],
        }),
        new TableRow({
          children: [
            createCell("Téléphone"),
            createCell(rapport.client.telephone || "-"),
          ],
        }),
        new TableRow({
          children: [
            createCell("Email"),
            createCell(rapport.client.email || "-"),
          ],
        }),
        new TableRow({
          children: [
            createCell("Date d'intervention"),
            createCell(rapport.inspection.date),
          ],
        }),
        new TableRow({
          children: [
            createCell("Technicien"),
            createCell(rapport.inspection.technicien.nom_complet || "-"),
          ],
        }),
      ],
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
    }),

    new Paragraph({ text: "", spacing: { after: 200 } }),

    new Paragraph({
      children: [
        new TextRun({
          text: "Services effectués :",
          bold: true,
          color: COLORS.darkTeal,
          size: 24,
        }),
      ],
      spacing: { after: 150 },
    })
  );

  // Services effectués
  if (rapport.inspection.services_effectues && rapport.inspection.services_effectues.length > 0) {
    rapport.inspection.services_effectues.forEach((service) => {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${service}`,
              size: 22,
              color: COLORS.darkGray,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    });
  }

  // ==========================================
  // PAGE 4: DESCRIPTIF TECHNIQUE
  // ==========================================
  docChildren.push(
    new Paragraph({ pageBreakBefore: true }),
    createSectionTitle("DESCRIPTIF TECHNIQUE"),

    createSubtitle("Description & État des lieux"),

    new Table({
      rows: [
        new TableRow({
          children: [
            createCell("DESCRIPTION", true),
            createCell("ÉTAT DES LIEUX", true),
          ],
        }),
        new TableRow({
          children: [
            createCell(`Le revêtement est de type : ${rapport.piscine?.revetement?.type || "-"}.\n\nÂge : ${rapport.piscine?.revetement?.age || "-"}\n\n\nLa filtration est de type : ${rapport.piscine?.filtration?.type || "-"}`),
            createCell(`Remplissage : ${rapport.piscine?.etat_des_lieux?.remplissage || "-"}\n\n\nÉtat de l'eau : ${rapport.piscine?.etat_des_lieux?.etat_eau || "-"}`),
          ],
        }),
      ],
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
    }),

    new Paragraph({ text: "", spacing: { after: 200 } }),

    createSubtitle("Équipements"),

    new Table({
      rows: [
        new TableRow({
          children: [
            createCell("Équipement", true),
            createCell("Quantité", true),
          ],
        }),
        ...(rapport.equipements.skimmer.quantite > 0
          ? [
              new TableRow({
                children: [
                  createCell("Skimmer"),
                  createCell(rapport.equipements.skimmer.quantite.toString()),
                ],
              }),
            ]
          : []),
        ...(rapport.equipements.prise_balai.quantite > 0
          ? [
              new TableRow({
                children: [
                  createCell("Prise balai"),
                  createCell(rapport.equipements.prise_balai.quantite.toString()),
                ],
              }),
            ]
          : []),
        ...(rapport.equipements.bonde_fond.quantite > 0
          ? [
              new TableRow({
                children: [
                  createCell("Bonde de fond"),
                  createCell(rapport.equipements.bonde_fond.quantite.toString()),
                ],
              }),
            ]
          : []),
        ...(rapport.equipements.refoulement.quantite > 0
          ? [
              new TableRow({
                children: [
                  createCell("Refoulement"),
                  createCell(rapport.equipements.refoulement.quantite.toString()),
                ],
              }),
            ]
          : []),
        ...(rapport.equipements.bonde_bac_volet.quantite > 0
          ? [
              new TableRow({
                children: [
                  createCell("Bonde de bac volet"),
                  createCell(rapport.equipements.bonde_bac_volet.quantite.toString()),
                ],
              }),
            ]
          : []),
        ...(rapport.equipements.spot.quantite > 0
          ? [
              new TableRow({
                children: [
                  createCell("Spot"),
                  createCell(rapport.equipements.spot.quantite.toString()),
                ],
              }),
            ]
          : []),
      ],
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
    })
  );

  // ==========================================
  // PAGE 5: LOCAL TECHNIQUE
  // ==========================================
  docChildren.push(
    new Paragraph({ pageBreakBefore: true }),
    createSectionTitle("LOCAL TECHNIQUE")
  );

  if (rapport.local_technique?.etat_general || rapport.local_technique?.observations) {
    const localText = rapport.local_technique.observations || rapport.local_technique.etat_general || "Aucune fuite apparente";
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: localText,
            size: 22,
            color: COLORS.darkGray,
          }),
        ],
        spacing: { after: 300 },
      })
    );
  }

  // Images du local technique (plus grandes, SANS légende, comme le PDF)
  if (localTechniqueImages.length > 0) {
    console.log(`Ajout de ${localTechniqueImages.length} image(s) du local technique`);

    localTechniqueImages.forEach((img, index) => {
      try {
        docChildren.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: base64ToBuffer(img.base64),
                transformation: {
                  width: 500,
                  height: 350,
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          })
        );
      } catch (error) {
        console.error(`Erreur image local ${index}:`, error);
      }
    });
  }

  // ==========================================
  // PAGE 6: TESTS RÉALISÉS
  // ==========================================
  docChildren.push(
    new Paragraph({ pageBreakBefore: true }),
    createSectionTitle("TESTS RÉALISÉS")
  );

  // Tests de pression - Canalisations
  if (rapport.conformite?.canalisations && rapport.conformite.canalisations.length > 0) {
    docChildren.push(
      createSubtitle("Tests de pression - Canalisations"),
      new Table({
        rows: [
          new TableRow({
            children: [
              createCell("Canalisation", true),
              createCell("Conformité", true),
            ],
          }),
          ...rapport.conformite.canalisations.map((item) =>
            new TableRow({
              children: [
                createCell(item.element),
                createCell(item.statut, false, true),
              ],
            })
          ),
        ],
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      }),
      new Paragraph({ text: "", spacing: { after: 200 } })
    );
  }

  // Images de manomètre (REGROUPÉES, SANS description, comme PDF)
  if (manometreImages.length > 0) {
    docChildren.push(
      createSubtitle("Mise en pression des canalisations")
    );

    console.log(`Ajout de ${manometreImages.length} image(s) de manomètre`);

    // Grouper 2 par 2
    for (let i = 0; i < manometreImages.length; i += 2) {
      const img1 = manometreImages[i];
      const img2 = manometreImages[i + 1];

      try {
        const rowChildren: any[] = [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: base64ToBuffer(img1.base64),
                    transformation: {
                      width: 250,
                      height: 200,
                    },
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            width: { size: 50, type: WidthType.PERCENTAGE },
          }),
        ];

        if (img2) {
          rowChildren.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: base64ToBuffer(img2.base64),
                      transformation: {
                        width: 250,
                        height: 200,
                      },
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              width: { size: 50, type: WidthType.PERCENTAGE },
            })
          );
        }

        docChildren.push(
          new Table({
            rows: [new TableRow({ children: rowChildren })],
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
          new Paragraph({ text: "", spacing: { after: 200 } })
        );
      } catch (error) {
        console.error(`Erreur images manomètre ${i}:`, error);
      }
    }
  }

  // Tests d'étanchéité - Pièces à sceller
  if (rapport.conformite?.pieces_sceller && rapport.conformite.pieces_sceller.length > 0) {
    docChildren.push(
      createSubtitle("Tests d'étanchéité - Pièces à sceller"),
      new Table({
        rows: [
          new TableRow({
            children: [
              createCell("Pièce à sceller", true),
              createCell("Conformité", true),
            ],
          }),
          ...rapport.conformite.pieces_sceller.map((item) =>
            new TableRow({
              children: [
                createCell(item.element),
                createCell(item.statut, false, true),
              ],
            })
          ),
        ],
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      }),
      new Paragraph({ text: "", spacing: { after: 200 } })
    );
  }

  // Images d'équipements (SANS légende, comme PDF)
  if (equipementImages.length > 0) {
    console.log(`Ajout de ${equipementImages.length} image(s) d'équipement`);

    equipementImages.forEach((img, index) => {
      try {
        docChildren.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: base64ToBuffer(img.base64),
                transformation: {
                  width: 450,
                  height: 300,
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          })
        );
      } catch (error) {
        console.error(`Erreur image équipement ${index}:`, error);
      }
    });
  }

  // Test d'étanchéité du revêtement
  if (rapport.conformite?.etancheite?.revetement) {
    docChildren.push(
      createSubtitle("Test d'étanchéité du revêtement"),
      new Table({
        rows: [
          new TableRow({
            children: [
              createCell("Élément", true),
              createCell("Conformité", true),
            ],
          }),
          new TableRow({
            children: [
              createCell("Étanchéité du revêtement"),
              createCell(rapport.conformite.etancheite.revetement, false, true),
            ],
          }),
        ],
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      })
    );
  }

  // ==========================================
  // PAGE 7: BILAN
  // ==========================================
  docChildren.push(
    new Paragraph({ pageBreakBefore: true }),
    createSectionTitle("BILAN DE L'INSPECTION")
  );

  if (rapport.bilan?.conclusion_generale && rapport.bilan.conclusion_generale.trim().length > 0) {
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

    items.forEach((item) => {
      const displayItem = item.endsWith('.') || item.endsWith('!') ? item : item + '.';
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${displayItem}`,
              size: 22,
              color: COLORS.darkGray,
            }),
          ],
          spacing: { after: 120 },
        })
      );
    });
  }

  // ==========================================
  // PAGE 8: RESPONSABILITÉS
  // ==========================================
  docChildren.push(
    new Paragraph({ pageBreakBefore: true }),
    createSectionTitle("RESPONSABILITÉS", COLORS.darkTeal),

    new Paragraph({
      children: [
        new TextRun({
          text: `La mission ne porte pas sur l'étude ou le calcul des résistances des différents matériaux.

La responsabilité de LOCAMEX se limite à l'objet de la présente mission sous réserve des vices cachés.

Les mesures conservatoires mises en place ne sont pas garanties et sont uniquement destinées à vous donner le temps nécessaire pour procéder aux réparations. Aucune nouvelle intervention ne sera programmée avant la mise en œuvre de la réparation définitive. Par ailleurs, la pose de patchs n'est ni obligatoire ni garantie : leur efficacité peut varier et ils peuvent perdre leur efficacité après quelques jours ou semaines.

En ce qui concerne les piscines en béton, une réparation localisée ne permet pas de résoudre les problèmes de fuite liés au revêtement. Dans ces cas, une reprise complète de l'étanchéité du bassin est nécessaire.

Pour les localisations effectuées avec le gaz traceur, la précision peut être inférieure à celle obtenue par caméra, mais c'est le seul moyen de repérer une zone de fuite, avec une marge d'erreur d'environ 1 à 2 mètres.

Notre intervention a permis un diagnostic des réseaux jugé comme vrai uniquement au moment de nos tests. Si d'autres anomalies, sans rapport avec l'objet, ont été détectées et mises sur ce rapport, elles l'ont été au titre d'un devoir d'information.

La société procédant à la réparation des fuites sur canalisation devra effectuer un test après réparation sous sa responsabilité. Si une autre fuite subsistait, il s'agirait d'une nouvelle mission pour LOCAMEX.`,
          size: 22,
          color: COLORS.darkGray,
        }),
      ],
      spacing: { after: 400 },
    })
  );

  // ==========================================
  // DERNIÈRE PAGE: Page de fin (comme le PDF)
  // ==========================================
  const endPageImageBuffer = loadImageAsBuffer("pagedefin.png");

  if (endPageImageBuffer) {
    docChildren.push(
      new Paragraph({ pageBreakBefore: true }),
      new Paragraph({
        children: [
          new ImageRun({
            data: endPageImageBuffer,
            transformation: {
              width: 595,  // Largeur A4
              height: 842, // Hauteur A4
            },
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
      })
    );
    console.log("   ✓ Page de fin ajoutée avec pagedefin.png");
  } else {
    console.log("   ⚠️  pagedefin.png non trouvée, page de fin non ajoutée");
  }

  // Créer le document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.79),
              right: convertInchesToTwip(0.79),
              bottom: convertInchesToTwip(0.79),
              left: convertInchesToTwip(0.79),
            },
          },
        },
        headers: {
          default: createHeader(),
        },
        footers: {
          default: createFooter(),
        },
        children: docChildren,
      },
    ],
  });

  console.log("✅ Document DOCX créé avec succès (identique au PDF)");

  // Convertir en buffer
  const buffer = await Packer.toBuffer(doc);
  console.log(`✅ Buffer DOCX généré: ${(buffer.length / 1024).toFixed(2)} KB`);

  return buffer;
}
