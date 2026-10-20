"use client";

import React, { useState } from "react";
import { useAdGuard } from "@/context/AdGuardContext";
import { RefreshCw, ChevronDown, ShieldCheck, ShieldAlert, Server } from "lucide-react";
import { IosSheet } from "./IosSheet";

export function IosHeader() {
  const {
    activeInstance,
    instances,
    switchInstance,
    status,
    isRefreshing,
    refreshAll,
    lastError,
  } = useAdGuard();

  const [isSwitchOpen, setIsSwitchOpen] = useState(false);

  const isOnline = !!status && !lastError;
  const isProtected = status?.protection_enabled ?? false;

  return (
    <>
      <header className="sticky top-0 z-30 w-full pt-safe ios-blur-dark border-b border-zinc-800/80 px-4 pb-3 transition-colors">
        <div className="flex items-center justify-between gap-2">
          {/* Instance Selector Trigger */}
          <button
            onClick={() => setIsSwitchOpen(true)}
            className="flex items-center gap-2 py-1 px-2.5 rounded-full bg-zinc-800/80 border border-zinc-700/50 hover:bg-zinc-700/70 transition-all ios-tap-active max-w-[65%]"
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse bg-[#34c759]" />
            <span className="text-sm font-semibold text-white truncate">
              {activeInstance.name}
            </span>
            <ChevronDown size={14} className="text-zinc-400 flex-shrink-0" />
          </button>

          {/* Status Badge & Refresh Button */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isProtected
                  ? "bg-[#34c759]/10 text-[#34c759] border-[#34c759]/30"
                  : "bg-[#ff3b30]/10 text-[#ff453a] border-[#ff3b30]/30"
              }`}
            >
              {isProtected ? (
                <>
                  <ShieldCheck size={13} />
                  <span>Activo</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={13} />
                  <span>Pausado</span>
                </>
              )}
            </div>

            <button
              onClick={() => refreshAll()}
              disabled={isRefreshing}
              aria-label="Refrescar"
              className="w-8 h-8 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-300 hover:text-white transition-all ios-tap-active"
            >
              <RefreshCw
                size={14}
                className={isRefreshing ? "animate-spin text-[#34c759]" : ""}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Instance Switcher Modal */}
      <IosSheet
        isOpen={isSwitchOpen}
        onClose={() => setIsSwitchOpen(false)}
        title="Instancias de AdGuard"
        subtitle="Selecciona el servidor que deseas controlar"
      >
        <div className="space-y-2">
          {instances.map((inst) => {
            const isCurrent = inst.id === activeInstance.id;
            return (
              <div
                key={inst.id}
                onClick={() => {
                  switchInstance(inst.id);
                  setIsSwitchOpen(false);
                }}
                className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer border transition-all ios-tap-active ${
                  isCurrent
                    ? "bg-[#34c759]/15 border-[#34c759]/50 text-white"
                    : "bg-[#2c2c2e]/70 border-zinc-700/40 text-zinc-200 hover:bg-[#2c2c2e]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isCurrent ? "bg-[#34c759] text-black" : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    <Server size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{inst.name}</div>
                    <div className="text-xs text-zinc-400 truncate">{inst.url}</div>
                  </div>
                </div>

                {isCurrent && (
                  <div className="text-xs font-bold text-[#34c759] bg-[#34c759]/20 px-2 py-1 rounded-md">
                    Activo
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </IosSheet>
    </>
  );
}
