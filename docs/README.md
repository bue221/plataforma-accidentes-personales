# Documentación del proyecto

Índice de la documentación del MVP de accidentes personales. Las reglas para agentes de IA están en [`AGENTS.md`](../AGENTS.md) y el flujo de contribución en [`CONTRIBUTING.md`](../CONTRIBUTING.md).

| Sección                                                            | Contenido                                                                                                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| [requirements/](./requirements/README.md)                          | Resumen parafraseado del caso, alcance, supuestos y [criterios de aceptación (borrador)](./requirements/acceptance-criteria-draft.md) |
| [architecture/](./architecture/README.md)                          | Hexagonal: capas, ports/adapters, flujo de autenticación, grafo de dependencias                                                       |
| [adr/](./adr/)                                                     | Architecture Decision Records (mantenidos junto con el código)                                                                        |
| [api/](./api/README.md)                                            | Endpoints planificados y contrato de errores                                                                                          |
| [data-model/](./data-model/README.md)                              | Tablas, restricciones e índices                                                                                                       |
| [decisions/decision-log.md](./decisions/decision-log.md)           | Registro de decisiones y supuestos                                                                                                    |
| [decisions/agent-corrections.md](./decisions/agent-corrections.md) | Correcciones aplicadas a la salida de agentes                                                                                         |
| [testing/](./testing/README.md)                                    | Matriz de pruebas obligatorias y evidencia                                                                                            |
| [defects/](./defects/README.md)                                    | Fase 2: reporte por defecto (reproducción, causa raíz, fix, regresión)                                                                |
| [ai-sessions/](./ai-sessions/README.md)                            | Historial de sesiones/prompts por historia                                                                                            |
| [known-limitations.md](./known-limitations.md)                     | Limitaciones conocidas y mejoras pendientes                                                                                           |

## Otras fuentes

- **Artefactos BMAD** (brief, PRD, UX, arquitectura, épicas, historias, sprint status): `../_bmad-output/` — generados exclusivamente por los skills de BMAD Method v6.12.4.
- **Insumos confidenciales de la organización** (MDD de agentes, contratos/contextos de agentes, lineamientos de arquitectura; aún no recibidos): viven solo en local en `docs/_private/`, que **no se versiona**. Si contradicen algo de esta documentación, prevalecen ellos y la contradicción se registra en el [decision log](./decisions/decision-log.md).

## Convenciones

- Prosa en español; identificadores de código, endpoints y nombres de tablas en inglés.
- Ningún secreto real en la documentación: usa valores ficticios como en `.env.example`.
- El enunciado del caso es confidencial: se parafrasea, nunca se copia.
