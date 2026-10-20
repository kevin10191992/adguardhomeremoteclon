"use client";

import React from "react";
import { useAdGuard } from "@/context/AdGuardContext";
import { Activity } from "lucide-react";

export function ActivitySparkline() {
  const { stats } = useAdGuard();

  const totalSeries = stats?.dns_queries || [];
  const blockedSeries = stats?.blocked_filtering || [];

  if (totalSeries.length === 0) {
    return null;
  }

  // Calculate coordinates
  const width = 360;
  const height = 90;
  const maxVal = Math.max(...totalSeries, 10);

  const getPoints = (data: number[]) => {
    return data
      .map((val, idx) => {
        const x = (idx / (data.length - 1 || 1)) * width;
        const y = height - (val / maxVal) * (height - 10) - 5;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  const totalPoints = getPoints(totalSeries);
  const blockedPoints = getPoints(blockedSeries);

  const totalArea = `0,${height} ${totalPoints} ${width},${height}`;
  const blockedArea = `0,${height} ${blockedPoints} ${width},${height}`;

  return (
    <div className="ios-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-[#34c759]" />
          <span className="text-xs font-semibold text-zinc-300">
            Actividad de Tráfico (24 Horas)
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#34c759]" />
            <span className="text-zinc-400">Total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff3b30]" />
            <span className="text-zinc-400">Bloqueadas</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden mt-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-24 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#34c759" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#34c759" stop-opacity="0.0" />
            </linearGradient>
            <linearGradient id="blockedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ff3b30" stop-opacity="0.45" />
              <stop offset="100%" stop-color="#ff3b30" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          {/* Total queries area */}
          <polygon points={totalArea} fill="url(#totalGrad)" />
          <polyline
            fill="none"
            stroke="#34c759"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={totalPoints}
          />

          {/* Blocked queries area */}
          <polygon points={blockedArea} fill="url(#blockedGrad)" />
          <polyline
            fill="none"
            stroke="#ff3b30"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={blockedPoints}
          />
        </svg>
      </div>
    </div>
  );
}
