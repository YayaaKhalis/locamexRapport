import mammoth from "mammoth";
import OpenAI from "openai";
import { ExtractedData, ImageData, TableData } from "@/types";

/**
 * Extrait les tableaux HTML du contenu avec leur titre
 */
function extractTables(htmlContent: string): TableData[] {
  const tables: TableData[] = [];

  // Diviser le contenu en sections pour identifier les titres avant les tableaux
  const sections = htmlContent.split(/<table[^>]*>/gi);

  for (let i = 1; i < sections.length; i++) {
    const beforeTable = sections[i - 1];
    const tableSection = sections[i];

    // Extraire le titre du tableau (texte avant le tableau)
    let title = "";
    const titleMatch = beforeTable.match(/<(?:h[1-6]|p|strong)[^>]*>([^<]+)<\/(?:h[1-6]|p|strong)>\s*$/i);
    if (titleMatch) {
      title = titleMatch[1]
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .trim();
    }

    // Si pas de titre dans une balise, chercher le dernier texte significatif
    if (!title) {
      const textMatch = beforeTable.match(/([A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ\s'-]{3,})\s*$/i);
      if (textMatch) {
        const potentialTitle = textMatch[1].trim();
        // Vérifier si c'est un titre probable (majuscules, mots-clés)
        if (
          potentialTitle.length > 3 &&
          (potentialTitle === potentialTitle.toUpperCase() ||
            /DESCRIPTIF|ÉQUIPEMENT|ÉTAT|TEST|LOCAL|TECHNIQUE|PISCINE|BILAN/i.test(potentialTitle))
        ) {
          title = potentialTitle;
        }
      }
    }

    // Extraire le contenu du tableau
    const tableEndIndex = tableSection.indexOf("</table>");
    if (tableEndIndex === -1) continue;

    const tableHtml = tableSection.substring(0, tableEndIndex);

    // Extraire les en-têtes
    const headers: string[] = [];
    const headerRegex = /<th[^>]*>([\s\S]*?)<\/th>/gi;
    let headerMatch;
    while ((headerMatch = headerRegex.exec(tableHtml)) !== null) {
      const headerText = cleanHtmlText(headerMatch[1]);
      if (headerText) {
        headers.push(headerText);
      }
    }

    // Extraire les lignes
    const rows: string[][] = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;

    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      const rowHtml = rowMatch[1];

      // Skip si c'est la ligne d'en-tête
      if (rowHtml.includes("<th")) continue;

      const cells: string[] = [];
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      let cellMatch;

      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        const cellText = cleanHtmlText(cellMatch[1]);
        cells.push(cellText);
      }

      if (cells.length > 0) {
        rows.push(cells);
      }
    }

    if (headers.length > 0 || rows.length > 0) {
      tables.push({
        title: title || undefined,
        headers: headers.length > 0 ? headers : rows[0] || [],
        rows: headers.length > 0 ? rows : rows.slice(1),
      });
    }
  }

  console.log(`\n   Récapitulatif des tableaux extraits:`);
  tables.forEach((table, index) => {
    console.log(`   📋 Tableau ${index + 1}:`);
    console.log(`      Titre: ${table.title || "Sans titre"}`);
    console.log(`      Colonnes: ${table.headers.length}`);
    console.log(`      Lignes de données: ${table.rows.length}`);
    if (table.headers.length > 0) {
      console.log(`      En-têtes: ${table.headers.join(" | ")}`);
    }
    // Afficher un aperçu de la première ligne
    if (table.rows.length > 0 && table.rows[0].length > 0) {
      const firstRow = table.rows[0].map(cell =>
        cell.length > 30 ? cell.substring(0, 27) + "..." : cell
      ).join(" | ");
      console.log(`      1ère ligne: ${firstRow}`);
    }
  });

  return tables;
}

/**
 * Nettoie le texte HTML en enlevant les balises et entités
 */
function cleanHtmlText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&eacute;/g, "é")
    .replace(/&egrave;/g, "è")
    .replace(/&ecirc;/g, "ê")
    .replace(/&agrave;/g, "à")
    .replace(/&acirc;/g, "â")
    .replace(/&ccedil;/g, "ç")
    .replace(/&ocirc;/g, "ô")
    .replace(/&ucirc;/g, "û")
    .replace(/&icirc;/g, "î")
    .trim();
}

/**
 * Extrait le contenu avancé d'un fichier Word (texte, images, tableaux)
 * AMÉLIORÉ pour récupérer 100% des données sans rien perdre
 */
