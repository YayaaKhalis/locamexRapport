import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ImageRun, VerticalAlign } from "docx";
import { RapportAnalyse, ImageData } from "@/types";

// Couleurs LOCAMEX
const COLORS = {
  darkTeal: "5B949A",    // Bleu-vert foncé
  lightBlue: "7CAEB8",   // Bleu pâle
  lightGreen: "B6D1A3",  // Vert pâle
  white: "FFFFFF",
  darkGray: "333333",
  red: "DC3545",
  green: "228B22",
};

/**
 * Vérifie si un statut est non-conforme
 */
function isNonConforme(statut: string): boolean {
  const s = statut.toLowerCase();
  return s.includes("non conforme") || s.includes("non-conforme") || s.includes("défaut") || s.includes("fuite");
}

/**
 * Élimine les doublons d'images basés sur le contenu base64
 */
function removeDuplicateImages(images: ImageData[]): ImageData[] {
  const seen = new Set<string>();
  const uniqueImages: ImageData[] = [];

  for (const img of images) {
    const imageId = img.base64.substring(0, 1000);
    if (!seen.has(imageId)) {
      seen.add(imageId);
      uniqueImages.push(img);
    } else {
      console.log(`   ⚠️  Image dupliquée ignorée (DOCX)`);
    }
  }

  console.log(`   ✓ ${images.length - uniqueImages.length} doublons éliminés (DOCX)`);
  return uniqueImages;
}

/**
 * Convertit base64 en Buffer pour DOCX
 */
function base64ToBuffer(base64: string): Buffer {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64Data, "base64");
}

/**
 * Génère un document DOCX professionnel à partir des données analysées
 * STRUCTURE IDENTIQUE AU PDF
 */
