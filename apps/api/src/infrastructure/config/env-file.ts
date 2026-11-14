import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { repositoryRoot } from './paths.js';

/**
 * Loads the repository-level `.env` (shared with docker compose) when present.
 * Variables already defined in the process environment take precedence.
 */
export function loadEnvFile(path: string = join(repositoryRoot, '.env')): boolean {
  if (!existsSync(path)) return false;
  process.loadEnvFile(path);
  return true;
}
