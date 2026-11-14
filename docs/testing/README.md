# Estrategia y matriz de pruebas

## Capas y herramientas

| Capa                   | Tipo                                                  | Ubicación                        | Infraestructura |
| ---------------------- | ----------------------------------------------------- | -------------------------------- | --------------- |
| `domain`               | Unitarias                                             | `apps/api/test/unit/domain`      | Ninguna         |
| `application`          | Unitarias (fakes en memoria de ports)                 | `apps/api/test/unit/application` | Ninguna         |
| `persistence` / `http` | Integración (`fastify.inject` + BD `accidentes_test`) | `apps/api/test/integration`      | PostgreSQL 16   |
| `web`                  | Componentes y validación (`@testing-library/react`)   | `apps/web/src/**/*.test.tsx`     | Ninguna         |

## Regla de oro para defectos (TDD)

1. Escribir primero la prueba de regresión que reproduce el fallo y falla.
2. Corregir la causa raíz en la capa correspondiente.
3. Verificar que toda la suite pasa y adjuntar la salida real en el PR.

## Comandos

```bash
npm run test:unit
npm run test:integration
npm test
```
