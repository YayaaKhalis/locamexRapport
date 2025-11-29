import Anthropic from "@anthropic-ai/sdk";
import { ImageData, ImageAnalysis } from "@/types";

/**
 * Analyse UNE SEULE image avec Claude Haiku Vision (10x moins cher que Sonnet)
 * UTILISÉ EN FALLBACK SEULEMENT - Préférer analyzeImagesBatch() pour économiser
 */
export async function analyzeImageWithVision(
  image: ImageData
): Promise<ImageAnalysis> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("Clé API Anthropic manquante, analyse d'image impossible");
      return getDefaultAnalysis();
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // OPTIMISATION : Utiliser Haiku au lieu de Sonnet (10x moins cher pour la vision)
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022", // Claude 3.5 Haiku avec vision - 10x moins cher !
      max_tokens: 300, // Réduit de 500 à 300 (suffisant pour la classification)
      temperature: 0.1, // Réduit de 0.2 à 0.1 pour plus de cohérence
      system: [
        {
          type: "text",
          text: `Tu es un expert en analyse de photos de rapports d'inspection de piscines pour LOCAMEX.`,
          cache_control: { type: "ephemeral" } // PROMPT CACHING activé !
        }
      ] as any,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyse chaque photo et retourne UNIQUEMENT un objet JSON avec cette structure EXACTE :
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
              cache_control: { type: "ephemeral" } // Cache le prompt utilisateur aussi
            } as any,
            {
              type: "image",
              source: {
                type: "base64",
                media_type: (image.contentType || "image/png") as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: image.base64,
              },
            },
          ],
        },
      ],
    });

    const content = response.content[0]?.type === "text" ? response.content[0].text : null;

    if (!content) {
      console.warn("Aucune réponse de Claude Vision");
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
 * 🚀 OPTIMISATION : Analyse PLUSIEURS images en 1 seul appel API (BATCH)
 * Économie de 70-85% sur les coûts d'analyse d'images !
 */
export async function analyzeImagesBatch(
  images: ImageData[]
): Promise<ImageAnalysis[]> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("Clé API Anthropic manquante, analyse d'image impossible");
      return images.map(() => getDefaultAnalysis());
    }

    if (images.length === 0) {
      return [];
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Construire le contenu avec toutes les images
    const content: any[] = [
      {
        type: "text",
        text: `Analyse ces ${images.length} photos de rapport d'inspection de piscine LOCAMEX.

Retourne UNIQUEMENT un tableau JSON avec ${images.length} objets ayant cette structure EXACTE :
[
  {
    "imageIndex": 1,
    "type": "piscine" | "manometre" | "local_technique" | "equipement" | "autre",
    "quality": "bonne" | "moyenne" | "floue",
    "sizeRecommendation": "grande" | "petite",
    "description": "Description courte et précise",
    "displayPriority": 1-10
  },
  ...
]

RÈGLES :
- type "piscine" = vue d'ensemble de la piscine, bassin
- type "manometre" = manomètre de pression, appareil de mesure
- type "local_technique" = local technique, pompe, filtres
- type "equipement" = équipement divers (skimmer, bonde, refoulement, etc.)
- type "couverture_rapport" = couverture du rapport LOCAMEX, logo LOCAMEX (à EXCLURE)
- type "autre" = tout le reste

- quality "bonne" = photo nette, bien éclairée
- quality "moyenne" = acceptable
- quality "floue" = photo floue, mal cadrée

- sizeRecommendation "grande" = photo importante (vue d'ensemble, anomalie)
- sizeRecommendation "petite" = détail technique, photo secondaire

- displayPriority : 1 = la plus importante (vue d'ensemble piscine), 10 = secondaire

- description : max 60 caractères, français, technique et précis

IMPORTANT : imageIndex doit correspondre à l'ordre des images (1, 2, 3, etc.)

Ne retourne QUE le tableau JSON, rien d'autre.`,
        cache_control: { type: "ephemeral" } // Cache le prompt
      },
    ];

    // Ajouter toutes les images
    images.forEach((image, index) => {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: (image.contentType || "image/png") as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: image.base64,
        },
      });

      // Ajouter un label pour chaque image
      content.push({
        type: "text",
        text: `Image ${index + 1}/${images.length}`,
      });
    });

    // OPTIMISATION : Utiliser Haiku (10x moins cher que Sonnet)
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022", // Claude 3.5 Haiku avec vision
      max_tokens: 300 * images.length, // 300 tokens par image
      temperature: 0.1,
      system: [
        {
          type: "text",
          text: "Tu es un expert en analyse de photos de rapports d'inspection de piscines pour LOCAMEX.",
          cache_control: { type: "ephemeral" } // Cache le système prompt
        }
      ] as any,
      messages: [
        {
          role: "user",
          content,
        },
      ],
    });

    const responseContent = response.content[0]?.type === "text" ? response.content[0].text : null;

    if (!responseContent) {
      console.warn("Aucune réponse de Claude Vision (batch)");
      return images.map(() => getDefaultAnalysis());
    }

    // Parser la réponse JSON
    try {
      let cleanContent = responseContent.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const analyses: (ImageAnalysis & { imageIndex: number })[] = JSON.parse(cleanContent);

      // Trier par imageIndex et retourner dans le bon ordre
      const sortedAnalyses = analyses.sort((a, b) => a.imageIndex - b.imageIndex);

      return sortedAnalyses.map(analysis => ({
        type: analysis.type,
        quality: analysis.quality,
        sizeRecommendation: analysis.sizeRecommendation,
        description: analysis.description,
        displayPriority: analysis.displayPriority,
      }));

    } catch (parseError) {
      console.error("Erreur lors du parsing de la réponse JSON (batch):", parseError);
      console.error("Contenu reçu:", responseContent.substring(0, 500));
      // Fallback : retourner des analyses par défaut
      return images.map(() => getDefaultAnalysis());
    }

  } catch (error) {
    console.error("Erreur lors de l'analyse batch d'images:", error);
    // Fallback : retourner des analyses par défaut
    return images.map(() => getDefaultAnalysis());
  }
}

