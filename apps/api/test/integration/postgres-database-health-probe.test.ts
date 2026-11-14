import { pino } from 'pino';
import { afterAll, describe, expect, it } from 'vitest';
import { loadConfig } from '../../src/infrastructure/config/config.js';
import { loadEnvFile } from '../../src/infrastructure/config/env-file.js';
import { createPgPool } from '../../src/infrastructure/persistence/postgres/pg-pool.js';
import { PostgresDatabaseHealthProbe } from '../../src/infrastructure/persistence/postgres/postgres-database-health-probe.js';

// Requires a running PostgreSQL (npm run db:up) and uses the isolated DB_NAME_TEST database.
loadEnvFile();
const config = loadConfig();
const logger = pino({ level: 'silent' });
const testDatabase = { ...config.database, name: config.testDatabaseName };

describe('PostgresDatabaseHealthProbe (integration)', () => {
  const reachablePool = createPgPool(testDatabase, logger);
  const unreachablePool = createPgPool({ ...testDatabase, port: 1 }, logger);

  afterAll(async () => {
    await Promise.all([reachablePool.end(), unreachablePool.end()]);
  });

  it('reports the test database as reachable', async () => {
    await expect(
      new PostgresDatabaseHealthProbe(reachablePool, logger).isReachable(),
    ).resolves.toBe(true);
  });

  it('reports false instead of throwing when the server cannot be reached', async () => {
    await expect(
      new PostgresDatabaseHealthProbe(unreachablePool, logger).isReachable(),
    ).resolves.toBe(false);
  });
});
