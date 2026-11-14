import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

// Single repository-level .env shared with the API and docker compose; only VITE_* reach the bundle.
const envDir = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, '');
  const apiPort = env.PORT || '3000';

  return {
    envDir,
    plugins: [react()],
    server: {
      proxy: {
        '/api': { target: `http://127.0.0.1:${apiPort}` },
      },
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
      restoreMocks: true,
    },
  };
});
