export type ComponentStatus = 'up' | 'down';

export type OverallStatus = 'ok' | 'degraded';

export interface HealthReport {
  readonly status: OverallStatus;
  readonly checks: Readonly<Record<string, ComponentStatus>>;
}

export function createHealthReport(
  checks: Readonly<Record<string, ComponentStatus>>,
): HealthReport {
  const allComponentsUp = Object.values(checks).every((status) => status === 'up');
  return { status: allComponentsUp ? 'ok' : 'degraded', checks: { ...checks } };
}
