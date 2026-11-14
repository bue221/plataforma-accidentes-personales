import { createHealthReport, type HealthReport } from '../../domain/health/health-report.js';
import type { DatabaseHealthProbe } from '../ports/database-health-probe.js';

export class CheckHealthUseCase {
  private readonly databaseProbe: DatabaseHealthProbe;

  constructor(databaseProbe: DatabaseHealthProbe) {
    this.databaseProbe = databaseProbe;
  }

  async execute(): Promise<HealthReport> {
    const databaseReachable = await this.databaseProbe.isReachable();
    return createHealthReport({ database: databaseReachable ? 'up' : 'down' });
  }
}
