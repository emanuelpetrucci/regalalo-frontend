---
title: 'Backend — Campo slug y endpoint de resolución por slug'
type: 'feature'
ticket: 'f0'
created: '2026-10-28'
status: done
baseline_revision: 'a04bb61e89f2fc3f497d086a17f87eb537f0f3bc'
route: 'full'
route_source: 'auto'
risk: 'high'
review: ''
review_source: ''
review_loop_iteration: 1
lenses_ran:
  - blind-hunter
  - edge-case-hunter
  - verification-gap
  - intent-alignment
context:
  - ../../../../../../backend/src/domain/slug.ts
  - ../../../../../../backend/src/infrastructure/database/supabase/migrations/026-items-slug.sql
  - ../../../../../../backend/openapi/openapi.json
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** El frontend no puede usar URLs semánticas `/items/:slug` (FR-F54) mientras la API solo expone UUID y no persiste slugs únicos; 14-f1 y 14-f2 quedan bloqueados.

**Approach:** En el repo backend (`feature/14-f0-item-slug`): columna `slug` con backfill, generación al publicar con desambiguación, `slug` en listados y detalle, y `GET /items/:param` resolviendo UUID o slug vía el mismo contrato OpenAPI.

## Boundaries & Constraints

**Always:** Clean Architecture; SQL directo; regla `slugBase` alineada entre `src/domain/slug.ts` y migración `026-items-slug.sql`; rutas mutantes (`DELETE`, `PATCH`, `POST` hijas) siguen exigiendo UUID; OpenAPI regenerado en build.

**Never:** Cambios en frontend `no-lo-vendo`; romper compatibilidad `GET /items/:uuid`; slugs con mayúsculas o caracteres fuera de `[a-z0-9-]`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH_UUID | `GET /items/{uuid}` item activo | 200, cuerpo incluye `slug` | — |
| HAPPY_PATH_SLUG | `GET /items/bicicleta-montana` | 200, mismo contrato que UUID | `findBySlug` |
| PUBLISH_SLUG | `POST /items` título nuevo | 201, `slug` derivado del título | — |
| COLLISION | Dos títulos iguales | Segundo slug `base-2` | reintento transaccional |
| INVALID_KEY | `GET /items/No_Slug` | 400 | no consulta DB |
| MISSING | slug inexistente | 410 Gone | — |
| LIST | `GET /items` | cada item con `slug` | — |
| MY_ITEMS | `GET /users/me/items` autenticado | cada item con `slug` | — |

</frozen-after-approval>

## Code Map

- `backend/src/domain/slug.ts` — `slugBase`, `allocateSlug`; máx. 60 chars; fallback `item`.
- `backend/src/infrastructure/database/supabase/migrations/026-items-slug.sql` — `item_slug_base`, backfill, `NOT NULL`, índice único `idx_items_slug`.
- `backend/src/infrastructure/database/supabase/item.repository.ts` — `createWithImages` asigna slug; `findBySlug`; list/detail incluyen `slug`.
- `backend/src/application/use-cases/item/get-item.use-case.ts` — rama UUID vs slug con `UUID_V4_REGEX`.
- `backend/src/interfaces/http/routes/items.routes.ts` — `GET /:id` + `validateItemKeyParam`.
- `backend/src/interfaces/validators/item-key-param.validator.ts` — acepta UUID v4 o slug `[a-z0-9-]+`.
- `backend/src/openapi/schemas/item.schemas.ts` + `register-paths.ts` — `slug` obligatorio; summary «UUID o slug».
- `backend/openapi/openapi.json` — artefacto committed tras build.
- `backend/tests/slug.test.ts`, `items-get.test.ts`, `13-1-public-discovery-seo.test.ts` — cobertura matriz.

## Tasks & Acceptance

