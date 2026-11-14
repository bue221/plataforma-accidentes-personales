import pg from 'pg';
import type { Logger } from 'pino';
import type { DatabaseConfig } from '../../config/config.js';

export function createPgPool(database: DatabaseConfig, logger: Logger): pg.Pool {
  const pool = new pg.Pool({
    host: database.host,
    port: database.port,
    database: database.name,
    user: database.user,
    password: database.password,
    max: 10,
    connectionTimeoutMillis: 3_000,
    idleTimeoutMillis: 30_000,
    query_timeout: 5_000,
  });

  // Without this listener an idle client error (e.g. DB restart) crashes the process.
  pool.on('error', (error) => {
    logger.error({ err: error }, 'Unexpected error on idle PostgreSQL client');
  });

  return pool;
}
