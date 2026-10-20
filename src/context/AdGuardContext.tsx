"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import {
  AdGuardFilterItem,
  AdGuardFilteringStatus,
  AdGuardInstance,
  AdGuardStats,
  AdGuardStatus,
} from "@/lib/types";
import { AdGuardApi } from "@/lib/api";
import {
  DEFAULT_INSTANCE,
  getActiveInstanceId,
  getStoredInstances,
  saveStoredInstances,
  setActiveInstanceId,
} from "@/lib/instances";

interface AdGuardContextType {
  instances: AdGuardInstance[];
  activeInstance: AdGuardInstance;
  api: AdGuardApi;
  status: AdGuardStatus | null;
  filteringStatus: AdGuardFilteringStatus | null;
  stats: AdGuardStats | null;
  safebrowsingEnabled: boolean;
  parentalEnabled: boolean;
  safesearchEnabled: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  lastError: string | null;
  lastRefreshed: Date | null;
  autoRefreshInterval: number;
  setAutoRefreshInterval: (ms: number) => void;
  refreshAll: () => Promise<void>;
  switchInstance: (id: string) => void;
  addInstance: (inst: Omit<AdGuardInstance, "id">) => void;
  updateInstance: (inst: AdGuardInstance) => void;
  deleteInstance: (id: string) => void;
  toggleProtection: (enabled: boolean, durationMs?: number) => Promise<void>;
  toggleFiltering: (enabled: boolean) => Promise<void>;
  toggleSafebrowsing: (enabled: boolean) => Promise<void>;
  toggleParental: (enabled: boolean) => Promise<void>;
  toggleSafesearch: (enabled: boolean) => Promise<void>;
}

const AdGuardContext = createContext<AdGuardContextType | undefined>(undefined);

