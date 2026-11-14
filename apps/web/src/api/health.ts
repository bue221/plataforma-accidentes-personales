import { apiGet } from './http-client';

export interface HealthReport {
  status: 'ok' | 'degraded';
  checks: Record<string, 'up' | 'down'>;
}

export function getHealth(signal?: AbortSignal): Promise<HealthReport> {
  return apiGet<HealthReport>('/health', { signal });
}
