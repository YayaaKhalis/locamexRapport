import mammoth from "mammoth";
import OpenAI from "openai";
import { ExtractedData, ImageData, TableData } from "@/types";

/**
 * Extrait le contenu avancé d'un fichier Word (texte, images, tableaux)
 */
export async function extractWordContentAdvanced(
  file: File
): Promise<ExtractedData> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extraire avec mammoth pour avoir les images
    const result = await mammoth.convertToHtml(
      { buffer: buffer },
      {
        convertImage: mammoth.images.imgElement(function(image) {
          return image.read("base64").then(function(imageBuffer) {
            return {
              src: "data:" + image.contentType + ";base64," + imageBuffer
            };
          });
        })
      }
    );

    // Parser le HTML pour extraire images et texte
    const images: ImageData[] = [];
    const htmlContent = result.value;

    // Extraire les images (base64)
    const imgRegex = /<img[^>]+src="data:image\/([^;]+);base64,([^"]+)"[^>]*>/g;
    let match;
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      images.push({
        base64: match[2],
        contentType: `image/${match[1]}`,
      });
    }

    // Retirer les images du HTML pour avoir le texte pur
    const textOnly = htmlContent
      .replace(/<img[^>]*>/g, "")
      .replace(/<[^>]+>/g, "") // Retirer toutes les balises HTML
      .replace(/\s+/g, " ") // Normaliser les espaces
      .trim();

    // Parser les tableaux (simplifié)
    // Nous pourrions améliorer ceci pour extraire de vrais tableaux HTML
    const tables: TableData[] = [];

    return {
      text: textOnly,
      images,
      tables,
    };
  } catch (error) {
    console.error("Erreur lors de l'extraction Word:", error);
    throw new Error("Impossible d'extraire le contenu du fichier Word");
  }
}

/**
 * Corrige le texte avec l'IA OpenAI GPT-4
 */
export async function correctTextWithAI(text: string): Promise<string> {
  try {
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
    return text;
  }
}
