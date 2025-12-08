"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, CheckCircle2, X, RefreshCw, Sparkles } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Button } from "@/components/ui/button";

interface DownloadModalProps {
  isOpen: boolean;
  onDownloadPdf: () => void;
  onDownloadDocx: () => void;
  hasDocx: boolean;
  onClose: () => void;
  onNewReport: () => void;
}

export function DownloadModal({
  isOpen,
  onDownloadPdf,
  onDownloadDocx,
  hasDocx,
  onClose,
  onNewReport,
}: DownloadModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-lg"
            >
              {/* Success fireworks effect */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i * Math.PI * 2) / 12) * 100,
                    y: Math.sin((i * Math.PI * 2) / 12) * 100,
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.2,
                    ease: "easeOut",
                  }}
                  className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, #5B949A, #B6D1A3)`,
                  }}
                />
              ))}

              {/* Card */}
              <div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>

                {/* Success gradient bar */}
                <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500" />

                {/* Content */}
                <div className="p-8 lg:p-10">
                  {/* Success icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", duration: 0.8, delay: 0.1 }}
                    className="flex justify-center mb-6"
                  >
                    <div className="relative">
                      {/* Glow */}
                      <div className="absolute inset-0 blur-3xl bg-green-500 opacity-30 rounded-full scale-150" />

                      {/* Icon */}
                      <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 shadow-xl">
                        <CheckCircle2 className="w-16 h-16 text-white" />
                      </div>

                      {/* Pulse ring */}
                      <motion.div
                        className="absolute inset-0 border-4 border-green-500 rounded-3xl"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                    </div>
                  </motion.div>

                  {/* Title */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-6"
                  >
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                      C'est prêt ! 🎉
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      Votre rapport professionnel est prêt à télécharger
                    </p>
                  </motion.div>

                  {/* PDF Preview Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                  >
                    <div className="relative group">
                      {/* Gradient border effect */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />

                      {/* Card content */}
                      <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                          {/* PDF Icon */}
                          <div className="relative flex-shrink-0">
                            <div className="bg-gradient-to-br from-[#5B949A] to-[#7CAEB8] rounded-xl p-3 shadow-lg">
                              <FileText className="w-8 h-8 text-white" />
                            </div>
                            <motion.div
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0.8, 0.5],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                              }}
                              className="absolute inset-0 rounded-xl bg-[#5B949A] opacity-30 blur-lg"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              Rapport LOCAMEX
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                PDF professionnel
                              </span>
                              <span className="text-slate-400">•</span>
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30">
                                <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                  Prêt
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Action buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3"
                  >
                    {/* Bouton PDF Principal */}
                    <ShimmerButton
                      onClick={onDownloadPdf}
                      className="w-full h-14 text-base"
                    >
                      <Download className="w-5 h-5" />
                      Télécharger le PDF
                    </ShimmerButton>

                    {/* Bouton DOCX (si disponible) */}
                    {hasDocx && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Button
                          onClick={onDownloadDocx}
                          variant="outline"
                          size="lg"
                          className="w-full h-12 border-2 border-[#7CAEB8] hover:bg-[#7CAEB8]/10 gap-2"
                        >
                          <FileText className="w-5 h-5 text-[#7CAEB8]" />
                          <span className="text-[#7CAEB8] font-semibold">
                            Télécharger le DOCX (modifiable)
                          </span>
                        </Button>
                      </motion.div>
                    )}

                    <Button
                      onClick={onNewReport}
                      variant="secondary"
                      size="lg"
                      className="w-full h-12 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Traiter un autre rapport
                    </Button>
                  </motion.div>

                  {/* Footer badges */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 flex flex-wrap justify-center gap-2"
                  >
                    {[
                      "✓ Corrigé par IA",
                      "✓ Mise en page pro",
                      "✓ Branding LOCAMEX"
                    ].map((badge, i) => (
                      <div
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5B949A]/10 border border-[#5B949A]/20"
                      >
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {badge}
                        </span>
                      </div>
                    ))}
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
