"use client";

import React, { useState } from "react";
import { useAdGuard } from "@/context/AdGuardContext";
import { TabType } from "@/components/layout/IosTabBar";
import { Laptop, ShieldX, ChevronRight, Check } from "lucide-react";

interface QuickListsProps {
  onNavigateTab: (tab: TabType) => void;
}

export function QuickLists({ onNavigateTab }: QuickListsProps) {
  const { stats, api, refreshAll } = useAdGuard();
  const [unblockedDomain, setUnblockedDomain] = useState<string | null>(null);

  // Extract top clients
  const topClients = (stats?.top_clients || []).slice(0, 3).map((item) => {
    const [ip, count] = Object.entries(item)[0] || ["Desconocido", 0];
    return { ip, count };
  });

  // Extract top blocked domains
  const topBlocked = (stats?.top_blocked_domains || []).slice(0, 3).map((item) => {
    const [domain, count] = Object.entries(item)[0] || ["Desconocido", 0];
    return { domain, count };
  });

  const handleQuickUnblock = async (domain: string) => {
    try {
      // Add whitelist rule
      const rule = `@@||${domain}^$important`;
      const currentFiltering = await api.getFilteringStatus();
      const existingRules = currentFiltering.user_rules || [];
      if (!existingRules.includes(rule)) {
        await api.setUserRules([...existingRules, rule]);
        setUnblockedDomain(domain);
        setTimeout(() => setUnblockedDomain(null), 3000);
        await refreshAll();
      }
    } catch (e) {
      console.error("Error unblocking domain", e);
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Dispositivos / Clientes */}
      <div className="ios-card overflow-hidden">
        <div
          onClick={() => onNavigateTab("clients")}
          className="flex items-center justify-between p-3.5 border-b border-zinc-800/80 cursor-pointer hover:bg-zinc-800/40 transition-colors ios-tap-active"
        >
          <div className="flex items-center gap-2">
            <Laptop size={15} className="text-[#007aff]" />
            <span className="text-xs font-semibold text-zinc-300">Clientes Activos</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#007aff] font-medium">
            <span>Ver todos</span>
            <ChevronRight size={14} />
          </div>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {topClients.length === 0 ? (
            <div className="p-3 text-xs text-zinc-500 text-center">No hay clientes registrados</div>
          ) : (
            topClients.map((client, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-2.5 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-zinc-500 font-mono w-4">{idx + 1}.</span>
                  <span className="font-medium text-white truncate">{client.ip}</span>
                </div>
                <span className="text-zinc-400 font-medium">
                  {client.count.toLocaleString()} reqs
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Dominios Bloqueados */}
      <div className="ios-card overflow-hidden">
        <div
          onClick={() => onNavigateTab("stats")}
          className="flex items-center justify-between p-3.5 border-b border-zinc-800/80 cursor-pointer hover:bg-zinc-800/40 transition-colors ios-tap-active"
        >
          <div className="flex items-center gap-2">
            <ShieldX size={15} className="text-[#ff453a]" />
            <span className="text-xs font-semibold text-zinc-300">Top Bloqueados</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#007aff] font-medium">
            <span>Estadísticas</span>
            <ChevronRight size={14} />
          </div>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {topBlocked.length === 0 ? (
            <div className="p-3 text-xs text-zinc-500 text-center">No hay dominios bloqueados</div>
          ) : (
            topBlocked.map((item, idx) => {
              const isJustUnblocked = unblockedDomain === item.domain;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-2.5 text-xs gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-zinc-500 font-mono w-4">{idx + 1}.</span>
                    <span className="font-medium text-white truncate">{item.domain}</span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-zinc-400 font-medium">
                      {item.count.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleQuickUnblock(item.domain)}
                      disabled={isJustUnblocked}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-all ios-tap-active ${
                        isJustUnblocked
                          ? "bg-[#34c759]/20 text-[#34c759] border-[#34c759]/40"
                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700/60"
                      }`}
                    >
                      {isJustUnblocked ? (
                        <span className="flex items-center gap-1">
                          <Check size={11} /> Desbloqueado
                        </span>
                      ) : (
                        "Desbloquear"
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
