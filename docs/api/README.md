# API — endpoints

> **Estado: planificado.** Actualiza cada fila (estado, request/response reales) en el PR que implemente el endpoint. Base path `/api`, JSON, autenticación por cookie `httpOnly` emitida en login.

## Endpoints

| Método | Ruta                              | Auth | Rol   | Descripción                                                | Respuestas                   | Estado      |
| ------ | --------------------------------- | ---- | ----- | ---------------------------------------------------------- | ---------------------------- | ----------- |
| GET    | `/api/health`                     | no   | —     | Salud del servicio (y conexión a BD)                       | 200                          | planificado |
| POST   | `/api/auth/signup`                | no   | —     | Crea cuenta `USER` (rol del cliente ignorado)              | 201, 400, 409                | planificado |
| POST   | `/api/auth/login`                 | no   | —     | Verifica credenciales y emite cookie JWT                   | 200, 400, 401                | planificado |
| POST   | `/api/auth/logout`                | sí   | —     | Elimina la cookie                                          | 204                          | planificado |
| GET    | `/api/auth/me`                    | sí   | —     | Perfil del usuario autenticado (para precargar formulario) | 200, 401                     | planificado |
| POST   | `/api/accidents`                  | sí   | USER  | Registra accidente; dueño = usuario del token              | 201, 400, 401                | planificado |
| GET    | `/api/me/accidents`               | sí   | USER  | Lista los accidentes propios (fecha, estado)               | 200, 401                     | planificado |
| GET    | `/api/accidents/:id`              | sí   | USER  | Detalle de un accidente propio                             | 200, 400, 401, 404           | planificado |
| GET    | `/api/admin/accidents`            | sí   | ADMIN | Accidentes agrupados por usuario                           | 200, 401, 403                | planificado |
| PATCH  | `/api/admin/accidents/:id/status` | sí   | ADMIN | Cambia estado según transiciones válidas                   | 200, 400, 401, 403, 404, 409 | planificado |

Pendiente de decidir con BMAD (registrar en decision log): si un `ADMIN` puede usar también los endpoints de usuario.

## Reglas transversales

- El servidor nunca acepta `userId`, `email` de dueño ni `role` del cliente para identificar o autorizar.
- Accidente ajeno o inexistente ⇒ **404** (no 403) para no revelar existencia.
- Validación Zod de body/params/query en el borde; errores por campo en `details`.
- Las respuestas nunca incluyen `password_hash`, secretos ni stack traces.

## Contrato de errores (propuesta)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos inválidos",
    "details": [{ "field": "occurredOn", "message": "La fecha no puede ser futura" }]
  }
}
```

| HTTP | `code`                                   | Cuándo                                               |
| ---- | ---------------------------------------- | ---------------------------------------------------- |
| 400  | `VALIDATION_ERROR`                       | Payload, params o query inválidos                    |
| 401  | `UNAUTHENTICATED`                        | Sin cookie válida o expirada; credenciales inválidas |
| 403  | `FORBIDDEN`                              | Rol insuficiente (endpoints admin)                   |
| 404  | `NOT_FOUND`                              | Recurso inexistente o ajeno                          |
| 409  | `CONFLICT` / `INVALID_STATUS_TRANSITION` | Email duplicado; transición de estado no permitida   |
| 500  | `INTERNAL_ERROR`                         | Error inesperado (mensaje genérico)                  |

## Ejemplos

_Añadir ejemplos reales (request/response con datos ficticios) al implementar cada endpoint._
