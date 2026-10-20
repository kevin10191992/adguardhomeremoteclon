"use client";

import React, { useState, useEffect } from "react";
import { useAdGuard } from "@/context/AdGuardContext";
import { IosSheet } from "@/components/layout/IosSheet";
import { Save, Plus, Trash2, Check, HelpCircle } from "lucide-react";

interface UserRulesSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserRulesSheet({ isOpen, onClose }: UserRulesSheetProps) {
  const { filteringStatus, api, refreshAll } = useAdGuard();

  const [rulesText, setRulesText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && filteringStatus?.user_rules) {
      setRulesText(filteringStatus.user_rules.join("\n"));
    }
  }, [isOpen, filteringStatus]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const parsedRules = rulesText
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);

      await api.setUserRules(parsedRules);
      await refreshAll();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error("Failed to save rules", e);
    } finally {
      setIsSaving(false);
    }
  };

  const ruleCount = rulesText.split("\n").filter((r) => r.trim()).length;

  return (
    <IosSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Reglas Personalizadas"
      subtitle={`${ruleCount} reglas de usuario configuradas`}
    >
      <div className="space-y-3">
        {savedSuccess && (
          <div className="p-3 rounded-xl bg-[#34c759]/20 border border-[#34c759]/40 text-xs text-[#34c759] flex items-center gap-2 font-medium">
            <Check size={16} />
            <span>Reglas guardadas y aplicadas con éxito</span>
          </div>
        )}

        <div className="ios-card p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Editor de Reglas (una por línea)</span>
            <span className="font-mono">{ruleCount} reglas</span>
          </div>
          <textarea
            rows={12}
            value={rulesText}
            onChange={(e) => setRulesText(e.target.value)}
            placeholder="||ads.example.com^&#10;@@||allowed.example.com^$important"
            className="w-full bg-[#2c2c2e] font-mono text-xs text-white p-3 rounded-xl border border-zinc-700/60 focus:outline-none focus:border-[#34c759] leading-relaxed resize-none"
          />
        </div>

        {/* Examples / Help Box */}
        <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/40 text-xs space-y-1">
          <div className="font-semibold text-zinc-300 flex items-center gap-1.5">
            <HelpCircle size={14} className="text-[#007aff]" />
            <span>Ejemplos de sintaxis:</span>
          </div>
          <div className="text-zinc-400 font-mono text-[11px] space-y-0.5">
            <div><span className="text-[#ff453a]">||example.com^</span> - Bloquear dominio y subdominios</div>
            <div><span className="text-[#34c759]">@@||example.com^</span> - Desbloquear / Permitir dominio</div>
            <div><span className="text-[#007aff]">127.0.0.1 example.com</span> - Sintaxis hosts</div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 px-4 rounded-xl bg-[#34c759] hover:bg-[#2fb34f] text-black font-bold text-sm flex items-center justify-center gap-2 transition-all ios-tap-active shadow-lg shadow-[#34c759]/20"
        >
          <Save size={16} />
          <span>{isSaving ? "Guardando..." : "Guardar Reglas"}</span>
        </button>
      </div>
    </IosSheet>
  );
}
