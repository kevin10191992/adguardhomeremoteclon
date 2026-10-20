"use client";

import React, { useState } from "react";
import { useAdGuard } from "@/context/AdGuardContext";
import { IosSegmentedControl } from "@/components/ui/IosSegmentedControl";
import { Globe, ShieldX, Users, Server, Shield, Check, Ban } from "lucide-react";

export function StatsTab() {
  const { stats, api, refreshAll } = useAdGuard();
  const [timeframe, setTimeframe] = useState<string>("24h");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const totalQueries = stats?.num_dns_queries || 1;

  // Formatting Top Queried
  const topQueried = (stats?.top_queried_domains || []).slice(0, 15).map((item) => {
    const [domain, count] = Object.entries(item)[0] || ["", 0];
    const pct = ((count / totalQueries) * 100).toFixed(1);
    return { domain, count, pct };
  });

  // Formatting Top Blocked
  const topBlocked = (stats?.top_blocked_domains || []).slice(0, 15).map((item) => {
    const [domain, count] = Object.entries(item)[0] || ["", 0];
    const pct = ((count / (stats?.num_blocked_filtering || 1)) * 100).toFixed(1);
    return { domain, count, pct };
  });

  // Formatting Top Clients
  const topClients = (stats?.top_clients || []).slice(0, 15).map((item) => {
    const [client, count] = Object.entries(item)[0] || ["", 0];
    const pct = ((count / totalQueries) * 100).toFixed(1);
    return { client, count, pct };
  });

  // Formatting Upstreams
  const upstreams = (stats?.top_upstreams_responses || []).map((item) => {
    const [server, count] = Object.entries(item)[0] || ["", 0];
    // Find avg time if present
    const avgEntry = (stats?.top_upstreams_avg_time || []).find(
      (a) => Object.keys(a)[0] === server
    );
    const avgSec = avgEntry ? Object.values(avgEntry)[0] : 0;
    const avgMs = (avgSec * 1000).toFixed(1);
    return { server, count, avgMs };
  });

  // Action: Block a queried domain
  const handleBlockDomain = async (domain: string) => {
    try {
      const rule = `||${domain}^`;
      const current = await api.getFilteringStatus();
      const existing = current.user_rules || [];
      if (!existing.includes(rule)) {
        await api.setUserRules([...existing, rule]);
        setActionSuccess(`Bloqueado: ${domain}`);
        setTimeout(() => setActionSuccess(null), 3000);
        await refreshAll();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Whitelist a blocked domain
  const handleWhitelistDomain = async (domain: string) => {
    try {
      const rule = `@@||${domain}^$important`;
      const current = await api.getFilteringStatus();
      const existing = current.user_rules || [];
      if (!existing.includes(rule)) {
        await api.setUserRules([...existing, rule]);
        setActionSuccess(`Permitido: ${domain}`);
        setTimeout(() => setActionSuccess(null), 3000);
        await refreshAll();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Render a visual Bar Chart for Queries Over Time
  const querySeries = stats?.dns_queries || [];
  const blockedSeries = stats?.blocked_filtering || [];
  const maxBar = Math.max(...querySeries, 10);

  return (
    <div className="space-y-4 pb-safe-tab animate-in fade-in duration-200">
      {/* Timeframe Selector */}
      <IosSegmentedControl
        options={[
          { value: "24h", label: "24 Horas" },
          { value: "7d", label: "7 Días" },
          { value: "30d", label: "30 Días" },
          { value: "90d", label: "90 Días" },
        ]}
        value={timeframe}
        onChange={(val) => setTimeframe(val)}
      />

      {/* Toast Notification */}
      {actionSuccess && (
        <div className="p-2.5 rounded-xl bg-[#34c759]/20 border border-[#34c759]/50 text-xs text-[#34c759] flex items-center gap-2 font-medium">
          <Check size={14} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Bar Chart: Allowed vs Blocked */}
      <div className="ios-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-zinc-300">
            Consultas DNS por Periodo
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#34c759]" />
              <span className="text-zinc-400">Permitidas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#ff3b30]" />
              <span className="text-zinc-400">Bloqueadas</span>
            </div>
          </div>
        </div>

        {/* Dynamic Mobile CSS/SVG Chart */}
        <div className="h-32 flex items-end gap-1 pt-4 pb-1">
          {querySeries.slice(-24).map((total, idx) => {
            const blocked = blockedSeries[idx] || 0;
            const allowed = Math.max(0, total - blocked);

            const totalHeightPct = Math.min(100, Math.max(4, (total / maxBar) * 100));
            const blockedHeightPct = total > 0 ? (blocked / total) * totalHeightPct : 0;
            const allowedHeightPct = totalHeightPct - blockedHeightPct;

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col justify-end h-full group relative"
              >
                <div
                  className="w-full bg-[#ff3b30] rounded-t-sm"
                  style={{ height: `${blockedHeightPct}%` }}
                />
                <div
                  className="w-full bg-[#34c759]"
                  style={{ height: `${allowedHeightPct}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-zinc-500 mt-2 font-mono">
          <span>Hace 24h</span>
          <span>Hace 12h</span>
          <span>Ahora</span>
        </div>
      </div>

      {/* 1. Top Queried Domains */}
      <div className="ios-card overflow-hidden">
        <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-[#007aff]" />
            <span className="text-xs font-semibold text-zinc-200">
              Top Dominios Consultados ({topQueried.length})
            </span>
          </div>
        </div>
        <div className="divide-y divide-zinc-800/60 max-h-80 overflow-y-auto no-scrollbar">
          {topQueried.map((item, idx) => (
            <div
              key={idx}
              className="p-3 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="text-zinc-500 font-mono text-[11px] w-5">
                  {idx + 1}.
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-white truncate">{item.domain}</div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-[#007aff] h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.max(2, parseFloat(item.pct)))}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                  <div className="font-semibold text-white">
                    {item.count.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-zinc-400">{item.pct}%</div>
                </div>
                <button
                  onClick={() => handleBlockDomain(item.domain)}
                  title="Bloquear Dominio"
                  className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-all ios-tap-active border border-zinc-700/50"
                >
                  <Ban size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Top Blocked Domains */}
      <div className="ios-card overflow-hidden">
        <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldX size={16} className="text-[#ff453a]" />
            <span className="text-xs font-semibold text-zinc-200">
              Top Dominios Bloqueados ({topBlocked.length})
            </span>
          </div>
        </div>
        <div className="divide-y divide-zinc-800/60 max-h-80 overflow-y-auto no-scrollbar">
          {topBlocked.map((item, idx) => (
            <div
              key={idx}
              className="p-3 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="text-zinc-500 font-mono text-[11px] w-5">
                  {idx + 1}.
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-white truncate">{item.domain}</div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-[#ff453a] h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.max(2, parseFloat(item.pct)))}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                  <div className="font-semibold text-[#ff453a]">
                    {item.count.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-zinc-400">{item.pct}%</div>
                </div>
                <button
                  onClick={() => handleWhitelistDomain(item.domain)}
                  title="Permitir / Desbloquear"
                  className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-emerald-950/60 text-zinc-400 hover:text-emerald-400 flex items-center justify-center transition-all ios-tap-active border border-zinc-700/50"
                >
                  <Shield size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Top Clients */}
      <div className="ios-card overflow-hidden">
        <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#34c759]" />
            <span className="text-xs font-semibold text-zinc-200">
              Top Dispositivos / Clientes ({topClients.length})
            </span>
          </div>
        </div>
        <div className="divide-y divide-zinc-800/60 max-h-80 overflow-y-auto no-scrollbar">
          {topClients.map((item, idx) => (
            <div
              key={idx}
              className="p-3 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="text-zinc-500 font-mono text-[11px] w-5">
                  {idx + 1}.
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-white truncate">{item.client}</div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-[#34c759] h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.max(2, parseFloat(item.pct)))}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="font-semibold text-white">
                  {item.count.toLocaleString()}
                </div>
                <div className="text-[10px] text-zinc-400">{item.pct}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Upstream DNS Servers */}
      {upstreams.length > 0 && (
        <div className="ios-card overflow-hidden">
          <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server size={16} className="text-[#ff9500]" />
              <span className="text-xs font-semibold text-zinc-200">
                Servidores Upstream ({upstreams.length})
              </span>
            </div>
          </div>
          <div className="divide-y divide-zinc-800/60">
            {upstreams.map((item, idx) => (
              <div
                key={idx}
                className="p-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-white truncate font-mono text-[11px]">
                    {item.server}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {item.count.toLocaleString()} respuestas procesadas
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-[#34c759]">{item.avgMs} ms</div>
                  <div className="text-[10px] text-zinc-400">latencia media</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
