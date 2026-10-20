"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAdGuard } from "@/context/AdGuardContext";
import { AdGuardQueryLogItem } from "@/lib/types";
import { IosBadge, BadgeVariant } from "@/components/ui/IosBadge";
import { QueryDetailSheet } from "./QueryDetailSheet";
import {
  Search,
  Trash2,
  Radio,
  RefreshCw,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { IosSheet } from "@/components/layout/IosSheet";

export function QueryLogTab() {
  const { api, refreshAll } = useAdGuard();

  const [queries, setQueries] = useState<AdGuardQueryLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLiveLog, setIsLiveLog] = useState<boolean>(false);
  const [selectedQuery, setSelectedQuery] = useState<AdGuardQueryLogItem | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);

  const fetchQueries = useCallback(async () => {
    try {
      const res = await api.getQueryLog({
        limit: 60,
        search: search.trim() || undefined,
        response_status: filterStatus === "all" ? undefined : filterStatus,
      });
      setQueries(res.data || []);
    } catch (e) {
      console.error("Failed to fetch query log", e);
    } finally {
      setLoading(false);
    }
  }, [api, search, filterStatus]);

  // Initial and on filter change
  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  // Live log polling
  useEffect(() => {
    if (!isLiveLog) return;
    const interval = setInterval(() => {
      fetchQueries();
    }, 2500);
    return () => clearInterval(interval);
  }, [isLiveLog, fetchQueries]);

  // Handle clearing log
  const handleClearLog = async () => {
    setIsClearModalOpen(false);
    setLoading(true);
    try {
      await api.clearQueryLog();
      await fetchQueries();
      await refreshAll();
    } catch (e) {
      console.error("Failed to clear query log", e);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockDomain = async (domain: string) => {
    const rule = `||${domain}^`;
    const cur = await api.getFilteringStatus();
    const rules = cur.user_rules || [];
    if (!rules.includes(rule)) {
      await api.setUserRules([...rules, rule]);
      await refreshAll();
    }
  };

  const handleWhitelistDomain = async (domain: string) => {
    const rule = `@@||${domain}^$important`;
    const cur = await api.getFilteringStatus();
    const rules = cur.user_rules || [];
    if (!rules.includes(rule)) {
      await api.setUserRules([...rules, rule]);
      await refreshAll();
    }
  };

  const getStatusBadge = (item: AdGuardQueryLogItem) => {
    const isBlocked =
      item.reason.includes("BlackList") ||
      item.reason.includes("Blocked") ||
      item.status === "NXDOMAIN";
    const isWhitelisted =
      item.reason.includes("WhiteList") || item.reason.includes("Allowed");
    const isRewrite = item.reason.includes("Rewrite");

    if (isBlocked) {
      return { variant: "blocked" as BadgeVariant, label: "Bloqueado" };
    }
    if (isRewrite) {
      return { variant: "rewritten" as BadgeVariant, label: "Reescrito" };
    }
    if (isWhitelisted) {
      return { variant: "allowed" as BadgeVariant, label: "Permitido" };
    }
    return { variant: "neutral" as BadgeVariant, label: "OK" };
  };

  return (
    <div className="space-y-3 pb-safe-tab animate-in fade-in duration-200">
      {/* Search & Actions Bar */}
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
            placeholder="Buscar dominio, IP o cliente..."
            className="w-full bg-[#1c1c1e] text-sm text-white pl-9 pr-3 py-2.5 rounded-xl border border-zinc-800 placeholder-zinc-500 focus:outline-none focus:border-[#34c759] transition-colors"
          />
        </div>

        {/* Live Log Toggle */}
        <button
          onClick={() => setIsLiveLog(!isLiveLog)}
          className={`px-3 py-2.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold border transition-all ios-tap-active flex-shrink-0 ${
            isLiveLog
              ? "bg-[#ff3b30]/20 text-[#ff453a] border-[#ff3b30]/40 animate-pulse"
              : "bg-[#1c1c1e] text-zinc-400 border-zinc-800 hover:text-white"
          }`}
        >
          <Radio size={14} />
          <span>{isLiveLog ? "En Vivo" : "Pausado"}</span>
        </button>

        {/* Clear Log */}
        <button
          onClick={() => setIsClearModalOpen(true)}
          className="p-2.5 rounded-xl bg-[#1c1c1e] text-zinc-400 hover:text-red-400 border border-zinc-800 transition-colors flex-shrink-0 ios-tap-active"
          title="Vaciar Registro"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Filter Status Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {[
          { id: "all", label: "Todas" },
          { id: "filtered", label: "Bloqueadas" },
          { id: "not_filtered", label: "Permitidas" },
          { id: "safe_browsing", label: "SafeBrowsing" },
          { id: "parental", label: "Parental" },
        ].map((f) => {
          const isSelected = filterStatus === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ios-tap-active ${
                isSelected
                  ? "bg-white text-black font-bold"
                  : "bg-[#1c1c1e] text-zinc-400 border border-zinc-800/80 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Query List */}
      <div className="ios-card overflow-hidden">
        {loading && queries.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm flex flex-col items-center gap-2">
            <RefreshCw size={20} className="animate-spin text-[#34c759]" />
            <span>Cargando registro de consultas...</span>
          </div>
        ) : queries.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">
            No se encontraron consultas registradas
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {queries.map((item, idx) => {
              const badge = getStatusBadge(item);
              const date = new Date(item.time);
              const timeStr = date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedQuery(item)}
                  className="p-3.5 hover:bg-zinc-800/40 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs ios-tap-active"
                >
                  {/* Left: Domain & Meta */}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white truncate text-[13px]">
                      {item.question.name}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400 text-[11px] mt-1">
                      <span className="font-mono">{timeStr}</span>
                      <span>·</span>
                      <span className="truncate max-w-[120px]">
                        {item.client_info?.name || item.client}
                      </span>
                      <span>·</span>
                      <span className="text-zinc-500 font-mono">
                        {item.question.type}
                      </span>
                    </div>
                  </div>

                  {/* Right: Badge & Latency */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <IosBadge variant={badge.variant}>{badge.label}</IosBadge>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {(parseFloat(item.elapsedMs) || 0).toFixed(1)} ms
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Query Detail Sheet */}
      <QueryDetailSheet
        query={selectedQuery}
        isOpen={!!selectedQuery}
        onClose={() => setSelectedQuery(null)}
        onBlockDomain={handleBlockDomain}
        onWhitelistDomain={handleWhitelistDomain}
      />

      {/* Clear Confirmation Sheet */}
      <IosSheet
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Vaciar Registro"
        subtitle="Esta acción eliminará todas las consultas registradas en AdGuard Home"
      >
        <div className="space-y-3">
          <button
            onClick={handleClearLog}
            className="w-full py-3.5 px-4 rounded-xl bg-[#ff3b30] hover:bg-[#e0352b] text-white font-bold text-sm transition-all ios-tap-active shadow-lg shadow-red-500/20"
          >
            Confirmar y Vaciar Registro
          </button>
          <button
            onClick={() => setIsClearModalOpen(false)}
            className="w-full py-3 px-4 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-sm transition-all ios-tap-active"
          >
            Cancelar
          </button>
        </div>
      </IosSheet>
    </div>
  );
}
