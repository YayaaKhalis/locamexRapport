/**
 * Générateur DOCX V3 - IDENTIQUE AU PDF V3
 * Inclut : Hero page, Headers, Footers, Page de fin, Couleurs exactes
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ImageRun,
  VerticalAlign,
  PageBreak,
  Header,
  Footer,
  SectionType,
  IPropertiesOptions,
} from "docx";
import { RapportAnalyse, ImageData } from "@/types";
import fs from "fs";
import path from "path";

// COULEURS EXACTES DU PDF V3
const COLORS = {
  darkTeal: "5B949A",     // Bleu-vert foncé (#5B949A) - titres principaux
  lightBlue: "7CAEB8",    // Bleu pâle (#7CAEB8) - sous-titres
  lightGreen: "B6D1A3",   // Vert pâle (#B6D1A3) - sections, bilan
  white: "FFFFFF",
  black: "000000",
  darkGray: "333333",
  red: "DC3545",          // Rouge pour non-conforme
  green: "228B22",        // Vert pour conforme
  lightGrayBg: "F2F2F2",  // Gris clair backgrounds
};

// TAILLES DE POLICE (en half-points pour docx)
const FONT_SIZES = {
  title: 32,        // 16pt * 2
  heading1: 24,     // 12pt * 2
  heading2: 20,     // 10pt * 2
  normal: 22,       // 11pt * 2
  small: 20,        // 10pt * 2
};

// POLICES
const FONTS = {
  main: "Calibri",
  title: "Helvetica Neue",
  table: "Calibri",
};

/**
 * Vérifie si un statut est non-conforme
 */
function isNonConforme(statut: string): boolean {
  const s = statut.toLowerCase();
  return (
    s.includes("non conforme") ||
    s.includes("non-conforme") ||
    s.includes("défaut") ||
    s.includes("fuite")
  );
}

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
 * Crée un header avec image (hautdepage.png)
 */
function createHeader(): Header {
  const headerBuffer = loadImageAsBuffer("hautdepage.png");

  if (headerBuffer) {
    return new Header({
      children: [
        new Paragraph({
          children: [
            new ImageRun({
              data: headerBuffer,
              transformation: {
                width: 595, // A4 width in pixels (210mm * 2.834)
                height: 85,  // 30mm * 2.834
              },
            }),
          ],
          spacing: { after: 0, before: 0 },
        }),
      ],
    });
  }

  // Fallback si l'image n'est pas disponible
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: "LOCAMEX - Expert en recherche de fuites",
            font: FONTS.title,
            size: FONT_SIZES.small,
            color: COLORS.darkTeal,
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    ],
  });
}

/**
 * Crée un footer avec image (pieddepage.png)
 */
function createFooter(): Footer {
  const footerBuffer = loadImageAsBuffer("pieddepage.png");

  if (footerBuffer) {
    return new Footer({
      children: [
        new Paragraph({
          children: [
            new ImageRun({
              data: footerBuffer,
              transformation: {
                width: 595,  // A4 width
                height: 113, // 40mm * 2.834
              },
            }),
          ],
          spacing: { after: 0, before: 0 },
        }),
      ],
    });
  }

  // Fallback
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: "LOCAMEX - 1er Réseau d'experts en recherche de fuites piscine",
            font: FONTS.main,
            size: FONT_SIZES.small,
            color: COLORS.darkGray,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200 },
      }),
    ],
  });
}

/**
 * Crée un titre de section avec fond coloré
 */
function createSectionTitle(title: string, color: string = COLORS.lightGreen): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: title.toUpperCase(),
        font: FONTS.title,
        size: FONT_SIZES.heading1,
        bold: true,
        color: COLORS.white,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 400 },
    shading: {
      fill: color,
    },
  });
}

/**
 * Crée un sous-titre avec fond coloré
 */
function createSubtitle(subtitle: string, color: string = COLORS.lightBlue): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: subtitle,
        font: FONTS.title,
        size: FONT_SIZES.heading2,
        bold: true,
        color: COLORS.white,
      }),
    ],
    alignment: AlignmentType.LEFT,
    spacing: { before: 300, after: 200 },
    shading: {
      fill: color,
    },
  });
}

/**
 * Génère un document DOCX V3 identique au PDF V3
 */
