import OpenAI from "openai";
import { ExtractedData } from "@/types";

/**
 * Extrait le contenu d'un fichier Word (.docx)
 * Utilise officeparser pour extraire texte, images et tableaux
 */
export async function extractWordContent(
  file: File
): Promise<ExtractedData> {
  try {
    // officeparser nécessite un buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Importer officeparser de manière dynamique
    const officeparser = await import("officeparser");

    // Extraire le texte
    const text = await officeparser.parseOfficeAsync(buffer);

    // Pour le moment, on extrait seulement le texte
    // Les images et tableaux nécessitent un traitement plus complexe
    // qui sera ajouté dans une version ultérieure

    return {
      text: text || "",
      images: [],
      tables: [],
    };
  } catch (error) {
    console.error("Erreur lors de l'extraction Word:", error);
    throw new Error("Impossible d'extraire le contenu du fichier Word");
  }
}

/**
 * Corrige le texte avec l'IA OpenAI GPT-4
 * Corrige l'orthographe et la grammaire sans modifier les données critiques
 */
export async function correctTextWithAI(text: string): Promise<string> {
  try {
    // Vérifier que la clé API est présente
    if (!process.env.OPENAI_API_KEY) {
      console.warn("Clé API OpenAI manquante, texte non corrigé");
      return text;
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      temperature: 0.3,
      max_tokens: 4000,
      messages: [
        {
          role: "system",
          content: `Tu es un correcteur orthographique et grammatical pour des rapports techniques de piscine pour l'entreprise LOCAMEX.

RÈGLES STRICTES À RESPECTER ABSOLUMENT :
1. Corrige UNIQUEMENT l'orthographe et la grammaire
2. Ne JAMAIS modifier : dates, noms propres, adresses, chiffres, nombres, quantités
3. Utilise le vocabulaire technique exact LOCAMEX :
   - PVC armé (jamais "PVC renforcé")
   - Skimmer (jamais "écumeur")
   - Bonde de fond
   - Refoulement
   - Pièces à sceller
   - Mise en pression des canalisations
   - Test d'étanchéité
   - Injection de fluorescéine
   - Test électro-induction

4. Garde le ton professionnel et technique
5. Ne supprime RIEN du texte original
6. N'ajoute AUCUNE information qui n'était pas présente
7. Respecte la structure originale du document
8. Corrige les fautes courantes :
   - "plies" → "plis"
   - "constatée" → "constatés" (accords)
   - "aumoment" → "au moment"
   - "Aucun soucis" → "Aucun souci"

Retourne UNIQUEMENT le texte corrigé, sans commentaire ni explication.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const correctedText = response.choices[0]?.message?.content;

    if (!correctedText) {
      console.warn("Aucune réponse de l'IA, texte non corrigé");
      return text;
    }

    return correctedText;
  } catch (error) {
    console.error("Erreur lors de la correction IA:", error);
    // En cas d'erreur, retourner le texte original
    return text;
  }
}
