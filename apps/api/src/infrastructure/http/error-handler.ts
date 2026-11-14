import type { FastifyReply, FastifyRequest } from 'fastify';

export interface ErrorResponseBody {
  error: string;
  message: string;
  requestId?: string;
}

const CLIENT_ERROR_MESSAGES: Readonly<Record<number, { error: string; message: string }>> = {
  400: { error: 'BadRequest', message: 'La solicitud no es válida.' },
  401: { error: 'Unauthorized', message: 'Debe iniciar sesión para continuar.' },
  403: { error: 'Forbidden', message: 'No tiene permisos para realizar esta acción.' },
  404: { error: 'NotFound', message: 'Recurso no encontrado.' },
  413: { error: 'PayloadTooLarge', message: 'La solicitud excede el tamaño permitido.' },
  415: { error: 'UnsupportedMediaType', message: 'Tipo de contenido no soportado.' },
  429: { error: 'TooManyRequests', message: 'Demasiadas solicitudes. Intente más tarde.' },
};

const GENERIC_CLIENT_ERROR = {
  error: 'ClientError',
  message: 'No fue posible procesar la solicitud.',
};

function statusCodeOf(error: unknown): number {
  const statusCode =
    typeof error === 'object' && error !== null && 'statusCode' in error
      ? Number(error.statusCode)
      : NaN;
  return statusCode >= 400 && statusCode < 600 ? statusCode : 500;
}

export function buildClientError(statusCode: number): Omit<ErrorResponseBody, 'requestId'> {
  return CLIENT_ERROR_MESSAGES[statusCode] ?? GENERIC_CLIENT_ERROR;
}

/**
 * Clients only ever receive generic, safe messages; the full error (stack, cause,
 * driver details) is logged server-side and correlated through the request id.
 */
export function errorHandler(error: unknown, request: FastifyRequest, reply: FastifyReply): void {
  const statusCode = statusCodeOf(error);

  if (statusCode >= 500) {
    request.log.error({ err: error }, 'Unhandled error while processing request');
    void reply.status(500).send({
      error: 'InternalServerError',
      message: 'Ocurrió un error inesperado. Intente nuevamente más tarde.',
      requestId: request.id,
    } satisfies ErrorResponseBody);
    return;
  }

  request.log.info({ err: error }, 'Request rejected with client error');
  void reply
    .status(statusCode)
    .send({ ...buildClientError(statusCode), requestId: request.id } satisfies ErrorResponseBody);
}
