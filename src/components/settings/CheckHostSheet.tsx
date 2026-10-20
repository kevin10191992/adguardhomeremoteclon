"use client";

import React, { useState } from "react";
import { useAdGuard } from "@/context/AdGuardContext";
import { IosSheet } from "@/components/layout/IosSheet";
import { IosBadge } from "@/components/ui/IosBadge";
import { Search, ShieldAlert, ShieldCheck, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

interface CheckHostSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckHostSheet({ isOpen, onClose }: CheckHostSheetProps) {
  const { api } = useAdGuard();

  const [host, setHost] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!host.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.checkHost(host.trim());
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const reason = (result?.reason as string) || "";
  const isBlocked = reason.includes("BlackList") || reason.includes("Blocked") || (result?.filter_id as number) > 0;
  const rules = (result?.rules as Array<{ text?: string; filter_list_id?: number }>) || [];

  return (
    <IosSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Comprobar Host"
      subtitle="Prueba cómo respondería el filtrado de AdGuard a un dominio"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder="ej. doubleclick.net, google.com"
            className="flex-1 bg-[#2c2c2e] text-white text-sm px-3.5 py-2.5 rounded-xl border border-zinc-700/60 focus:outline-none focus:border-[#34c759]"
          />
          <button
            onClick={handleCheck}
            disabled={loading || !host.trim()}
            className="px-4 py-2.5 rounded-xl bg-[#34c759] hover:bg-[#2fb34f] text-black font-semibold text-xs flex items-center gap-1.5 transition-all ios-tap-active shadow-md shadow-[#34c759]/20"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
            <span>Comprobar</span>
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="ios-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">Resultado del Filtrado</span>
              <IosBadge variant={isBlocked ? "blocked" : "allowed"} size="md">
                {isBlocked ? (
                  <span className="flex items-center gap-1">
                    <XCircle size={13} /> Bloqueado
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={13} /> Permitido
                  </span>
                )}
              </IosBadge>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800 text-xs font-mono text-zinc-300">
              <div><strong className="text-zinc-500">Motivo:</strong> {reason || "NotFilteredNotFound"}</div>
            </div>

            {rules.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-zinc-400">Reglas Coincidentes:</div>
                {rules.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-black/40 border border-zinc-800 text-xs font-mono text-[#ff453a] break-all"
                  >
                    {r.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </IosSheet>
  );
}
