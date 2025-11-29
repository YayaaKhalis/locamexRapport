import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ImageRun, VerticalAlign, PageBreak } from "docx";
import { RapportAnalyse, ImageData } from "@/types";
import fs from "fs";
import path from "path";

// COULEURS EXACTES DU TEMPLATE LOCAMEX (extraites du XML)
const COLORS = {
  // Couleurs principales du template
  headerBlue: "4472C4",        // Bleu en-têtes de tableaux (extrait du template)
  lightBlueAccent: "5B9BD5",   // Bleu clair pour backgrounds
  lightGrayBg: "F2F2F2",       // Gris clair backgrounds (extrait)
  mediumGray: "D8D8D8",        // Gris moyen (extrait)
  darkGray: "605E5C",          // Gris texte (extrait)
  white: "FFFFFF",
  black: "000000",
  // Couleurs de statut
  red: "DC3545",                // Rouge pour non-conforme
  green: "228B22",              // Vert pour conforme
};

// TAILLES DE POLICE EXACTES DU TEMPLATE (en half-points, donc divisé par 2)
const FONT_SIZES = {
  title: 24,        // 48 / 2 = 24pt (titres principaux)
  heading1: 18,     // 36 / 2 = 18pt (sections)
  heading2: 12,     // 24 / 2 = 12pt (sous-sections)
  normal: 11,       // 22 / 2 = 11pt (texte normal)
  small: 10,        // 20 / 2 = 10pt (petit texte)
  tiny: 8,          // 16 / 2 = 8pt (très petit)
};

// POLICES EXACTES DU TEMPLATE
const FONTS = {
  main: "Calibri",              // Police principale (extraite)
  title: "Helvetica Neue",      // Titres (extraite)
  table: "Calibri",             // Tableaux (extraite)
};

/**
 * Vérifie si un statut est non-conforme
 */
