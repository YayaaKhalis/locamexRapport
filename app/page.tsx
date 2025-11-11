"use client";

import { useState } from "react";
import { UploadZone } from "@/components/upload-zone";
import { ProcessingStatus } from "@/components/processing-status";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Download, AlertCircle } from "lucide-react";
import { ProcessingState } from "@/types";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    step: "idle",
    progress: 0,
    message: "",
  });
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setPdfBlob(null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setError(null);
    setPdfBlob(null);
    setProcessingState({
      step: "idle",
      progress: 0,
      message: "",
    });
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setError(null);
    setPdfBlob(null);

    try {
      // Étape 1: Upload
      setProcessingState({
        step: "uploading",
        progress: 10,
        message: "Envoi du fichier...",
      });

      const formData = new FormData();
      formData.append("file", selectedFile);

      // Étape 2: Extraction
      setProcessingState({
        step: "extracting",
        progress: 25,
        message: "Extraction du contenu Word...",
      });

      // Étape 3: Correction (simulée pour le moment)
      setProcessingState({
        step: "correcting",
        progress: 50,
        message: "Correction orthographique avec IA...",
      });

      // Étape 4: Génération
      setProcessingState({
        step: "generating",
        progress: 75,
        message: "Génération du PDF professionnel...",
      });

      // Appel à l'API
      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors du traitement");
      }

      // Récupérer le PDF
      const blob = await response.blob();
      setPdfBlob(blob);

      // Étape 5: Terminé
      setProcessingState({
        step: "completed",
        progress: 100,
        message: "Rapport traité avec succès !",
      });
    } catch (err) {
      console.error("Erreur:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors du traitement"
      );
      setProcessingState({
        step: "error",
        progress: 0,
        message: "",
      });
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;

    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport_corrige_${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isProcessing =
    processingState.step !== "idle" &&
    processingState.step !== "completed" &&
    processingState.step !== "error";

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* En-tête */}
      <header className="bg-[#0066CC] text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">
            LOCAMEX - Correcteur de Rapports
          </h1>
          <p className="text-center mt-2 text-blue-100">
            1er Réseau d'experts en recherche de fuites piscine
          </p>
        </div>
      </header>

      {/* Image après Hero Section */}
      <div className="flex justify-center py-8 bg-white">
        <img
          src="/ApresHeroSection.png"
          alt="LOCAMEX Services"
          className="max-w-full h-auto object-contain"
          style={{ maxWidth: "800px" }}
        />
      </div>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Titre et description */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-[#2C3E50]">
              Transformez vos rapports Word en PDF professionnels
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Déposez votre rapport Word, nous corrigeons automatiquement
              l'orthographe et la grammaire, puis générons un PDF avec la charte
              graphique LOCAMEX.
            </p>
          </div>

          {/* Zone d'upload */}
          {!isProcessing && processingState.step !== "completed" && (
            <>
              <UploadZone
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                onClearFile={handleClearFile}
                disabled={isProcessing}
              />

              {selectedFile && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleProcess}
                    size="lg"
                    className="w-full max-w-md"
                  >
                    Traiter le rapport
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Barre de progression */}
          {isProcessing && <ProcessingStatus state={processingState} />}

          {/* Message d'erreur */}
          {error && (
            <Alert variant="error">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Succès et téléchargement */}
          {processingState.step === "completed" && pdfBlob && (
            <div className="space-y-6">
              <Alert variant="success">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Succès !</AlertTitle>
                <AlertDescription>
                  Votre rapport a été traité avec succès et est prêt à être
                  téléchargé.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleDownload} size="lg" className="gap-2">
                  <Download className="w-5 h-5" />
                  Télécharger le PDF
                </Button>
                <Button
                  onClick={handleClearFile}
                  variant="secondary"
                  size="lg"
                >
                  Traiter un autre rapport
                </Button>
              </div>
            </div>
          )}

          {/* Afficher le bouton réessayer en cas d'erreur */}
          {error && (
            <div className="flex justify-center">
              <Button onClick={handleClearFile} variant="secondary" size="lg">
                Réessayer
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Pied de page */}
      <footer className="bg-white border-t border-[#CCCCCC] mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; 2025 LOCAMEX - Tous droits réservés</p>
          <p className="mt-2">
            www.locamex.org | contact@locamex.org | +70 agences en Europe
          </p>
        </div>
      </footer>
    </div>
  );
}
