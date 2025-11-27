import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ImageRun } from "docx";
import { RapportAnalyse } from "@/types";

/**
 * Génère un document DOCX professionnel à partir des données analysées
 */
export async function generateDOCX(
  analyzedReport: RapportAnalyse,
  analyzedImages: Array<{ base64: string; description?: string }>
): Promise<Blob> {
  console.log("📄 Génération du document DOCX...");

  // Préparer les sections du document
  const children: (Paragraph | Table)[] = [];

  // En-tête avec logo et titre
  children.push(
    new Paragraph({
      text: "LOCAMEX",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: "Expert en recherche de fuites piscine",
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: "RAPPORT D'INTERVENTION",
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    })
  );

  // Informations client
  children.push(
    new Paragraph({
      text: "INFORMATIONS CLIENT",
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 400, after: 200 },
    })
  );

  if (analyzedReport.client.nom) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Nom : ", bold: true }),
          new TextRun({ text: analyzedReport.client.nom }),
        ],
        spacing: { after: 100 },
      })
    );
  }

  if (analyzedReport.client.adresse) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Adresse : ", bold: true }),
          new TextRun({ text: analyzedReport.client.adresse }),
        ],
        spacing: { after: 100 },
      })
    );
  }

  // Informations d'inspection
  children.push(
    new Paragraph({
      text: "INFORMATIONS D'INSPECTION",
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 400, after: 200 },
    })
  );

  if (analyzedReport.inspection.date) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Date d'intervention : ", bold: true }),
          new TextRun({ text: analyzedReport.inspection.date }),
        ],
        spacing: { after: 100 },
      })
    );
  }

  if (analyzedReport.inspection.technicien) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Technicien : ", bold: true }),
          new TextRun({ text: analyzedReport.inspection.technicien }),
        ],
        spacing: { after: 100 },
      })
    );
  }

  // Description de la mission
  if (analyzedReport.mission.description) {
    children.push(
      new Paragraph({
        text: "DESCRIPTION DE LA MISSION",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: analyzedReport.mission.description,
        spacing: { after: 400 },
      })
    );
  }

  // Équipements - Tableau
  if (analyzedReport.equipements.liste.length > 0) {
    children.push(
      new Paragraph({
        text: "ÉQUIPEMENTS",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 400, after: 200 },
      })
    );

    const equipementRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: "Équipement", bold: true })],
            shading: { fill: "5B949A" },
          }),
          new TableCell({
            children: [new Paragraph({ text: "Quantité", bold: true })],
            shading: { fill: "5B949A" },
          }),
        ],
      }),
    ];

    analyzedReport.equipements.liste.forEach((equip) => {
      equipementRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: equip.nom })],
            }),
            new TableCell({
              children: [new Paragraph({ text: equip.quantite.toString() })],
            }),
          ],
        })
      );
    });

    children.push(
      new Table({
        rows: equipementRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );
  }

  // Tests réalisés
  if (analyzedReport.tests.length > 0) {
    children.push(
      new Paragraph({
        text: "TESTS RÉALISÉS",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 400, after: 200 },
      })
    );

    analyzedReport.tests.forEach((test) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${test.type} : `, bold: true }),
            new TextRun({ text: test.resultat }),
          ],
          spacing: { after: 100 },
        })
      );

      if (test.details) {
        children.push(
          new Paragraph({
            text: test.details,
            spacing: { after: 200, left: 400 },
          })
        );
      }
    });
  }

  // État des lieux
  if (analyzedReport.etatDesLieux.description) {
    children.push(
      new Paragraph({
        text: "ÉTAT DES LIEUX",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: analyzedReport.etatDesLieux.description,
        spacing: { after: 400 },
      })
    );
  }

  // Images
  if (analyzedImages.length > 0) {
    children.push(
      new Paragraph({
        text: "PHOTOS D'INTERVENTION",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 400, after: 200 },
      })
    );

    for (let i = 0; i < analyzedImages.length; i++) {
      const image = analyzedImages[i];
      try {
        // Convertir base64 en buffer
        const base64Data = image.base64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

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
            spacing: { after: 200 },
          })
        );

        if (image.description) {
          children.push(
            new Paragraph({
              text: image.description,
              italics: true,
              spacing: { after: 400 },
            })
          );
        }
      } catch (error) {
        console.error(`Erreur lors de l'ajout de l'image ${i + 1}:`, error);
      }
    }
  }

  // Conclusion
  if (analyzedReport.conclusion.verdict) {
    children.push(
      new Paragraph({
        text: "CONCLUSION",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Verdict : ", bold: true }),
          new TextRun({ text: analyzedReport.conclusion.verdict }),
        ],
        spacing: { after: 200 },
      })
    );

    if (analyzedReport.conclusion.details) {
      children.push(
        new Paragraph({
          text: analyzedReport.conclusion.details,
          spacing: { after: 400 },
        })
      );
    }
  }

  // Disclaimer
  if (analyzedReport.conclusion.disclaimer) {
    children.push(
      new Paragraph({
        text: "LIMITES DE RESPONSABILITÉ",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: analyzedReport.conclusion.disclaimer,
        italics: true,
        spacing: { after: 400 },
      })
    );
  }

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

  return blob;
}
