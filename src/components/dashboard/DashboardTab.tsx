"use client";

import React, { useState } from "react";
import { ServerStatusCard } from "./ServerStatusCard";
import { MetricCards } from "./MetricCards";
import { MasterSwitches } from "./MasterSwitches";
import { ActivitySparkline } from "./ActivitySparkline";
import { QuickLists } from "./QuickLists";
import { TabType } from "@/components/layout/IosTabBar";
import { useAdGuard } from "@/context/AdGuardContext";
import { InstancesManager } from "@/components/settings/InstancesManager";
import { ShieldCheck, Plus, Server } from "lucide-react";

interface DashboardTabProps {
  onNavigateTab: (tab: TabType) => void;
}

export function DashboardTab({ onNavigateTab }: DashboardTabProps) {
  const { status, activeInstance } = useAdGuard();
  const [isInstancesOpen, setIsInstancesOpen] = useState(false);

  const hasConfiguredServer = !!status || !!activeInstance.url;

  return (
    <div className="space-y-4 pb-safe-tab animate-in fade-in duration-200">
      {/* If no server configured yet, show a friendly onboarding card */}
      {!hasConfiguredServer && (
        <div className="ios-card p-6 text-center space-y-3.5 border-[#34c759]/40 bg-gradient-to-b from-zinc-900 to-black">
          <div className="w-14 h-14 rounded-2xl bg-[#34c759]/20 text-[#34c759] flex items-center justify-center mx-auto shadow-lg shadow-[#34c759]/10">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Conecta tu AdGuard Home</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Introduce la dirección de tu servidor AdGuard Home para monitorizar consultas y controlar el filtrado en tiempo real.
            </p>
          </div>
          <button
            onClick={() => setIsInstancesOpen(true)}
            className="py-2.5 px-5 rounded-xl bg-[#34c759] hover:bg-[#2fb34f] text-black font-bold text-xs shadow-lg shadow-[#34c759]/20 ios-tap-active inline-flex items-center gap-1.5 transition-all"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Configurar Conexión</span>
          </button>
        </div>
      )}

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

      {/* Instances Manager Modal */}
      <InstancesManager
        isOpen={isInstancesOpen}
        onClose={() => setIsInstancesOpen(false)}
      />
    </div>
  );
}
