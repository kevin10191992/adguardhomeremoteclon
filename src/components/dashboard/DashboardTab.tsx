"use client";

import React from "react";
import { ServerStatusCard } from "./ServerStatusCard";
import { MetricCards } from "./MetricCards";
import { MasterSwitches } from "./MasterSwitches";
import { ActivitySparkline } from "./ActivitySparkline";
import { QuickLists } from "./QuickLists";
import { TabType } from "@/components/layout/IosTabBar";

interface DashboardTabProps {
  onNavigateTab: (tab: TabType) => void;
}

export function DashboardTab({ onNavigateTab }: DashboardTabProps) {
  return (
    <div className="space-y-4 pb-safe-tab animate-in fade-in duration-200">
      {/* 1. Server Status Card */}
      <ServerStatusCard />

      {/* 2. Key Metrics Grid */}
      <MetricCards />

      {/* 3. 5 Master Switches */}
      <div>
        <div className="text-xs uppercase font-semibold text-zinc-500 tracking-wider px-2 mb-1.5">
          Controles Rápidos
        </div>
        <MasterSwitches />
      </div>

      {/* 4. 24h Activity Graph */}
      <ActivitySparkline />

      {/* 5. Quick Lists (Top Clients & Top Blocked) */}
      <QuickLists onNavigateTab={onNavigateTab} />
    </div>
  );
}
