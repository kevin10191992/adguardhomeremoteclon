"use client";

import React, { useState, useEffect } from "react";
import { useAdGuard } from "@/context/AdGuardContext";
import { AdGuardRewrite } from "@/lib/types";
import { IosSheet } from "@/components/layout/IosSheet";
import { Plus, Trash2, Zap, Check, RefreshCw } from "lucide-react";

interface DnsRewritesSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DnsRewritesSheet({ isOpen, onClose }: DnsRewritesSheetProps) {
  const { api } = useAdGuard();

  const [rewrites, setRewrites] = useState<AdGuardRewrite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [answer, setAnswer] = useState("");
  const [cacheCleared, setCacheCleared] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const fetchRewrites = async () => {
    setLoading(true);
    try {
      const res = await api.getRewrites();
      setRewrites(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRewrites();
    }
  }, [isOpen]);

  const handleAdd = async () => {
    if (!domain.trim() || !answer.trim()) return;
    try {
      await api.addRewrite(domain.trim(), answer.trim());
      setDomain("");
      setAnswer("");
      setIsAddOpen(false);
      await fetchRewrites();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (domain: string, answer: string) => {
    if (confirm(`¿Eliminar reescritura para ${domain}?`)) {
      await api.deleteRewrite(domain, answer);
      await fetchRewrites();
    }
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await api.clearDnsCache();
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <IosSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Reescrituras DNS y Caché"
      subtitle={`${rewrites.length} dominios personalizados configurados`}
    >
      <div className="space-y-4">
        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleClearCache}
            disabled={isClearing}
            className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all ios-tap-active border border-zinc-700/50"
          >
            {cacheCleared ? (
              <span className="text-[#34c759] flex items-center gap-1">
                <Check size={14} /> Caché Vaciada
              </span>
            ) : (
              <>
                <Zap size={14} className="text-[#ff9500]" />
                <span>Vaciar Caché DNS</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="py-2.5 px-3.5 rounded-xl bg-[#34c759] hover:bg-[#2fb34f] text-black font-semibold text-xs flex items-center gap-1.5 transition-all ios-tap-active shadow-md shadow-[#34c759]/20"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Nueva Reescritura</span>
          </button>
        </div>

        {/* Rewrites List */}
        <div className="ios-card overflow-hidden divide-y divide-zinc-800/80">
          {loading ? (
            <div className="p-8 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
              <RefreshCw size={18} className="animate-spin text-[#34c759]" />
              <span>Cargando reescrituras...</span>
            </div>
          ) : rewrites.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-xs">
              No hay reescrituras DNS configuradas
            </div>
          ) : (
            rewrites.map((rw, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white truncate">{rw.domain}</div>
                  <div className="text-zinc-400 font-mono text-[11px] mt-0.5">{rw.answer}</div>
                </div>

                <button
                  onClick={() => handleDelete(rw.domain, rw.answer)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Rewrite Modal */}
        <IosSheet
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Añadir Reescritura DNS"
          subtitle="Apunta un nombre de dominio local a una dirección IP"
        >
          <div className="space-y-3">
            <div className="ios-card p-3.5 space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Dominio</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="ej. mi-nas.home, router.lan"
                className="w-full bg-[#2c2c2e] text-white text-sm px-3 py-2 rounded-xl border border-zinc-700/60 focus:outline-none focus:border-[#34c759]"
              />
            </div>

            <div className="ios-card p-3.5 space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Dirección IP de Destino</label>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="ej. 192.168.1.100"
                className="w-full bg-[#2c2c2e] text-white text-sm px-3 py-2 rounded-xl border border-zinc-700/60 focus:outline-none focus:border-[#34c759]"
              />
            </div>

            <button
              onClick={handleAdd}
              disabled={!domain || !answer}
              className="w-full py-3 px-4 rounded-xl bg-[#34c759] hover:bg-[#2fb34f] text-black font-bold text-sm transition-all ios-tap-active shadow-lg shadow-[#34c759]/20 disabled:opacity-50"
            >
              Guardar Reescritura
            </button>
          </div>
        </IosSheet>
      </div>
    </IosSheet>
  );
}
