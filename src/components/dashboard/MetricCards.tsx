"use client";

import React from "react";
import { useAdGuard } from "@/context/AdGuardContext";
import { Globe, ShieldAlert, AlertTriangle, Zap } from "lucide-react";

export function MetricCards() {
  const { stats } = useAdGuard();

  const totalQueries = stats?.num_dns_queries ?? 0;
  const blockedQueries = stats?.num_blocked_filtering ?? 0;
  const blockedRatio = totalQueries > 0 ? ((blockedQueries / totalQueries) * 100).toFixed(1) : "0.0";
  const threatsBlocked =
    (stats?.num_replaced_safebrowsing ?? 0) + (stats?.num_replaced_parental ?? 0);
  const avgTime = stats?.avg_processing_time
    ? (stats.avg_processing_time * 1000).toFixed(1)
    : "0.0";

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* 1. Total Consultas */}
      <div className="ios-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-xs font-medium">Consultas DNS</span>
          <div className="w-6 h-6 rounded-md bg-[#007aff]/15 flex items-center justify-center text-[#007aff]">
            <Globe size={13} />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold tracking-tight text-white">
            {totalQueries.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Últimas 24 horas</div>
        </div>
      </div>

      {/* 2. Bloqueadas */}
      <div className="ios-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-xs font-medium">Bloqueadas</span>
          <div className="w-6 h-6 rounded-md bg-[#ff3b30]/15 flex items-center justify-center text-[#ff453a]">
            <ShieldAlert size={13} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-[#ff453a]">
              {blockedQueries.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-zinc-400">({blockedRatio}%)</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Por filtros activos</div>
        </div>
      </div>

      {/* 3. Amenazas */}
      <div className="ios-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-xs font-medium">Amenazas</span>
          <div className="w-6 h-6 rounded-md bg-[#ff9500]/15 flex items-center justify-center text-[#ff9500]">
            <AlertTriangle size={13} />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold tracking-tight text-[#ff9500]">
            {threatsBlocked.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Malware y phishing</div>
        </div>
      </div>

      {/* 4. Tiempo promedio */}
      <div className="ios-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-xs font-medium">Latencia Media</span>
          <div className="w-6 h-6 rounded-md bg-[#34c759]/15 flex items-center justify-center text-[#34c759]">
            <Zap size={13} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-[#34c759]">
              {avgTime}
            </span>
            <span className="text-xs font-semibold text-zinc-400">ms</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Resolución DNS</div>
        </div>
      </div>
    </div>
  );
}
