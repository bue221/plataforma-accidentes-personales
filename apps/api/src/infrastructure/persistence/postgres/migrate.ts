import { join } from 'node:path';
import { runner } from 'node-pg-migrate';
import { ConfigError, loadConfig } from '../../config/config.js';
import { loadEnvFile } from '../../config/env-file.js';
import { apiRoot } from '../../config/paths.js';

/** CLI: applies pending SQL migrations. `--test` targets DB_NAME_TEST instead of DB_NAME. */
async function migrate(): Promise<void> {
  loadEnvFile();
  const config = loadConfig();
  const database = process.argv.includes('--test') ? config.testDatabaseName : config.database.name;

  console.log(`Aplicando migraciones en la base "${database}"...`);
  await runner({
    databaseUrl: {
      host: config.database.host,
      port: config.database.port,
      database,
      user: config.database.user,
      password: config.database.password,
    },
    dir: join(apiRoot, 'migrations'),
    useGlob: true,
    direction: 'up',
    migrationsTable: 'pgmigrations',
    checkOrder: true,
    singleTransaction: true,
    log: (message) => console.log(message),
  });
}

migrate().catch((error: unknown) => {
  if (error instanceof ConfigError) console.error(error.message);
  else console.error('Error al aplicar migraciones:', error);
  process.exit(1);
});