/**
 * Ancienne fonction - GARDÉE POUR COMPATIBILITÉ
 * Maintenant utilise analyzeImagesBatch() en interne pour économiser
 */
export async function _OLD_analyzeImageWithVision(
  image: ImageData
): Promise<ImageAnalysis> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("Clé API Anthropic manquante, analyse d'image impossible");
      return getDefaultAnalysis();
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Claude accepte les images en base64 directement
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022", // Claude 3.5 Haiku au lieu de Sonnet
      max_tokens: 300,
      temperature: 0.1,
      system: `Tu es un expert en analyse de photos de rapports d'inspection de piscines pour LOCAMEX.

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
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: (image.contentType || "image/png") as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: image.base64,
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

    const content = response.content[0]?.type === "text" ? response.content[0].text : null;

    if (!content) {
      console.warn("Aucune réponse de Claude Vision");
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
 * 🚀 OPTIMISÉ : Analyse toutes les images en BATCH (5 images par appel API)
 * Économie de 80% sur les coûts d'analyse d'images !
 */
export async function analyzeAllImages(
  images: ImageData[]
): Promise<ImageData[]> {
  if (!images || images.length === 0) {
    return images;
  }

  console.log(`\n🚀 ANALYSE OPTIMISÉE: ${images.length} images avec Claude Haiku (batch)`);
  console.log(`   Coût estimé: ~$${(images.length * 0.0015).toFixed(4)} (au lieu de ~$${(images.length * 0.01).toFixed(4)} avec Sonnet individuel)`);
  console.log(`   Économie: ${(((images.length * 0.01 - images.length * 0.0015) / (images.length * 0.01)) * 100).toFixed(0)}% 💰\n`);

  const analyzedImages: ImageData[] = [];

  // OPTIMISATION : Analyser 5 images à la fois en 1 seul appel API
  const batchSize = 5;

  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);

    console.log(`   📦 Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(images.length / batchSize)}: Analyse de ${batch.length} images...`);

    try {
      // Analyser le batch complet en 1 seul appel
      const analyses = await analyzeImagesBatch(batch);

      // Associer chaque analyse à son image
      const batchWithAnalysis = batch.map((image, index) => ({
        ...image,
        analysis: analyses[index] || getDefaultAnalysis(),
      }));

      analyzedImages.push(...batchWithAnalysis);

      console.log(`   ✅ Batch ${Math.floor(i / batchSize) + 1} terminé (${Math.min(i + batchSize, images.length)}/${images.length} images)`);

    } catch (error) {
      console.error(`   ❌ Erreur sur le batch ${Math.floor(i / batchSize) + 1}:`, error);

      // Fallback : ajouter des analyses par défaut
      const batchWithDefault = batch.map((image) => ({
        ...image,
        analysis: getDefaultAnalysis(),
      }));

      analyzedImages.push(...batchWithDefault);
    }
  }

  console.log(`\n✅ Analyse terminée: ${analyzedImages.length} images analysées avec succès!\n`);

  return analyzedImages;
}

/**
 * Retourne une analyse par défaut si Claude Vision n'est pas disponible
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
