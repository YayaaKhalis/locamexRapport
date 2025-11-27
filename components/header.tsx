"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Menu, X, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FeedbackModal } from "@/components/feedback-modal";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo LOCAMEX */}
          <Link href="/">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5B949A] to-[#7CAEB8] flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-[#5B949A] to-[#7CAEB8] bg-clip-text text-transparent">
                    LOCAMEX
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full">
                    BETA
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Expert en recherche de fuites
                </p>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Button
              variant="outline"
              onClick={() => setFeedbackModalOpen(true)}
              className="border-[#5B949A] text-[#5B949A] hover:bg-[#5B949A] hover:text-white transition-all flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Signaler un problème
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pb-4 space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4"
          >
            <button
              onClick={() => {
                setFeedbackModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full block px-4 py-2 rounded-lg bg-[#5B949A]/10 text-[#5B949A] font-medium text-center"
            >
              Signaler un problème
            </button>
          </motion.nav>
        )}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
      />
    </header>
  );
}
