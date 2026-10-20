"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface IosSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export function IosSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = "max-h-[88vh]",
}: IosSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      />

      {/* Sheet Content */}
      <div
        className={`relative z-10 w-full ${maxHeight} flex flex-col bg-[#1c1c1e] text-white rounded-t-[28px] border-t border-zinc-700/50 shadow-2xl overflow-hidden pb-safe animate-in slide-in-from-bottom duration-300`}
      >
        {/* iOS Drag Handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-pointer" onClick={onClose}>
          <div className="w-10 h-1.5 rounded-full bg-zinc-500/70" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-2 border-b border-zinc-800/80">
          <div className="min-w-0 flex-1 pr-3">
            {title && (
              <h3 className="text-lg font-semibold tracking-tight text-white truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-zinc-400 truncate mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition-colors ios-tap-active"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
