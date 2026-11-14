# Correcciones a la salida de agentes (Agent Corrections)

Toda corrección manual o ajuste aplicado sobre código o artefactos generados por agentes de IA se registra aquí para trazabilidad y mejora continua.

| Fecha      | Agente / Contexto             | Qué se corrigió                                                                                                                                            | Motivo                                                                       |
| ---------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 2026-11-14 | Scaffold inicial (`apps/api`) | `ServerDependencies.logger` ajustado a `FastifyBaseLogger` en `server.ts` y eliminada propiedad `extensionAlias` no soportada en `.dependency-cruiser.cjs` | `npm run typecheck` y `npm run arch:check` fallaban tras el scaffold inicial |
