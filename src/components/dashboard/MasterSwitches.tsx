"use client";

import React from "react";
import { useAdGuard } from "@/context/AdGuardContext";
import { IosToggle } from "@/components/ui/IosToggle";
import { ShieldCheck, Filter, Shield, Baby, Search } from "lucide-react";

export function MasterSwitches() {
  const {
    status,
    filteringStatus,
    safebrowsingEnabled,
    parentalEnabled,
    safesearchEnabled,
    toggleProtection,
    toggleFiltering,
    toggleSafebrowsing,
    toggleParental,
    toggleSafesearch,
  } = useAdGuard();

  const isProtectionOn = status?.protection_enabled ?? false;
  const isFilteringOn = filteringStatus?.enabled ?? false;

  return (
    <div className="ios-card overflow-hidden divide-y divide-zinc-800/80">
      {/* 1. Protección General */}
      <IosToggle
        checked={isProtectionOn}
        onChange={(val) => toggleProtection(val)}
        label="Protección General"
        sublabel={isProtectionOn ? "Filtrado DNS global habilitado" : "Todo el tráfico sin filtrar"}
        icon={
          <div className="w-8 h-8 rounded-lg bg-[#34c759]/20 flex items-center justify-center text-[#34c759]">
            <ShieldCheck size={18} />
          </div>
        }
      />

      {/* 2. Filtrado de Reglas */}
      <IosToggle
        checked={isFilteringOn}
        onChange={(val) => toggleFiltering(val)}
        label="Filtrado de Reglas"
        sublabel={
          filteringStatus?.filters?.length
            ? `${filteringStatus.filters.filter((f) => f.enabled).length} listas de bloqueo activas`
            : "Listas de bloqueo y reglas de usuario"
        }
        icon={
          <div className="w-8 h-8 rounded-lg bg-[#007aff]/20 flex items-center justify-center text-[#007aff]">
            <Filter size={18} />
          </div>
        }
      />

      {/* 3. Navegación Segura */}
      <IosToggle
        checked={safebrowsingEnabled}
        onChange={(val) => toggleSafebrowsing(val)}
        label="Navegación Segura"
        sublabel="Bloquea sitios web maliciosos y phishing"
        icon={
          <div className="w-8 h-8 rounded-lg bg-[#ff9500]/20 flex items-center justify-center text-[#ff9500]">
            <Shield size={18} />
          </div>
        }
      />

      {/* 4. Control Parental */}
      <IosToggle
        checked={parentalEnabled}
        onChange={(val) => toggleParental(val)}
        label="Control Parental"
        sublabel="Bloquea contenido para adultos"
        icon={
          <div className="w-8 h-8 rounded-lg bg-[#af52de]/20 flex items-center justify-center text-[#af52de]">
            <Baby size={18} />
          </div>
        }
      />

      {/* 5. Búsqueda Segura */}
      <IosToggle
        checked={safesearchEnabled}
        onChange={(val) => toggleSafesearch(val)}
        label="Búsqueda Segura"
        sublabel="Google, Bing, YouTube, DuckDuckGo"
        icon={
          <div className="w-8 h-8 rounded-lg bg-[#5ac8fa]/20 flex items-center justify-center text-[#5ac8fa]">
            <Search size={18} />
          </div>
        }
      />
    </div>
  );
}
