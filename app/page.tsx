"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Header } from "@/components/header";
import { UploadZone } from "@/components/upload-zone";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Sparkles } from "lucide-react";
import { ProcessingState } from "@/types";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Particles } from "@/components/ui/particles";
import { ProcessingModal } from "@/components/processing-modal";
import { DownloadModal } from "@/components/download-modal";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    step: "idle",
    progress: 0,
    message: "",
  });
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>("");
  const [docxFilename, setDocxFilename] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setPdfBlob(null);
    setDocxBlob(null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setError(null);
    setPdfBlob(null);
    setDocxBlob(null);
    setPdfFilename("");
    setDocxFilename("");
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

    // Fonction pour simuler une progression fluide
    const simulateProgress = (
      startProgress: number,
      endProgress: number,
      duration: number
    ): Promise<void> => {
      return new Promise((resolve) => {
        const steps = 20; // Nombre d'étapes pour la progression
        const increment = (endProgress - startProgress) / steps;
        const stepDuration = duration / steps;
        let currentProgress = startProgress;
        let currentStep = 0;

        const interval = setInterval(() => {
          currentStep++;
          currentProgress += increment;

          if (currentStep >= steps) {
            clearInterval(interval);
            resolve();
          } else {
            setProcessingState((prev) => ({
              ...prev,
              progress: Math.round(currentProgress),
            }));
          }
        }, stepDuration);
      });
    };

    try {
      // Réinitialiser les blobs
      setError(null);
      setPdfBlob(null);
      setDocxBlob(null);

      // Étape 1: Lecture du fichier (0% -> 15%)
      setProcessingState({
        step: "uploading",
        progress: 0,
        message: "Lecture du fichier...",
      });
      await simulateProgress(0, 15, 800);

      // Étape 2: Extraction des données (15% -> 30%)
      setProcessingState({
        step: "extracting",
        progress: 15,
        message: "Extraction des données...",
      });
      await simulateProgress(15, 30, 800);

      const formData = new FormData();
      formData.append("file", selectedFile);

      // Étape 3: Récupération des images (30% -> 45%)
      setProcessingState({
        step: "extracting",
        progress: 30,
        message: "Récupération des images...",
      });
      await simulateProgress(30, 45, 1000);

      // Étape 4: Correction des erreurs (45% -> 60%)
      setProcessingState({
        step: "correcting",
        progress: 45,
        message: "Correction des erreurs...",
      });

      // Lancer la requête API en parallèle de la progression
      const responsePromise = fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      await simulateProgress(45, 60, 1200);

      // Étape 5: Amélioration du texte (60% -> 75%)
      setProcessingState({
        step: "correcting",
        progress: 60,
        message: "Amélioration du texte...",
      });
      await simulateProgress(60, 75, 1000);

      // Étape 6: Génération PDF + DOCX (75% -> 90%)
      setProcessingState({
        step: "generating",
        progress: 75,
        message: "Génération PDF + DOCX...",
      });
      await simulateProgress(75, 90, 1000);

      // Attendre la réponse de l'API si pas encore terminée
      const response = await responsePromise;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors du traitement");
      }

      // Parser la réponse JSON
      const result = await response.json();

      if (!result.success || !result.files) {
        throw new Error("Réponse invalide du serveur");
      }

      // Étape 7: Finalisation (90% -> 100%)
      setProcessingState({
        step: "generating",
        progress: 90,
        message: "Finalisation...",
      });
      await simulateProgress(90, 100, 600);

      // Convertir les base64 en Blobs
      const pdfData = atob(result.files.pdf.data);
      const pdfArray = new Uint8Array(pdfData.length);
      for (let i = 0; i < pdfData.length; i++) {
        pdfArray[i] = pdfData.charCodeAt(i);
      }
      const pdfBlobCreated = new Blob([pdfArray], { type: result.files.pdf.mimeType });

      const docxData = atob(result.files.docx.data);
      const docxArray = new Uint8Array(docxData.length);
      for (let i = 0; i < docxData.length; i++) {
        docxArray[i] = docxData.charCodeAt(i);
      }
      const docxBlobCreated = new Blob([docxArray], { type: result.files.docx.mimeType });

      // Stocker les blobs et noms de fichiers
      setPdfBlob(pdfBlobCreated);
      setDocxBlob(docxBlobCreated);
      setPdfFilename(result.files.pdf.filename);
      setDocxFilename(result.files.docx.filename);

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
    a.download = pdfFilename || `rapport_corrige_${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadDocx = () => {
    if (!docxBlob) return;

    const url = URL.createObjectURL(docxBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = docxFilename || `rapport_corrige_${new Date().toISOString().split("T")[0]}.docx`;
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
    <AuroraBackground className="min-h-screen">
      {/* Particles Effect */}
      <Particles
        className="absolute inset-0 pointer-events-none"
        quantity={100}
        staticity={50}
        ease={50}
      />

      <Header />

      {/* Main Content - Two Column Layout */}
      <main className="relative z-10 container mx-auto px-4 h-[calc(100vh-80px)] flex items-center">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Badge */}
              <a
                href="https://www.matixweb.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-[#5B949A]/10 to-[#B6D1A3]/10 border border-[#5B949A]/20 hover:border-[#5B949A]/40 transition-all duration-300 group"
              >
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Propulsé par
                </span>
                <Image
                  src="https://www.matixweb.fr/Matixweb-Digital-Solution-Dark.svg"
                  alt="MatixWeb Digital Solution"
                  width={100}
                  height={20}
                  priority
                  className="transition-transform group-hover:scale-105"
                />
              </a>

              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] bg-clip-text text-transparent">
                    Rapports
                  </span>
                  <br />
                  <span className="text-slate-800 dark:text-slate-200">
                    professionnels
                  </span>
                  <br />
                  <span className="text-4xl lg:text-5xl xl:text-6xl text-slate-600 dark:text-slate-400">
                    en 2 minutes
                  </span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                  L'IA corrige, met en page et génère votre PDF parfait
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: "✓", title: "Correction IA", desc: "Orthographe & grammaire parfaites" },
                  { icon: "✓", title: "Mise en page pro", desc: "Design LOCAMEX automatique" },
                  { icon: "✓", title: "Images organisées", desc: "Classement intelligent par section" }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#5B949A] to-[#7CAEB8] flex items-center justify-center text-white font-bold">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200">{feature.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Column - Upload */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <BackgroundGradient className="rounded-3xl p-8 bg-white dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl">
                <UploadZone
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  onClearFile={handleClearFile}
                  disabled={isProcessing}
                />

                {selectedFile && !isProcessing && processingState.step !== "completed" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6"
                  >
                    <ShimmerButton
                      onClick={handleProcess}
                      className="w-full h-14 text-lg"
                    >
                      <Sparkles className="w-6 h-6" />
                      Traiter le rapport
                    </ShimmerButton>
                  </motion.div>
                )}

                {/* Error Alert */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <Alert variant="error" className="border-red-500/50 bg-red-50/50 dark:bg-red-950/20">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Erreur</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <Button onClick={handleClearFile} variant="secondary" size="lg" className="w-full mt-4">
                      Réessayer
                    </Button>
                  </motion.div>
                )}
              </BackgroundGradient>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Processing Modal */}
      <ProcessingModal isOpen={isProcessing} state={processingState} />

      {/* Download Modal */}
      <DownloadModal
        isOpen={processingState.step === "completed" && pdfBlob !== null}
        onDownloadPdf={handleDownload}
        onDownloadDocx={handleDownloadDocx}
        hasDocx={docxBlob !== null}
        onClose={() => {}}
        onNewReport={handleClearFile}
      />
    </AuroraBackground>
  );
}
