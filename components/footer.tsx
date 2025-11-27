"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 mt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Logo LOCAMEX */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5B949A] to-[#7CAEB8] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">LOCAMEX</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              &copy; 2025 LOCAMEX
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              www.locamex.org<br />
              contact@locamex.org<br />
              +70 agences en Europe
            </p>
          </div>

          {/* Navigation rapide */}
          <div className="text-center">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">
              Navigation
            </h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <Link href="/" className="block hover:text-[#5B949A] transition-colors">
                Accueil
              </Link>
              <Link href="/stats" className="block hover:text-[#5B949A] transition-colors">
                Statistiques API
              </Link>
              <a
                href="https://www.matixweb.fr/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-[#5B949A] transition-colors"
              >
                Signaler un problème
              </a>
            </div>
          </div>

          {/* Propulsé par MatixWeb */}
          <div className="text-center md:text-right">
            <div className="inline-block">
              <div className="rounded-2xl bg-blue-500/5 p-6 border border-blue-500/10 backdrop-blur-sm">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  Propulsé par
                </p>
                <a
                  href="https://www.matixweb.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:opacity-80 transition-opacity"
                >
                  <Image
                    src="https://www.matixweb.fr/Matixweb-Digital-Solution-Dark.svg"
                    alt="MatixWeb Digital Solution"
                    width={180}
                    height={40}
                    className="mx-auto"
                    priority
                  />
                </a>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                  Solutions digitales professionnelles
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Tous droits réservés • Application développée avec{" "}
            <span className="text-red-500">♥</span> par{" "}
            <a
              href="https://www.matixweb.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5B949A] hover:underline font-medium"
            >
              MatixWeb
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
