import mammoth from "mammoth";
import { ExtractedData, ImageData, TableData } from "@/types";
import { createCanvas, loadImage } from "canvas";

/**
 * Compresse une image base64 en JPEG avec redimensionnement
 * Réduit la taille du PDF en compressant les images
 */
async function compressImageBase64(
  base64Data: string,
  contentType: string,
  maxWidth: number = 800,
  quality: number = 0.6
): Promise<{ base64: string; contentType: string }> {
  try {
    console.log(`      🔧 Compression tentée - Type: ${contentType}`);

    // Reconstruire le data URL complet
    const dataUrl = `data:${contentType};base64,${base64Data}`;

    // Charger l'image
    const img = await loadImage(dataUrl);
    console.log(`      📐 Dimensions originales: ${img.width}x${img.height}px`);

    // Calculer les nouvelles dimensions en gardant le ratio
    let width = img.width;
    let height = img.height;

    if (width > maxWidth) {
      const ratio = maxWidth / width;
      width = maxWidth;
      height = Math.round(height * ratio);
    }

    console.log(`      📐 Nouvelles dimensions: ${width}x${height}px`);

    // Créer un canvas et dessiner l'image redimensionnée
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    // Convertir en JPEG avec compression
    const jpegBuffer = canvas.toBuffer('image/jpeg', { quality });

    const originalSizeKB = Math.round(base64Data.length * 0.75 / 1024);
    const newSizeKB = Math.round(jpegBuffer.length / 1024);
    const reduction = Math.round((1 - jpegBuffer.length / (base64Data.length * 0.75)) * 100);

    console.log(`      ✅ Compression réussie: ${originalSizeKB}KB → ${newSizeKB}KB (${reduction}% de réduction)`);

    // Retourner en base64
    return {
      base64: jpegBuffer.toString('base64'),
      contentType: 'image/jpeg'
    };
  } catch (error) {
    console.error('      ❌ ERREUR compression image:', error);
    console.error('      Stack:', (error as Error).stack);
    // Retourner l'original en cas d'erreur
    return { base64: base64Data, contentType };
  }
}

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

    // Compression des images
    if (images.length > 0) {
      console.log("\n🗜️  Compression des images...");
      for (let i = 0; i < images.length; i++) {
        const originalSize = images[i].base64.length;
        console.log(`   Image ${i + 1}/${images.length}: Taille originale ~${(originalSize * 0.75 / 1024).toFixed(0)} KB`);

        const compressed = await compressImageBase64(
          images[i].base64,
          images[i].contentType || "image/png"
        );

        images[i].base64 = compressed.base64;
        images[i].contentType = compressed.contentType;

        const newSize = images[i].base64.length;
        const reduction = Math.round((1 - newSize / originalSize) * 100);
        console.log(`   ✅ Compressée: ~${(newSize * 0.75 / 1024).toFixed(0)} KB (${reduction}% de réduction)`);
      }
      console.log(`✅ Compression terminée: ${images.length} image(s) optimisée(s)`);
    }

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

