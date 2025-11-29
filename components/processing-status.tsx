"use client";

import { Sparkles, FileSearch, Wand2, FileCheck2, Zap, CheckCircle2 } from "lucide-react";
import { ProcessingState } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface ProcessingStatusProps {
  state: ProcessingState;
  outputFormat?: "pdf" | "docx";
}

export function ProcessingStatus({ state, outputFormat = "pdf" }: ProcessingStatusProps) {
  const formatLabel = outputFormat.toUpperCase();

  const getStepInfo = () => {
    const progress = state.progress;

    // Étapes réalistes basées sur le traitement réel de l'API
    if (progress < 15) {
      return {
        message: "Lecture du fichier Word",
        detail: "Analyse de la structure du document",
        icon: FileSearch,
        color: "#5B949A",
      };
    } else if (progress < 30) {
      return {
        message: "Extraction du contenu",
        detail: "Récupération du texte, tableaux et métadonnées",
        icon: FileSearch,
        color: "#7CAEB8",
      };
    } else if (progress < 45) {
      return {
        message: "Analyse des images",
        detail: "Optimisation et préparation des photos",
        icon: FileCheck2,
        color: "#B6D1A3",
      };
    } else if (progress < 60) {
      return {
        message: "Intelligence artificielle en action",
        detail: "Analyse complète du rapport par Claude AI",
        icon: Zap,
        color: "#5B949A",
      };
    } else if (progress < 75) {
      return {
        message: "Correction linguistique",
        detail: "Orthographe, grammaire et amélioration du texte",
        icon: Wand2,
        color: "#7CAEB8",
      };
    } else if (progress < 90) {
      return {
        message: `Analyse visuelle des photos`,
        detail: "Description intelligente des images par l'IA",
        icon: Sparkles,
        color: "#B6D1A3",
      };
    } else if (progress < 100) {
      return {
        message: `Génération du ${formatLabel}`,
        detail: "Mise en page professionnelle avec branding LOCAMEX",
        icon: FileCheck2,
        color: "#5B949A",
      };
    } else {
      return {
        message: "Traitement terminé !",
        detail: `Votre rapport ${formatLabel} est prêt`,
        icon: CheckCircle2,
        color: "#7CAEB8",
      };
    }
  };

  const stepInfo = getStepInfo();
  const StepIcon = stepInfo.icon;

  // Milestones avec labels mis à jour
  const milestones = [
    { label: "Lecture", threshold: 15 },
    { label: "Extraction", threshold: 30 },
    { label: "Images", threshold: 45 },
    { label: "IA", threshold: 60 },
    { label: "Texte", threshold: 75 },
    { label: "Photos", threshold: 90 },
    { label: formatLabel, threshold: 100 },
  ];

  return (
    <div className="w-full mx-auto">
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
          {/* Icon and message */}
          <div className="flex flex-col items-center space-y-6">
            <motion.div
              className="relative"
              key={stepInfo.message}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="relative"
              >
                <div className="p-6 bg-gradient-to-br from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] rounded-3xl shadow-2xl">
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <StepIcon className="w-10 h-10 text-white" strokeWidth={2} />
                  </motion.div>
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
            </motion.div>

            <div className="text-center space-y-3 max-w-md">
              <AnimatePresence mode="wait">
                <motion.h3
                  key={stepInfo.message}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-bold bg-gradient-to-r from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] bg-clip-text text-transparent"
                >
                  {stepInfo.message}
                </motion.h3>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.p
                  key={stepInfo.detail}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="text-base text-slate-600 dark:text-slate-400 font-medium"
                >
                  {stepInfo.detail}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="px-6 py-3 bg-gradient-to-r from-[#5B949A]/10 via-[#7CAEB8]/10 to-[#B6D1A3]/10 rounded-full border-2 border-[#7CAEB8]/30 backdrop-blur-sm">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-3">
                  <motion.span
                    animate={{
                      scale: [1, 1.3, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-xl"
                  >
                    ⚡
                  </motion.span>
                  L'intelligence artificielle travaille pour vous
                </p>
              </div>
              {/* Animated border */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#7CAEB8]"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className="space-y-3">
            <div className="relative w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
              {/* Animated gradient bar */}
              <motion.div
                className="absolute inset-0 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${state.progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="h-full w-full bg-gradient-to-r from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] relative overflow-hidden shadow-lg">
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Progress percentage */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Progression du traitement
              </span>
              <motion.span
                key={state.progress}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-2xl font-bold bg-gradient-to-r from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] bg-clip-text text-transparent"
              >
                {state.progress}%
              </motion.span>
            </div>
          </div>

          {/* Modern step indicator */}
          <div className="flex items-center justify-center gap-3">
            {milestones.map((milestone, index) => {
              const previousThreshold = index > 0 ? milestones[index - 1].threshold : 0;
              const isCompleted = state.progress >= milestone.threshold;
              const isActive = state.progress >= previousThreshold && state.progress < milestone.threshold;

              return (
                <motion.div
                  key={milestone.label}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: isCompleted || isActive ? 1 : 0.3,
                    scale: isActive ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    scale: {
                      duration: 1.5,
                      repeat: isActive ? Infinity : 0,
                      ease: "easeInOut",
                    },
                  }}
                  className="relative"
                >
                  <div
                    className={`h-2 w-2 rounded-full transition-all ${
                      isCompleted
                        ? "bg-gradient-to-r from-[#5B949A] to-[#7CAEB8] shadow-lg"
                        : isActive
                        ? "bg-gradient-to-r from-[#7CAEB8] to-[#B6D1A3] shadow-lg"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  />
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#7CAEB8] to-[#B6D1A3]"
                      animate={{
                        scale: [1, 2.5, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
