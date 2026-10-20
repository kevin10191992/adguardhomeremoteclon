"use client";

import React, { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X, Smartphone, Check } from "lucide-react";
import { IosSheet } from "./IosSheet";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(true);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isIosModalOpen, setIsIosModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone / installed mode
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(standaloneMode);

    if (standaloneMode) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isAppleDevice);

    // Check if user dismissed banner recently
    const dismissed = sessionStorage.getItem("agh_remote_install_dismissed");
    if (!dismissed) {
      // Delay showing banner slightly for smooth UX
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }

    // Android / Desktop beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setIsIosModalOpen(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("agh_remote_install_dismissed", "true");
  };

  if (isStandalone || !showBanner) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Install Banner */}
      <div className="fixed bottom-[74px] left-4 right-4 z-30 max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
        <div className="p-3.5 rounded-2xl bg-zinc-900/95 border border-zinc-700/80 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
              <Download size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">Instalar AdGuard Remote</div>
              <div className="text-[11px] text-zinc-400 truncate">
                {isIos ? "Añadir a pantalla de inicio" : "Instalar como app nativa"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="py-1.5 px-3 rounded-xl bg-[#34c759] hover:bg-[#2fb34f] text-black font-bold text-xs transition-all ios-tap-active shadow-sm"
            >
              {isIos ? "Cómo Instalar" : "Instalar"}
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Step-by-Step Instructions Modal */}
      <IosSheet
        isOpen={isIosModalOpen}
        onClose={() => setIsIosModalOpen(false)}
        title="Instalar en tu iPhone"
        subtitle="Sigue estos 3 sencillos pasos en Safari"
      >
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="ios-card p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#007aff]/20 text-[#007aff] font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
              1
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                <span>Pulsa el botón Compartir</span>
                <Share size={15} className="text-[#007aff]" />
              </div>
              <div className="text-zinc-400 mt-1 leading-relaxed">
                En la barra inferior de Safari, pulsa el icono cuadrado con la flecha apuntando hacia arriba.
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="ios-card p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#34c759]/20 text-[#34c759] font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
              2
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                <span>"Añadir a pantalla de inicio"</span>
                <PlusSquare size={15} className="text-[#34c759]" />
              </div>
              <div className="text-zinc-400 mt-1 leading-relaxed">
                Desplaza el menú hacia abajo y selecciona la opción <strong>Añadir a pantalla de inicio</strong>.
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="ios-card p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ff9500]/20 text-[#ff9500] font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
              3
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <div className="font-semibold text-white text-sm">
                Pulsa "Añadir" arriba a la derecha
              </div>
              <div className="text-zinc-400 mt-1 leading-relaxed">
                ¡Listo! Aparecerá el icono en tu iPhone y al tocarlo se abrirá a <strong>pantalla completa</strong> sin barras de navegador.
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsIosModalOpen(false)}
            className="w-full py-3 px-4 rounded-xl bg-[#34c759] text-black font-bold text-sm transition-all ios-tap-active shadow-lg shadow-[#34c759]/20"
          >
            Entendido
          </button>
        </div>
      </IosSheet>
    </>
  );
}
