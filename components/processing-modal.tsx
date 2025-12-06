"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ProcessingState } from "@/types";
import { CheckCircle2, Sparkles, Zap, FileCheck, Wand2 } from "lucide-react";

interface ProcessingModalProps {
  isOpen: boolean;
  state: ProcessingState;
}

const steps = [
  { key: "uploading", label: "Lecture", icon: FileCheck },
  { key: "extracting", label: "Extraction", icon: Sparkles },
  { key: "correcting", label: "Correction IA", icon: Wand2 },
  { key: "generating", label: "Génération PDF", icon: Zap },
];

export function ProcessingModal({ isOpen, state }: ProcessingModalProps) {
  const currentStepIndex = steps.findIndex(step => state.step.includes(step.key));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-2xl"
            >
              {/* Card */}
              <div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                {/* Animated gradient bar on top */}
                <div className="h-1 bg-gradient-to-r from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-white/30"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12">
                  {/* Progress percentage */}
                  <div className="text-center mb-8">
                    <motion.div
                      key={state.progress}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-baseline gap-1"
                    >
                      <span className="text-7xl font-bold bg-gradient-to-br from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] bg-clip-text text-transparent">
                        {state.progress}
                      </span>
                      <span className="text-3xl font-semibold text-slate-400">%</span>
                    </motion.div>
                    <motion.p
                      key={state.message}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-slate-600 dark:text-slate-400 text-lg font-medium"
                    >
                      {state.message}
                    </motion.p>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-10">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] rounded-full relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${state.progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        {/* Shine effect */}
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
                      </motion.div>
                    </div>
                  </div>

                  {/* Steps timeline */}
                  <div className="grid grid-cols-4 gap-4">
                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = index === currentStepIndex;
                      const isCompleted = index < currentStepIndex;

                      return (
                        <motion.div
                          key={step.key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex flex-col items-center gap-3"
                        >
                          {/* Icon */}
                          <motion.div
                            animate={{
                              scale: isActive ? [1, 1.1, 1] : 1,
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: isActive ? Infinity : 0,
                            }}
                            className={`
                              relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
                              ${isActive
                                ? 'bg-gradient-to-br from-[#5B949A] to-[#7CAEB8] shadow-lg shadow-[#5B949A]/30'
                                : isCompleted
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                : 'bg-slate-200 dark:bg-slate-700'
                              }
                            `}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            ) : (
                              <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            )}

                            {/* Active glow */}
                            {isActive && (
                              <motion.div
                                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#5B949A] to-[#7CAEB8] opacity-50 blur-xl"
                                animate={{
                                  scale: [1, 1.3, 1],
                                  opacity: [0.5, 0.8, 0.5],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                }}
                              />
                            )}
                          </motion.div>

                          {/* Label */}
                          <span className={`
                            text-xs font-medium text-center transition-colors
                            ${isActive
                              ? 'text-slate-800 dark:text-slate-200'
                              : 'text-slate-500 dark:text-slate-400'
                            }
                          `}>
                            {step.label}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Fun fact or tip */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-10 text-center"
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5B949A]/10 border border-[#5B949A]/20">
                      <Sparkles className="w-4 h-4 text-[#5B949A]" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Notre IA analyse et corrige votre rapport en temps réel
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
