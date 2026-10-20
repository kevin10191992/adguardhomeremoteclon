export interface AdGuardInstance {
  id: string;
  name: string;
  url: string;
  username?: string;
  password?: string;
  isDefault?: boolean;
}

export interface AdGuardStatus {
  version: string;
  language: string;
  dns_addresses: string[];
  dns_port: number;
  http_port: number;
  protection_enabled: boolean;
  protection_disabled_duration: number;
  dhcp_available: boolean;
  running: boolean;
  start_time?: number;
}

export interface AdGuardFilterItem {
  id: number;
  url: string;
  name: string;
  rules_count: number;
  enabled: boolean;
  last_updated?: string;
}

export interface AdGuardFilteringStatus {
  enabled: boolean;
  interval: number;
  filters: AdGuardFilterItem[];
  whitelist_filters?: AdGuardFilterItem[];
  user_rules: string[];
}

export interface AdGuardStats {
  num_dns_queries: number;
  num_blocked_filtering: number;
  num_replaced_safebrowsing: number;
  num_replaced_safesearch: number;
  num_replaced_parental: number;
  avg_processing_time: number;
  dns_queries: number[];
  blocked_filtering: number[];
  replaced_safebrowsing?: number[];
  replaced_parental?: number[];
  time_units?: "hours" | "days";
  top_queried_domains: Array<Record<string, number>>;
  top_blocked_domains: Array<Record<string, number>>;
  top_clients: Array<Record<string, number>>;
  top_upstreams_responses?: Array<Record<string, number>>;
  top_upstreams_avg_time?: Array<Record<string, number>>;
}

export interface QueryAnswer {
  type: string;
  value: string;
  ttl?: number;
}

export interface QueryQuestion {
  class: string;
  name: string;
  type: string;
}

export interface QueryRule {
  filter_list_id?: number;
  text?: string;
}

export interface QueryClientInfo {
  name?: string;
  disallowed?: boolean;
  disallowed_rule?: string;
  whois?: Record<string, unknown>;
}

export interface AdGuardQueryLogItem {
  answer: QueryAnswer[];
  answer_dnssec: boolean;
  cached: boolean;
  client: string;
  client_info?: QueryClientInfo;
  client_proto?: string;
  elapsedMs: string;
  question: QueryQuestion;
  reason: string;
  rules: QueryRule[];
  status: string;
  time: string;
  upstream: string;
}

export interface AdGuardQueryLogResponse {
  data: AdGuardQueryLogItem[];
  oldest?: string;
}

export interface AdGuardClient {
  name: string;
  ids: string[];
  use_global_settings: boolean;
  filtering_enabled: boolean;
  parental_enabled: boolean;
  safebrowsing_enabled: boolean;
  safesearch_enabled?: boolean;
  use_global_blocked_services: boolean;
  blocked_services: string[];
  upstreams: string[];
  tags: string[];
}

export interface AdGuardAutoClient {
  ip: string;
  name?: string;
  source?: string;
  whois?: Record<string, unknown>;
}

export interface AdGuardClientsResponse {
  clients: AdGuardClient[];
  auto_clients?: AdGuardAutoClient[];
  supported_tags?: string[];
}

export interface AdGuardRewrite {
  domain: string;
  answer: string;
}

export interface BlockedServicesSchedule {
  time_zone?: string;
  blocked_services?: string[];
}
