"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface AuroraBackgroundProps {
  children: ReactNode;
  showRadialGradient?: boolean;
  className?: string;
}

export const AuroraBackground = ({
  children,
  showRadialGradient = true,
  className = "",
}: AuroraBackgroundProps) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

        {/* Radial gradient overlay */}
        {showRadialGradient && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(91,148,154,0.15),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(182,209,163,0.15),transparent_50%)]" />
        )}

        {/* Aurora effect 1 */}
        <motion.div
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-[#5B949A]/30 via-[#7CAEB8]/30 to-transparent rounded-full blur-3xl"
        />

        {/* Aurora effect 2 */}
        <motion.div
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-l from-[#B6D1A3]/30 via-[#7CAEB8]/20 to-transparent rounded-full blur-3xl"
        />

        {/* Aurora effect 3 */}
        <motion.div
          initial={{ opacity: 0.2 }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-t from-[#7CAEB8]/20 to-transparent rounded-full blur-3xl"
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
