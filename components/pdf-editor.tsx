"use client";

import { useState, useEffect, useRef } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Download,
  X,
  Edit3,
  Save,
  Type,
  Trash2,
  Plus,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Upload
} from "lucide-react";

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  align: "left" | "center" | "right";
}

interface ImageElement {
  id: string;
  src: string; // Base64 data URL
  x: number;
  y: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

type EditorMode = "text" | "image";

interface PDFEditorProps {
  pdfBlob: Blob;
  onClose: () => void;
  onSave: (editedBlob: Blob) => void;
}

export function PDFEditor({ pdfBlob, onClose, onSave }: PDFEditorProps) {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [editorMode, setEditorMode] = useState<EditorMode>("text");
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [imageElements, setImageElements] = useState<ImageElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"text" | "image" | null>(null);
  const [showAddTextForm, setShowAddTextForm] = useState(false);
  const [showAddImageForm, setShowAddImageForm] = useState(false);
  const [newText, setNewText] = useState("");
  const [fontSize, setFontSize] = useState(12);
  const [textColor, setTextColor] = useState("#000000");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pdfBlob]);

  const handlePDFClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setClickPosition({ x, y });

    if (editorMode === "text") {
      setShowAddTextForm(true);
    } else if (editorMode === "image" && pendingImage) {
      setShowAddImageForm(true);
    }
  };

  const handleAddText = () => {
    if (!newText.trim() || !clickPosition) return;

    const element: TextElement = {
      id: Date.now().toString(),
      text: newText,
      x: clickPosition.x,
      y: clickPosition.y,
      fontSize,
      color: textColor,
      fontWeight: "normal",
      fontStyle: "normal",
      align: "left",
    };

    setTextElements([...textElements, element]);
    setNewText("");
    setShowAddTextForm(false);
    setClickPosition(null);
  };

  const handleDeleteElement = (id: string) => {
    setTextElements(textElements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
      setSelectedType(null);
    }
  };

  const handleUpdateElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(textElements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  // Image handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image valide");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPendingImage(dataUrl);
      setEditorMode("image");
    };
    reader.readAsDataURL(file);
  };

  const handleAddImage = (width: number, height: number) => {
    if (!pendingImage || !clickPosition) return;

    const img = new Image();
    img.onload = () => {
      const element: ImageElement = {
        id: Date.now().toString(),
        src: pendingImage,
        x: clickPosition.x,
        y: clickPosition.y,
        width,
        height,
        originalWidth: img.width,
        originalHeight: img.height,
      };

      setImageElements([...imageElements, element]);
      setPendingImage(null);
      setShowAddImageForm(false);
      setClickPosition(null);
      setEditorMode("text");
    };
    img.src = pendingImage;
  };

  const handleDeleteImage = (id: string) => {
    setImageElements(imageElements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
      setSelectedType(null);
    }
  };

  const handleUpdateImage = (id: string, updates: Partial<ImageElement>) => {
    setImageElements(imageElements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const handleSavePDF = async () => {
    try {
      const existingPdfBytes = await pdfBlob.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { height } = firstPage.getSize();

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Ajouter tous les éléments de texte
      for (const element of textElements) {
        // Convertir la couleur hex en RGB
        const r = parseInt(element.color.slice(1, 3), 16) / 255;
        const g = parseInt(element.color.slice(3, 5), 16) / 255;
        const b = parseInt(element.color.slice(5, 7), 16) / 255;

        firstPage.drawText(element.text, {
          x: element.x,
          y: height - element.y,
          size: element.fontSize,
          font: font,
          color: rgb(r, g, b),
        });
      }

      // Ajouter toutes les images
      for (const element of imageElements) {
        try {
          // Convertir le data URL en bytes
          const imageBytes = await fetch(element.src).then(res => res.arrayBuffer());

          // Détecter le type d'image et l'embarquer
          let image;
          if (element.src.includes("data:image/png")) {
            image = await pdfDoc.embedPng(imageBytes);
          } else if (element.src.includes("data:image/jpeg") || element.src.includes("data:image/jpg")) {
            image = await pdfDoc.embedJpg(imageBytes);
          } else {
            console.warn("Type d'image non supporté, tentative avec JPEG");
            image = await pdfDoc.embedJpg(imageBytes);
          }

          firstPage.drawImage(image, {
            x: element.x,
            y: height - element.y - element.height,
            width: element.width,
            height: element.height,
          });
        } catch (err) {
          console.error("Erreur lors de l'ajout de l'image:", err);
        }
      }

      const pdfBytes = await pdfDoc.save();
      const editedBlob = new Blob([pdfBytes], { type: "application/pdf" });

      onSave(editedBlob);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du PDF:", error);
      alert("Erreur lors de la sauvegarde des modifications");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
    >
      <div className="h-full flex">
        {/* Panneau latéral gauche - Outils */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col"
        >
          {/* Header du panneau */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-[#5B949A] to-[#7CAEB8] rounded-lg">
                <Edit3 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Éditeur PDF Pro
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Ajoutez texte et images
                </p>
              </div>
            </div>

            {/* Mode selector et bouton upload */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setEditorMode("text")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    editorMode === "text"
                      ? "bg-[#5B949A] text-white shadow-md"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  <Type className="w-4 h-4 inline mr-2" />
                  Texte
                </button>
                <button
                  onClick={() => setEditorMode("image")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    editorMode === "image"
                      ? "bg-[#5B949A] text-white shadow-md"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  Image
                </button>
              </div>

              {editorMode === "image" && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-gradient-to-r from-[#7CAEB8] to-[#5B949A] text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {pendingImage ? "Changer l'image" : "Charger une image"}
                  </Button>
                  {pendingImage && (
                    <p className="text-xs text-center text-green-600 mt-2">
                      ✓ Image chargée, cliquez sur le PDF pour la placer
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Liste des éléments */}
          <div className="flex-1 overflow-auto p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Éléments de texte ({textElements.length})
              </h3>
            </div>

            <div className="space-y-2">
              {textElements.map((element) => (
                <div
                  key={element.id}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedElement === element.id
                      ? "border-[#5B949A] bg-[#5B949A]/10"
                      : "border-slate-200 dark:border-slate-700 hover:border-[#7CAEB8]"
                  }`}
                  onClick={() => setSelectedElement(element.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={element.text}
                        onChange={(e) => handleUpdateElement(element.id, { text: e.target.value })}
                        className="w-full px-2 py-1 text-sm bg-transparent border-b border-slate-300 dark:border-slate-600 focus:outline-none focus:border-[#5B949A]"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteElement(element.id);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  {selectedElement === element.id && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <label className="text-xs text-slate-600 dark:text-slate-400">Taille</label>
                        <input
                          type="range"
                          min="8"
                          max="48"
                          value={element.fontSize}
                          onChange={(e) => handleUpdateElement(element.id, { fontSize: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <span className="text-xs text-slate-600">{element.fontSize}px</span>
                      </div>

                      <div>
                        <label className="text-xs text-slate-600 dark:text-slate-400">Couleur</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={element.color}
                            onChange={(e) => handleUpdateElement(element.id, { color: e.target.value })}
                            className="w-12 h-8 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={element.color}
                            onChange={(e) => handleUpdateElement(element.id, { color: e.target.value })}
                            className="flex-1 px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {textElements.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Type className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun élément de texte</p>
                  <p className="text-xs">Cliquez sur le PDF pour ajouter</p>
                </div>
              )}
            </div>

            {/* Section Images */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Images ({imageElements.length})
              </h3>
            </div>

            <div className="space-y-2">
              {imageElements.map((element) => (
                <div
                  key={element.id}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedElement === element.id && selectedType === "image"
                      ? "border-[#5B949A] bg-[#5B949A]/10"
                      : "border-slate-200 dark:border-slate-700 hover:border-[#7CAEB8]"
                  }`}
                  onClick={() => {
                    setSelectedElement(element.id);
                    setSelectedType("image");
                  }}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <img
                      src={element.src}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {element.width} × {element.height} px
                      </p>
                      <p className="text-xs text-slate-500">
                        Position: ({Math.round(element.x)}, {Math.round(element.y)})
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(element.id);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  {selectedElement === element.id && selectedType === "image" && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <label className="text-xs text-slate-600 dark:text-slate-400">Largeur</label>
                        <input
                          type="range"
                          min="50"
                          max="600"
                          value={element.width}
                          onChange={(e) => {
                            const newWidth = parseInt(e.target.value);
                            const ratio = element.originalHeight / element.originalWidth;
                            handleUpdateImage(element.id, {
                              width: newWidth,
                              height: Math.round(newWidth * ratio)
                            });
                          }}
                          className="w-full"
                        />
                        <span className="text-xs text-slate-600">{element.width}px</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {imageElements.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune image</p>
                  <p className="text-xs">Chargez une image ci-dessus</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <Button
              onClick={handleSavePDF}
              className="w-full bg-gradient-to-r from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] text-white"
              disabled={textElements.length === 0 && imageElements.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Enregistrer le PDF
            </Button>
            <Button
              onClick={onClose}
              variant="secondary"
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Fermer sans sauvegarder
            </Button>
          </div>
        </motion.div>

        {/* Zone principale - PDF */}
        <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-800">
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {editorMode === "text" ? (
                  "Cliquez sur le PDF pour ajouter du texte"
                ) : pendingImage ? (
                  "Cliquez sur le PDF pour placer l'image"
                ) : (
                  "Chargez une image puis cliquez sur le PDF"
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* PDF Viewer avec overlay cliquable */}
          <div className="flex-1 overflow-auto p-8 relative">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden relative">
              {/* Overlay cliquable */}
              <div
                onClick={handlePDFClick}
                className={`absolute inset-0 z-10 ${editorMode === "image" && pendingImage ? "cursor-copy" : "cursor-crosshair"}`}
                style={{ pointerEvents: (showAddTextForm || showAddImageForm) ? 'none' : 'auto' }}
              />

              {/* PDF iframe */}
              <iframe
                ref={iframeRef}
                src={pdfUrl}
                className="w-full h-[800px]"
                title="PDF à éditer"
              />

              {/* Aperçu des éléments de texte */}
              {textElements.map((element) => (
                <div
                  key={element.id}
                  style={{
                    position: 'absolute',
                    left: element.x,
                    top: element.y,
                    fontSize: element.fontSize,
                    color: element.color,
                    fontWeight: element.fontWeight,
                    fontStyle: element.fontStyle,
                    textAlign: element.align,
                    pointerEvents: 'none',
                    zIndex: 5,
                    textShadow: '0 0 2px rgba(255,255,255,0.8)',
                  }}
                >
                  {element.text}
                </div>
              ))}

              {/* Aperçu des images */}
              {imageElements.map((element) => (
                <img
                  key={element.id}
                  src={element.src}
                  alt="Overlay"
                  style={{
                    position: 'absolute',
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    pointerEvents: 'none',
                    zIndex: 5,
                    boxShadow: '0 0 8px rgba(91, 148, 154, 0.5)',
                    border: '2px solid rgba(91, 148, 154, 0.3)',
                    borderRadius: '4px',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Modal d'ajout de texte */}
        {showAddTextForm && clickPosition && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ pointerEvents: 'none' }}
          >
            <div
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border-2 border-[#5B949A]"
              style={{ pointerEvents: 'auto' }}
            >
              <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
                Ajouter du texte
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Texte
                  </label>
                  <textarea
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B949A] dark:bg-slate-700 dark:text-white"
                    rows={3}
                    placeholder="Entrez votre texte..."
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Taille: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="48"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Couleur
                    </label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleAddText}
                    className="flex-1 bg-gradient-to-r from-[#5B949A] to-[#7CAEB8] text-white"
                    disabled={!newText.trim()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddTextForm(false);
                      setClickPosition(null);
                      setNewText("");
                    }}
                    variant="secondary"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Modal d'ajout d'image */}
        {showAddImageForm && clickPosition && pendingImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ pointerEvents: 'none' }}
          >
            <div
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border-2 border-[#5B949A]"
              style={{ pointerEvents: 'auto' }}
            >
              <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
                Taille de l'image
              </h3>

              {/* Preview de l'image */}
              <div className="mb-4">
                <img
                  src={pendingImage}
                  alt="Preview"
                  className="w-full h-48 object-contain rounded-lg bg-slate-100 dark:bg-slate-700"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Largeur: <span id="image-width">200</span>px
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="600"
                    defaultValue="200"
                    onChange={(e) => {
                      const width = parseInt(e.target.value);
                      document.getElementById("image-width")!.textContent = width.toString();

                      // Calculer la hauteur proportionnelle
                      const img = new Image();
                      img.src = pendingImage;
                      img.onload = () => {
                        const ratio = img.height / img.width;
                        const height = Math.round(width * ratio);
                        document.getElementById("image-height")!.textContent = height.toString();
                      };
                    }}
                    className="w-full"
                    id="image-width-slider"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Hauteur: <span id="image-height">200</span>px
                  </label>
                  <p className="text-xs text-slate-500">
                    (Calculée automatiquement pour garder les proportions)
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      const widthSlider = document.getElementById("image-width-slider") as HTMLInputElement;
                      const width = parseInt(widthSlider.value);
                      const img = new Image();
                      img.src = pendingImage;
                      img.onload = () => {
                        const ratio = img.height / img.width;
                        const height = Math.round(width * ratio);
                        handleAddImage(width, height);
                      };
                    }}
                    className="flex-1 bg-gradient-to-r from-[#5B949A] to-[#7CAEB8] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddImageForm(false);
                      setClickPosition(null);
                      setPendingImage(null);
                      setEditorMode("text");
                    }}
                    variant="secondary"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