**Execution:**
- [x] Verificar rama `feature/14-f0-item-slug` en backend contiene migración 026 y OpenAPI con `slug`.
- [x] `npm test` — suites slug, items-get, items-list, items-publish, users-items, 13-1-public-discovery-seo.
- [x] `npm run build` — OpenAPI generado sin drift vs committed.

**Acceptance Criteria:**
- Given item existente tras migración, when `GET /items/{slug}`, then 200 con `slug` y mismo shape que por UUID.
- Given título «Bicicleta Montaña», when publicar, then `slug` es `bicicleta-montana` o sufijo numérico si colisión.
- Given `GET /items` y `GET /users/me/items`, when respuesta OK, then cada elemento incluye `slug` string.
- Given OpenAPI publicado, when frontend ejecute `npm run api:generate`, then tipos incluyen `slug` (desbloqueo 14-f1).

## Implementation Notes

Implementación ya presente en backend (commit `0651ac9` en rama `feature/14-f0-item-slug`, baseline HEAD `a04bb61`). Esta sesión validó contrato y tests; sin cambios de código en backend ni frontend.

- Migración `026-items-slug.sql`, dominio `slug.ts`, repositorio, use cases y OpenAPI alineados con FR-F54 / AC épica 14.
- 72 tests en 6 archivos: OK (2026-10-28).
- `npm run build`: OK; `openapi/openapi.json` sin diff funcional tras regenerar.
- **HITL:** merge de rama backend a `develop` y migración en entorno compartido quedan fuera de este spike (coordinación equipo backend).
## Plan Change Log

## Review Triage Log

## Design Notes

Desambiguación: primer slug = base; colisiones `base-2`, `base-3`. Carrera en insert: SAVEPOINT + retry ante violación `idx_items_slug`.

## Verification

**Commands:**
- `npm test -- --run tests/slug.test.ts tests/items-get.test.ts tests/items-list.test.ts tests/items-publish.test.ts tests/users-items.test.ts tests/13-1-public-discovery-seo.test.ts` — expected: all pass
- `npm run build` — expected: exit 0, `openapi/openapi.json` coherente

**Manual checks (if no CLI):**
- Revisar `openapi/openapi.json` paths `/items/{id}` description «UUID v4 del objeto o su slug».

## Code Review

### 2026-10-28

**Code review complete.** 0 `decision-needed` abiertas, 9 `patch` aplicados el 2026-10-28, 0 `defer`, 10 rejected.

Diff: commit `0651ac9` en `feature/14-f0-item-slug`. Lentes: blind-hunter, edge-case-hunter, verification-gap, intent-alignment. Tests del contrato: 72 passed.

Decisiones 2026-10-28: D1=3, D2=2, D3=2, D4=2, D5=2, D6=1.

- [x] [Review][Patch] Nueva migración que reescriba los slugs ya guardados cuando no coincidan con `slugBase` (D1=3). No se edita `026` [`src/domain/slug.ts:7`]
- [x] [Review][Patch] Abrir `## [1.5.0]` en el changelog y mover allí la nota del slug (D6=1) [`CHANGELOG.md:8`]
- [x] [Review][Patch] Un título que es un UUID v4 genera un slug inalcanzable: `GetItemUseCase` lo manda a `findById` [`src/application/use-cases/item/get-item.use-case.ts:11`]
- [x] [Review][Patch] Un slug de más de 100 caracteres pasa el regex y acaba en 410 en vez de 400 [`src/interfaces/validators/item-key-param.validator.ts:4`]
- [x] [Review][Patch] Un UUID que no es v4 ahora se trata como slug y responde 410; antes era 400 [`src/interfaces/validators/item-key-param.validator.ts:9`]
- [x] [Review][Patch] El `throw` final de `insertItemResolvingSlug` no se alcanza: el último intento ya relanza el error [`src/infrastructure/database/supabase/item.repository.ts:139`]
- [x] [Review][Patch] `findBySlug` y el mapeo SQL de `slug` no se prueban contra un `Pool`; los tests HTTP simulan el repositorio [`src/infrastructure/database/supabase/item.repository.ts:302`]
- [x] [Review][Patch] `findMyItems` devuelve `slug` sin un test de repositorio que mire el SELECT y el mapeo [`src/infrastructure/database/supabase/user.repository.ts:467`]
- [x] [Review][Patch] No hay test que agote `SLUG_INSERT_ATTEMPTS` ni que un `23505` de otra constraint se relance sin reintentar [`src/infrastructure/database/supabase/item.repository.ts:136`]
- [x] [Review][Patch] El changelog cita `GET /users/me/items` sin el prefijo `/api` del resto de rutas [`CHANGELOG.md:12`]

