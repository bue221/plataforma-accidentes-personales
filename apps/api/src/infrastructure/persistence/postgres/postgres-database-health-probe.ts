import type { Pool } from 'pg';
import type { Logger } from 'pino';
import type { DatabaseHealthProbe } from '../../../application/ports/database-health-probe.js';

export class PostgresDatabaseHealthProbe implements DatabaseHealthProbe {
  private readonly pool: Pool;
  private readonly logger: Logger;

  constructor(pool: Pool, logger: Logger) {
    this.pool = pool;
    this.logger = logger;
  }

  async isReachable(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.warn({ err: error }, 'PostgreSQL health probe failed');
      return false;
    }
  }
}
