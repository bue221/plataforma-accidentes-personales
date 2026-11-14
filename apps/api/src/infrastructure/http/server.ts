import { existsSync } from 'node:fs';
import { join } from 'node:path';
import fastifyHelmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import Fastify, { type FastifyBaseLogger, type FastifyInstance } from 'fastify';
import type { CheckHealthUseCase } from '../../application/use-cases/check-health.use-case.js';
import { buildClientError, errorHandler } from './error-handler.js';
import { healthRoutes } from './routes/health.routes.js';

export const API_PREFIX = '/api';

export interface ServerDependencies {
  logger: FastifyBaseLogger;
  checkHealth: CheckHealthUseCase;
  /** Folder with the React production build. Served only when it contains index.html. */
  webDistDir?: string;
}

export async function buildServer(dependencies: ServerDependencies): Promise<FastifyInstance> {
  const app = Fastify({ loggerInstance: dependencies.logger });

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      // Same-origin SPA served over plain HTTP locally; HTTPS upgrades belong to the edge proxy.
      directives: { upgradeInsecureRequests: null },
    },
  });
  app.setErrorHandler(errorHandler);

  await app.register(healthRoutes, { prefix: API_PREFIX, checkHealth: dependencies.checkHealth });

  const serveWeb = Boolean(
    dependencies.webDistDir && existsSync(join(dependencies.webDistDir, 'index.html')),
  );
  if (serveWeb && dependencies.webDistDir) {
    await app.register(fastifyStatic, { root: dependencies.webDistDir });
  } else {
    app.log.warn(
      { webDistDir: dependencies.webDistDir },
      'Web build not found: only the API will be served (run `npm run build`)',
    );
  }

  app.setNotFoundHandler((request, reply) => {
    const isApiRequest = request.url === API_PREFIX || request.url.startsWith(`${API_PREFIX}/`);
    const isPageNavigation = request.method === 'GET' || request.method === 'HEAD';

    // Client-side routes (e.g. /ingresar) are resolved by React Router.
    if (serveWeb && !isApiRequest && isPageNavigation) {
      return reply.type('text/html').sendFile('index.html');
    }
    return reply.status(404).send({ ...buildClientError(404), requestId: request.id });
  });

  return app;
}