### Rejected

- D2 — elegido dejar el backfill de `026`: corre una vez y la tabla actual es pequeña.
- D3 — elegido ventana de deploy (parar escrituras, migrar, desplegar). Sin `DEFAULT` temporal.
- D4 — elegido dejar `takenSlugs` con `LIKE`. El over-match no asigna un slug equivocado.
- D5 — elegido dejar el 500 cuando se agotan los 8 reintentos. El cliente puede reintentar.
- R7 — falso: el plan prohíbe cambios en el frontend; regenerar el cliente no es parte de este commit.
- R10 — falso: los slugs de seed (`test-item-<uuid>` y 12 hex del id) no coinciden con `UUID_V4_REGEX` y no ocultan el slug inalcanzable.
- R11 — falso: no hay ruta que edite el título de un ítem; el slug no puede quedar desfasado.
- R24 — falso: el plan pide el mismo `GET /items/:param` para UUID o slug; la ruta `/:id` ya acepta ambos.
- R25 — falso: el 410 del detalle ya estaba en el código y en el changelog 1.3.0; este commit lo documenta en la nota del slug. `slug` obligatorio es el contrato pedido.
- R26 — falso: marcar 14-f0 como desbloqueado es el estado del plan, no un cambio del commit de backend. El plan sigue en `in-review`.

### 2026-10-28 (pasada orquestador f0, baseline `a04bb61`..`b46f6cf`)

**Code review complete.** 0 `decision-needed`, 0 `patch`, 0 `defer`, 6 rejected.

Diff: 9 archivos, +338/−13 (490 líneas). `review_mode`: full. Rama backend `feature/14-f0-item-slug` @ `b46f6cf`. Lentes: blind-hunter, edge-case-hunter, verification-gap, intent-alignment. Tests ejecutados en review: 29 passed (`slug`, `items-get`, `item-repository-slug`, `user-repository-slug`).

Intent-alignment: el diff implementa la remediación acordada (migración `027`, prefijo `item-` en títulos UUID v4, validador de clave, tests de repositorio y colisiones); alineado con el intent del plan. Sin divergencias accionables.

### Rejected (pasada orquestador f0)

- R1 (blind-hunter) — falso: la migración `027` corre en una transacción; un fallo en el bloque `DO` revierte también el `UPDATE` a `rekey-*`.
- R2 (blind-hunter) — baja rechazada: fecha fija en CHANGELOG 1.5.0 es convención semver previa al tag.
- R3 (blind-hunter) — baja rechazada: duplicar reglas TS/SQL ya está mitigado con comentarios cruzados y migración `027` de realineo one-shot.
- R4 (edge-case-hunter) — falso: marcas combinantes fuera de los bloques SQL pero dentro de `\p{M}` no afectan publicación (solo `slugBase` TS); rekey one-shot no rompe URLs publicadas en la práctica actual.
- R5 (verification-gap) — rechazado: el diff añade tests de repositorio, HTTP 10.5b/10.5c y agotamiento de reintentos; no queda regresión demostrable sin test de migración SQL estático (patrón opcional del repo).
- R6 (verification-gap) — rechazado: smoke test estático de `027` no pincha comportamiento; HITL de deploy/migración ya documentado en el plan.
