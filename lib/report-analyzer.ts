import Anthropic from "@anthropic-ai/sdk";
import { ExtractedData, ReponseAnalyseur, RapportAnalyse, TableData } from "@/types";
import { SYSTEM_PROMPT_ANALYSEUR, USER_PROMPT_TEMPLATE } from "./prompts/analyseur-rapport";
import { SYSTEM_PROMPT_SIMPLE, USER_PROMPT_SIMPLE } from "./prompts/analyseur-simple";

/**
 * Convertit les tableaux extraits en format texte pour l'IA
 */
function formatTablesForAI(tables: TableData[]): string {
  if (!tables || tables.length === 0) {
    return "Aucun tableau trouvé dans le document.";
  }

  let formattedText = "";

  tables.forEach((table, index) => {
    formattedText += `\n\n=== TABLEAU ${index + 1} ===\n`;

    if (table.title) {
      formattedText += `Titre: ${table.title}\n\n`;
    }

    // En-têtes
    if (table.headers && table.headers.length > 0) {
      formattedText += `En-têtes: ${table.headers.join(" | ")}\n`;
    }

    // Lignes
    if (table.rows && table.rows.length > 0) {
      formattedText += "\nDonnées:\n";
      table.rows.forEach((row, rowIndex) => {
        formattedText += `Ligne ${rowIndex + 1}: ${row.join(" | ")}\n`;
      });
    }

    formattedText += "\n";
  });

  return formattedText;
}

/**
 * Analyse un rapport LOCAMEX avec GPT-4 en utilisant le prompt système universel
 * Cette fonction extrait TOUTES les informations, corrige TOUTES les fautes,
 * et retourne un JSON structuré complet
 */
