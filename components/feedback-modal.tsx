"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, MessageSquare, Lightbulb, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorInfo?: {
    message: string;
    stack?: string;
  };
}

export function FeedbackModal({ isOpen, onClose, errorInfo }: FeedbackModalProps) {
  const [type, setType] = useState<"bug" | "suggestion" | "question">("bug");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      setError("Veuillez décrire le problème");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          description,
          email,
          errorInfo,
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setDescription("");
        setEmail("");
      }, 2000);
    } catch (err) {
      setError("Impossible d'envoyer le message. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { value: "bug", label: "Bug / Erreur", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
    { value: "suggestion", label: "Suggestion", icon: Lightbulb, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { value: "question", label: "Question", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* Modal Container - Scrollable */}
          <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto py-8 px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full relative pointer-events-auto"
            >
              {success ? (
                // Success State
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Message envoyé !
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Merci pour votre retour. Nous allons examiner cela rapidement.
                  </p>
                </div>
              ) : (
                // Form State
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        Signaler un problème
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Version BETA - Votre feedback est précieux
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Type Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        Type de message
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {typeOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setType(option.value as any)}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                type === option.value
                                  ? `${option.bg} border-current ${option.color}`
                                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                              }`}
                            >
                              <Icon className={`w-6 h-6 mx-auto mb-2 ${type === option.value ? option.color : "text-slate-400"}`} />
                              <p className={`text-xs font-medium ${type === option.value ? option.color : "text-slate-600 dark:text-slate-400"}`}>
                                {option.label}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Error Info (if present) */}
                    {errorInfo && (
                      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                          Erreur détectée :
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 font-mono">
                          {errorInfo.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                          Cette erreur sera automatiquement incluse dans votre message
                        </p>
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Description du problème *
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Décrivez le problème rencontré, ce que vous attendiez, et les étapes pour le reproduire..."
                        className="w-full h-32 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B949A] resize-none"
                        required
                      />
                    </div>

                    {/* Email (optional) */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Email (optionnel)
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B949A]"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Pour que nous puissions vous répondre si nécessaire
                      </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={loading}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-[#5B949A] hover:bg-[#4A7B80] text-white"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Envoi...
                          </>
                        ) : (
                          "Envoyer"
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
