"use client";

import { Loader2 } from "lucide-react";
import { ProcessingState } from "@/types";
import { Card, CardContent } from "./ui/card";

interface ProcessingStatusProps {
  state: ProcessingState;
}

export function ProcessingStatus({ state }: ProcessingStatusProps) {
  const getStepMessage = () => {
    switch (state.step) {
      case "uploading":
        return "Envoi du fichier...";
      case "extracting":
        return "Extraction du contenu Word...";
      case "correcting":
        return "Correction orthographique avec IA...";
      case "generating":
        return "Génération du PDF professionnel...";
      case "completed":
        return "Finalisation...";
      default:
        return state.message || "Traitement en cours...";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="w-6 h-6 text-[#0066CC] animate-spin" />
            <p className="text-lg font-medium text-[#2C3E50]">
              {getStepMessage()}
            </p>
          </div>

          {/* Barre de progression */}
          <div className="w-full bg-[#F5F5F5] rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0066CC] to-[#00A3E0] transition-all duration-500 ease-out"
              style={{ width: `${state.progress}%` }}
            />
          </div>

          <p className="text-center text-sm text-gray-500">
            {state.progress}% complété
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
