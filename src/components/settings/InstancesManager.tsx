"use client";

import React, { useState } from "react";
import { useAdGuard } from "@/context/AdGuardContext";
import { AdGuardInstance } from "@/lib/types";
import { IosSheet } from "@/components/layout/IosSheet";
import { Server, Plus, Trash2, Check, Activity, Globe, Edit3 } from "lucide-react";

interface InstancesManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstancesManager({ isOpen, onClose }: InstancesManagerProps) {
  const {
    instances,
    activeInstance,
    switchInstance,
    addInstance,
    updateInstance,
    deleteInstance,
  } = useAdGuard();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<AdGuardInstance | null>(null);

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const handleTestConnection = async () => {
    if (!url.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const headers: Record<string, string> = {
        "x-adguard-url": url.trim(),
      };
      if (username && password) {
        const token = btoa(`${username}:${password}`);
        headers["x-adguard-auth"] = `Basic ${token}`;
      }

      const t0 = performance.now();
      const res = await fetch("/api/proxy/control/status", { headers });
      const t1 = performance.now();

      if (res.ok) {
        const data = await res.json();
        const latency = (t1 - t0).toFixed(0);
        setTestResult({
          success: true,
          msg: `¡Conexión exitosa! Versión ${data.version} (${latency} ms)`,
        });
      } else {
        setTestResult({
          success: false,
          msg: `Error: Servidor respondió con código ${res.status}`,
        });
      }
    } catch (e: unknown) {
      const err = e as Error;
      setTestResult({ success: false, msg: `Fallo al conectar: ${err.message}` });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (!name.trim() || !url.trim()) return;

    if (editingInst) {
      updateInstance({
        ...editingInst,
        name: name.trim(),
        url: url.trim(),
        username: username.trim() || undefined,
        password: password.trim() || undefined,
      });
    } else {
      addInstance({
        name: name.trim(),
        url: url.trim(),
        username: username.trim() || undefined,
        password: password.trim() || undefined,
      });
    }

    setIsAddOpen(false);
    setEditingInst(null);
    setName("");
    setUrl("");
    setUsername("");
    setPassword("");
    setTestResult(null);
  };

  const openEdit = (inst: AdGuardInstance) => {
    setEditingInst(inst);
    setName(inst.name);
    setUrl(inst.url);
    setUsername(inst.username || "");
    setPassword(inst.password || "");
    setTestResult(null);
    setIsAddOpen(true);
  };

  const openNew = () => {
    setEditingInst(null);
    setName("");
    setUrl("http://");
    setUsername("");
    setPassword("");
    setTestResult(null);
    setIsAddOpen(true);
  };

  return (
    <IosSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Gestor de Instancias"
      subtitle="Gestiona y alterna entre múltiples servidores AdGuard Home"
    >
      <div className="space-y-4">
        {/* Add button */}
        <button
          onClick={openNew}
          className="w-full py-2.5 px-4 rounded-xl bg-[#34c759] hover:bg-[#2fb34f] text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ios-tap-active shadow-md shadow-[#34c759]/20"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Añadir Nuevo Servidor AdGuard</span>
        </button>

        {/* Instances list */}
        <div className="space-y-2">
          {instances.map((inst) => {
            const isCurrent = inst.id === activeInstance.id;
            return (
              <div
                key={inst.id}
                onClick={() => switchInstance(inst.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ios-tap-active ${
                  isCurrent
                    ? "bg-[#34c759]/15 border-[#34c759]/50 text-white"
                    : "bg-[#2c2c2e]/70 border-zinc-700/40 text-zinc-200 hover:bg-[#2c2c2e]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isCurrent ? "bg-[#34c759] text-black" : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    <Server size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate flex items-center gap-2">
                      <span>{inst.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-[#34c759] text-black px-1.5 py-0.2 rounded font-bold">
                          Activo
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 truncate">{inst.url}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(inst);
                    }}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    <Edit3 size={15} />
                  </button>

                  {instances.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar la instancia "${inst.name}"?`)) {
                          deleteInstance(inst.id);
                        }
                      }}
                      className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add/Edit Modal */}
        <IosSheet
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title={editingInst ? "Editar Instancia" : "Nueva Instancia"}
          subtitle="Configuración de conexión para AdGuard Home"
        >
          <div className="space-y-3">
            <div className="ios-card p-3.5 space-y-1">
              <label className="text-xs font-semibold text-zinc-400">
                Nombre de la Instancia
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej. Casa, Servidor NUC, VPS..."
                className="w-full bg-[#2c2c2e] text-white text-sm px-3 py-2 rounded-xl border border-zinc-700/60 focus:outline-none focus:border-[#34c759]"
              />
            </div>

            <div className="ios-card p-3.5 space-y-1">
              <label className="text-xs font-semibold text-zinc-400">
                URL de AdGuard Home (con puerto)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://192.168.1.1:80 o http://adguard.home"
                className="w-full bg-[#2c2c2e] text-white text-sm px-3 py-2 rounded-xl border border-zinc-700/60 focus:outline-none focus:border-[#34c759]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="ios-card p-3.5 space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Usuario</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-[#2c2c2e] text-white text-sm px-3 py-2 rounded-xl border border-zinc-700/60 focus:outline-none focus:border-[#34c759]"
                />
              </div>

              <div className="ios-card p-3.5 space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#2c2c2e] text-white text-sm px-3 py-2 rounded-xl border border-zinc-700/60 focus:outline-none focus:border-[#34c759]"
                />
              </div>
            </div>

            {/* Test Connection Button & Result */}
            <button
              onClick={handleTestConnection}
              disabled={testing || !url}
              className="w-full py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs flex items-center justify-center gap-2 border border-zinc-700/50 transition-all ios-tap-active"
            >
              <Activity size={14} className={testing ? "animate-spin text-[#34c759]" : ""} />
              <span>{testing ? "Probando..." : "Probar Conexión"}</span>
            </button>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 font-medium border ${
                  testResult.success
                    ? "bg-[#34c759]/15 text-[#34c759] border-[#34c759]/40"
                    : "bg-[#ff3b30]/15 text-[#ff453a] border-[#ff3b30]/40"
                }`}
              >
                {testResult.success ? <Check size={16} /> : <Trash2 size={16} />}
                <span>{testResult.msg}</span>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!name || !url}
              className="w-full py-3 px-4 rounded-xl bg-[#34c759] hover:bg-[#2fb34f] text-black font-bold text-sm transition-all ios-tap-active shadow-lg shadow-[#34c759]/20 disabled:opacity-50"
            >
              {editingInst ? "Actualizar Servidor" : "Guardar Servidor"}
            </button>
          </div>
        </IosSheet>
      </div>
    </IosSheet>
  );
}