function isNonConforme(statut: string): boolean {
  const s = statut.toLowerCase();
  return s.includes("non conforme") || s.includes("non-conforme") || s.includes("défaut") || s.includes("fuite");
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
 * Génère un document DOCX en utilisant la structure exacte du template LOCAMEX
 */
export async function generateDOCXV2(
  rapport: RapportAnalyse,
  images: ImageData[]
): Promise<Blob> {
  console.log("\n=== GÉNÉRATION DOCX V2 (TEMPLATE LOCAMEX) ===");
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

  // Document enfants
  const children: (Paragraph | Table)[] = [];

  // ============================
  // PAGE DE COUVERTURE (identique au template)
  // ============================

  // Essayer de charger le logo si disponible
  const logoBuffer = loadImageAsBuffer("logo-locamex-light.webp");

  if (logoBuffer) {
    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: {
              width: 200,
              height: 80,
            },
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 1000, after: 400 },
      })
    );
  }

  children.push(
    new Paragraph({
      text: "RAPPORT D'INSPECTION",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 2000, after: 600 },
    }),
    new Paragraph({
      text: "Pour le compte de :",
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: rapport.client.nom || "Client",
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
    new Paragraph({
      text: "Date d'inspection :",
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: rapport.inspection.date,
      alignment: AlignmentType.CENTER,
      bold: true,
      spacing: { after: 800 },
    }),
    new Paragraph({
      text: "Ce rapport comprend les données suivantes :",
      alignment: AlignmentType.CENTER,
      italics: true,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: "Les informations générales",
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: "Plusieurs vues intégrées",
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: "Un bilan général de l'inspection",
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Saut de page
  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ============================
  // IMAGE PISCINE
  // ============================
  if (piscineImages.length > 0) {
    try {
      const buffer = base64ToBuffer(piscineImages[0].base64);
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: buffer,
              transformation: {
                width: 600,
                height: 400,
              },
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 400 },
        })
      );
    } catch (error) {
      console.error("Erreur image piscine:", error);
    }
  }

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ============================
  // SECTION INTERVENTION
  // ============================
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "INTERVENTION",
          font: FONTS.title,
          size: FONT_SIZES.heading1 * 2, // docx utilise half-points
          bold: true,
          color: COLORS.white,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 400 },
      shading: {
        fill: COLORS.headerBlue,
      },
    })
  );

  // Tableau intervention
  const interventionRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Piscine de Mme/M",
                  font: FONTS.table,
                  size: FONT_SIZES.normal * 2,
                  bold: true,
                }),
              ],
            }),
          ],
          shading: { fill: COLORS.lightGrayBg },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: rapport.client.nom || "-",
                  font: FONTS.table,
                  size: FONT_SIZES.normal * 2,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Date de l'inspection", bold: true })],
          shading: { fill: COLORS.lightGray },
        }),
        new TableCell({
          children: [new Paragraph(rapport.inspection.date)],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Adresse de l'inspection", bold: true })],
          shading: { fill: COLORS.lightGray },
        }),
        new TableCell({
          children: [new Paragraph(rapport.client.adresse_complete || "-")],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Nom de l'intervenant", bold: true })],
          shading: { fill: COLORS.lightGray },
        }),
        new TableCell({
          children: [new Paragraph(rapport.inspection.technicien.nom_complet || "-")],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Recommandé par", bold: true })],
          shading: { fill: COLORS.lightGray },
        }),
        new TableCell({
          children: [new Paragraph("-")],
        }),
      ],
    }),
  ];

  // Description des services
  const servicesText = rapport.inspection.services_effectues?.join(" | ") ||
                      rapport.inspection.description_services ||
                      "Services d'inspection";

  interventionRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Description", bold: true })],
          shading: { fill: COLORS.lightGray },
        }),
        new TableCell({
          children: [new Paragraph(servicesText)],
        }),
      ],
    })
  );

  children.push(
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

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ============================
  // SECTION DESCRIPTIF TECHNIQUE
  // ============================
  children.push(
    new Paragraph({
      text: "DESCRIPTIF TECHNIQUE",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 400 },
      shading: {
        fill: COLORS.lightGreen,
        color: COLORS.white,
      },
    })
  );

  // Tableau Description & État des lieux
  const descriptionText = `Le revêtement est de type: ${rapport.piscine.revetement.type || "-"}. Age: ${rapport.piscine.revetement.age || "-"}\nLa filtration est de type:${rapport.piscine.filtration.type || "-"}`;
  const etatText = `Remplissage: ${rapport.piscine.etat_des_lieux.remplissage || "-"}\n\nÉtat de l'eau: ${rapport.piscine.etat_des_lieux.etat_eau || "-"}`;

  children.push(
    new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: "DESCRIPTION", bold: true, alignment: AlignmentType.CENTER })],
              shading: { fill: COLORS.darkTeal },
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ text: "ÉTAT DES LIEUX", bold: true, alignment: AlignmentType.CENTER })],
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

  children.push(
    new Paragraph({
      text: "ÉQUIPEMENTS",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );

  // Tableau équipements (format template)
  const equipList = [
    { nom: "Skimmer :", quantite: rapport.equipements.skimmer.quantite },
    { nom: "Prise balai :", quantite: rapport.equipements.prise_balai.quantite },
    { nom: "Prise robot :", quantite: 0 },
    { nom: "Bonde de fond :", quantite: rapport.equipements.bonde_fond.quantite },
    { nom: "Balnéo :", quantite: 0 },
    { nom: "Nage contre-courant :", quantite: 0 },
    { nom: "Refoulement :", quantite: rapport.equipements.refoulement.quantite },
    { nom: "Fontaine :", quantite: 0 },
    { nom: "Bonde de bac volet :", quantite: rapport.equipements.bonde_bac_volet.quantite },
    { nom: "Spot :", quantite: rapport.equipements.spot.quantite },
    { nom: "Mise à niveau automatique :", quantite: 0 },
    { nom: "Pompe à chaleur :", quantite: 0 },
  ];

  const equipRows: TableRow[] = [];
  for (let i = 0; i < equipList.length; i += 2) {
    const cells: TableCell[] = [];

    // Première colonne (équipement 1)
    cells.push(
      new TableCell({
        children: [new Paragraph({ text: equipList[i].nom, bold: true })],
        shading: { fill: COLORS.lightGray },
        width: { size: 40, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph(equipList[i].quantite > 0 ? equipList[i].quantite.toString() : "")],
        width: { size: 10, type: WidthType.PERCENTAGE },
      })
    );

    // Deuxième colonne (équipement 2)
    if (i + 1 < equipList.length) {
      cells.push(
        new TableCell({
          children: [new Paragraph({ text: equipList[i + 1].nom, bold: true })],
          shading: { fill: COLORS.lightGray },
          width: { size: 40, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph(equipList[i + 1].quantite > 0 ? equipList[i + 1].quantite.toString() : "")],
          width: { size: 10, type: WidthType.PERCENTAGE },
        })
      );
    }

    equipRows.push(new TableRow({ children: cells }));
  }

  children.push(
    new Table({
      rows: equipRows,
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

  // Observations techniques
  if (rapport.observations_techniques?.descriptif_technique) {
    children.push(
      new Paragraph({
        text: rapport.observations_techniques.descriptif_technique,
        spacing: { before: 300, after: 200 },
      })
    );
  }

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ============================
  // LOCAL TECHNIQUE
  // ============================
  children.push(
    new Paragraph({
      text: "LOCAL TECHNIQUE",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 400 },
      shading: {
        fill: COLORS.lightGreen,
        color: COLORS.white,
      },
    })
  );

  const localText = rapport.local_technique?.observations || rapport.local_technique?.etat_general || "Aucune fuite apparente";
  children.push(
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
        children.push(
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

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ============================
  // TESTS RÉALISÉS
  // ============================
  children.push(
    new Paragraph({
      text: "TESTS RÉALISÉS",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 400 },
      shading: {
        fill: COLORS.lightGreen,
        color: COLORS.white,
      },
    })
  );

  // TESTS CANALISATIONS
  if (rapport.conformite.canalisations && rapport.conformite.canalisations.length > 0) {
    children.push(
      new Paragraph({
        text: "TESTS CANALISATIONS :",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 200 },
      })
    );

    const canalisationsRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: "CANALISATIONS", bold: true, alignment: AlignmentType.CENTER })],
            shading: { fill: COLORS.darkTeal },
          }),
          new TableCell({
            children: [new Paragraph({ text: "CONFORMITE", bold: true, alignment: AlignmentType.CENTER })],
            shading: { fill: COLORS.darkTeal },
          }),
        ],
      }),
    ];

    rapport.conformite.canalisations.forEach((item) => {
      const conformeColor = isNonConforme(item.statut) ? COLORS.red : COLORS.green;
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

    children.push(
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

  // MISE EN PRESSION + Images manomètre
  if (manometreImages.length > 0) {
    children.push(
      new Paragraph({
        text: "MISE EN PRESSION DES CANALISATIONS :",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    manometreImages.forEach((img) => {
      try {
        const buffer = base64ToBuffer(img.base64);
        children.push(
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

  // TESTS PIÈCES À SCELLER
  if (rapport.conformite.pieces_sceller && rapport.conformite.pieces_sceller.length > 0) {
    children.push(
      new Paragraph({
        text: "TESTS PIECES A SCELLER :",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    const piecesRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: "PIECES A SCELLER", bold: true, alignment: AlignmentType.CENTER })],
            shading: { fill: COLORS.darkTeal },
          }),
          new TableCell({
            children: [new Paragraph({ text: "CONFORMITE", bold: true, alignment: AlignmentType.CENTER })],
            shading: { fill: COLORS.darkTeal },
          }),
        ],
      }),
    ];

    rapport.conformite.pieces_sceller.forEach((item) => {
      const conformeColor = isNonConforme(item.statut) ? COLORS.red : COLORS.green;
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

    children.push(
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
        children.push(
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

  // TESTS ÉTANCHÉITÉ REVÊTEMENT
  if (rapport.conformite.etancheite?.revetement) {
    children.push(
      new Paragraph({
        text: "TESTS ÉTANCHÉITÉ REVÊTEMENT :",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    const conformeColor = isNonConforme(rapport.conformite.etancheite.revetement) ? COLORS.red : COLORS.green;
    children.push(
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: "ÉLÉMENTS", bold: true, alignment: AlignmentType.CENTER })],
                shading: { fill: COLORS.darkTeal },
              }),
              new TableCell({
                children: [new Paragraph({ text: "CONFORMITÉ", bold: true, alignment: AlignmentType.CENTER })],
                shading: { fill: COLORS.darkTeal },
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Étanchéité du revêtement")] }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: rapport.conformite.etancheite.revetement,
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

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ============================
  // BILAN
  // ============================
  children.push(
    new Paragraph({
      text: "BILAN",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 400 },
      shading: {
        fill: COLORS.lightGreen,
        color: COLORS.white,
      },
    })
  );

  if (rapport.bilan?.conclusion_generale) {
    const bilanText = rapport.bilan.conclusion_generale;
    const items: string[] = [];

    if (bilanText.includes("|")) {
      items.push(...bilanText.split("|").map(s => s.trim()));
    } else {
      items.push(...bilanText.split(/\.\s+/).filter(s => s.trim().length > 0).map(s => s.trim()));
    }

    items.forEach((item) => {
      const displayItem = item.endsWith('.') || item.endsWith('!') ? item : item + '.';
      children.push(
        new Paragraph({
          text: displayItem,
          spacing: { after: 150 },
        })
      );
    });
  }

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ============================
  // RESPONSABILITÉS
  // ============================
  children.push(
    new Paragraph({
      text: "RESPONSABILITÉS",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 400 },
      shading: {
        fill: COLORS.darkTeal,
        color: COLORS.white,
      },
    })
  );

  const responsabilites = `La mission ne porte pas sur l'étude ou le calcul des résistances des différents matériaux.

La responsabilité de LOCAMEX se limite à l'objet de la présente mission sous réserve des vices cachés.

Les mesures conservatoires mises en place ne sont pas garanties et sont uniquement destinées à vous donner le temps nécessaire pour procéder aux réparations. Aucune nouvelle intervention ne sera programmée avant la mise en œuvre de la réparation définitive. Par ailleurs, la pose de patchs n'est ni obligatoire ni garantie : leur efficacité peut varier et ils peuvent perdre leur efficacité après quelques jours ou semaines.

En ce qui concerne les piscines en béton, une réparation localisée ne permet pas de résoudre les problèmes de fuite liés au revêtement. Dans ces cas, une reprise complète de l'étanchéité du bassin est nécessaire.

Pour les localisations effectuées avec le gaz traceur, la précision peut être inférieure à celle obtenue par caméra, mais c'est le seul moyen de repérer une zone de fuite, avec une marge d'erreur d'environ 1 à 2 mètres.

Notre intervention a permis un diagnostic des réseaux jugé comme vrai uniquement au moment de nos tests. Si d'autres anomalies, sans rapport avec l'objet, ont été détectées et mises sur ce rapport, elles l'ont été au titre d'un devoir d'information.

La société procédant à la réparation des fuites sur canalisation devra effectuer un test après réparation sous sa responsabilité. Si une autre fuite subsistait, il s'agirait d'une nouvelle mission pour LOCAMEX.`;

  children.push(
    new Paragraph({
      text: responsabilites,
      spacing: { after: 400 },
    })
  );

  // Créer le document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch = 1440 twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  console.log("✅ Document DOCX V2 généré avec succès");
  console.log(`   Images utilisées: ${usedImages.size}`);
  console.log("=== FIN GÉNÉRATION DOCX V2 ===\n");

  return blob;
}
