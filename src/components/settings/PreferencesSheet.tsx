"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { useAdGuard } from "@/context/AdGuardContext";
import { IosSheet } from "@/components/layout/IosSheet";
import { IosSegmentedControl } from "@/components/ui/IosSegmentedControl";
import { Moon, Sun, Smartphone, Clock } from "lucide-react";

interface PreferencesSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreferencesSheet({ isOpen, onClose }: PreferencesSheetProps) {
  const { theme, setTheme } = useTheme();
  const { autoRefreshInterval, setAutoRefreshInterval } = useAdGuard();

  return (
    <IosSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Preferencias de la App"
      subtitle="Personaliza el aspecto y comportamiento"
    >
      <div className="space-y-4">
        {/* Appearance */}
        <div className="ios-card p-4 space-y-3">
          <div className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
            <Moon size={15} className="text-[#af52de]" />
            <span>Tema Visual</span>
          </div>

          <IosSegmentedControl
            options={[
              { value: "dark", label: "OLED Negro" },
              { value: "light", label: "Claro" },
              { value: "system", label: "Sistema" },
            ]}
            value={theme}
            onChange={(val) => setTheme(val as "dark" | "light" | "system")}
          />
        </div>

        {/* Auto Refresh */}
        <div className="ios-card p-4 space-y-3">
          <div className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
            <Clock size={15} className="text-[#007aff]" />
            <span>Intervalo de Refresco Automático</span>
          </div>

          <IosSegmentedControl
            options={[
              { value: 5000, label: "5 seg" },
              { value: 10000, label: "10 seg" },
              { value: 30000, label: "30 seg" },
              { value: 0, label: "Manual" },
            ]}
            value={autoRefreshInterval}
            onChange={(val) => setAutoRefreshInterval(Number(val))}
          />
        </div>

        {/* iOS PWA Tips */}
        <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/40 text-xs space-y-2">
          <div className="font-semibold text-white flex items-center gap-2">
            <Smartphone size={16} className="text-[#34c759]" />
            <span>Cómo instalar en tu iPhone</span>
          </div>
          <ol className="text-zinc-400 space-y-1 list-decimal list-inside text-[11px] leading-relaxed">
            <li>Abre esta web desde <strong>Safari</strong> en tu iPhone.</li>
            <li>Toca el botón <strong>Compartir</strong> (icono de cuadrado con flecha arriba).</li>
            <li>Selecciona <strong>"Añadir a pantalla de inicio"</strong>.</li>
            <li>¡Listo! Se abrirá a pantalla completa sin barras de navegador.</li>
          </ol>
        </div>
      </div>
    </IosSheet>
  );
}
