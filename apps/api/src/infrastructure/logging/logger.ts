import { pino, type Logger } from 'pino';
import type { LogLevel } from '../config/config.js';

export const REDACTED_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  'headers.authorization',
  'headers.cookie',
  'password',
  'passwordHash',
  'token',
  '*.password',
  '*.passwordHash',
  '*.token',
  '*.DB_PASSWORD',
];

export function createLogger(level: LogLevel): Logger {
  return pino({ level, redact: { paths: REDACTED_PATHS, censor: '[REDACTED]' } });
}
