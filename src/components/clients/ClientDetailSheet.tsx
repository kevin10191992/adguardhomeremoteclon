"use client";

import React, { useState, useEffect } from "react";
import { AdGuardClient } from "@/lib/types";
import { IosSheet } from "@/components/layout/IosSheet";
import { IosToggle } from "@/components/ui/IosToggle";
import { Trash2, Save, Tag, Server, Shield, Check } from "lucide-react";

interface ClientDetailSheetProps {
  client: AdGuardClient | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: AdGuardClient) => Promise<void>;
  onDelete: (name: string) => Promise<void>;
}

export function ClientDetailSheet({
  client,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: ClientDetailSheetProps) {
  const [formData, setFormData] = useState<AdGuardClient | null>(null);
  const [idsInput, setIdsInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [upstreamsInput, setUpstreamsInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({ ...client });
      setIdsInput(client.ids.join("\n"));
      setTagsInput(client.tags.join(", "));
      setUpstreamsInput((client.upstreams || []).join("\n"));
    }
  }, [client]);

  if (!formData) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated: AdGuardClient = {
        ...formData,
        ids: idsInput
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        tags: tagsInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        upstreams: upstreamsInput
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      await onSave(updated);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`¿Eliminar el cliente "${formData.name}"?`)) {
      await onDelete(formData.name);
      onClose();
    }
  };

  return (
    <IosSheet
      isOpen={isOpen}
      onClose={onClose}
      title={client?.name ? `Editar ${client.name}` : "Nuevo Cliente"}
      subtitle="Configuración y reglas específicas para este dispositivo"
    >
      <div className="space-y-4">
        {saveSuccess && (
          <div className="p-3 rounded-xl bg-[#34c759]/20 border border-[#34c759]/40 text-xs text-[#34c759] flex items-center gap-2 font-medium">
            <Check size={16} />
            <span>Cliente guardado correctamente</span>
          </div>
        )}

        {/* Name */}
        <div className="ios-card p-3.5 space-y-1">
          <label className="text-xs font-semibold text-zinc-400">
            Nombre del Dispositivo
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="ej. iPhone de Juan, MacBook Pro..."
            className="w-full bg-[#2c2c2e] text-white text-sm px-3 py-2 rounded-xl border border-zinc-700/60 focus:outline-none focus:border-[#34c759]"
          />
        </div>

        {/* Identifiers (IP, MAC, CIDR) */}
        <div className="ios-card p-3.5 space-y-1">
          <label className="text-xs font-semibold text-zinc-400">
            Identificadores (IPs, MAC o CIDR - uno por línea)
          </label>
          <textarea
            rows={3}
            value={idsInput}
            onChange={(e) => setIdsInput(e.target.value)}
            placeholder="192.168.1.50&#10;aa:bb:cc:dd:ee:ff"
            className="w-full bg-[#2c2c2e] font-mono text-xs text-white px-3 py-2 rounded-xl border border-zinc-700/60 focus:outline-none focus:border-[#34c759]"
          />
        </div>

        {/* Tags */}
        <div className="ios-card p-3.5 space-y-1">
          <label className="text-xs font-semibold text-zinc-400">
            Etiquetas (separadas por coma)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="user_admin, device_phone, device_pc"
            className="w-full bg-[#2c2c2e] text-white text-sm px-3 py-2 rounded-xl border border-zinc-700/60 focus:outline-none focus:border-[#34c759]"
          />
        </div>

        {/* Global Settings & Toggles */}
        <div className="ios-card overflow-hidden divide-y divide-zinc-800/80">
          <IosToggle
            checked={formData.use_global_settings}
            onChange={(val) => setFormData({ ...formData, use_global_settings: val })}
            label="Usar Ajustes Globales"
            sublabel="Aplica la configuración general del servidor"
          />

          {!formData.use_global_settings && (
            <>
              <IosToggle
                checked={formData.filtering_enabled}
                onChange={(val) => setFormData({ ...formData, filtering_enabled: val })}
                label="Filtrado de Reglas"
                sublabel="Bloqueo de anuncios en este cliente"
              />
              <IosToggle
                checked={formData.safebrowsing_enabled}
                onChange={(val) =>
                  setFormData({ ...formData, safebrowsing_enabled: val })
                }
                label="Navegación Segura"
                sublabel="Protección anti-malware"
              />
              <IosToggle
                checked={formData.parental_enabled}
                onChange={(val) => setFormData({ ...formData, parental_enabled: val })}
                label="Control Parental"
                sublabel="Bloqueo de contenido adulto"
              />
            </>
          )}
        </div>

        {/* Upstream DNS Overrides */}
        <div className="ios-card p-3.5 space-y-1">
          <label className="text-xs font-semibold text-zinc-400">
            Servidores DNS Upstream para este cliente (opcional)
          </label>
          <textarea
            rows={2}
            value={upstreamsInput}
            onChange={(e) => setUpstreamsInput(e.target.value)}
            placeholder="tls://1.1.1.1&#10;https://dns.quad9.net/dns-query"
            className="w-full bg-[#2c2c2e] font-mono text-xs text-white px-3 py-2 rounded-xl border border-zinc-700/60 focus:outline-none focus:border-[#34c759]"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 px-4 rounded-xl bg-[#34c759] hover:bg-[#2fb34f] text-black font-bold text-sm flex items-center justify-center gap-2 transition-all ios-tap-active shadow-lg shadow-[#34c759]/20"
          >
            <Save size={16} />
            <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
          </button>

          {client && (
            <button
              onClick={handleDelete}
              className="p-3 rounded-xl bg-[#ff3b30]/15 hover:bg-[#ff3b30]/25 text-[#ff453a] border border-[#ff3b30]/30 transition-all ios-tap-active flex-shrink-0"
              title="Eliminar Cliente"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </IosSheet>
  );
}
