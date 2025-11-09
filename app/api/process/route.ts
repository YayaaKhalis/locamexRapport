import { NextRequest, NextResponse } from "next/server";
import {
  extractWordContentAdvanced,
  correctTextWithAI,
} from "@/lib/word-extractor-advanced";
import { generatePDF } from "@/lib/pdf-generator";
import { ReportData } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 secondes max

export async function POST(request: NextRequest) {
  try {
    // Récupérer le fichier depuis le FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    if (
      file.type !==
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return NextResponse.json(
        { error: "Format de fichier invalide. Utilisez un fichier .docx" },
        { status: 400 }
      );
    }

    // Vérifier la taille (10 MB max)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop volumineux. Taille maximale : 10 MB" },
        { status: 400 }
      );
    }

    // Étape 1 : Extraction du contenu Word (avec images)
    const extractedData = await extractWordContentAdvanced(file);

    if (!extractedData.text) {
      return NextResponse.json(
        { error: "Impossible d'extraire le texte du document" },
        { status: 500 }
      );
    }

    // Étape 2 : Correction du texte avec OpenAI GPT-4
    const correctedText = await correctTextWithAI(extractedData.text);

    // Préparer les données du rapport
    const reportData: ReportData = {
      originalText: extractedData.text,
      correctedText: correctedText,
      images: extractedData.images,
      tables: extractedData.tables,
    };

    // Étape 3 : Génération du PDF
    const pdfBlob = generatePDF(reportData);

    // Convertir le Blob en Buffer pour Next.js
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Retourner le PDF
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rapport_corrige_${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Erreur lors du traitement:", error);

    return NextResponse.json(
      {
        error: "Erreur lors du traitement du fichier. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}
