"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Header } from "@/components/header";
import { UploadZone } from "@/components/upload-zone";
import { ProcessingStatus } from "@/components/processing-status";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Download, AlertCircle, Sparkles } from "lucide-react";
import { ProcessingState } from "@/types";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { GridPattern } from "@/components/ui/grid-pattern";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { MovingBorder } from "@/components/ui/moving-border";

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

      // Étape 6: Génération du PDF (75% -> 90%)
      setProcessingState({
        step: "generating",
        progress: 75,
        message: "Génération du PDF...",
      });
      await simulateProgress(75, 90, 1000);

      // Attendre la réponse de l'API si pas encore terminée
      const response = await responsePromise;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors du traitement");
      }

      // Étape 7: Finalisation (90% -> 100%)
      setProcessingState({
        step: "generating",
        progress: 90,
        message: "Finalisation...",
      });
      await simulateProgress(90, 100, 600);

      const blob = await response.blob();
      setPdfBlob(blob);

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 relative overflow-hidden">
      {/* Grid Pattern Background */}
      <GridPattern
        width={50}
        height={50}
        className="absolute inset-0 opacity-40"
      />

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#5B949A]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#B6D1A3]/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#7CAEB8]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <Header />

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center space-y-8 py-8"
          >
            <a
              href="https://www.matixweb.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/5 border border-blue-500/10 mb-4 hover:bg-blue-500/10 transition-all duration-300 group"
            >
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Propulsé par
              </span>
              <Image
                src="https://www.matixweb.fr/Matixweb-Digital-Solution-Dark.svg"
                alt="MatixWeb Digital Solution"
                width={120}
                height={24}
                priority
                className="transition-transform group-hover:scale-105"
              />
            </a>

            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] bg-clip-text text-transparent">
                Transformez vos rapports
              </span>
              <br />
              <span className="text-3xl md:text-5xl text-slate-800 dark:text-slate-200">
                en PDF professionnels
              </span>
            </h2>

            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Correction automatique IA • Mise en page parfaite • Branding LOCAMEX
            </p>
          </motion.div>

          {/* Upload Zone - Direct */}
          {!isProcessing && processingState.step !== "completed" && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex justify-center"
            >
              <BackgroundGradient className="rounded-[32px] max-w-4xl w-full p-10 bg-white dark:bg-zinc-900">
                <UploadZone
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  onClearFile={handleClearFile}
                  disabled={isProcessing}
                />

                {selectedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center mt-8"
                  >
                    <ShimmerButton
                      onClick={handleProcess}
                      className="w-full max-w-md"
                    >
                      <Sparkles className="w-5 h-5" />
                      Traiter le rapport
                    </ShimmerButton>
                  </motion.div>
                )}
              </BackgroundGradient>
            </motion.div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <MovingBorder borderRadius="1.5rem" duration={3000}>
                <ProcessingStatus state={processingState} />
              </MovingBorder>
            </motion.div>
          )}

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert variant="error" className="border-red-500/50 bg-red-50/50 dark:bg-red-950/20">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="flex justify-center mt-6">
                <Button onClick={handleClearFile} variant="secondary" size="lg">
                  Réessayer
                </Button>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {processingState.step === "completed" && pdfBlob && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <BackgroundGradient className="rounded-[32px] p-8">
                <Alert variant="success" className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Succès !</AlertTitle>
                  <AlertDescription>
                    Votre rapport a été traité avec succès et est prêt à être téléchargé.
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <ShimmerButton onClick={handleDownload} className="gap-2">
                    <Download className="w-5 h-5" />
                    Télécharger le PDF
                  </ShimmerButton>
                  <Button
                    onClick={handleClearFile}
                    variant="secondary"
                    size="lg"
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    Traiter un autre rapport
                  </Button>
                </div>
              </BackgroundGradient>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
