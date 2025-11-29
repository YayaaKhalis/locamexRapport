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
  const [outputFormat, setOutputFormat] = useState<"pdf" | "docx">("pdf");

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

          // Mettre à jour la progression
          setProcessingState((prev) => ({
            ...prev,
            progress: Math.round(currentProgress),
          }));

          if (currentStep >= steps) {
            clearInterval(interval);
            // S'assurer qu'on atteint exactement la cible
            setProcessingState((prev) => ({
              ...prev,
              progress: endProgress,
            }));
            resolve();
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
      formData.append("format", outputFormat);

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

      // Étape 6: Génération du document (75% -> 90%)
      setProcessingState({
        step: "generating",
        progress: 75,
        message: `Génération du ${outputFormat.toUpperCase()}...`,
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
    const extension = outputFormat === "pdf" ? "pdf" : "docx";
    a.download = `rapport_corrige_${new Date().toISOString().split("T")[0]}.${extension}`;
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
        <div className="max-w-7xl mx-auto">
          {/* Hero Section - 2 Columns */}
          {!isProcessing && processingState.step !== "completed" && (
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Column - Benefits */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="space-y-8 pt-8"
              >
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] bg-clip-text text-transparent">
                      Corrigez et formatez
                    </span>
                    <br />
                    <span className="text-slate-800 dark:text-slate-200">
                      vos rapports automatiquement
                    </span>
                  </h1>

                  <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                    Générez des rapports professionnels en quelques secondes avec correction automatique et mise en page parfaite.
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                    <div className="w-10 h-10 rounded-full bg-[#5B949A]/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-[#5B949A]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        Correction automatique
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        L'IA corrige toutes les fautes d'orthographe et de grammaire
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                    <div className="w-10 h-10 rounded-full bg-[#7CAEB8]/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-[#7CAEB8]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        Mise en page professionnelle
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Format standardisé avec branding LOCAMEX
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                    <div className="w-10 h-10 rounded-full bg-[#B6D1A3]/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-[#B6D1A3]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        Gain de temps considérable
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        De 30 minutes de travail à moins de 2 minutes
                      </p>
                    </div>
                  </div>
                </div>

                {/* MatixWeb Branding */}
                <a
                  href="https://www.matixweb.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-all duration-300 group"
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
              </motion.div>

              {/* Right Column - Upload Zone */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="lg:sticky lg:top-24"
              >
                <BackgroundGradient className="rounded-[32px] p-8 bg-white dark:bg-zinc-900">
                  <UploadZone
                    onFileSelect={handleFileSelect}
                    selectedFile={selectedFile}
                    onClearFile={handleClearFile}
                    disabled={isProcessing}
                  />

                  {selectedFile && (
                    <>
                      {/* Format Selection */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      >
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                          Format de sortie
                        </label>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setOutputFormat("pdf")}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                              outputFormat === "pdf"
                                ? "bg-[#5B949A] text-white shadow-md"
                                : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:border-[#5B949A]"
                            }`}
                          >
                            PDF
                          </button>
                          <button
                            onClick={() => setOutputFormat("docx")}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                              outputFormat === "docx"
                                ? "bg-[#5B949A] text-white shadow-md"
                                : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:border-[#5B949A]"
                            }`}
                          >
                            DOCX
                          </button>
                        </div>
                      </motion.div>

                      {/* Process Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center mt-6"
                      >
                        <ShimmerButton
                          onClick={handleProcess}
                          className="w-full"
                        >
                          <Sparkles className="w-5 h-5" />
                          Traiter le rapport
                        </ShimmerButton>
                      </motion.div>
                    </>
                  )}
                </BackgroundGradient>
              </motion.div>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <MovingBorder borderRadius="1.5rem" duration={3000}>
                <ProcessingStatus state={processingState} outputFormat={outputFormat} />
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

          {/* Success State - Modern Design */}
          {processingState.step === "completed" && pdfBlob && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-10 shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `radial-gradient(circle at 20px 20px, #5B949A 1px, transparent 0)`,
                      backgroundSize: "40px 40px",
                    }}
                    animate={{
                      backgroundPosition: ["0px 0px", "40px 40px"],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>

                <div className="relative z-10 space-y-8">
                  {/* Success Icon */}
                  <div className="flex justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                      className="relative"
                    >
                      <div className="p-6 bg-gradient-to-br from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] rounded-3xl shadow-2xl">
                        <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={2} />
                      </div>
                      {/* Pulsing glow effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] rounded-3xl blur-2xl"
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.4, 0.7, 0.4],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Success Message */}
                  <div className="text-center space-y-3">
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl font-bold bg-gradient-to-r from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] bg-clip-text text-transparent"
                    >
                      Traitement terminé avec succès !
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-base text-slate-600 dark:text-slate-400"
                    >
                      Votre rapport {outputFormat.toUpperCase()} professionnel est prêt à être téléchargé
                    </motion.p>
                  </div>

                  {/* Stats Cards */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-3 gap-4"
                  >
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#5B949A]/10 to-[#5B949A]/5 border border-[#5B949A]/20">
                      <div className="text-2xl font-bold text-[#5B949A]">✓</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Texte corrigé</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#7CAEB8]/10 to-[#7CAEB8]/5 border border-[#7CAEB8]/20">
                      <div className="text-2xl font-bold text-[#7CAEB8]">✓</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Images analysées</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#B6D1A3]/10 to-[#B6D1A3]/5 border border-[#B6D1A3]/20">
                      <div className="text-2xl font-bold text-[#B6D1A3]">✓</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Mise en page</div>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <button
                        onClick={handleDownload}
                        className="group relative px-8 py-4 bg-gradient-to-r from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] rounded-2xl text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 overflow-hidden"
                      >
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{
                            x: ["-100%", "200%"],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        <Download className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Télécharger le {outputFormat.toUpperCase()}</span>
                      </button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <button
                        onClick={handleClearFile}
                        className="px-8 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Traiter un autre rapport
                      </button>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
