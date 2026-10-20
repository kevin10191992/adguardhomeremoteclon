"use client";

import React, { useState } from "react";
import { useAdGuard } from "@/context/AdGuardContext";
import { ShieldCheck, ShieldAlert, Clock, Pause, Play, Server, Activity } from "lucide-react";
import { IosSheet } from "@/components/layout/IosSheet";

export function ServerStatusCard() {
  const { status, toggleProtection, activeInstance, lastError } = useAdGuard();
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);

  const isProtected = status?.protection_enabled ?? false;

  const pauseDurations = [
    { label: "30 segundos", ms: 30 * 1000 },
    { label: "1 minuto", ms: 60 * 1000 },
    { label: "10 minutos", ms: 10 * 60 * 1000 },
    { label: "30 minutos", ms: 30 * 60 * 1000 },
    { label: "1 hora", ms: 60 * 60 * 1000 },
    { label: "Desactivar indefinidamente", ms: 0 },
  ];

  const handlePause = async (ms: number) => {
    setIsPauseModalOpen(false);
    if (ms === 0) {
      await toggleProtection(false);
    } else {
      await toggleProtection(false, ms);
    }
  };

  const handleResume = async () => {
    await toggleProtection(true);
  };

  return (
    <>
      <div className="ios-card p-4 relative overflow-hidden">
        {/* Top Status Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-3 h-3 rounded-full ${
                isProtected
                  ? "bg-[#34c759] shadow-[0_0_10px_#34c759]"
                  : "bg-[#ff3b30] shadow-[0_0_10px_#ff3b30]"
              }`}
            />
            <div>
              <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
                Estado del Servidor
              </div>
              <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                {status
                  ? isProtected
                    ? "Protección Activa"
                    : "Protección Desactivada"
                  : "Servidor No Conectado"}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] bg-zinc-800/80 text-zinc-300 px-2 py-0.5 rounded-md border border-zinc-700/40">
              {status?.version || "Sin versión"}
            </span>
          </div>
        </div>

        {/* Server Info Details */}
        <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-[#2c2c2e]/60 border border-zinc-800/80 text-xs">
          <div className="flex items-center gap-2">
            <Server size={14} className="text-zinc-400 flex-shrink-0" />
            <span className="text-zinc-300 truncate">
              {status?.dns_addresses?.[0] ||
                activeInstance.url.replace(/^https?:\/\//, "") ||
                "Sin URL configurada"}
            </span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Activity size={14} className="text-[#34c759] flex-shrink-0" />
            <span className="text-zinc-300">
              Puerto {status?.dns_port || 53} DNS
            </span>
          </div>
        </div>

        {/* Quick Action Pause / Resume Button */}
        <div className="mt-2">
          {isProtected ? (
            <button
              onClick={() => setIsPauseModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all ios-tap-active border border-zinc-700/50"
            >
              <Pause size={15} className="text-zinc-300" />
              <span>Pausar Protección...</span>
            </button>
          ) : (
            <button
              onClick={handleResume}
              className="w-full py-2.5 px-4 rounded-xl bg-[#34c759] hover:bg-[#2fb34f] text-black font-semibold text-sm flex items-center justify-center gap-2 transition-all ios-tap-active shadow-lg shadow-[#34c759]/20"
            >
              <Play size={15} fill="black" />
              <span>Reanudar Protección</span>
            </button>
          )}
        </div>
      </div>

      {/* Pause Duration Bottom Sheet */}
      <IosSheet
        isOpen={isPauseModalOpen}
        onClose={() => setIsPauseModalOpen(false)}
        title="Pausar Protección"
        subtitle="Selecciona cuánto tiempo suspender el filtrado DNS"
      >
        <div className="space-y-2">
          {pauseDurations.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handlePause(item.ms)}
              className="w-full p-3.5 rounded-2xl bg-[#2c2c2e]/80 hover:bg-[#3a3a3c] border border-zinc-700/40 text-left flex items-center justify-between text-sm font-medium text-white transition-all ios-tap-active"
            >
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-zinc-400" />
                <span>{item.label}</span>
              </div>
            </button>
          ))}
        </div>
      </IosSheet>
    </>
  );
}
