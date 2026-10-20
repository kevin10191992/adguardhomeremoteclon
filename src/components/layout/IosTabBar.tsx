"use client";

import React from "react";
import {
  LayoutDashboard,
  BarChart2,
  ScrollText,
  Users,
  Settings,
} from "lucide-react";

export type TabType = "dashboard" | "stats" | "querylog" | "clients" | "settings";

interface IosTabBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function IosTabBar({ currentTab, onTabChange }: IosTabBarProps) {
  const tabs = [
    {
      id: "dashboard" as TabType,
      label: "Panel",
      icon: LayoutDashboard,
    },
    {
      id: "stats" as TabType,
      label: "Estadísticas",
      icon: BarChart2,
    },
    {
      id: "querylog" as TabType,
      label: "Registro",
      icon: ScrollText,
    },
    {
      id: "clients" as TabType,
      label: "Clientes",
      icon: Users,
    },
    {
      id: "settings" as TabType,
      label: "Ajustes",
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 ios-blur-dark border-t border-zinc-800/80 pb-safe pt-2">
      <div className="flex items-center justify-around max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-1 transition-all select-none ios-tap-active"
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.4 : 1.8}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-[#34c759]" : "text-zinc-500"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 transition-colors duration-200 ${
                  isActive ? "text-[#34c759] font-bold" : "text-zinc-500"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
