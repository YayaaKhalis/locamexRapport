"use client";

import { useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Eye, Save } from "lucide-react";
import jsPDF from "jspdf";

interface HTMLEditorProps {
  initialHTML: string;
  onSave: (editedHTML: string) => void;
  onBack: () => void;
  clientName: string;
  inspectionDate: string;
}

export default function HTMLEditor({
  initialHTML,
  onSave,
  onBack,
  clientName,
  inspectionDate,
}: HTMLEditorProps) {
  const editorRef = useRef<any>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Sauvegarder les modifications
  const handleSave = () => {
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      setIsSaving(true);
      setTimeout(() => {
        onSave(content);
        setIsSaving(false);
      }, 500);
    }
  };

  // Basculer entre mode édition et prévisualisation
  const togglePreview = () => {
    setIsPreview(!isPreview);
  };

  // Télécharger le PDF
  const handleDownloadPDF = async () => {
    setIsDownloading(true);

    try {
      // Récupérer le contenu HTML de l'éditeur
      const htmlContent = editorRef.current ? editorRef.current.getContent() : initialHTML;

      // Créer un iframe temporaire pour le rendu HTML
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.left = "-9999px";
      iframe.style.width = "210mm";
      iframe.style.height = "297mm";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();

        // Attendre que les images se chargent
        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        });

        // Convertir en PDF avec jsPDF
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        // Utiliser html2canvas pour capturer le contenu
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(iframeDoc.body, {
          scale: 2,
          useCORS: true,
          logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        // Télécharger le PDF
        const fileName = `rapport_locamex_${clientName.replace(/\s+/g, "_")}_${inspectionDate.replace(/\//g, "-")}.pdf`;
        pdf.save(fileName);

        // Supprimer l'iframe temporaire
        document.body.removeChild(iframe);
      }
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white dark:bg-slate-900 z-50 overflow-hidden"
    >
      {/* Header avec actions */}
      <div className="bg-gradient-to-r from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>

            <div>
              <h2 className="text-2xl font-bold text-white">
                Éditeur de rapport
              </h2>
              <p className="text-white/80 text-sm">
                {clientName} - {inspectionDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={togglePreview}
              variant="outline"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreview ? "Éditer" : "Prévisualiser"}
            </Button>

            <Button
              onClick={handleSave}
              variant="outline"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>

            <Button
              onClick={handleDownloadPDF}
              variant="default"
              size="sm"
              className="bg-white text-[#5B949A] hover:bg-white/90 font-semibold"
              disabled={isDownloading}
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? "Génération..." : "Télécharger PDF"}
            </Button>
          </div>
        </div>
      </div>

      {/* Zone d'édition/prévisualisation */}
      <div className="h-[calc(100vh-88px)] overflow-auto bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto p-6">
          {isPreview ? (
            // Mode prévisualisation
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-2xl p-8"
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: editorRef.current
                    ? editorRef.current.getContent()
                    : initialHTML,
                }}
              />
            </motion.div>
          ) : (
            // Mode édition avec TinyMCE
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-2xl overflow-hidden"
            >
              <Editor
                apiKey="VOTRE_CLE_API_TINYMCE_GRATUITE"
                onInit={(evt, editor) => (editorRef.current = editor)}
                initialValue={initialHTML}
                init={{
                  height: "calc(100vh - 200px)",
                  menubar: true,
                  plugins: [
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "code",
                    "help",
                    "wordcount",
                  ],
                  toolbar:
                    "undo redo | blocks | " +
                    "bold italic forecolor backcolor | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist outdent indent | " +
                    "table tabledelete | tableprops tablerowprops tablecellprops | " +
                    "tableinsertrowbefore tableinsertrowafter tabledeleterow | " +
                    "tableinsertcolbefore tableinsertcolafter tabledeletecol | " +
                    "image | removeformat | help",
                  content_style: `
                    body {
                      font-family: Helvetica, Arial, sans-serif;
                      font-size: 11pt;
                      line-height: 1.6;
                      color: #333333;
                      max-width: 210mm;
                      margin: 0 auto;
                      padding: 20mm;
                    }
                  `,
                  table_default_styles: {
                    width: "100%",
                  },
                  table_default_attributes: {
                    border: "1",
                  },
                  images_upload_handler: (blobInfo, progress) =>
                    new Promise((resolve, reject) => {
                      // Convertir l'image en base64
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        resolve(reader.result as string);
                      };
                      reader.onerror = reject;
                      reader.readAsDataURL(blobInfo.blob());
                    }),
                  automatic_uploads: true,
                  image_advtab: true,
                  image_caption: true,
                  quickbars_selection_toolbar:
                    "bold italic | quicklink h2 h3 blockquote",
                  quickbars_insert_toolbar: false,
                  contextmenu: "link image table",
                  resize: false,
                  branding: false,
                  promotion: false,
                }}
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