export async function extractWordContentAdvanced(
  file: File
): Promise<ExtractedData> {
  try {
    console.log("\n=== EXTRACTION WORD AVANCÉE ===");
    console.log(`Nom du fichier: ${file.name}`);
    console.log(`Taille: ${(file.size / 1024).toFixed(2)} KB`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extraire avec mammoth pour avoir les images et le contenu complet
    // Options exhaustives pour tout récupérer
    const result = await mammoth.convertToHtml(
      { buffer: buffer },
      {
        // Extraire toutes les images en base64
        convertImage: mammoth.images.imgElement(function(image) {
          return image.read("base64").then(function(imageBuffer) {
            return {
              src: "data:" + image.contentType + ";base64," + imageBuffer
            };
          });
        }),
        // Inclure les styles pour mieux identifier la structure
        includeDefaultStyleMap: true,
        // Ne pas ignorer les éléments vides
        ignoreEmptyParagraphs: false
      }
    );

    // Log des avertissements de mammoth (éléments non supportés)
    if (result.messages && result.messages.length > 0) {
      console.log("\n⚠️  Avertissements mammoth:");
      result.messages.forEach(msg => {
        console.log(`   - ${msg.type}: ${msg.message}`);
      });
    }

    // Parser le HTML pour extraire images et texte
    const images: ImageData[] = [];
    const htmlContent = result.value;

    console.log(`\n📄 HTML généré: ${htmlContent.length} caractères`);

    // Extraire les images (base64)
    const imgRegex = /<img[^>]+src="data:image\/([^;]+);base64,([^"]+)"[^>]*>/g;
    let match;
    let imageCount = 0;
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      imageCount++;
      const imageType = match[1];
      const base64Data = match[2];
      const imageSizeKB = (base64Data.length * 0.75 / 1024).toFixed(2); // Approximation de la taille

      console.log(`   Image ${imageCount}: ${imageType}, ~${imageSizeKB} KB`);

      images.push({
        base64: base64Data,
        contentType: `image/${imageType}`,
      });
    }

    console.log(`✅ ${images.length} image(s) extraite(s)`);

    // Extraire les tableaux HTML
    console.log("\n📊 Extraction des tableaux...");
    const tables = extractTables(htmlContent);
    console.log(`✅ ${tables.length} tableau(x) extrait(s)`);

    // Retirer les images et tableaux du HTML pour avoir le texte pur
    console.log("\n📝 Extraction du texte...");
    let textOnly = htmlContent
      .replace(/<img[^>]*>/g, "")
      .replace(/<table[^>]*>[\s\S]*?<\/table>/gi, ""); // Retirer les tableaux

    // Convertir les balises HTML importantes en texte formaté
    textOnly = textOnly
      .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, "\n\n$1\n")
      .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "$1")
      .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "$1")
      .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "$1")
      .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "$1")
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "• $1\n") // Listes à puces
      .replace(/<[^>]+>/g, "") // Retirer toutes les autres balises HTML
      .replace(/\n\s*\n\s*\n/g, "\n\n") // Normaliser les sauts de ligne multiples
      .trim();

    console.log(`✅ Texte extrait: ${textOnly.length} caractères`);
    console.log(`   - ${textOnly.split('\n').length} lignes`);
    console.log(`   - ~${textOnly.split(/\s+/).length} mots`);

    // Afficher un aperçu du début et de la fin du texte
    const previewLength = 200;
    if (textOnly.length > previewLength * 2) {
      console.log(`\n📖 Aperçu du texte:\n   Début: "${textOnly.substring(0, previewLength)}..."`);
      console.log(`   Fin: "...${textOnly.substring(textOnly.length - previewLength)}"`);
    }

    console.log("\n=== EXTRACTION WORD TERMINÉE ===\n");

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
      temperature: 0.2,
      max_tokens: 4000,
      messages: [
        {
          role: "system",
          content: `Tu es un correcteur orthographique et grammatical EXPERT pour des rapports techniques de piscine pour l'entreprise LOCAMEX.

RÈGLES STRICTES À RESPECTER ABSOLUMENT :

1. CORRECTION ORTHOGRAPHIQUE ET GRAMMATICALE :
   - Corrige TOUTES les fautes d'orthographe
   - Corrige TOUTES les fautes de grammaire
   - Corrige TOUS les accords (genre, nombre, verbes)
   - Corrige la conjugaison des verbes

2. ESPACEMENT ET PONCTUATION :
   - Corrige TOUS les problèmes d'espacement entre les mots
   - "aumoment" → "au moment"
   - "àcet" → "à cet"
   - "dela" → "de la"
   - UN SEUL espace entre les mots (jamais double espace)
   - UN SEUL espace après la ponctuation (. , ; : ! ?)
   - AUCUN espace avant : . ,
   - UN espace avant : ; : ! ?
   - Enlève les espaces en trop en début/fin de ligne

3. NE JAMAIS MODIFIER :
   - Dates (06/11/2025, etc.)
   - Noms propres (Cholat, Geoffrey GARDETTE, etc.)
   - Adresses (248 Allée de garenne, 73230 Barby)
   - Chiffres, nombres, quantités, mesures
   - Titres de sections (DESCRIPTIF TECHNIQUE, BILAN, etc.)

4. VOCABULAIRE TECHNIQUE EXACT LOCAMEX :
   - PVC armé (jamais "PVC renforcé")
   - Skimmer (jamais "écumeur")
   - Bonde de fond
   - Refoulement
   - Pièces à sceller
   - Mise en pression des canalisations
   - Test d'étanchéité
   - Injection de fluorescéine
   - Test électro-induction
   - Revêtement
   - Liner
   - Membrane armée

5. FAUTES COURANTES À CORRIGER :
   - "plies" → "plis"
   - "constatée" → "constatés" (accords)
   - "Aucun soucis" → "Aucun souci"
   - "conformitée" → "conformité"
   - "réalisée" → "réalisé" (accord selon contexte)

6. AUTRES RÈGLES :
   - Garde le ton professionnel et technique
   - Ne supprime RIEN du texte original
   - N'ajoute AUCUNE information qui n'était pas présente
   - Respecte la structure originale du document
   - Garde les sauts de ligne et la mise en forme

EXIGENCE DE QUALITÉ : Le texte corrigé doit être PARFAIT, sans AUCUNE faute.

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
