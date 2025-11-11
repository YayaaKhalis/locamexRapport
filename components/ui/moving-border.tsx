"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MovingBorder({
  children,
  duration = 2000,
  rx,
  ry,
  className,
  borderRadius = "1.5rem",
  ...otherProps
}: {
  children: React.ReactNode;
  duration?: number;
  rx?: string;
  ry?: string;
  className?: string;
  borderRadius?: string;
  [key: string]: any;
}) {
  return (
    <div
      className={cn(
        "relative bg-transparent p-[1px] overflow-hidden",
        className
      )}
      style={{
        borderRadius: borderRadius,
      }}
      {...otherProps}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, #5B949A, #7CAEB8, #B6D1A3, #7CAEB8, #5B949A)`,
          backgroundSize: "400% 100%",
          borderRadius: borderRadius,
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: duration / 1000,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div
        className="relative bg-white dark:bg-slate-900 p-4"
        style={{
          borderRadius: `calc(${borderRadius} * 0.96)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export const MovingBorderButton = ({
  borderRadius = "1.75rem",
  children,
  as: Component = "button",
  containerClassName,
  borderClassName,
  duration,
  className,
  ...otherProps
}: {
  borderRadius?: string;
  children: React.ReactNode;
  as?: any;
  containerClassName?: string;
  borderClassName?: string;
  duration?: number;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <Component
      className={cn(
        "relative text-xl h-16 w-full p-[1px] overflow-hidden",
        containerClassName
      )}
      style={{
        borderRadius: borderRadius,
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, #5B949A, #7CAEB8, #B6D1A3, #7CAEB8, #5B949A)`,
          backgroundSize: "400% 100%",
          borderRadius: borderRadius,
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: (duration || 2000) / 1000,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div
        className={cn(
          "relative bg-slate-900/[0.8] border border-slate-800 backdrop-blur-xl text-white flex items-center justify-center w-full h-full text-sm antialiased font-medium",
          className
        )}
        style={{
          borderRadius: `calc(${borderRadius} * 0.96)`,
        }}
      >
        {children}
      </div>
    </Component>
  );
};
