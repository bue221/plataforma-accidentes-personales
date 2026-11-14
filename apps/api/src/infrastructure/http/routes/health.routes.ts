import type { FastifyPluginAsync } from 'fastify';
import type { CheckHealthUseCase } from '../../../application/use-cases/check-health.use-case.js';

export interface HealthRoutesOptions {
  checkHealth: CheckHealthUseCase;
}

const healthReportSchema = {
  type: 'object',
  required: ['status', 'checks'],
  additionalProperties: false,
  properties: {
    status: { type: 'string', enum: ['ok', 'degraded'] },
    checks: {
      type: 'object',
      additionalProperties: { type: 'string', enum: ['up', 'down'] },
    },
  },
} as const;

export const healthRoutes: FastifyPluginAsync<HealthRoutesOptions> = async (app, options) => {
  app.get(
    '/health',
    { schema: { response: { 200: healthReportSchema, 503: healthReportSchema } } },
    async (_request, reply) => {
      const report = await options.checkHealth.execute();
      return reply.status(report.status === 'ok' ? 200 : 503).send(report);
    },
  );
};
