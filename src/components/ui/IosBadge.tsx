"use client";

import React from "react";

export type BadgeVariant =
  | "allowed"
  | "blocked"
  | "filtered"
  | "rewritten"
  | "safebrowsing"
  | "parental"
  | "neutral";

interface IosBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}

export function IosBadge({
  variant = "neutral",
  children,
  className = "",
  size = "sm",
}: IosBadgeProps) {
  const styles: Record<BadgeVariant, string> = {
    allowed: "bg-[#34c759]/15 text-[#34c759] border-[#34c759]/30",
    blocked: "bg-[#ff3b30]/15 text-[#ff453a] border-[#ff3b30]/30",
    filtered: "bg-[#ff9500]/15 text-[#ff9f0a] border-[#ff9500]/30",
    rewritten: "bg-[#af52de]/15 text-[#bf5af2] border-[#af52de]/30",
    safebrowsing: "bg-[#ff3b30]/15 text-[#ff453a] border-[#ff3b30]/30",
    parental: "bg-[#5ac8fa]/15 text-[#64d2ff] border-[#5ac8fa]/30",
    neutral: "bg-zinc-800/60 text-zinc-300 border-zinc-700/40",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] font-medium tracking-tight",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border ${styles[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}
