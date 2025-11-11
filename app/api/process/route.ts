import { NextRequest, NextResponse } from "next/server";
import { extractWordContentAdvanced } from "@/lib/word-extractor-advanced";
import { generatePDFV2 } from "@/lib/pdf-generator-v3";
import { analyzeAllImages } from "@/lib/image-analyzer";
import { analyzeReportWithAI, validateRapportAnalyse } from "@/lib/report-analyzer";
import { ReportDataV2 } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 120; // 120 secondes max (augmenté pour l'analyse IA)

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

    console.log("\n========================================");
    console.log("DÉBUT DU TRAITEMENT DU RAPPORT LOCAMEX");
    console.log("========================================\n");

    // Étape 1 : Extraction du contenu Word (texte, images, tableaux)
    console.log("📄 ÉTAPE 1 : Extraction du contenu Word...");
    const extractedData = await extractWordContentAdvanced(file);

    if (!extractedData.text) {
      return NextResponse.json(
        { error: "Impossible d'extraire le texte du document" },
        { status: 500 }
      );
    }

    console.log(`✅ Extraction réussie:`);
    console.log(`   - Texte: ${extractedData.text.length} caractères`);
    console.log(`   - Images: ${extractedData.images.length}`);
    console.log(`   - Tableaux: ${extractedData.tables.length}`);

    // Étape 2 : Analyse universelle avec GPT-4 (extraction + correction)
    console.log("\n🤖 ÉTAPE 2 : Analyse universelle avec GPT-4...");
    console.log("   (Extraction exhaustive + Correction linguistique)");
    const analyzedReport = await analyzeReportWithAI(extractedData);

    // Valider le rapport analysé
    const validation = validateRapportAnalyse(analyzedReport);

    if (!validation.isValid) {
      console.error("❌ Erreurs de validation:", validation.errors);
      return NextResponse.json(
        {
          error: "Le rapport analysé contient des erreurs",
          details: validation.errors,
        },
        { status: 500 }
      );
    }

    if (validation.warnings.length > 0) {
      console.warn("⚠️  Avertissements:", validation.warnings);
    }

    console.log("✅ Analyse universelle terminée avec succès");

    // Étape 3 : Analyse des images avec GPT-4 Vision
    console.log("\n📸 ÉTAPE 3 : Analyse des images avec GPT-4 Vision...");
    const analyzedImages = await analyzeAllImages(extractedData.images);
    console.log(`✅ ${analyzedImages.length} images analysées`);

    // Préparer les données du rapport enrichies (v2.0)
    const reportDataV2: ReportDataV2 = {
      analysedData: analyzedReport,
      images: analyzedImages,
      originalTables: extractedData.tables,
    };

    // Étape 4 : Génération du PDF professionnel v3 (nouvelle structure)
    console.log("\n📑 ÉTAPE 4 : Génération du PDF professionnel v3...");

    const pdfBlob = generatePDFV2(analyzedReport, analyzedImages);

    // Convertir le Blob en Buffer pour Next.js
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("✅ PDF généré avec succès");
    console.log("\n========================================");
    console.log("TRAITEMENT TERMINÉ AVEC SUCCÈS");
    console.log("========================================\n");

    // Retourner le PDF
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rapport_locamex_${analyzedReport.client.nom || "client"}_${analyzedReport.inspection.date.replace(/\//g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("\n❌ ERREUR LORS DU TRAITEMENT:", error);

    return NextResponse.json(
      {
        error: "Erreur lors du traitement du fichier. Veuillez réessayer.",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
