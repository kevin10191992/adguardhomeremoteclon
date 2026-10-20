"use client";

import React from "react";

interface Option<T> {
  value: T;
  label: string;
}

interface IosSegmentedControlProps<T> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function IosSegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  className = "",
}: IosSegmentedControlProps<T>) {
  return (
    <div
      className={`flex p-1 bg-[#1c1c1e] dark:bg-[#1c1c1e] rounded-xl border border-zinc-800/80 relative select-none ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-1.5 px-3 text-center text-xs font-semibold rounded-lg transition-all duration-200 ios-tap-active ${
              isSelected
                ? "bg-[#2c2c2e] text-white shadow-sm font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