export async function analyzeReportWithAI(
  extractedData: ExtractedData
): Promise<RapportAnalyse> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("Clé API Anthropic manquante. Veuillez ajouter ANTHROPIC_API_KEY dans votre fichier .env.local");
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    console.log("=== DÉBUT ANALYSE UNIVERSELLE DU RAPPORT AVEC CLAUDE ===");
    console.log(`Longueur du texte: ${extractedData.text.length} caractères`);
    console.log(`Nombre de tableaux: ${extractedData.tables.length}`);
    console.log(`Nombre d'images: ${extractedData.images.length}`);

    // Formater les tableaux pour l'IA
    const tablesText = formatTablesForAI(extractedData.tables);

    // Choisir le prompt selon la taille du document
    // Claude 3.5 Sonnet peut gérer des documents beaucoup plus longs (200K tokens)
    const useSimplePrompt = process.env.USE_SIMPLE_PROMPT === "true";

    const systemPrompt = useSimplePrompt ? SYSTEM_PROMPT_SIMPLE : SYSTEM_PROMPT_ANALYSEUR;
    const userPrompt = useSimplePrompt
      ? USER_PROMPT_SIMPLE(extractedData.text, tablesText)
      : USER_PROMPT_TEMPLATE(extractedData.text, tablesText);

    console.log("\n=== ENVOI À CLAUDE 3.5 SONNET POUR ANALYSE ===");
    console.log(`Mode: ${useSimplePrompt ? "SIMPLIFIÉ (test)" : "COMPLET"}`);
    console.log(`Taille prompt système: ${systemPrompt.length} caractères`);
    console.log(`Taille prompt utilisateur: ${userPrompt.length} caractères`);

    // Appeler Claude 4.5 Sonnet avec le prompt système universel + PROMPT CACHING
    console.log("Appel à l'API Anthropic Claude avec PROMPT CACHING activé...");
    const startTime = Date.now();

    let response;
    try {
      response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929", // Claude Sonnet 4.5 (le plus récent et puissant)
        max_tokens: 16000, // Maximum pour générer le JSON complet sans troncature
        temperature: 0.2, // Basse température pour cohérence et précision
        // OPTIMISATION : PROMPT CACHING activé (économise 50% sur les tokens input)
        system: [
          {
            type: "text",
            text: systemPrompt,
            cache_control: { type: "ephemeral" } // Cache le system prompt pendant 5 minutes
          }
        ] as any,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      });
    } catch (error: any) {
      console.error("❌ ERREUR ANTHROPIC API:", error);
      console.error("Type:", error?.type);
      console.error("Message:", error?.message);
      throw new Error(`Erreur API Anthropic: ${error?.message || "Erreur inconnue"}`);
    }

    const endTime = Date.now();
    console.log(`✅ Réponse reçue en ${((endTime - startTime) / 1000).toFixed(1)}s`);

    // Claude retourne un tableau de blocs de contenu
    const content = response.content[0]?.type === "text" ? response.content[0].text : null;

    if (!content) {
      throw new Error("Aucune réponse de Claude");
    }

    console.log("\n=== RÉPONSE REÇUE DE CLAUDE 3.5 SONNET ===");
    console.log(`Longueur de la réponse: ${content.length} caractères`);

    // Parser la réponse JSON
    let parsedResponse: ReponseAnalyseur;

    try {
      // Nettoyer le contenu au cas où Claude retourne du markdown
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      parsedResponse = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Erreur de parsing JSON:", parseError);
      console.error("Contenu reçu:", content.substring(0, 500));
      throw new Error("La réponse de Claude n'est pas un JSON valide");
    }

    // Vérifier le statut de l'analyse
    if (parsedResponse.statut === "error") {
      throw new Error(`Erreur lors de l'analyse: ${parsedResponse.message}`);
    }

    if (parsedResponse.statut === "warning") {
      console.warn(`⚠️ Avertissement: ${parsedResponse.message}`);
    }

    // Afficher les statistiques
    console.log("\n=== STATISTIQUES D'ANALYSE ===");
    console.log(`Statut: ${parsedResponse.statut}`);
    console.log(`Message: ${parsedResponse.message}`);
    console.log(`Champs remplis: ${parsedResponse.statistiques.champs_remplis} / ${parsedResponse.statistiques.champs_totaux}`);
    console.log(`Taux de complétion: ${parsedResponse.statistiques.taux_completion}%`);
    console.log(`Corrections appliquées: ${parsedResponse.statistiques.corrections_appliquees}`);
    console.log(`Sections manquantes: ${parsedResponse.statistiques.sections_manquantes}`);

    // Afficher les notes de l'analyseur
    if (parsedResponse.donnees.notes_analyseur) {
      console.log("\n=== NOTES DE L'ANALYSEUR ===");
      console.log(`Qualité du document: ${parsedResponse.donnees.notes_analyseur.qualite_document}`);

      if (parsedResponse.donnees.notes_analyseur.sections_manquantes.length > 0) {
        console.log(`Sections manquantes: ${parsedResponse.donnees.notes_analyseur.sections_manquantes.join(", ")}`);
      }

      if (parsedResponse.donnees.notes_analyseur.informations_incompletes.length > 0) {
        console.log(`Informations incomplètes: ${parsedResponse.donnees.notes_analyseur.informations_incompletes.join(", ")}`);
      }

      if (parsedResponse.donnees.notes_analyseur.commentaires) {
        console.log(`Commentaires: ${parsedResponse.donnees.notes_analyseur.commentaires}`);
      }
    }

    // Afficher quelques corrections appliquées
    if (parsedResponse.donnees.corrections_appliquees.length > 0) {
      console.log("\n=== EXEMPLES DE CORRECTIONS ===");
      parsedResponse.donnees.corrections_appliquees.slice(0, 5).forEach((correction, index) => {
        console.log(`${index + 1}. [${correction.type}] "${correction.original}" → "${correction.corrige}"`);
      });
      if (parsedResponse.donnees.corrections_appliquees.length > 5) {
        console.log(`... et ${parsedResponse.donnees.corrections_appliquees.length - 5} autres corrections`);
      }
    }

    console.log("\n=== ANALYSE UNIVERSELLE TERMINÉE AVEC SUCCÈS ===\n");

    return parsedResponse.donnees;

  } catch (error) {
    console.error("Erreur lors de l'analyse universelle du rapport:", error);

    if (error instanceof Error) {
      throw new Error(`Échec de l'analyse: ${error.message}`);
    }

    throw new Error("Erreur inconnue lors de l'analyse du rapport");
  }
}

/**
 * Valide la structure du rapport analysé
 * Vérifie que les champs essentiels sont présents
 */
export function validateRapportAnalyse(rapport: RapportAnalyse): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Vérifications essentielles
  if (!rapport.metadata) {
    errors.push("Métadonnées manquantes");
  }

  if (!rapport.client || !rapport.client.nom) {
    warnings.push("Nom du client manquant");
  }

  if (!rapport.inspection || !rapport.inspection.date) {
    warnings.push("Date d'inspection manquante");
  }

  if (!rapport.bilan || !rapport.bilan.conclusion_generale) {
    warnings.push("Conclusion générale manquante");
  }

  // Vérifier la qualité de l'extraction
  if (rapport.notes_analyseur) {
    if (rapport.notes_analyseur.qualite_document === "faible") {
      warnings.push("Qualité du document source faible");
    }

    if (rapport.notes_analyseur.sections_manquantes.length > 3) {
      warnings.push(`Plusieurs sections manquantes (${rapport.notes_analyseur.sections_manquantes.length})`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
