import OpenAI from "openai";
import { ImageData, ImageAnalysis } from "@/types";

/**
 * Analyse une image avec GPT-4 Vision pour déterminer son type, qualité et ordre d'affichage
 */
export async function analyzeImageWithVision(
  image: ImageData
): Promise<ImageAnalysis> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("Clé API OpenAI manquante, analyse d'image impossible");
      return getDefaultAnalysis();
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const imageDataUrl = `data:${image.contentType || "image/png"};base64,${image.base64}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // gpt-4o supporte vision
      max_tokens: 300,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `Tu es un expert en analyse de photos de rapports d'inspection de piscines pour LOCAMEX.

Analyse chaque photo et retourne UNIQUEMENT un objet JSON avec cette structure EXACTE :
{
  "type": "piscine" | "manometre" | "local_technique" | "equipement" | "autre",
  "quality": "bonne" | "moyenne" | "floue",
  "sizeRecommendation": "grande" | "petite",
  "description": "Description courte et précise de la photo",
  "displayPriority": 1-10
}

RÈGLES :
- type "piscine" = vue d'ensemble de la piscine, bassin
- type "manometre" = manomètre de pression, appareil de mesure
- type "local_technique" = local technique, pompe, filtres
- type "equipement" = équipement divers (skimmer, bonde, refoulement, etc.)
- type "couverture_rapport" = couverture du rapport LOCAMEX, logo LOCAMEX, page de garde (à EXCLURE du PDF final)
- type "autre" = tout le reste

IMPORTANT : Si l'image contient uniquement le logo LOCAMEX, du texte promotionnel, ou ressemble à une couverture de rapport, utiliser type "couverture_rapport".

- quality "bonne" = photo nette, bien éclairée
- quality "moyenne" = photo acceptable mais pas parfaite
- quality "floue" = photo floue, mal cadrée

- sizeRecommendation "grande" = photo importante (vue d'ensemble, anomalie majeure)
- sizeRecommendation "petite" = détail technique, photo secondaire

- displayPriority : 1 = photo la plus importante à afficher en premier (vue d'ensemble piscine)
                    10 = photo secondaire à afficher en dernier

- description : max 60 caractères, en français, technique et précis, style professionnel

Ne retourne QUE le JSON, rien d'autre.`,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl,
                detail: "low", // Pour réduire les coûts
              },
            },
            {
              type: "text",
              text: "Analyse cette photo de rapport d'inspection de piscine LOCAMEX.",
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      console.warn("Aucune réponse de GPT-4 Vision");
      return getDefaultAnalysis();
    }

    // Parser la réponse JSON
    try {
      // Nettoyer la réponse en enlevant les backticks markdown
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const analysis: ImageAnalysis = JSON.parse(cleanContent);

      // Valider les valeurs
      if (
        !analysis.type ||
        !analysis.quality ||
        !analysis.sizeRecommendation ||
        !analysis.description ||
        !analysis.displayPriority
      ) {
        console.warn("Analyse incomplète, utilisation des valeurs par défaut");
        return getDefaultAnalysis();
      }

      return analysis;
    } catch (parseError) {
      console.error("Erreur lors du parsing de la réponse JSON:", parseError);
      console.error("Contenu reçu:", content);
      return getDefaultAnalysis();
    }
  } catch (error) {
    console.error("Erreur lors de l'analyse d'image:", error);
    return getDefaultAnalysis();
  }
}

/**
 * Analyse toutes les images d'un tableau et ajoute les métadonnées
 */
export async function analyzeAllImages(
  images: ImageData[]
): Promise<ImageData[]> {
  if (!images || images.length === 0) {
    return images;
  }

  console.log(`Analyse de ${images.length} images avec GPT-4 Vision...`);

  const analyzedImages: ImageData[] = [];

  // Analyser les images en parallèle (max 3 à la fois pour éviter les rate limits)
  const batchSize = 3;
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);

    const batchPromises = batch.map(async (image) => {
      const analysis = await analyzeImageWithVision(image);
      return {
        ...image,
        analysis,
      };
    });

    const batchResults = await Promise.all(batchPromises);
    analyzedImages.push(...batchResults);

    console.log(
      `Analysé ${Math.min(i + batchSize, images.length)}/${images.length} images`
    );
  }

  console.log("Analyse des images terminée");

  return analyzedImages;
}

/**
 * Retourne une analyse par défaut si GPT-4 Vision n'est pas disponible
 */
function getDefaultAnalysis(): ImageAnalysis {
  return {
    type: "autre",
    quality: "moyenne",
    sizeRecommendation: "petite",
    description: "Photo de rapport d'inspection",
    displayPriority: 5,
  };
}
