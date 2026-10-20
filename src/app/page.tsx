"use client";

import React, { useState } from "react";
import { IosHeader } from "@/components/layout/IosHeader";
import { IosTabBar, TabType } from "@/components/layout/IosTabBar";
import { DashboardTab } from "@/components/dashboard/DashboardTab";
import { StatsTab } from "@/components/stats/StatsTab";
import { QueryLogTab } from "@/components/querylog/QueryLogTab";
import { ClientsTab } from "@/components/clients/ClientsTab";
import { SettingsTab } from "@/components/settings/SettingsTab";
import { InstallPrompt } from "@/components/layout/InstallPrompt";
import { useAdGuard } from "@/context/AdGuardContext";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<TabType>("dashboard");
  const { lastError, refreshAll, isRefreshing } = useAdGuard();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between max-w-lg mx-auto relative shadow-2xl">
      {/* Top Header */}
      <IosHeader />

      {/* Connection Error Banner if any */}
      {lastError && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-start gap-2.5">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-red-300">Aviso de Conexión</div>
            <div className="text-[11px] text-red-200/80 mt-0.5 leading-relaxed">
              {lastError}
            </div>
            <button
              onClick={() => refreshAll()}
              className="mt-2 text-[11px] font-semibold text-red-300 bg-red-900/50 hover:bg-red-900/70 px-2.5 py-1 rounded-lg border border-red-500/30 transition-all flex items-center gap-1.5"
            >
              <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
              <span>Reintentar</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 px-4 pt-3">
        {currentTab === "dashboard" && <DashboardTab onNavigateTab={setCurrentTab} />}
        {currentTab === "stats" && <StatsTab />}
        {currentTab === "querylog" && <QueryLogTab />}
        {currentTab === "clients" && <ClientsTab />}
        {currentTab === "settings" && <SettingsTab />}
      </main>

      {/* Bottom Tab Bar */}
      <IosTabBar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* PWA Install Banner & iOS Modal */}
      <InstallPrompt />
    </div>
  );
}
