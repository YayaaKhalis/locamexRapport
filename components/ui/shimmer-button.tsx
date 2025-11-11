"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "rgba(91, 148, 154, 1)",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          boxShadow:
            "0 0 12px rgba(91, 148, 154, 0.5), 0 0 24px rgba(91, 148, 154, 0.3)",
          borderRadius,
          background,
        }}
        className={cn(
          "relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-8 py-4 text-white [background:var(--bg)] [border-radius:var(--radius)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(91,148,154,0.6)]",
          "before:absolute before:inset-0 before:rounded-[100px] before:bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.2)_50%,transparent_70%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:-100%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease]",
          "hover:before:bg-[position:200%_0,0_0] hover:before:[transition-duration:1.5s]",
          "active:scale-95",
          className
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2 text-base font-semibold">
          {children}
        </span>
      </motion.button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";
