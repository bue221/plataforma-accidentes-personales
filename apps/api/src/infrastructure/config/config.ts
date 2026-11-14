import { join, resolve } from 'node:path';
import { z } from 'zod';
import { repositoryRoot } from './paths.js';

const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;

const port = z.coerce.number().int().min(1).max(65535);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('127.0.0.1'),
  PORT: port.default(3000),
  LOG_LEVEL: z.enum(LOG_LEVELS).default('info'),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: port.default(5432),
  DB_NAME: z.string().min(1).default('accidentes'),
  DB_NAME_TEST: z.string().min(1).default('accidentes_test'),
  DB_USER: z.string().min(1).default('accidentes_app'),
  DB_PASSWORD: z.string({ error: 'es obligatoria' }).min(1, 'no puede estar vacía'),
  WEB_DIST_DIR: z.string().min(1).optional(),
});

export type LogLevel = (typeof LOG_LEVELS)[number];

export interface DatabaseConfig {
  readonly host: string;
  readonly port: number;
  readonly name: string;
  readonly user: string;
  readonly password: string;
}

export interface AppConfig {
  readonly nodeEnv: 'development' | 'test' | 'production';
  readonly server: { readonly host: string; readonly port: number };
  readonly logLevel: LogLevel;
  readonly database: DatabaseConfig;
  readonly testDatabaseName: string;
  readonly webDistDir: string;
}

export class ConfigError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(
      [
        'Configuración inválida. Revise su archivo .env (plantilla: .env.example):',
        ...issues.map((issue) => `  - ${issue}`),
      ].join('\n'),
    );
    this.name = 'ConfigError';
    this.issues = issues;
  }
}

/**
 * Validates environment variables once at startup and fails fast.
 * Error messages only name the offending variables, never their values.
 */
export function loadConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    throw new ConfigError(
      parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    );
  }

  const env = parsed.data;
  return {
    nodeEnv: env.NODE_ENV,
    server: { host: env.HOST, port: env.PORT },
    logLevel: env.LOG_LEVEL,
    database: {
      host: env.DB_HOST,
      port: env.DB_PORT,
      name: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
    },
    testDatabaseName: env.DB_NAME_TEST,
    webDistDir: env.WEB_DIST_DIR
      ? resolve(env.WEB_DIST_DIR)
      : join(repositoryRoot, 'apps', 'web', 'dist'),
  };
}
