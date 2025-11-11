"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClearFile: () => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function UploadZone({
  onFileSelect,
  selectedFile,
  onClearFile,
  disabled = false,
}: UploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        // Vérifier la taille
        if (file.size > MAX_FILE_SIZE) {
          alert("Le fichier est trop volumineux. Taille maximale : 10 MB");
          return;
        }

        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
    disabled,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  if (selectedFile) {
    return (
      <div className="w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#5B949A]/10 via-[#7CAEB8]/10 to-[#B6D1A3]/10 p-1"
        >
          <div className="relative rounded-2xl bg-white dark:bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="relative p-4 bg-gradient-to-br from-[#5B949A] to-[#7CAEB8] rounded-xl shadow-lg"
                >
                  <FileText className="w-8 h-8 text-white" />
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-[#B6D1A3]" />
                  </motion.div>
                </motion.div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#B6D1A3]/20 text-[#5B949A] rounded-full text-xs font-medium">
                      {formatFileSize(selectedFile.size)}
                    </span>
                    <span className="text-xs">• Prêt à traiter</span>
                  </p>
                </div>
              </div>
              {!disabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFile}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 overflow-hidden",
            isDragActive
              ? "border-[#5B949A] bg-gradient-to-br from-[#5B949A]/10 via-[#7CAEB8]/10 to-[#B6D1A3]/10 shadow-xl"
              : "border-slate-300 dark:border-slate-700 hover:border-[#7CAEB8] hover:shadow-lg bg-white dark:bg-slate-900",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />

          {/* Animated gradient background on drag */}
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-br from-[#5B949A]/5 via-[#7CAEB8]/5 to-[#B6D1A3]/5"
            />
          )}

          <div className="relative z-10 flex flex-col items-center space-y-6">
            <motion.div
              animate={
                isDragActive
                  ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
                  : {}
              }
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="p-6 bg-gradient-to-br from-[#5B949A] to-[#7CAEB8] rounded-2xl shadow-lg relative overflow-hidden">
                <Upload className="w-12 h-12 text-white relative z-10" />
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              </div>
              {/* Floating sparkles */}
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{
                  y: [0, -5, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="w-5 h-5 text-[#B6D1A3]" />
              </motion.div>
            </motion.div>

            <div>
              <motion.p
                className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#5B949A] via-[#7CAEB8] to-[#B6D1A3] bg-clip-text text-transparent"
                animate={isDragActive ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {isDragActive
                  ? "✨ Déposez le fichier maintenant"
                  : "Déposez votre rapport Word ici"}
              </motion.p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                ou cliquez pour parcourir vos fichiers
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
              <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full font-medium">
                .docx uniquement
              </span>
              <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full font-medium">
                Max 10 MB
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
