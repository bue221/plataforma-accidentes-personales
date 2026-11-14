# Requisitos — resumen del caso (parafraseado)

> Resumen propio del caso de negocio. El enunciado original es confidencial y no se versiona. Este documento es la entrada para `bmad-product-brief` y `bmad-prd`; el PRD generado por BMAD lo reemplaza como fuente detallada.

## Objetivo

Plataforma web donde una persona con cuenta registra accidentes personales y luego consulta, autenticada, únicamente los accidentes asociados a su cuenta. Un administrador gestiona el ciclo de estados. Se evalúa tanto el producto como la dirección y supervisión de agentes de IA con BMAD Method.

## Requisitos funcionales (IDs para trazabilidad)

| ID    | Requisito                                                                                                                           |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------- |
| RF-01 | Landing pública que explica el propósito y ofrece dos accesos: "Registrar un accidente" e "Ingresar para consultar mis accidentes". |
| RF-02 | Crear cuenta (signup).                                                                                                              |
| RF-03 | Iniciar y cerrar sesión; autenticación validada en backend.                                                                         |
| RF-04 | Registrar un accidente (requiere sesión): identificación y contacto del afectado, tipo, fecha, lugar y descripción.                 |
| RF-05 | Validación de campos obligatorios en frontend y backend, con mensajes comprensibles de error, confirmación y carga.                 |
| RF-06 | Listar solo los accidentes propios, con fecha y estado; mensaje adecuado si no hay ninguno.                                         |
| RF-07 | Ver el detalle de un accidente propio y su estado.                                                                                  |
| RF-08 | Estados `REGISTRADO`, `EN_REVISION`, `CERRADO`; transiciones validadas en backend (dominio).                                        |
| RF-09 | Tablero admin agrupado por usuario (acordeones) para cambiar estados con botones.                                                   |
| RF-10 | Persistencia real en PostgreSQL con migraciones y restricciones de integridad.                                                      |

## Requisitos no funcionales

| ID     | Requisito                                                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RNF-01 | Arquitectura hexagonal verificable por análisis de dependencias (dominio sin dependencias de framework/BD).                                                         |
| RNF-02 | Un usuario nunca accede a datos de otro, aunque manipule identificadores en URL o petición.                                                                         |
| RNF-03 | El accidente se asocia a la identidad verificada en servidor, nunca a datos del cliente.                                                                            |
| RNF-04 | Secretos solo por variables de entorno; `.env.example` ficticio; `.env` fuera del repo y del historial; nada sensible en bundle, respuestas, errores, logs ni docs. |
| RNF-05 | Contraseñas con hash adecuado.                                                                                                                                      |
| RNF-06 | El proyecto se instala y ejecuta sin credenciales reales, desde un clon limpio siguiendo solo el README, ejecutando desde el build.                                 |
| RNF-07 | Trazabilidad requisito → historia → código → prueba → PR; historial de prompts/sesiones; registro de decisiones y correcciones.                                     |
| RNF-08 | Fuentes de plantillas o componentes públicos identificadas, justificadas y con adaptaciones trazables.                                                              |

## Supuestos (detalle en el decision log)

- El afectado es el titular de la cuenta; el formulario se precarga desde su perfil.
- Para registrar un accidente se exige sesión; la landing dirige a crear cuenta o ingresar.
- Las transiciones de estado las ejecuta solo un `ADMIN` creado por seed desde variables de entorno.
- Accidente ajeno o inexistente responde 404.

## Fuera de alcance del MVP

Recuperación de contraseña, verificación de email, adjuntos, accidentes de terceros, notificaciones, drag & drop en el tablero admin, despliegue productivo.

## Fase 2

Se recibirá un repositorio común con defectos plantados. Por cada defecto: reproducir y documentar, causa raíz, fix en la capa correcta en su propia rama, prueba de regresión (falla antes, pasa después) y evidencia. Ver [`../defects/README.md`](../defects/README.md).

## Trazabilidad

| Requisito      | Historia BMAD                                      | Código | Prueba | PR  |
| -------------- | -------------------------------------------------- | ------ | ------ | --- |
| RF-01 … RNF-08 | _pendiente (tras `bmad-create-epics-and-stories`)_ |        |        |     |
