import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FastifyInstance } from 'fastify';
import { pino } from 'pino';
import { afterEach, describe, expect, it } from 'vitest';
import type { DatabaseHealthProbe } from '../../../../src/application/ports/database-health-probe.js';
import { CheckHealthUseCase } from '../../../../src/application/use-cases/check-health.use-case.js';
import { buildServer } from '../../../../src/infrastructure/http/server.js';

const silentLogger = pino({ level: 'silent' });

function probe(isReachable: () => Promise<boolean>): DatabaseHealthProbe {
  return { isReachable };
}

describe('HTTP server', () => {
  let app: FastifyInstance | undefined;
  let webDistDir: string | undefined;

  afterEach(async () => {
    await app?.close();
    if (webDistDir) rmSync(webDistDir, { recursive: true, force: true });
    app = undefined;
    webDistDir = undefined;
  });

  async function start(databaseProbe: DatabaseHealthProbe, withWebBuild = false) {
    if (withWebBuild) {
      webDistDir = mkdtempSync(join(tmpdir(), 'web-dist-'));
      writeFileSync(join(webDistDir, 'index.html'), '<!doctype html><title>SPA</title>');
    }
    app = await buildServer({
      logger: silentLogger,
      checkHealth: new CheckHealthUseCase(databaseProbe),
      webDistDir,
    });
    return app;
  }

  it('GET /api/health returns 200 when the database is up', async () => {
    const server = await start(probe(async () => true));

    const response = await server.inject({ method: 'GET', url: '/api/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok', checks: { database: 'up' } });
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('GET /api/health returns 503 when the database is down', async () => {
    const server = await start(probe(async () => false));

    const response = await server.inject({ method: 'GET', url: '/api/health' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({ status: 'degraded', checks: { database: 'down' } });
  });

  it('hides internal error details from the client', async () => {
    const server = await start(
      probe(async () => {
        throw new Error('connection string with secrets');
      }),
    );

    const response = await server.inject({ method: 'GET', url: '/api/health' });

    expect(response.statusCode).toBe(500);
    expect(response.body).not.toContain('secrets');
    expect(response.json()).toMatchObject({ error: 'InternalServerError' });
  });

  it('answers unknown API routes with a JSON 404', async () => {
    const server = await start(
      probe(async () => true),
      true,
    );

    const response = await server.inject({ method: 'GET', url: '/api/does-not-exist' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ error: 'NotFound' });
  });

  it('serves the SPA index for client-side routes when the web build exists', async () => {
    const server = await start(
      probe(async () => true),
      true,
    );

    const response = await server.inject({ method: 'GET', url: '/ingresar' });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
    expect(response.body).toContain('<title>SPA</title>');
  });
});