export async function generateDOCXV3(
  rapport: RapportAnalyse,
  images: ImageData[]
): Promise<Blob> {
  console.log("\n=== GÉNÉRATION DOCX V3 (IDENTIQUE AU PDF V3) ===");
  console.log(`Client: ${rapport.client.nom || "Non spécifié"}`);
  console.log(`Date inspection: ${rapport.inspection.date}`);

  const uniqueImages = removeDuplicateImages(images);
  console.log(`Images uniques: ${uniqueImages.length}`);

  // Classification des images (identique au PDF)
  const manometreImages = uniqueImages.filter((img) => {
    const desc = img.analysis?.description?.toLowerCase() || "";
    const type = img.analysis?.type?.toLowerCase() || "";
    return (
      desc.includes("manomètre") ||
      desc.includes("manometre") ||
      desc.includes("pression") ||
      type.includes("manometre")
    );
  });

  const usedImages = new Set(manometreImages);

  const piscineImages = uniqueImages.filter((img) => {
    if (usedImages.has(img)) return false;
    const isPiscine =
      img.analysis?.type === "piscine" ||
      img.analysis?.description?.toLowerCase().includes("bassin") ||
      img.analysis?.description?.toLowerCase().includes("vue d'ensemble") ||
      img.analysis?.displayPriority === 1;
    if (isPiscine) usedImages.add(img);
    return isPiscine;
  });

  const localTechniqueImages = uniqueImages.filter((img) => {
    if (usedImages.has(img)) return false;
    const isLocal =
      (img.analysis?.type === "local_technique" ||
        img.analysis?.description?.toLowerCase().includes("local technique")) &&
      !img.analysis?.description?.toLowerCase().includes("manomètre");
    if (isLocal) usedImages.add(img);
    return isLocal;
  });

  const equipementImages = uniqueImages.filter((img) => {
    if (usedImages.has(img)) return false;
    const isEquip =
      img.analysis?.type === "equipement" ||
      img.analysis?.description?.toLowerCase().includes("skimmer") ||
      img.analysis?.description?.toLowerCase().includes("bonde");
    if (isEquip) usedImages.add(img);
    return isEquip;
  });

  console.log(`Classification: Piscine=${piscineImages.length}, Manomètre=${manometreImages.length}, Local=${localTechniqueImages.length}, Équip=${equipementImages.length}`);

  // ============================
  // SECTION 1: PAGE HERO (sans header/footer)
  // ============================
  const heroSection: any[] = [];

  const heroBuffer = loadImageAsBuffer("HeroSectionRapport.png");
  if (heroBuffer) {
    heroSection.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: heroBuffer,
            transformation: {
              width: 595,  // A4 width
              height: 842, // A4 height
            },
          }),
        ],
        spacing: { after: 0, before: 0 },
      })
    );

    // Texte superposé (simulé car on ne peut pas superposer en DOCX)
    // On ajoute le texte après l'image
    heroSection.push(
      new Paragraph({
        text: "",
        spacing: { before: -600, after: 0 }, // Essayer de remonter
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "Pour le compte de :",
            font: FONTS.main,
            size: FONT_SIZES.normal,
            color: COLORS.darkTeal,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: rapport.client.nom || "Client",
            font: FONTS.title,
            size: FONT_SIZES.title,
            color: COLORS.darkTeal,
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "Date d'inspection :",
            font: FONTS.main,
            size: FONT_SIZES.small,
            color: COLORS.darkTeal,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: rapport.inspection.date,
            font: FONTS.title,
            size: FONT_SIZES.normal,
            color: COLORS.darkTeal,
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );
  }

  heroSection.push(new Paragraph({ children: [new PageBreak()] }));

  // ============================
  // SECTION 2: PAGE 2 - Image piscine (sans header/footer)
  // ============================
  const page2Section: any[] = [];

  // Note: Les "3 blocs arrondis" du PDF ne sont pas facilement reproduisibles en DOCX
  // On va mettre l'image principale directement

  if (piscineImages.length > 0) {
    try {
      const buffer = base64ToBuffer(piscineImages[0].base64);
      page2Section.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: buffer,
              transformation: {
                width: 500,
                height: 350,
              },
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 400 },
        })
      );

      if (piscineImages[0].analysis?.description) {
        page2Section.push(
          new Paragraph({
            children: [
              new TextRun({
                text: piscineImages[0].analysis.description,
                font: FONTS.main,
                size: FONT_SIZES.normal,
                color: COLORS.darkGray,
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          })
        );
      }
    } catch (error) {
      console.error("Erreur image piscine:", error);
    }
  }

  page2Section.push(new Paragraph({ children: [new PageBreak()] }));

  // ============================
  // SECTIONS 3+: Contenu avec header/footer
  // ============================
  const contentSections: any[] = [];

  // --- INTERVENTION ---
  contentSections.push(
    createSectionTitle("INTERVENTION", COLORS.lightGreen)
  );

  const interventionRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Information",
                  font: FONTS.table,
                  size: FONT_SIZES.normal,
                  bold: true,
                  color: COLORS.white,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          shading: { fill: COLORS.darkTeal },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Détails",
                  font: FONTS.table,
                  size: FONT_SIZES.normal,
                  bold: true,
                  color: COLORS.white,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          shading: { fill: COLORS.darkTeal },
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Client", bold: true })],
          shading: { fill: COLORS.lightGrayBg },
        }),
        new TableCell({
          children: [new Paragraph(rapport.client.nom || "-")],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Adresse", bold: true })],
          shading: { fill: COLORS.lightGrayBg },
        }),
        new TableCell({
          children: [new Paragraph(rapport.client.adresse_complete || "-")],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Téléphone", bold: true })],
          shading: { fill: COLORS.lightGrayBg },
        }),
        new TableCell({
          children: [new Paragraph(rapport.client.telephone || "-")],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Email", bold: true })],
          shading: { fill: COLORS.lightGrayBg },
        }),
        new TableCell({
          children: [new Paragraph(rapport.client.email || "-")],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Date d'intervention", bold: true })],
          shading: { fill: COLORS.lightGrayBg },
        }),
        new TableCell({
          children: [new Paragraph(rapport.inspection.date)],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Technicien", bold: true })],
          shading: { fill: COLORS.lightGrayBg },
        }),
        new TableCell({
          children: [
            new Paragraph(rapport.inspection.technicien.nom_complet || "-"),
          ],
        }),
      ],
    }),
  ];

  contentSections.push(
    new Table({
      rows: interventionRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
    })
  );

  // Services effectués
  contentSections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Services effectués :",
          font: FONTS.title,
          size: FONT_SIZES.normal,
          color: COLORS.darkTeal,
          bold: true,
        }),
      ],
      spacing: { before: 300, after: 200 },
    })
  );

  if (
    rapport.inspection.services_effectues &&
    rapport.inspection.services_effectues.length > 0
  ) {
    rapport.inspection.services_effectues.forEach((service) => {
      contentSections.push(
        new Paragraph({
          text: `• ${service}`,
          spacing: { after: 100 },
        })
      );
    });
  } else if (rapport.inspection.description_services) {
    const services = rapport.inspection.description_services
      .split("|")
      .map((s) => s.trim());
    services.forEach((service) => {
      contentSections.push(
        new Paragraph({
          text: `• ${service}`,
          spacing: { after: 100 },
        })
      );
    });
  }

  contentSections.push(new Paragraph({ children: [new PageBreak()] }));

  // --- DESCRIPTIF TECHNIQUE ---
  contentSections.push(
    createSectionTitle("DESCRIPTIF TECHNIQUE", COLORS.lightGreen)
  );

  contentSections.push(
    createSubtitle("Description & État des lieux", COLORS.lightBlue)
  );

  const descriptionText = `Le revêtement est de type : ${rapport.piscine.revetement.type || "-"}.\n\nÂge : ${rapport.piscine.revetement.age || "-"}\n\n\nLa filtration est de type : ${rapport.piscine.filtration.type || "-"}`;
  const etatText = `Remplissage : ${rapport.piscine.etat_des_lieux.remplissage || "-"}\n\n\nÉtat de l'eau : ${rapport.piscine.etat_des_lieux.etat_eau || "-"}`;

  contentSections.push(
    new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  text: "DESCRIPTION",
                  bold: true,
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: { fill: COLORS.darkTeal },
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: "ÉTAT DES LIEUX",
                  bold: true,
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: { fill: COLORS.darkTeal },
              verticalAlign: VerticalAlign.CENTER,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(descriptionText)] }),
            new TableCell({ children: [new Paragraph(etatText)] }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
    })
  );

  // Équipements
  contentSections.push(createSubtitle("Équipements", COLORS.lightBlue));

  const equipRows: TableRow[] = [];
  const equipList = [
    { nom: "Skimmer", quantite: rapport.equipements.skimmer.quantite },
    { nom: "Prise balai", quantite: rapport.equipements.prise_balai.quantite },
    { nom: "Bonde de fond", quantite: rapport.equipements.bonde_fond.quantite },
    {
      nom: "Refoulement",
      quantite: rapport.equipements.refoulement.quantite,
    },
    {
      nom: "Bonde de bac volet",
      quantite: rapport.equipements.bonde_bac_volet.quantite,
    },
    { nom: "Spot", quantite: rapport.equipements.spot.quantite },
  ];

  equipList.forEach((equip) => {
    if (equip.quantite && equip.quantite > 0) {
      equipRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: equip.nom, bold: true })],
              shading: { fill: COLORS.lightGrayBg },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: equip.quantite.toString(),
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          ],
        })
      );
    }
  });

  contentSections.push(
    new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  text: "Équipement",
                  bold: true,
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: { fill: COLORS.darkTeal },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: "Quantité",
                  bold: true,
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: { fill: COLORS.darkTeal },
            }),
          ],
        }),
        ...equipRows,
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
    })
  );

  if (rapport.observations_techniques?.descriptif_technique) {
    contentSections.push(
      new Paragraph({
        text: rapport.observations_techniques.descriptif_technique,
        spacing: { before: 300, after: 300 },
      })
    );
  }

  contentSections.push(new Paragraph({ children: [new PageBreak()] }));

  // --- LOCAL TECHNIQUE ---
  contentSections.push(
    createSectionTitle("LOCAL TECHNIQUE", COLORS.lightGreen)
  );

  const localText =
    rapport.local_technique?.observations ||
    rapport.local_technique?.etat_general ||
    "Aucune fuite apparente";
  contentSections.push(
    new Paragraph({
      text: localText,
      spacing: { after: 400 },
    })
  );

  // Images local technique
  if (localTechniqueImages.length > 0) {
    localTechniqueImages.forEach((img) => {
      try {
        const buffer = base64ToBuffer(img.base64);
        contentSections.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: buffer,
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
        console.error("Erreur image local:", error);
      }
    });
  }

  contentSections.push(new Paragraph({ children: [new PageBreak()] }));

  // --- TESTS RÉALISÉS ---
  contentSections.push(
    createSectionTitle("TESTS RÉALISÉS", COLORS.lightGreen)
  );

  // Tests canalisations
  if (
    rapport.conformite.canalisations &&
    rapport.conformite.canalisations.length > 0
  ) {
    contentSections.push(
      createSubtitle("Tests de pression - Canalisations", COLORS.lightBlue)
    );

    const canalisationsRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                text: "Canalisation",
                bold: true,
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: { fill: COLORS.darkTeal },
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: "Conformité",
                bold: true,
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: { fill: COLORS.darkTeal },
          }),
        ],
      }),
    ];

    rapport.conformite.canalisations.forEach((item) => {
      const conformeColor = isNonConforme(item.statut)
        ? COLORS.red
        : COLORS.green;
      canalisationsRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(item.element)] }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: item.statut,
                      bold: true,
                      color: conformeColor,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          ],
        })
      );
    });

    contentSections.push(
      new Table({
        rows: canalisationsRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
          insideVertical: { style: BorderStyle.SINGLE, size: 1 },
        },
      })
    );
  }

  // Images manomètre
  if (manometreImages.length > 0) {
    contentSections.push(
      createSubtitle("Mise en pression des canalisations", COLORS.lightBlue)
    );

    manometreImages.forEach((img) => {
      try {
        const buffer = base64ToBuffer(img.base64);
        contentSections.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: buffer,
                transformation: {
                  width: 300,
                  height: 250,
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          })
        );
      } catch (error) {
        console.error("Erreur manomètre:", error);
      }
    });
  }

  // Tests pièces à sceller
  if (
    rapport.conformite.pieces_sceller &&
    rapport.conformite.pieces_sceller.length > 0
  ) {
    contentSections.push(
      createSubtitle("Tests d'étanchéité - Pièces à sceller", COLORS.lightBlue)
    );

    const piecesRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                text: "Pièce à sceller",
                bold: true,
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: { fill: COLORS.darkTeal },
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: "Conformité",
                bold: true,
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: { fill: COLORS.darkTeal },
          }),
        ],
      }),
    ];

    rapport.conformite.pieces_sceller.forEach((item) => {
      const conformeColor = isNonConforme(item.statut)
        ? COLORS.red
        : COLORS.green;
      piecesRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(item.element)] }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: item.statut,
                      bold: true,
                      color: conformeColor,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          ],
        })
      );
    });

    contentSections.push(
      new Table({
        rows: piecesRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
          insideVertical: { style: BorderStyle.SINGLE, size: 1 },
        },
      })
    );
  }

  // Images équipements
  if (equipementImages.length > 0) {
    equipementImages.forEach((img) => {
      try {
        const buffer = base64ToBuffer(img.base64);
        contentSections.push(
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
            spacing: { after: 300 },
          })
        );
      } catch (error) {
        console.error("Erreur équipement:", error);
      }
    });
  }

  // Test étanchéité revêtement
  if (rapport.conformite.etancheite?.revetement) {
    contentSections.push(
      createSubtitle("Test d'étanchéité du revêtement", COLORS.lightBlue)
    );

    const conformeColor = isNonConforme(
      rapport.conformite.etancheite.revetement
    )
      ? COLORS.red
      : COLORS.green;
    contentSections.push(
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    text: "Élément",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                shading: { fill: COLORS.darkTeal },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    text: "Conformité",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                shading: { fill: COLORS.darkTeal },
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph("Étanchéité du revêtement")],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text:
                          rapport.conformite.etancheite.revetement ||
                          "Conforme",
                        bold: true,
                        color: conformeColor,
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
              }),
            ],
          }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
          insideVertical: { style: BorderStyle.SINGLE, size: 1 },
        },
      })
    );
  }

  contentSections.push(new Paragraph({ children: [new PageBreak()] }));

  // --- BILAN ---
  contentSections.push(
    createSectionTitle("BILAN DE L'INSPECTION", COLORS.lightGreen)
  );

  if (rapport.bilan?.conclusion_generale) {
    const bilanText = rapport.bilan.conclusion_generale;
    const items: string[] = [];

    if (bilanText.includes("|")) {
      items.push(...bilanText.split("|").map((s) => s.trim()));
    } else {
      items.push(
        ...bilanText
          .split(/\.\s+/)
          .filter((s) => s.trim().length > 0)
          .map((s) => s.trim())
      );
    }

    items.forEach((item) => {
      const displayItem =
        item.endsWith(".") || item.endsWith("!") ? item : item + ".";
      contentSections.push(
        new Paragraph({
          text: `• ${displayItem}`,
          spacing: { after: 150 },
        })
      );
    });
  }

  contentSections.push(new Paragraph({ children: [new PageBreak()] }));

  // --- RESPONSABILITÉS ---
  contentSections.push(
    createSectionTitle("RESPONSABILITÉS", COLORS.darkTeal)
  );

  const responsabilites = `La mission ne porte pas sur l'étude ou le calcul des résistances des différents matériaux.

La responsabilité de LOCAMEX se limite à l'objet de la présente mission sous réserve des vices cachés.

Les mesures conservatoires mises en place ne sont pas garanties et sont uniquement destinées à vous donner le temps nécessaire pour procéder aux réparations. Aucune nouvelle intervention ne sera programmée avant la mise en œuvre de la réparation définitive. Par ailleurs, la pose de patchs n'est ni obligatoire ni garantie : leur efficacité peut varier et ils peuvent perdre leur efficacité après quelques jours ou semaines.

En ce qui concerne les piscines en béton, une réparation localisée ne permet pas de résoudre les problèmes de fuite liés au revêtement. Dans ces cas, une reprise complète de l'étanchéité du bassin est nécessaire.

Pour les localisations effectuées avec le gaz traceur, la précision peut être inférieure à celle obtenue par caméra, mais c'est le seul moyen de repérer une zone de fuite, avec une marge d'erreur d'environ 1 à 2 mètres.

Notre intervention a permis un diagnostic des réseaux jugé comme vrai uniquement au moment de nos tests. Si d'autres anomalies, sans rapport avec l'objet, ont été détectées et mises sur ce rapport, elles l'ont été au titre d'un devoir d'information.

La société procédant à la réparation des fuites sur canalisation devra effectuer un test après réparation sous sa responsabilité. Si une autre fuite subsistait, il s'agirait d'une nouvelle mission pour LOCAMEX.`;

  contentSections.push(
    new Paragraph({
      text: responsabilites,
      spacing: { after: 400 },
    })
  );

  // ============================
  // DERNIÈRE SECTION: Page de fin (sans header/footer)
  // ============================
  const finalSection: any[] = [];

  const finalBuffer = loadImageAsBuffer("pagedefin.png");
  if (finalBuffer) {
    finalSection.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: finalBuffer,
            transformation: {
              width: 595,
              height: 842,
            },
          }),
        ],
        spacing: { after: 0, before: 0 },
      })
    );
  }

  // ============================
  // ASSEMBLER LE DOCUMENT
  // ============================
  const doc = new Document({
    sections: [
      // Section 1: Hero (sans header/footer)
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            margin: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
        },
        children: heroSection,
      },
      // Section 2: Page 2 (sans header/footer)
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: page2Section,
      },
      // Section 3: Contenu principal (AVEC header/footer)
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        headers: {
          default: createHeader(),
        },
        footers: {
          default: createFooter(),
        },
        children: contentSections,
      },
      // Section 4: Page de fin (sans header/footer)
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            margin: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
        },
        children: finalSection,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  console.log("✅ Document DOCX V3 généré avec succès");
  console.log(`   Images utilisées: ${usedImages.size}`);
  console.log("=== FIN GÉNÉRATION DOCX V3 ===\n");

  return blob;
}
