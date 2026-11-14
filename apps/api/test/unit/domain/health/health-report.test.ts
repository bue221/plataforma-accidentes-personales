import { describe, expect, it } from 'vitest';
import { createHealthReport } from '../../../../src/domain/health/health-report.js';

describe('createHealthReport', () => {
  it('is ok when every component is up', () => {
    expect(createHealthReport({ database: 'up' })).toEqual({
      status: 'ok',
      checks: { database: 'up' },
    });
  });

  it('is degraded when any component is down', () => {
    expect(createHealthReport({ database: 'down' }).status).toBe('degraded');
  });

  it('does not keep a reference to the caller input', () => {
    const checks: Record<string, 'up' | 'down'> = { database: 'up' };
    const report = createHealthReport(checks);
    checks.database = 'down';
    expect(report.checks.database).toBe('up');
  });
});
