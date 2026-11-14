import { CheckHealthUseCase } from './application/use-cases/check-health.use-case.js';
import { ConfigError, loadConfig } from './infrastructure/config/config.js';
import { loadEnvFile } from './infrastructure/config/env-file.js';
import { buildServer } from './infrastructure/http/server.js';
import { createLogger } from './infrastructure/logging/logger.js';
import { createPgPool } from './infrastructure/persistence/postgres/pg-pool.js';
import { PostgresDatabaseHealthProbe } from './infrastructure/persistence/postgres/postgres-database-health-probe.js';

/** Composition root: the only place where adapters are wired into use cases. */
async function main(): Promise<void> {
  loadEnvFile();
  const config = loadConfig();
  const logger = createLogger(config.logLevel);

  const pool = createPgPool(config.database, logger);
  const checkHealth = new CheckHealthUseCase(new PostgresDatabaseHealthProbe(pool, logger));

  const app = await buildServer({ logger, checkHealth, webDistDir: config.webDistDir });
  app.addHook('onClose', async () => {
    await pool.end();
  });

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      logger.info({ signal }, 'Shutting down');
      app.close().then(
        () => process.exit(0),
        (error: unknown) => {
          logger.error({ err: error }, 'Error during shutdown');
          process.exit(1);
        },
      );
    });
  }

  await app.listen({ host: config.server.host, port: config.server.port });
}

main().catch((error: unknown) => {
  if (error instanceof ConfigError) console.error(error.message);
  else console.error('Error fatal al iniciar la API:', error);
  process.exit(1);
});
