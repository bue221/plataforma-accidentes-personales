// Hooks are a developer convenience: installing them must never break `npm install`
// in CI, in production images or in a checkout without `.git` yet.
import { existsSync } from 'node:fs';

if (process.env.CI === 'true' || process.env.NODE_ENV === 'production' || !existsSync('.git')) {
  process.exit(0);
}

try {
  const { default: husky } = await import('husky');
  const message = husky();
  if (message) console.log(message);
} catch (error) {
  console.warn(`husky: hooks no instalados (${error instanceof Error ? error.message : error})`);
}