export async function generateDOCX(
  rapport: RapportAnalyse,
  images: ImageData[]
): Promise<Blob> {
  console.log("\n=== GÉNÉRATION DOCX PROFESSIONNELLE ===");
  console.log(`Client: ${rapport.client.nom || "Non spécifié"}`);
  console.log(`Date inspection: ${rapport.inspection.date}`);
  console.log(`Nombre d'images reçues: ${images.length}`);

  // Éliminer les doublons
  const uniqueImages = removeDuplicateImages(images);
  console.log(`Images uniques: ${uniqueImages.length}`);

  // Classification des images (identique au PDF)
  const manometreImages = uniqueImages.filter(img => {
    const desc = img.analysis?.description?.toLowerCase() || "";
    const type = img.analysis?.type?.toLowerCase() || "";
    return desc.includes("manomètre") || desc.includes("manometre") ||
           desc.includes("pression") || type.includes("manometre") ||
           type.includes("pression");
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
                    img.analysis?.description?.toLowerCase().includes("local technique") ||
                    img.analysis?.description?.toLowerCase().includes("filtre") ||
                    img.analysis?.description?.toLowerCase().includes("pompe")) &&
                   !img.analysis?.description?.toLowerCase().includes("manomètre") &&
                   !img.analysis?.description?.toLowerCase().includes("pression");
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

  console.log("\n=== CLASSIFICATION DES IMAGES (DOCX) ===");
  console.log(`Piscine: ${piscineImages.length}`);
  console.log(`Manomètre: ${manometreImages.length}`);
  console.log(`Local technique: ${localTechniqueImages.length}`);
  console.log(`Équipement: ${equipementImages.length}`);

  // Préparer les sections du document
  const children: (Paragraph | Table)[] = [];

  // ============================
  // PAGE 1 - HERO SECTION
  // ============================
  children.push(
    new Paragraph({
      text: "",
      pageBreakBefore: false,
      spacing: { before: 4000 },
    }),
    new Paragraph({
      text: "RAPPORT D'INSPECTION",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
      shading: {
        fill: COLORS.darkTeal,
        color: COLORS.white,
      },
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
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: "Date d'inspection :",
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: rapport.inspection.date,
      alignment: AlignmentType.CENTER,
      bold: true,
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: "",
      pageBreakBefore: true,
    })
  );

  // ============================
  // PAGE 2 - IMAGE PISCINE
  // ============================
  if (piscineImages.length > 0) {
    const piscineImage = piscineImages[0];
    try {
      const buffer = base64ToBuffer(piscineImage.base64);
      children.push(
        new Paragraph({
          text: "VUE D'ENSEMBLE DE LA PISCINE",
          heading: HeadingLevel.HEADING_3,
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 200 },
          shading: {
            fill: COLORS.lightGreen,
            color: COLORS.white,
          },
        }),
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
          spacing: { after: 200 },
        })
      );
      if (piscineImage.analysis?.description) {
        children.push(
          new Paragraph({
            text: piscineImage.analysis.description,
            italics: true,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          })
        );
      }
      console.log(`   ✓ Image piscine principale ajoutée (DOCX)`);
    } catch (error) {
      console.error("Erreur image piscine:", error);
    }
  }

  children.push(
    new Paragraph({
      text: "",
      pageBreakBefore: true,
    })
  );

  // ============================
  // SECTION INTERVENTION
  // ============================
  children.push(
    new Paragraph({
      text: "INTERVENTION",
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
      shading: {
        fill: COLORS.lightGreen,
        color: COLORS.white,
      },
    })
  );

  // Tableau informations client
  const interventionRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Information", bold: true })],
          shading: { fill: COLORS.darkTeal },
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: "Détails", bold: true })],
          shading: { fill: COLORS.darkTeal },
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Client")] }),
        new TableCell({ children: [new Paragraph(rapport.client.nom || "-")] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Adresse")] }),
        new TableCell({ children: [new Paragraph(rapport.client.adresse_complete || "-")] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Téléphone")] }),
        new TableCell({ children: [new Paragraph(rapport.client.telephone || "-")] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Email")] }),
        new TableCell({ children: [new Paragraph(rapport.client.email || "-")] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Date d'intervention")] }),
        new TableCell({ children: [new Paragraph(rapport.inspection.date)] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Technicien")] }),
        new TableCell({ children: [new Paragraph(rapport.inspection.technicien.nom_complet || "-")] }),
      ],
    }),
  ];

  children.push(
    new Table({
      rows: interventionRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  );

  // Services effectués
  children.push(
    new Paragraph({
      text: "Services effectués :",
      bold: true,
      spacing: { before: 300, after: 100 },
    })
  );

  if (rapport.inspection.services_effectues && rapport.inspection.services_effectues.length > 0) {
    rapport.inspection.services_effectues.forEach((service) => {
      children.push(
        new Paragraph({
          text: `• ${service}`,
          spacing: { after: 100 },
        })
      );
    });
  } else if (rapport.inspection.description_services) {
    const services = rapport.inspection.description_services.split("|").map(s => s.trim());
    services.forEach((service) => {
      children.push(
        new Paragraph({
          text: `• ${service}`,
          spacing: { after: 100 },
        })
      );
    });
  }

  children.push(
    new Paragraph({
      text: "",
      pageBreakBefore: true,
    })
  );

  // ============================
  // SECTION DESCRIPTIF TECHNIQUE
  // ============================
  children.push(
    new Paragraph({
      text: "DESCRIPTIF TECHNIQUE",
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
      shading: {
        fill: COLORS.lightGreen,
        color: COLORS.white,
      },
    })
  );

  // Tableau Description & État des lieux
  const descriptionText = `Le revêtement est de type : ${rapport.piscine.revetement.type || "-"}.\n\nÂge : ${rapport.piscine.revetement.age || "-"}\n\n\nLa filtration est de type : ${rapport.piscine.filtration.type || "-"}`;
  const etatText = `Remplissage : ${rapport.piscine.etat_des_lieux.remplissage || "-"}\n\n\nÉtat de l'eau : ${rapport.piscine.etat_des_lieux.etat_eau || "-"}`;

  children.push(
    new Paragraph({
      text: "Description & État des lieux",
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 200, after: 200 },
      shading: {
        fill: COLORS.lightBlue,
        color: COLORS.white,
      },
    })
  );

  const descriptifRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "DESCRIPTION", bold: true })],
          shading: { fill: COLORS.darkTeal },
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: "ÉTAT DES LIEUX", bold: true })],
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
  ];

  children.push(
    new Table({
      rows: descriptifRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  );

  // Tableau Équipements
  children.push(
    new Paragraph({
      text: "Équipements",
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 300, after: 200 },
      shading: {
        fill: COLORS.lightBlue,
        color: COLORS.white,
      },
    })
  );

  const equipRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Équipement", bold: true })],
          shading: { fill: COLORS.darkTeal },
        }),
        new TableCell({
          children: [new Paragraph({ text: "Quantité", bold: true, alignment: AlignmentType.CENTER })],
          shading: { fill: COLORS.darkTeal },
        }),
      ],
    }),
  ];

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
      equipRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(equip.nom)] }),
            new TableCell({ children: [new Paragraph({ text: equip.quantite.toString(), alignment: AlignmentType.CENTER })] }),
          ],
        })
      );
    }
  });

  children.push(
    new Table({
      rows: equipRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
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
      text: "",
      pageBreakBefore: true,
    })
  );

  // ============================
  // SECTION LOCAL TECHNIQUE
  // ============================
  children.push(
    new Paragraph({
      text: "LOCAL TECHNIQUE",
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
      shading: {
        fill: COLORS.lightGreen,
        color: COLORS.white,
      },
    })
  );

  if (rapport.local_technique?.etat_general || rapport.local_technique?.observations) {
    const localText = rapport.local_technique.observations || rapport.local_technique.etat_general || "Aucune fuite apparente";
    children.push(
      new Paragraph({
        text: localText,
        spacing: { after: 300 },
      })
    );
  }

  // Images du local technique
  if (localTechniqueImages.length > 0) {
    localTechniqueImages.forEach((img, index) => {
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
        console.log(`   ✓ Image local technique ${index + 1}/${localTechniqueImages.length} (DOCX)`);
      } catch (error) {
        console.error(`Erreur image local ${index}:`, error);
      }
    });
  }

  children.push(
    new Paragraph({
      text: "",
      pageBreakBefore: true,
    })
  );

  // ============================
  // SECTION TESTS RÉALISÉS
  // ============================
  children.push(
    new Paragraph({
      text: "TESTS RÉALISÉS",
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
      shading: {
        fill: COLORS.lightGreen,
        color: COLORS.white,
      },
    })
  );

  // Tests de pression - Canalisations
  if (rapport.conformite.canalisations && rapport.conformite.canalisations.length > 0) {
    children.push(
      new Paragraph({
        text: "Tests de pression - Canalisations",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 200 },
        shading: {
          fill: COLORS.lightBlue,
          color: COLORS.white,
        },
      })
    );

    const canalisationsRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: "Canalisation", bold: true })],
            shading: { fill: COLORS.darkTeal },
          }),
          new TableCell({
            children: [new Paragraph({ text: "Conformité", bold: true, alignment: AlignmentType.CENTER })],
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
      })
    );
  }

  // Images de manomètre
  if (manometreImages.length > 0) {
    children.push(
      new Paragraph({
        text: "Mise en pression des canalisations",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 300, after: 200 },
        shading: {
          fill: COLORS.lightBlue,
          color: COLORS.white,
        },
      })
    );

    manometreImages.forEach((img, index) => {
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
        console.log(`   ✓ Manomètre ${index + 1}/${manometreImages.length} (DOCX)`);
      } catch (error) {
        console.error(`Erreur manomètre ${index}:`, error);
      }
    });
  }

  // Tests d'étanchéité - Pièces à sceller
  if (rapport.conformite.pieces_sceller && rapport.conformite.pieces_sceller.length > 0) {
    children.push(
      new Paragraph({
        text: "Tests d'étanchéité - Pièces à sceller",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 300, after: 200 },
        shading: {
          fill: COLORS.lightBlue,
          color: COLORS.white,
        },
      })
    );

    const piecesRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: "Pièce à sceller", bold: true })],
            shading: { fill: COLORS.darkTeal },
          }),
          new TableCell({
            children: [new Paragraph({ text: "Conformité", bold: true, alignment: AlignmentType.CENTER })],
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
      })
    );
  }

  // Images d'équipements
  if (equipementImages.length > 0) {
    equipementImages.forEach((img, index) => {
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
        console.log(`   ✓ Équipement ${index + 1}/${equipementImages.length} (DOCX)`);
      } catch (error) {
        console.error(`Erreur équipement ${index}:`, error);
      }
    });
  }

  // Test d'étanchéité du revêtement
  if (rapport.conformite.etancheite?.revetement) {
    children.push(
      new Paragraph({
        text: "Test d'étanchéité du revêtement",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 300, after: 200 },
        shading: {
          fill: COLORS.lightBlue,
          color: COLORS.white,
        },
      })
    );

    const etancheiteRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: "Élément", bold: true })],
            shading: { fill: COLORS.darkTeal },
          }),
          new TableCell({
            children: [new Paragraph({ text: "Conformité", bold: true, alignment: AlignmentType.CENTER })],
            shading: { fill: COLORS.darkTeal },
          }),
        ],
      }),
    ];

    const conformeColor = isNonConforme(rapport.conformite.etancheite.revetement) ? COLORS.red : COLORS.green;
    etancheiteRows.push(
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
      })
    );

    children.push(
      new Table({
        rows: etancheiteRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );
  }

  children.push(
    new Paragraph({
      text: "",
      pageBreakBefore: true,
    })
  );

  // ============================
  // SECTION BILAN
  // ============================
  children.push(
    new Paragraph({
      text: "BILAN DE L'INSPECTION",
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
      shading: {
        fill: COLORS.lightGreen,
        color: COLORS.white,
      },
    })
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
      children.push(
        new Paragraph({
          text: `• ${displayItem}`,
          spacing: { after: 150 },
        })
      );
    });
  }

  children.push(
    new Paragraph({
      text: "",
      pageBreakBefore: true,
    })
  );

  // ============================
  // SECTION RESPONSABILITÉS
  // ============================
  children.push(
    new Paragraph({
      text: "RESPONSABILITÉS",
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
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
        properties: {},
        children: children,
      },
    ],
  });

  // Générer le blob
  const blob = await Packer.toBlob(doc);
  console.log("✅ Document DOCX généré avec succès");
  console.log(`   Images uniques utilisées: ${usedImages.size}`);
  console.log("=== FIN GÉNÉRATION DOCX ===\n");

  return blob;
}
