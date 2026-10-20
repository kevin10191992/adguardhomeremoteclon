"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAdGuard } from "@/context/AdGuardContext";
import { AdGuardAutoClient, AdGuardClient } from "@/lib/types";
import { ClientDetailSheet } from "./ClientDetailSheet";
import {
  Users,
  Plus,
  Search,
  Laptop,
  Smartphone,
  Server,
  RefreshCw,
  Tag,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

export function ClientsTab() {
  const { api } = useAdGuard();

  const [configuredClients, setConfiguredClients] = useState<AdGuardClient[]>([]);
  const [autoClients, setAutoClients] = useState<AdGuardAutoClient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedClient, setSelectedClient] = useState<AdGuardClient | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

  const fetchClients = useCallback(async () => {
    try {
      const res = await api.getClients();
      setConfiguredClients(res.clients || []);
      setAutoClients(res.auto_clients || []);
    } catch (e) {
      console.error("Failed to fetch clients", e);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleCreateNew = () => {
    setSelectedClient({
      name: "",
      ids: [],
      use_global_settings: true,
      filtering_enabled: true,
      parental_enabled: false,
      safebrowsing_enabled: true,
      use_global_blocked_services: true,
      blocked_services: [],
      upstreams: [],
      tags: [],
    });
    setIsSheetOpen(true);
  };

  const handleEditConfigured = (client: AdGuardClient) => {
    setSelectedClient(client);
    setIsSheetOpen(true);
  };

  const handleEditAuto = (auto: AdGuardAutoClient) => {
    setSelectedClient({
      name: auto.name || auto.ip,
      ids: [auto.ip],
      use_global_settings: true,
      filtering_enabled: true,
      parental_enabled: false,
      safebrowsing_enabled: true,
      use_global_blocked_services: true,
      blocked_services: [],
      upstreams: [],
      tags: [],
    });
    setIsSheetOpen(true);
  };

  const handleSaveClient = async (client: AdGuardClient) => {
    const isExisting = configuredClients.some((c) => c.name === client.name);
    if (isExisting) {
      await api.updateClient({ name: client.name, data: client });
    } else {
      await api.addClient(client);
    }
    await fetchClients();
  };

  const handleDeleteClient = async (name: string) => {
    await api.deleteClient(name);
    await fetchClients();
  };

  // Filter clients by search
  const filteredConfigured = configuredClients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.ids.some((id) => id.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredAuto = autoClients.filter((a) =>
    (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
    a.ip.toLowerCase().includes(search.toLowerCase())
  );

  const getDeviceIcon = (client: AdGuardClient) => {
    const isPhone = client.tags.some((t) => t.includes("phone"));
    const isServer = client.tags.some((t) => t.includes("server"));
    if (isPhone) return <Smartphone size={16} className="text-[#34c759]" />;
    if (isServer) return <Server size={16} className="text-[#af52de]" />;
    return <Laptop size={16} className="text-[#007aff]" />;
  };

  return (
    <div className="space-y-4 pb-safe-tab animate-in fade-in duration-200">
      {/* Top Search & Add Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o IP..."
            className="w-full bg-[#1c1c1e] text-sm text-white pl-9 pr-3 py-2.5 rounded-xl border border-zinc-800 placeholder-zinc-500 focus:outline-none focus:border-[#34c759] transition-colors"
          />
        </div>

        <button
          onClick={handleCreateNew}
          className="py-2.5 px-3.5 rounded-xl bg-[#34c759] hover:bg-[#2fb34f] text-black font-semibold text-xs flex items-center gap-1.5 transition-all ios-tap-active shadow-md shadow-[#34c759]/20 flex-shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Añadir</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-zinc-500 text-sm flex flex-col items-center gap-2">
          <RefreshCw size={20} className="animate-spin text-[#34c759]" />
          <span>Cargando clientes de la red...</span>
        </div>
      ) : (
        <>
          {/* Configured Clients */}
          <div>
            <div className="text-xs uppercase font-semibold text-zinc-500 tracking-wider px-2 mb-1.5 flex items-center justify-between">
              <span>Clientes Configurados ({filteredConfigured.length})</span>
            </div>

            <div className="ios-card overflow-hidden">
              {filteredConfigured.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 text-xs">
                  No hay clientes configurados manualmente
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/60">
                  {filteredConfigured.map((client, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleEditConfigured(client)}
                      className="p-3.5 hover:bg-zinc-800/40 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs ios-tap-active"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center flex-shrink-0">
                          {getDeviceIcon(client)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-white text-[13px] truncate">
                            {client.name}
                          </div>
                          <div className="text-zinc-400 font-mono text-[11px] truncate mt-0.5">
                            {client.ids.join(", ")}
                          </div>
                          {client.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {client.tags.map((t, tidx) => (
                                <span
                                  key={tidx}
                                  className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        {client.use_global_settings ? (
                          <span className="text-[10px] text-zinc-500 font-medium">Global</span>
                        ) : (
                          <span className="text-[10px] text-[#34c759] font-semibold bg-[#34c759]/10 px-2 py-0.5 rounded-full border border-[#34c759]/30">
                            Personalizado
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Auto-discovered Runtime Clients */}
          {filteredAuto.length > 0 && (
            <div>
              <div className="text-xs uppercase font-semibold text-zinc-500 tracking-wider px-2 mb-1.5">
                Clientes Descubiertos en Red ({filteredAuto.length})
              </div>

              <div className="ios-card overflow-hidden">
                <div className="divide-y divide-zinc-800/60 max-h-96 overflow-y-auto no-scrollbar">
                  {filteredAuto.map((auto, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleEditAuto(auto)}
                      className="p-3 hover:bg-zinc-800/40 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs ios-tap-active"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center flex-shrink-0 text-zinc-400">
                          <Laptop size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-white truncate">
                            {auto.name || auto.ip}
                          </div>
                          {auto.name && (
                            <div className="text-zinc-500 font-mono text-[11px] truncate">
                              {auto.ip}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAuto(auto);
                        }}
                        className="text-[11px] font-semibold text-[#007aff] bg-[#007aff]/15 hover:bg-[#007aff]/25 px-2.5 py-1 rounded-lg border border-[#007aff]/30 transition-all ios-tap-active"
                      >
                        Configurar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Client Detail Sheet */}
      <ClientDetailSheet
        client={selectedClient}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSave={handleSaveClient}
        onDelete={handleDeleteClient}
      />
    </div>
  );
}
