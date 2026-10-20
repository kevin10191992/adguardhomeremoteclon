import { AdGuardInstance } from "./types";

export const DEFAULT_INSTANCE: AdGuardInstance = {
  id: "primary",
  name: "Servidor Principal",
  url: "",
  username: "",
  password: "",
  isDefault: true,
};

const INSTANCES_STORAGE_KEY = "agh_remote_instances";
const ACTIVE_INSTANCE_ID_KEY = "agh_remote_active_instance_id";

export function getStoredInstances(): AdGuardInstance[] {
  if (typeof window === "undefined") return [DEFAULT_INSTANCE];

  try {
    const raw = localStorage.getItem(INSTANCES_STORAGE_KEY);
    if (!raw) return [DEFAULT_INSTANCE];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [DEFAULT_INSTANCE];
    return parsed;
  } catch {
    return [DEFAULT_INSTANCE];
  }
}

export function saveStoredInstances(instances: AdGuardInstance[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(INSTANCES_STORAGE_KEY, JSON.stringify(instances));
  } catch (e) {
    console.error("Failed to save instances to localStorage", e);
  }
}

export function getActiveInstanceId(): string {
  if (typeof window === "undefined") return DEFAULT_INSTANCE.id;
  try {
    return localStorage.getItem(ACTIVE_INSTANCE_ID_KEY) || DEFAULT_INSTANCE.id;
  } catch {
    return DEFAULT_INSTANCE.id;
  }
}

export function setActiveInstanceId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_INSTANCE_ID_KEY, id);
  } catch (e) {
    console.error("Failed to save active instance id", e);
  }
}
