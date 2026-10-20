"use client";

import React from "react";

interface IosToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

export function IosToggle({
  checked,
  onChange,
  disabled = false,
  label,
  sublabel,
  icon,
}: IosToggleProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-between py-3 px-4 select-none cursor-pointer ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="flex items-center gap-3 pr-2 flex-1 min-w-0">
        {icon && <div className="text-xl flex-shrink-0">{icon}</div>}
        <div className="min-w-0 flex-1">
          {label && (
            <div className="text-[16px] font-medium leading-tight truncate text-white dark:text-white dark:text-opacity-95 dark:font-normal">
              {label}
            </div>
          )}
          {sublabel && (
            <div className="text-[12px] text-zinc-400 dark:text-zinc-400 mt-0.5 truncate">
              {sublabel}
            </div>
          )}
        </div>
      </div>

      {/* iOS Toggle track & thumb */}
      <div
        className={`w-[51px] h-[31px] rounded-full transition-colors duration-250 ease-in-out relative flex-shrink-0 ${
          checked ? "bg-[#34c759]" : "bg-[#39393d] dark:bg-[#39393d]"
        }`}
      >
        <div
          className={`w-[27px] h-[27px] rounded-full bg-white shadow-md absolute top-[2px] left-[2px] transition-transform duration-250 ease-in-out ${
            checked ? "translate-x-[20px]" : "translate-x-0"
          }`}
        />
      </div>
    </div>
  );
}