export function AdGuardProvider({ children }: { children: React.ReactNode }) {
  const [instances, setInstances] = useState<AdGuardInstance[]>([DEFAULT_INSTANCE]);
  const [activeId, setActiveId] = useState<string>(DEFAULT_INSTANCE.id);

  const [status, setStatus] = useState<AdGuardStatus | null>(null);
  const [filteringStatus, setFilteringStatus] = useState<AdGuardFilteringStatus | null>(null);
  const [stats, setStats] = useState<AdGuardStats | null>(null);
  const [safebrowsingEnabled, setSafebrowsingEnabled] = useState<boolean>(false);
  const [parentalEnabled, setParentalEnabled] = useState<boolean>(false);
  const [safesearchEnabled, setSafesearchEnabled] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [autoRefreshInterval, setAutoRefreshIntervalState] = useState<number>(10000); // 10s default

  // Load instances from storage
  useEffect(() => {
    const stored = getStoredInstances();
    setInstances(stored);
    const active = getActiveInstanceId();
    if (stored.some((i) => i.id === active)) {
      setActiveId(active);
    } else if (stored.length > 0) {
      setActiveId(stored[0].id);
    }
  }, []);

  const activeInstance = useMemo(() => {
    return instances.find((i) => i.id === activeId) || instances[0] || DEFAULT_INSTANCE;
  }, [instances, activeId]);

  const api = useMemo(() => {
    return new AdGuardApi(activeInstance);
  }, [activeInstance]);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    setLastError(null);
    try {
      const [
        newStatus,
        newFiltering,
        newStats,
        sb,
        par,
        ss,
      ] = await Promise.allSettled([
        api.getStatus(),
        api.getFilteringStatus(),
        api.getStats(),
        api.getSafebrowsingStatus(),
        api.getParentalStatus(),
        api.getSafesearchStatus(),
      ]);

      if (newStatus.status === "fulfilled") {
        setStatus(newStatus.value);
      } else {
        setLastError(newStatus.reason?.message || "No se pudo conectar con AdGuard Home");
      }

      if (newFiltering.status === "fulfilled") {
        setFilteringStatus(newFiltering.value);
      }

      if (newStats.status === "fulfilled") {
        setStats(newStats.value);
      }

      if (sb.status === "fulfilled") {
        setSafebrowsingEnabled(sb.value.enabled);
      }

      if (par.status === "fulfilled") {
        setParentalEnabled(par.value.enabled);
      }

      if (ss.status === "fulfilled") {
        setSafesearchEnabled(ss.value.enabled);
      }

      setLastRefreshed(new Date());
    } catch (e: unknown) {
      const err = e as Error;
      setLastError(err.message || "Error al refrescar datos");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [api]);

  // Initial load and instance change
  useEffect(() => {
    setIsLoading(true);
    refreshAll();
  }, [refreshAll]);

  // Auto-refresh interval
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      refreshAll();
    }, autoRefreshInterval);
    return () => clearInterval(interval);
  }, [autoRefreshInterval, refreshAll]);

  const switchInstance = (id: string) => {
    setActiveId(id);
    setActiveInstanceId(id);
  };

  const addInstance = (inst: Omit<AdGuardInstance, "id">) => {
    const newInst: AdGuardInstance = {
      ...inst,
      id: "ag_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    };
    const next = [...instances, newInst];
    setInstances(next);
    saveStoredInstances(next);
    switchInstance(newInst.id);
  };

  const updateInstance = (inst: AdGuardInstance) => {
    const next = instances.map((i) => (i.id === inst.id ? inst : i));
    setInstances(next);
    saveStoredInstances(next);
  };

  const deleteInstance = (id: string) => {
    if (instances.length <= 1) return; // Don't delete last
    const next = instances.filter((i) => i.id !== id);
    setInstances(next);
    saveStoredInstances(next);
    if (activeId === id) {
      switchInstance(next[0].id);
    }
  };

  const setAutoRefreshInterval = (ms: number) => {
    setAutoRefreshIntervalState(ms);
  };

  // Quick Switch Handlers with optimistic updates
  const toggleProtection = async (enabled: boolean, durationMs: number = 0) => {
    const prev = status?.protection_enabled ?? true;
    setStatus((s) => (s ? { ...s, protection_enabled: enabled } : null));
    try {
      await api.setProtection(enabled, durationMs);
      await refreshAll();
    } catch (e) {
      setStatus((s) => (s ? { ...s, protection_enabled: prev } : null));
      throw e;
    }
  };

  const toggleFiltering = async (enabled: boolean) => {
    const prev = filteringStatus?.enabled ?? true;
    setFilteringStatus((f) => (f ? { ...f, enabled } : null));
    try {
      await api.setFilteringConfig(enabled, filteringStatus?.interval ?? 72);
      await refreshAll();
    } catch (e) {
      setFilteringStatus((f) => (f ? { ...f, enabled: prev } : null));
      throw e;
    }
  };

  const toggleSafebrowsing = async (enabled: boolean) => {
    const prev = safebrowsingEnabled;
    setSafebrowsingEnabled(enabled);
    try {
      await api.setSafebrowsing(enabled);
    } catch (e) {
      setSafebrowsingEnabled(prev);
      throw e;
    }
  };

  const toggleParental = async (enabled: boolean) => {
    const prev = parentalEnabled;
    setParentalEnabled(enabled);
    try {
      await api.setParental(enabled);
    } catch (e) {
      setParentalEnabled(prev);
      throw e;
    }
  };

  const toggleSafesearch = async (enabled: boolean) => {
    const prev = safesearchEnabled;
    setSafesearchEnabled(enabled);
    try {
      await api.setSafesearch(enabled);
    } catch (e) {
      setSafesearchEnabled(prev);
      throw e;
    }
  };

  return (
    <AdGuardContext.Provider
      value={{
        instances,
        activeInstance,
        api,
        status,
        filteringStatus,
        stats,
        safebrowsingEnabled,
        parentalEnabled,
        safesearchEnabled,
        isLoading,
        isRefreshing,
        lastError,
        lastRefreshed,
        autoRefreshInterval,
        setAutoRefreshInterval,
        refreshAll,
        switchInstance,
        addInstance,
        updateInstance,
        deleteInstance,
        toggleProtection,
        toggleFiltering,
        toggleSafebrowsing,
        toggleParental,
        toggleSafesearch,
      }}
    >
      {children}
    </AdGuardContext.Provider>
  );
}

export function useAdGuard() {
  const context = useContext(AdGuardContext);
  if (!context) {
    throw new Error("useAdGuard must be used within an AdGuardProvider");
  }
  return context;
}
