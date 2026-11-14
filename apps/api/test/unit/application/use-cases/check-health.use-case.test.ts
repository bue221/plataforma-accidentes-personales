import { describe, expect, it } from 'vitest';
import type { DatabaseHealthProbe } from '../../../../src/application/ports/database-health-probe.js';
import { CheckHealthUseCase } from '../../../../src/application/use-cases/check-health.use-case.js';

class FakeDatabaseHealthProbe implements DatabaseHealthProbe {
  constructor(private readonly reachable: boolean) {}

  async isReachable(): Promise<boolean> {
    return this.reachable;
  }
}

describe('CheckHealthUseCase', () => {
  it('reports ok when the database is reachable', async () => {
    const report = await new CheckHealthUseCase(new FakeDatabaseHealthProbe(true)).execute();
    expect(report).toEqual({ status: 'ok', checks: { database: 'up' } });
  });

  it('reports degraded when the database is unreachable', async () => {
    const report = await new CheckHealthUseCase(new FakeDatabaseHealthProbe(false)).execute();
    expect(report).toEqual({ status: 'degraded', checks: { database: 'down' } });
  });
});
