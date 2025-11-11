"use client";

import { Loader2, Sparkles, FileSearch, Wand2, FileCheck2 } from "lucide-react";
import { ProcessingState } from "@/types";
import { motion } from "framer-motion";

interface ProcessingStatusProps {
  state: ProcessingState;
}

export function ProcessingStatus({ state }: ProcessingStatusProps) {
  const getStepInfo = () => {
    const progress = state.progress;

    // Étapes détaillées basées sur la progression réelle
    if (progress < 15) {
      return {
        message: "Lecture du fichier Word...",
        detail: "Ouverture et analyse du document",
        icon: FileSearch,
        color: "#5B949A",
      };
    } else if (progress < 30) {
      return {
        message: "Extraction des données...",
        detail: "Récupération du texte et des métadonnées",
        icon: FileSearch,
        color: "#7CAEB8",
      };
    } else if (progress < 45) {
      return {
        message: "Récupération des images...",
        detail: "Analyse et optimisation des photos",
        icon: FileSearch,
        color: "#B6D1A3",
      };
    } else if (progress < 60) {
      return {
        message: "Correction des erreurs...",
        detail: "Intelligence artificielle en action",
        icon: Wand2,
        color: "#5B949A",
      };
    } else if (progress < 75) {
      return {
        message: "Amélioration du texte...",
        detail: "Vérification orthographique et grammaticale",
        icon: Wand2,
        color: "#7CAEB8",
      };
    } else if (progress < 90) {
      return {
        message: "Génération du PDF...",
        detail: "Mise en page professionnelle LOCAMEX",
        icon: FileCheck2,
        color: "#B6D1A3",
      };
    } else if (progress < 100) {
      return {
        message: "Finalisation de votre rapport...",
        detail: "Dernières touches et optimisation",
        icon: Sparkles,
        color: "#5B949A",
      };
    } else {
      return {
        message: "Traitement terminé !",
        detail: "Votre rapport est prêt",
        icon: Sparkles,
        color: "#7CAEB8",
      };
    }
  };

  const stepInfo = getStepInfo();
  const StepIcon = stepInfo.icon;

  return (
    <div className="w-full mx-auto">
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-lg">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#5B949A]/5 via-[#7CAEB8]/5 to-[#B6D1A3]/5"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <div className="relative z-10 space-y-6">
          {/* Icon and message */}
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="relative"
            >
              <div className="p-4 bg-gradient-to-br from-[#5B949A] to-[#7CAEB8] rounded-2xl shadow-xl">
                <StepIcon className="w-8 h-8 text-white" />
              </div>
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#5B949A] to-[#7CAEB8] rounded-2xl blur-xl opacity-50"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            <div className="text-center space-y-2">
              <motion.p
                key={stepInfo.message}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-bold bg-gradient-to-r from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] bg-clip-text text-transparent"
              >
                {stepInfo.message}
              </motion.p>
              <motion.p
                key={stepInfo.detail}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-slate-600 dark:text-slate-400"
              >
                {stepInfo.detail}
              </motion.p>
            </div>

            {/* Merci de patienter message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="px-4 py-2 bg-gradient-to-r from-[#5B949A]/10 via-[#7CAEB8]/10 to-[#B6D1A3]/10 rounded-full border border-[#7CAEB8]/20"
            >
              <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-2">
                <motion.span
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  ⏳
                </motion.span>
                Merci de patienter, l'IA travaille pour vous...
              </p>
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              {/* Animated gradient bar */}
              <motion.div
                className="absolute inset-0 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${state.progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="h-full w-full bg-gradient-to-r from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] relative overflow-hidden">
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Progress percentage */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Progression
              </span>
              <motion.span
                key={state.progress}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="font-bold bg-gradient-to-r from-[#5B949A] to-[#7CAEB8] bg-clip-text text-transparent"
              >
                {state.progress}%
              </motion.span>
            </div>
          </div>

          {/* Steps indicator - Visual milestones */}
          <div className="flex items-center justify-between gap-2 px-4">
            {[
              { label: "Lecture", threshold: 15 },
              { label: "Extraction", threshold: 30 },
              { label: "Images", threshold: 45 },
              { label: "Correction", threshold: 60 },
              { label: "Texte", threshold: 75 },
              { label: "PDF", threshold: 90 },
              { label: "Finalisation", threshold: 100 },
            ].map((milestone, index) => {
              const isCompleted = state.progress >= milestone.threshold;
              const isActive =
                state.progress >= (index > 0 ? [0, 15, 30, 45, 60, 75, 90][index] : 0) &&
                state.progress < milestone.threshold;

              return (
                <div key={milestone.label} className="flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{
                      scale: isActive ? [1, 1.2, 1] : 1,
                      opacity: isCompleted || isActive ? 1 : 0.3,
                    }}
                    transition={{
                      scale: {
                        duration: 1,
                        repeat: isActive ? Infinity : 0,
                        ease: "easeInOut",
                      },
                    }}
                    className={`h-2 w-2 rounded-full ${
                      isCompleted
                        ? "bg-gradient-to-r from-[#5B949A] to-[#7CAEB8]"
                        : isActive
                        ? "bg-gradient-to-r from-[#7CAEB8] to-[#B6D1A3]"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-medium transition-all ${
                      isCompleted || isActive
                        ? "text-[#5B949A] dark:text-[#7CAEB8]"
                        : "text-slate-400 dark:text-slate-600"
                    }`}
                  >
                    {milestone.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
