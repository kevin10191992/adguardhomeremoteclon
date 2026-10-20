"use client";

import React, { useState } from "react";
import { AdGuardQueryLogItem } from "@/lib/types";
import { IosSheet } from "@/components/layout/IosSheet";
import { IosBadge } from "@/components/ui/IosBadge";
import {
  ShieldAlert,
  ShieldCheck,
  Copy,
  Check,
  Server,
  Laptop,
  Clock,
  KeyRound,
  Ban,
  Shield,
  Layers,
} from "lucide-react";

interface QueryDetailSheetProps {
  query: AdGuardQueryLogItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBlockDomain: (domain: string) => Promise<void>;
  onWhitelistDomain: (domain: string) => Promise<void>;
}

export function QueryDetailSheet({
  query,
  isOpen,
  onClose,
  onBlockDomain,
  onWhitelistDomain,
}: QueryDetailSheetProps) {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(null);

  if (!query) return null;

  const isBlocked =
    query.reason.includes("BlackList") ||
    query.reason.includes("Blocked") ||
    query.status === "NXDOMAIN";
  const isWhitelisted =
    query.reason.includes("WhiteList") || query.reason.includes("Allowed");

  const handleCopy = () => {
    navigator.clipboard.writeText(query.question.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBlock = async () => {
    setIsProcessing(true);
    try {
      await onBlockDomain(query.question.name);
      setActionDone("Dominio añadido a la lista de bloqueo");
      setTimeout(() => setActionDone(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWhitelist = async () => {
    setIsProcessing(true);
    try {
      await onWhitelistDomain(query.question.name);
      setActionDone("Dominio añadido a la lista de permitidos");
      setTimeout(() => setActionDone(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <IosSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de Consulta"
      subtitle={new Date(query.time).toLocaleTimeString()}
    >
      {/* Domain Header Card */}
      <div className="ios-card p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
              {query.question.type} · {query.question.class}
            </span>
            <div className="text-base font-bold text-white break-all mt-0.5">
              {query.question.name}
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors flex-shrink-0 ios-tap-active"
          >
            {copied ? <Check size={16} className="text-[#34c759]" /> : <Copy size={16} />}
          </button>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/80">
          <IosBadge variant={isBlocked ? "blocked" : isWhitelisted ? "allowed" : "neutral"}>
            {isBlocked ? "Bloqueado" : query.status}
          </IosBadge>
          <span className="text-xs text-zinc-400 font-mono">{query.reason}</span>
        </div>
      </div>

      {actionDone && (
        <div className="p-3 rounded-xl bg-[#34c759]/20 border border-[#34c759]/40 text-xs text-[#34c759] flex items-center gap-2 font-medium">
          <Check size={15} />
          <span>{actionDone}</span>
        </div>
      )}

      {/* 1-Tap Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleBlock}
          disabled={isProcessing}
          className="py-2.5 px-3 rounded-xl bg-[#ff3b30]/15 hover:bg-[#ff3b30]/25 text-[#ff453a] border border-[#ff3b30]/30 font-semibold text-xs flex items-center justify-center gap-2 transition-all ios-tap-active"
        >
          <Ban size={15} />
          <span>Bloquear Dominio</span>
        </button>

        <button
          onClick={handleWhitelist}
          disabled={isProcessing}
          className="py-2.5 px-3 rounded-xl bg-[#34c759]/15 hover:bg-[#34c759]/25 text-[#34c759] border border-[#34c759]/30 font-semibold text-xs flex items-center justify-center gap-2 transition-all ios-tap-active"
        >
          <Shield size={15} />
          <span>Permitir Dominio</span>
        </button>
      </div>

      {/* Matched Rules if any */}
      {query.rules && query.rules.length > 0 && (
        <div className="ios-card p-3.5 space-y-1.5">
          <div className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
            <Layers size={14} className="text-[#ff9500]" />
            <span>Regla Coincidente</span>
          </div>
          {query.rules.map((rule, idx) => (
            <div
              key={idx}
              className="p-2 rounded-lg bg-black/40 font-mono text-[11px] text-zinc-200 break-all border border-zinc-800"
            >
              {rule.text}
            </div>
          ))}
        </div>
      )}

      {/* Technical Metadata Inset Grouped */}
      <div className="ios-card divide-y divide-zinc-800/80 overflow-hidden text-xs">
        {/* Client */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-400">
            <Laptop size={14} />
            <span>Cliente</span>
          </div>
          <div className="font-medium text-white text-right">
            <div>{query.client_info?.name || query.client}</div>
            {query.client_info?.name && (
              <div className="text-[10px] text-zinc-500 font-mono">{query.client}</div>
            )}
          </div>
        </div>

        {/* Upstream Server */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-400">
            <Server size={14} />
            <span>Servidor Upstream</span>
          </div>
          <span className="font-mono text-zinc-300 text-right truncate max-w-[55%]">
            {query.upstream || "Caché Interna"}
          </span>
        </div>

        {/* Elapsed Time */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-400">
            <Clock size={14} />
            <span>Tiempo de Respuesta</span>
          </div>
          <span className="font-semibold text-[#34c759]">
            {(parseFloat(query.elapsedMs) || 0).toFixed(2)} ms
          </span>
        </div>

        {/* DNSSEC */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-400">
            <KeyRound size={14} />
            <span>DNSSEC</span>
          </div>
          <span className={query.answer_dnssec ? "text-[#34c759] font-medium" : "text-zinc-500"}>
            {query.answer_dnssec ? "Verificado" : "No aplicado"}
          </span>
        </div>
      </div>

      {/* DNS Answers List */}
      {query.answer && query.answer.length > 0 && (
        <div className="ios-card p-3.5 space-y-2">
          <div className="text-xs font-semibold text-zinc-400">
            Respuestas DNS ({query.answer.length})
          </div>
          <div className="space-y-1.5">
            {query.answer.map((ans, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-black/40 flex items-center justify-between text-xs font-mono border border-zinc-800"
              >
                <span className="text-[#007aff] font-bold">{ans.type}</span>
                <span className="text-zinc-200 truncate ml-2 flex-1 text-right">
                  {ans.value}
                </span>
                {ans.ttl && <span className="text-[10px] text-zinc-500 ml-2">TTL {ans.ttl}s</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </IosSheet>
  );
}
