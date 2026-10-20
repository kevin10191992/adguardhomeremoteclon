"use client";

import React, { useState } from "react";
import { useAdGuard } from "@/context/AdGuardContext";
import { IosSheet } from "@/components/layout/IosSheet";
import { IosToggle } from "@/components/ui/IosToggle";
import { Plus, Trash2, RefreshCw, Check, ShieldCheck, Filter } from "lucide-react";

interface FilterListsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterListsSheet({ isOpen, onClose }: FilterListsSheetProps) {
  const { filteringStatus, api, refreshAll } = useAdGuard();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [isWhitelist, setIsWhitelist] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const blocklists = filteringStatus?.filters || [];
  const whitelists = filteringStatus?.whitelist_filters || [];

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await api.refreshFilters(false);
      await refreshAll();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleFilter = async (url: string, enabled: boolean, name: string) => {
    await api.setFilterUrl({ url, name, enabled, whitelist: false });
    await refreshAll();
  };

  const handleRemoveFilter = async (url: string, whitelist: boolean) => {
    if (confirm("¿Seguro que deseas eliminar esta lista de filtros?")) {
      await api.removeFilterUrl(url, whitelist);
      await refreshAll();
    }
  };

  const handleAddFilter = async () => {
    if (!newUrl.trim() || !newName.trim()) return;
    setIsAdding(true);
    try {
      await api.addFilterUrl(newName.trim(), newUrl.trim(), isWhitelist);
      setNewName("");
      setNewUrl("");
      setIsAddOpen(false);
      await refreshAll();
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <IosSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Listas de Bloqueo DNS"
      subtitle={`${blocklists.length} listas configuradas`}
    >
      <div className="space-y-4">
        {/* Actions bar */}
        <div className="flex gap-2">
          <button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all ios-tap-active border border-zinc-700/50"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-[#34c759]" : ""} />
            <span>Actualizar Filtros</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="py-2.5 px-3.5 rounded-xl bg-[#34c759] hover:bg-[#2fb34f] text-black font-semibold text-xs flex items-center gap-1.5 transition-all ios-tap-active shadow-md shadow-[#34c759]/20"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Nueva Lista</span>
          </button>
        </div>

        {/* Blocklists */}
        <div>
          <div className="text-xs uppercase font-semibold text-zinc-500 tracking-wider px-2 mb-1.5">
            Listas de Bloqueo ({blocklists.length})
          </div>

          <div className="ios-card overflow-hidden divide-y divide-zinc-800/80">
            {blocklists.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-xs">
                No hay listas de bloqueo configuradas
              </div>
            ) : (
              blocklists.map((filter) => (
                <div key={filter.url} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-white truncate">
                      {filter.name}
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {filter.rules_count.toLocaleString()} reglas
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono truncate mt-0.5">
                      {filter.url}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Toggle */}
                    <div
                      onClick={() => handleToggleFilter(filter.url, !filter.enabled, filter.name)}
                      className={`w-[45px] h-[26px] rounded-full transition-colors relative cursor-pointer ${
                        filter.enabled ? "bg-[#34c759]" : "bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-[22px] h-[22px] rounded-full bg-white shadow absolute top-[2px] left-[2px] transition-transform ${
                          filter.enabled ? "translate-x-[19px]" : "translate-x-0"
                        }`}
                      />
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleRemoveFilter(filter.url, false)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Modal */}
        <IosSheet
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Añadir Lista de Filtros"
          subtitle="Introduce la URL del archivo de reglas de bloqueo"
        >
          <div className="space-y-3">
            <div className="ios-card p-3.5 space-y-1">
              <label className="text-xs font-semibold text-zinc-400">
                Nombre de la Lista
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="ej. HaGeZi Multi Pro, OISD..."
                className="w-full bg-[#2c2c2e] text-white text-sm px-3 py-2 rounded-xl border border-zinc-700/60 focus:outline-none focus:border-[#34c759]"
              />
            </div>

            <div className="ios-card p-3.5 space-y-1">
              <label className="text-xs font-semibold text-zinc-400">URL de la Lista</label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://adguardteam.github.io/HostlistsRegistry/..."
                className="w-full bg-[#2c2c2e] text-white text-sm px-3 py-2 rounded-xl border border-zinc-700/60 focus:outline-none focus:border-[#34c759]"
              />
            </div>

            <button
              onClick={handleAddFilter}
              disabled={isAdding || !newName || !newUrl}
              className="w-full py-3 px-4 rounded-xl bg-[#34c759] hover:bg-[#2fb34f] text-black font-bold text-sm transition-all ios-tap-active shadow-lg shadow-[#34c759]/20 disabled:opacity-50"
            >
              {isAdding ? "Añadiendo..." : "Confirmar y Añadir"}
            </button>
          </div>
        </IosSheet>
      </div>
    </IosSheet>
  );
}
