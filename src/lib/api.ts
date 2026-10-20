import {
  AdGuardFilterItem,
  AdGuardFilteringStatus,
  AdGuardInstance,
  AdGuardQueryLogResponse,
  AdGuardStats,
  AdGuardStatus,
  AdGuardClientsResponse,
  AdGuardClient,
  AdGuardRewrite,
} from "./types";

export class AdGuardApi {
  private instance?: AdGuardInstance;

  constructor(instance?: AdGuardInstance) {
    this.instance = instance;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.instance) {
      if (this.instance.url) {
        headers["x-adguard-url"] = this.instance.url;
      }
      if (this.instance.username && this.instance.password) {
        const token = btoa(`${this.instance.username}:${this.instance.password}`);
        headers["x-adguard-auth"] = `Basic ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const cleanedPath = path.startsWith("/") ? path.slice(1) : path;
    const url = `/api/proxy/${cleanedPath}`;

    const headers = {
      ...this.getHeaders(),
      ...(options.headers as Record<string, string>),
    };

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errText = await res.text();
      let message = `API request failed with status ${res.status}`;
      try {
        const parsed = JSON.parse(errText);
        message = parsed.message || parsed.error || message;
      } catch {
        if (errText) message = errText;
      }
      throw new Error(message);
    }

    const text = await res.text();
    if (!text) return {} as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  // --- Global Status & Controls ---
  async getStatus(): Promise<AdGuardStatus> {
    return this.request<AdGuardStatus>("/control/status");
  }

  async setProtection(enabled: boolean, durationMs: number = 0): Promise<void> {
    const body: { enabled: boolean; duration?: number } = { enabled };
    if (durationMs > 0) {
      body.duration = durationMs;
    }
    await this.request<void>("/control/protection", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // --- Statistics ---
  async getStats(): Promise<AdGuardStats> {
    return this.request<AdGuardStats>("/control/stats");
  }

  async resetStats(): Promise<void> {
    await this.request<void>("/control/stats_reset", { method: "POST" });
  }

  // --- Query Log ---
  async getQueryLog(params?: {
    older_than?: string;
    newer_than?: string;
    limit?: number;
    search?: string;
    response_status?: string;
  }): Promise<AdGuardQueryLogResponse> {
    const sp = new URLSearchParams();
    if (params?.older_than) sp.set("older_than", params.older_than);
    if (params?.newer_than) sp.set("newer_than", params.newer_than);
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.search) sp.set("search", params.search);
    if (params?.response_status) sp.set("response_status", params.response_status);

    const query = sp.toString() ? `?${sp.toString()}` : "";
    return this.request<AdGuardQueryLogResponse>(`/control/querylog${query}`);
  }

  async clearQueryLog(): Promise<void> {
    await this.request<void>("/control/querylog_clear", { method: "POST" });
  }

  // --- Filtering & Rules ---
  async getFilteringStatus(): Promise<AdGuardFilteringStatus> {
    return this.request<AdGuardFilteringStatus>("/control/filtering/status");
  }

  async setFilteringConfig(enabled: boolean, interval: number = 72): Promise<void> {
    await this.request<void>("/control/filtering/config", {
      method: "POST",
      body: JSON.stringify({ enabled, interval }),
    });
  }

  async refreshFilters(whitelist = false): Promise<void> {
    await this.request<void>("/control/filtering/refresh", {
      method: "POST",
      body: JSON.stringify({ whitelist }),
    });
  }

  async addFilterUrl(name: string, url: string, whitelist = false): Promise<void> {
    await this.request<void>("/control/filtering/add_url", {
      method: "POST",
      body: JSON.stringify({ name, url, whitelist }),
    });
  }

  async removeFilterUrl(url: string, whitelist = false): Promise<void> {
    await this.request<void>("/control/filtering/remove_url", {
      method: "POST",
      body: JSON.stringify({ url, whitelist }),
    });
  }

  async setFilterUrl(data: {
    url: string;
    name?: string;
    whitelist?: boolean;
    enabled: boolean;
  }): Promise<void> {
    await this.request<void>("/control/filtering/set_url", {
      method: "POST",
      body: JSON.stringify({
        url: data.url,
        data: {
          name: data.name,
          enabled: data.enabled,
        },
        whitelist: data.whitelist || false,
      }),
    });
  }

  async setUserRules(rules: string[]): Promise<void> {
    await this.request<void>("/control/filtering/set_rules", {
      method: "POST",
      body: JSON.stringify({ rules }),
    });
  }

  async checkHost(name: string): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(
      `/control/filtering/check_host?name=${encodeURIComponent(name)}`
    );
  }

  // --- Safe Browsing, Parental & Safe Search ---
  async getSafebrowsingStatus(): Promise<{ enabled: boolean }> {
    return this.request<{ enabled: boolean }>("/control/safebrowsing/status");
  }

  async setSafebrowsing(enable: boolean): Promise<void> {
    const endpoint = enable ? "/control/safebrowsing/enable" : "/control/safebrowsing/disable";
    await this.request<void>(endpoint, { method: "POST" });
  }

  async getParentalStatus(): Promise<{ enabled: boolean }> {
    return this.request<{ enabled: boolean }>("/control/parental/status");
  }

  async setParental(enable: boolean): Promise<void> {
    const endpoint = enable ? "/control/parental/enable" : "/control/parental/disable";
    await this.request<void>(endpoint, { method: "POST" });
  }

  async getSafesearchStatus(): Promise<{ enabled: boolean }> {
    return this.request<{ enabled: boolean }>("/control/safesearch/status");
  }

  async setSafesearch(enabled: boolean): Promise<void> {
    await this.request<void>("/control/safesearch/settings", {
      method: "PUT",
      body: JSON.stringify({
        enabled,
        bing: enabled,
        duckduckgo: enabled,
        google: enabled,
        pixabay: enabled,
        yandex: enabled,
        youtube: enabled,
      }),
    });
  }

  // --- Clients ---
  async getClients(): Promise<AdGuardClientsResponse> {
    return this.request<AdGuardClientsResponse>("/control/clients");
  }

  async addClient(client: Partial<AdGuardClient>): Promise<void> {
    await this.request<void>("/control/clients/add", {
      method: "POST",
      body: JSON.stringify(client),
    });
  }

  async updateClient(data: { name: string; data: Partial<AdGuardClient> }): Promise<void> {
    await this.request<void>("/control/clients/update", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteClient(name: string): Promise<void> {
    await this.request<void>("/control/clients/delete", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  // --- Blocked Services ---
  async getBlockedServicesAll(): Promise<string[] | { blocked_services: string[] }> {
    return this.request<string[] | { blocked_services: string[] }>("/control/blocked_services/all");
  }

  async getBlockedServices(): Promise<string[] | { blocked_services: string[] }> {
    return this.request<string[] | { blocked_services: string[] }>("/control/blocked_services/list");
  }

  async updateBlockedServices(services: string[]): Promise<void> {
    await this.request<void>("/control/blocked_services/update", {
      method: "POST",
      body: JSON.stringify(services),
    });
  }

  // --- DNS Rewrites ---
  async getRewrites(): Promise<AdGuardRewrite[]> {
    return this.request<AdGuardRewrite[]>("/control/rewrite/list");
  }

  async addRewrite(domain: string, answer: string): Promise<void> {
    await this.request<void>("/control/rewrite/add", {
      method: "POST",
      body: JSON.stringify({ domain, answer }),
    });
  }

  async deleteRewrite(domain: string, answer: string): Promise<void> {
    await this.request<void>("/control/rewrite/delete", {
      method: "POST",
      body: JSON.stringify({ domain, answer }),
    });
  }

  async clearDnsCache(): Promise<void> {
    await this.request<void>("/control/cache_clear", { method: "POST" });
  }
}
