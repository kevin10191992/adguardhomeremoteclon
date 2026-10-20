"use client";

import React, { useState } from "react";
import { useAdGuard } from "@/context/AdGuardContext";
import { InstancesManager } from "./InstancesManager";
import { BlockedServicesSheet } from "./BlockedServicesSheet";
import { FilterListsSheet } from "./FilterListsSheet";
import { UserRulesSheet } from "./UserRulesSheet";
import { CheckHostSheet } from "./CheckHostSheet";
import { DnsRewritesSheet } from "./DnsRewritesSheet";
import { PreferencesSheet } from "./PreferencesSheet";
import {
  Server,
  Ban,
  Filter,
  Code2,
  Search,
  Globe,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Info,
  Download,
} from "lucide-react";

export function SettingsTab() {
  const { activeInstance, instances, filteringStatus, status } = useAdGuard();

  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  const blocklistsCount = filteringStatus?.filters?.length || 0;
  const userRulesCount = filteringStatus?.user_rules?.length || 0;

  return (
    <div className="space-y-5 pb-safe-tab animate-in fade-in duration-200">
      {/* Group 1: Servidores */}
      <div>
        <div className="text-xs uppercase font-semibold text-zinc-500 tracking-wider px-2 mb-1.5">
          Servidores & Conexión
        </div>
        <div className="ios-card overflow-hidden divide-y divide-zinc-800/80">
          <div
            onClick={() => setActiveSheet("instances")}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/40 transition-colors ios-tap-active"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#34c759]/20 flex items-center justify-center text-[#34c759]">
                <Server size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Instancias de AdGuard</div>
                <div className="text-xs text-zinc-400">
                  {activeInstance.name} ({instances.length} configuradas)
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-zinc-500" />
          </div>
        </div>
      </div>

      {/* Group 2: Filtrado y Reglas */}
      <div>
        <div className="text-xs uppercase font-semibold text-zinc-500 tracking-wider px-2 mb-1.5">
          Filtrado & Seguridad
        </div>
        <div className="ios-card overflow-hidden divide-y divide-zinc-800/80">
          {/* Servicios Bloqueados */}
          <div
            onClick={() => setActiveSheet("services")}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/40 transition-colors ios-tap-active"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#ff3b30]/20 flex items-center justify-center text-[#ff453a]">
                <Ban size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Servicios Bloqueados</div>
                <div className="text-xs text-zinc-400">TikTok, YouTube, Netflix, Steam...</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-zinc-500" />
          </div>

          {/* Listas de Bloqueo */}
          <div
            onClick={() => setActiveSheet("filters")}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/40 transition-colors ios-tap-active"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#007aff]/20 flex items-center justify-center text-[#007aff]">
                <Filter size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Listas de Bloqueo DNS</div>
                <div className="text-xs text-zinc-400">{blocklistsCount} listas activas</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-zinc-500" />
          </div>

          {/* Reglas de Usuario */}
          <div
            onClick={() => setActiveSheet("user_rules")}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/40 transition-colors ios-tap-active"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#ff9500]/20 flex items-center justify-center text-[#ff9500]">
                <Code2 size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Reglas Personalizadas</div>
                <div className="text-xs text-zinc-400">{userRulesCount} reglas definidas</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-zinc-500" />
          </div>

          {/* Comprobar Host */}
          <div
            onClick={() => setActiveSheet("check_host")}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/40 transition-colors ios-tap-active"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#5ac8fa]/20 flex items-center justify-center text-[#5ac8fa]">
                <Search size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Comprobar Host</div>
                <div className="text-xs text-zinc-400">Probar filtrado para un dominio</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-zinc-500" />
          </div>
        </div>
      </div>

      {/* Group 3: Configuración DNS */}
      <div>
        <div className="text-xs uppercase font-semibold text-zinc-500 tracking-wider px-2 mb-1.5">
          Configuración DNS
        </div>
        <div className="ios-card overflow-hidden divide-y divide-zinc-800/80">
          <div
            onClick={() => setActiveSheet("rewrites")}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/40 transition-colors ios-tap-active"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#af52de]/20 flex items-center justify-center text-[#af52de]">
                <Globe size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Reescrituras DNS & Caché</div>
                <div className="text-xs text-zinc-400">Mapeos locales y vaciado de caché</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-zinc-500" />
          </div>
        </div>
      </div>

      {/* Group 4: Aplicación */}
      <div>
        <div className="text-xs uppercase font-semibold text-zinc-500 tracking-wider px-2 mb-1.5">
          Aplicación
        </div>
        <div className="ios-card overflow-hidden divide-y divide-zinc-800/80">
          <div
            onClick={() => setActiveSheet("preferences")}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/40 transition-colors ios-tap-active"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#34c759]/20 flex items-center justify-center text-[#34c759]">
                <Download size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Instalar Aplicación (PWA)</div>
                <div className="text-xs text-zinc-400">Instrucciones para iPhone y escritorio</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-zinc-500" />
          </div>

          <div
            onClick={() => setActiveSheet("preferences")}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/40 transition-colors ios-tap-active"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-700/50 flex items-center justify-center text-zinc-300">
                <Sliders size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Preferencias</div>
                <div className="text-xs text-zinc-400">Tema visual, intervalo y opciones</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-zinc-500" />
          </div>

          <div className="p-3.5 flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-zinc-500" />
              <span>AdGuard Home Remote Web</span>
            </div>
            <span className="font-mono text-zinc-500">v1.0.0 (Cupertino Mobile)</span>
          </div>
        </div>
      </div>

      {/* Sub-Sheets */}
      <InstancesManager
        isOpen={activeSheet === "instances"}
        onClose={() => setActiveSheet(null)}
      />

      <BlockedServicesSheet
        isOpen={activeSheet === "services"}
        onClose={() => setActiveSheet(null)}
      />

      <FilterListsSheet
        isOpen={activeSheet === "filters"}
        onClose={() => setActiveSheet(null)}
      />

      <UserRulesSheet
        isOpen={activeSheet === "user_rules"}
        onClose={() => setActiveSheet(null)}
      />

      <CheckHostSheet
        isOpen={activeSheet === "check_host"}
        onClose={() => setActiveSheet(null)}
      />

      <DnsRewritesSheet
        isOpen={activeSheet === "rewrites"}
        onClose={() => setActiveSheet(null)}
      />

      <PreferencesSheet
        isOpen={activeSheet === "preferences"}
        onClose={() => setActiveSheet(null)}
      />
    </div>
  );
}
