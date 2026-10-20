"use client";

import React, { useState, useEffect } from "react";
import { useAdGuard } from "@/context/AdGuardContext";
import { IosSheet } from "@/components/layout/IosSheet";
import { IosToggle } from "@/components/ui/IosToggle";
import { Check, ShieldAlert, Ban, ShieldCheck, RefreshCw } from "lucide-react";

interface BlockedServicesSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const KNOWN_SERVICES = [
  { id: "tiktok", name: "TikTok" },
  { id: "youtube", name: "YouTube" },
  { id: "netflix", name: "Netflix" },
  { id: "discord", name: "Discord" },
  { id: "steam", name: "Steam" },
  { id: "instagram", name: "Instagram" },
  { id: "facebook", name: "Facebook" },
  { id: "twitter", name: "Twitter / X" },
  { id: "whatsapp", name: "WhatsApp" },
  { id: "telegram", name: "Telegram" },
  { id: "spotify", name: "Spotify" },
  { id: "twitch", name: "Twitch" },
  { id: "reddit", name: "Reddit" },
  { id: "roblox", name: "Roblox" },
  { id: "epic_games", name: "Epic Games" },
  { id: "disneyplus", name: "Disney+" },
  { id: "amazon", name: "Amazon" },
  { id: "ebay", name: "eBay" },
  { id: "snapchat", name: "Snapchat" },
  { id: "pinterest", name: "Pinterest" },
  { id: "tinder", name: "Tinder" },
  { id: "badoo", name: "Badoo" },
  { id: "hulu", name: "Hulu" },
  { id: "primevideo", name: "Prime Video" },
];

export function BlockedServicesSheet({ isOpen, onClose }: BlockedServicesSheetProps) {
  const { api, refreshAll } = useAdGuard();

  const [blockedList, setBlockedList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await api.getBlockedServices();
        const list = Array.isArray(res) ? res : res.blocked_services || [];
        setBlockedList(list);
      } catch (e) {
        console.error("Failed to fetch blocked services", e);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [isOpen, api]);

  const handleToggle = async (serviceId: string, enabled: boolean) => {
    let next: string[];
    if (enabled) {
      next = [...blockedList, serviceId];
    } else {
      next = blockedList.filter((s) => s !== serviceId);
    }
    setBlockedList(next);

    setSaving(true);
    try {
      await api.updateBlockedServices(next);
      await refreshAll();
    } finally {
      setSaving(false);
    }
  };

  const handleBlockAll = async () => {
    const allIds = KNOWN_SERVICES.map((s) => s.id);
    setBlockedList(allIds);
    setSaving(true);
    try {
      await api.updateBlockedServices(allIds);
      await refreshAll();
    } finally {
      setSaving(false);
    }
  };

  const handleUnblockAll = async () => {
    setBlockedList([]);
    setSaving(true);
    try {
      await api.updateBlockedServices([]);
      await refreshAll();
    } finally {
      setSaving(false);
    }
  };

  return (
    <IosSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Servicios Bloqueados"
      subtitle={`${blockedList.length} de ${KNOWN_SERVICES.length} servicios bloqueados`}
    >
      <div className="space-y-4">
        {/* Bulk Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleBlockAll}
            disabled={saving}
            className="flex-1 py-2 px-3 rounded-xl bg-[#ff3b30]/15 hover:bg-[#ff3b30]/25 text-[#ff453a] border border-[#ff3b30]/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ios-tap-active"
          >
            <Ban size={14} />
            <span>Bloquear Todos</span>
          </button>
          <button
            onClick={handleUnblockAll}
            disabled={saving}
            className="flex-1 py-2 px-3 rounded-xl bg-[#34c759]/15 hover:bg-[#34c759]/25 text-[#34c759] border border-[#34c759]/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ios-tap-active"
          >
            <ShieldCheck size={14} />
            <span>Permitir Todos</span>
          </button>
        </div>

        {/* Services Inset List */}
        <div className="ios-card overflow-hidden divide-y divide-zinc-800/80">
          {loading ? (
            <div className="p-8 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
              <RefreshCw size={18} className="animate-spin text-[#34c759]" />
              <span>Cargando servicios...</span>
            </div>
          ) : (
            KNOWN_SERVICES.map((srv) => {
              const isBlocked = blockedList.includes(srv.id);
              return (
                <IosToggle
                  key={srv.id}
                  checked={isBlocked}
                  onChange={(checked) => handleToggle(srv.id, checked)}
                  label={srv.name}
                  sublabel={isBlocked ? "Bloqueado para toda la red" : "Acceso permitido"}
                />
              );
            })
          )}
        </div>
      </div>
    </IosSheet>
  );
}
