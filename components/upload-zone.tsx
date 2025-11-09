"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

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
      <div className="w-full max-w-2xl mx-auto">
        <div className="border-2 border-[#0066CC] rounded-lg p-6 bg-[#F5F5F5]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[#0066CC] rounded-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-medium text-[#2C3E50]">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            {!disabled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFile}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all",
          isDragActive
            ? "border-[#0066CC] bg-blue-50"
            : "border-[#CCCCCC] hover:border-[#0066CC] hover:bg-[#F5F5F5]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-[#0066CC] rounded-full">
            <Upload className="w-12 h-12 text-white" />
          </div>
          <div>
            <p className="text-xl font-semibold text-[#2C3E50] mb-2">
              {isDragActive
                ? "Déposez le fichier ici"
                : "Déposez votre rapport Word ici"}
            </p>
            <p className="text-sm text-gray-500">
              ou cliquez pour parcourir vos fichiers
            </p>
          </div>
          <div className="text-xs text-gray-400">
            Format accepté : .docx uniquement • Taille max : 10 MB
          </div>
        </div>
      </div>
    </div>
  );
}
