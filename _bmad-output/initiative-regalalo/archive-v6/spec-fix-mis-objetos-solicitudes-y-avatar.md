---
title: 'Fix: contador de solicitudes y avatar de candidatos en mis objetos'
type: 'bugfix'
created: '2026-05-27'
status: 'done'
baseline_commit: 'f40c61375f3ce6686527e320edaf743782ca940c'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** En la página «Mis objetos», los ítems activos siempre muestran «Sin solicitudes aún» aunque ya tengan candidatos (la API no devuelve `requestCount`). Además, en la lista de candidatos el avatar muestra iniciales derivadas del UUID (ej. «A3», «55») porque `RankedCandidate` no incluye `firstName`/`lastName`.

**Approach:** Añadir `requestCount` a `MyItem` en el backend y `firstName`/`lastName` a `RankedCandidate`; regenerar el cliente OpenAPI; actualizar la fila de la lista y el avatar de candidato en el frontend.

## Boundaries & Constraints

**Always:**
- Seguir el diseño del prototipo `Mis objetos.html` líneas 375–382: si `requestCount > 0` mostrar icono + número + «solicitud/es»; si `requestCount === 0` mostrar «Sin solicitudes aún».
- `requestCount` solo es significativo para ítems `status === 'active'`; para otros estados devolver `0` (o el conteo real si la BD ya lo tiene).
- `firstName`/`lastName` en `RankedCandidate` provienen de la tabla `users` (JOIN ya existe en la query).
- Regenerar OpenAPI en backend (`npm run openapi:generate`) antes de regenerar cliente frontend (`npm run api:generate`).
- Mantener todos los tests existentes en verde; añadir/actualizar mínimos necesarios.
- Sin cambios al contrato de otros endpoints ni a la lógica de selección/pausa.

**Ask First:**
- Si al revisar la query de `findMyItems` el LEFT JOIN con `item_requests` tiene un impacto de rendimiento considerable (ej. millones de filas), consultar antes de proceder.

**Never:**
- No añadir paginación ni filtros nuevos.
- No mostrar `requestCount` en la ficha de detalle (panel derecho) — ese panel ya muestra la lista real.
- No cambiar el algoritmo de ranking ni la lógica de pausa.
- No crear ruta nueva ni componente nuevo.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Ítem activo con candidatos | `MyItem.status='active'`, `requestCount=3` | Fila lista: «👤 3 solicitudes» (prototipo L376–378) | N/A |
| Ítem activo sin candidatos | `MyItem.status='active'`, `requestCount=0` | Fila lista: «Sin solicitudes aún» (prototipo L381–382) | N/A |
| Ítem no activo | `status='reserved'|'completed'|'cancelled'` | No se muestra texto de solicitudes (sección ya existente) | N/A |
| Avatar candidato con nombre | `RankedCandidate.firstName='Ana'`, `lastName='García'` | `UserAvatarComponent` muestra «AG» | N/A |
| Avatar candidato sin nombre | `firstName=''`, `lastName=''` | Fallback `initialsFromUserId` (comportamiento actual) | N/A |
| Ítem activo pausado con candidatos | `requestsPaused=true`, `requestCount=5` | «👤 5 solicitudes · pausadas» (prototipo L378) | N/A |

</frozen-after-approval>

## Code Map

- `backend/src/openapi/schemas/user.schemas.ts` -- `myItemSchema`: añadir `requestCount`
- `backend/src/openapi/schemas/item.schemas.ts` -- `rankedCandidateSchema`: añadir `firstName`, `lastName`
- `backend/src/application/dtos/get-my-items.dto.ts` -- `MyItemDto`: añadir `requestCount: number`
- `backend/src/application/dtos/get-ranked-candidates.dto.ts` -- `RankedCandidateDto`: añadir `firstName`, `lastName`
- `backend/src/domain/repositories/user.repository.ts` -- `UserItemRecord`: añadir `requestCount: number`
- `backend/src/domain/repositories/request.repository.ts` -- `RankedCandidate`: añadir `firstName`, `lastName`
- `backend/src/infrastructure/database/supabase/user.repository.ts` -- `findMyItems`: LEFT JOIN con `item_requests` para COUNT
- `backend/src/infrastructure/database/supabase/request.repository.ts` -- `findRankedCandidates`: SELECT `u.first_name`, `u.last_name`
- `backend/src/application/use-cases/user/get-my-items.use-case.ts` -- mapear `requestCount`
- `backend/openapi/openapi.json` -- regenerar con `npm run openapi:generate` en backend
- `src/app/core/api/generated/` -- regenerar con `npm run api:generate` en frontend (no editar manualmente)
- `src/app/features/items/mis-objetos/mis-objetos.component.html` -- filas activas: mostrar `requestCount` condicionalmente
- `src/app/shared/components/candidate-row/candidate-row.component.html` -- `app-user-avatar`: pasar `[firstName]`/`[lastName]`
- `src/app/shared/components/candidate-row/candidate-row.component.spec.ts` -- verificar avatar con nombre real
- `backend/tests/users-items.test.ts` -- verificar `requestCount` en respuesta
- `backend/tests/items-requests.test.ts` -- verificar `firstName`/`lastName` en respuesta

## Tasks & Acceptance

**Execution:**

- [x] `backend/src/openapi/schemas/user.schemas.ts` -- Añadir `requestCount: z.number().int()` a `myItemSchema` (antes del `.openapi('MyItem')`)
- [x] `backend/src/openapi/schemas/item.schemas.ts` -- Añadir `firstName: z.string()`, `lastName: z.string()` a `rankedCandidateSchema`
- [x] `backend/src/application/dtos/get-my-items.dto.ts` -- Añadir `requestCount: number` a `MyItemDto`
- [x] `backend/src/application/dtos/get-ranked-candidates.dto.ts` -- Añadir `firstName: string`, `lastName: string` a `RankedCandidateDto`
- [x] `backend/src/domain/repositories/user.repository.ts` -- Añadir `requestCount: number` a `UserItemRecord`
- [x] `backend/src/domain/repositories/request.repository.ts` -- Añadir `firstName: string`, `lastName: string` a `RankedCandidate`
- [x] `backend/src/infrastructure/database/supabase/user.repository.ts` -- Modificar query `findMyItems`: añadir `LEFT JOIN item_requests ir ON ir.item_id = i.id AND ir.status = 'pending'` y `COUNT(ir.id)::int AS pending_count`; añadir al tipo del resultado y al mapeo (`requestCount: row.pending_count ?? 0`)
- [x] `backend/src/infrastructure/database/supabase/request.repository.ts` -- Añadir `u.first_name AS first_name, u.last_name AS last_name` al SELECT; añadir al tipo del resultado y al mapeo
- [x] `backend/src/application/use-cases/user/get-my-items.use-case.ts` -- Mapear `requestCount: item.requestCount` en el `.map()`
- [x] `backend` -- Ejecutar `npm run openapi:generate` para regenerar `openapi/openapi.json`
- [x] `src/app/core/api/generated/` -- Ejecutar `npm run api:generate` en frontend para regenerar cliente
- [x] `src/app/features/items/mis-objetos/mis-objetos.component.html` -- Reemplazar la sección de meta para ítems activos (líneas que muestran siempre `no_requests_yet`) por: `@if (item.requestCount > 0)` → icono IUser + count + «solicitud/es»; `@else` → «Sin solicitudes aún». Mantener sufijo pausadas.
- [x] `src/app/shared/components/candidate-row/candidate-row.component.html` -- En `app-user-avatar` añadir `[firstName]="candidate().firstName"` y `[lastName]="candidate().lastName"`
- [x] `backend/tests/users-items.test.ts` -- Actualizar/añadir assertions para `requestCount` en respuesta
- [x] `backend/tests/items-requests.test.ts` -- Actualizar/añadir assertions para `firstName`/`lastName` en respuesta
- [x] `src/app/shared/components/candidate-row/candidate-row.component.spec.ts` -- Añadir caso: candidato con `firstName`/`lastName` → avatar muestra iniciales correctas

**Acceptance Criteria:**

- Given un ítem activo con 3 candidatos, when se renderiza la fila en la lista izquierda, then muestra el icono de persona y «3 solicitudes» (no «Sin solicitudes aún»)
- Given un ítem activo con 0 candidatos, when se renderiza la fila, then muestra «Sin solicitudes aún»
- Given un ítem activo con candidatos y `requestsPaused=true`, when se renderiza la fila, then muestra el count de solicitudes seguido de «· pausadas»
- Given un candidato con `firstName='Ana'`, `lastName='García'`, when se renderiza `CandidateRowComponent`, then el avatar muestra iniciales «AG»
- Given todos los ítems no activos (reserved, completed, cancelled), when se renderizan, then no aparece texto de solicitudes (comportamiento sin cambios)

### Review Findings

- [x] [Review][Decision] Valores centinela 'Usuario'/'Pendiente' producen iniciales «UP» en avatar — aceptado; se corrige sola cuando el usuario complete su perfil
- [x] [Review][Patch] `parseInt(row.pending_count, 10) || 0` sin null-guard explícito — usar `parseInt(row.pending_count ?? '0', 10)` [`user.repository.ts:428`]
- [x] [Review][Patch] `requestCount: z.number().int()` sin `.min(0)` — añadir cota mínima en schema Zod [`user.schemas.ts:83`]
- [x] [Review][Patch] Sufijo «· pausadas» se muestra cuando `requestCount === 0` — mover `@if (showPausedSuffix)` dentro del bloque `@if (item.requestCount > 0)` [`mis-objetos.component.html:~158`]
- [x] [Review][Patch] Falta test frontend para caso `requestCount > 0` (icono + «N solicitudes») [`mis-objetos.component.spec.ts`]
- [x] [Review][Defer] Literal `'pending'` hardcodeado en SQL sin constante de enum — pre-existente, patrón transversal
- [x] [Review][Defer] Pluralización manual con ternario en lugar de ICU/Transloco plural rules — pre-existente
- [x] [Review][Defer] `pausedDescId` invocado dos veces por ítem — acoplamiento frágil pero funcional, pre-existente
- [x] [Review][Defer] `firstName`/`lastName` sin `.min(1)` en schema Zod — degradación silenciosa a UUID initials, pre-existente

## Spec Change Log

## Design Notes

**Prototipo referencia** (`Mis objetos.html` L375–382):
```jsx
{item.status === 'active' && item.requestCount > 0 && (
  <span><IUser sz={11}/> {item.requestCount} {item.requestCount===1?'solicitud':'solicitudes'}
    {item.requestsPaused && <span style={{ color:C.fgMuted }}> · pausadas</span>}
  </span>
)}
{item.status === 'active' && item.requestCount === 0 && (
  <span>Sin solicitudes aún</span>
)}
```

Usar la i18n existente: `items.my_objects.no_requests_yet` para el caso 0. Para el caso `> 0` añadir claves `items.my_objects.requests_count_one` («1 solicitud») y `items.my_objects.requests_count` («{{ count }} solicitudes») en los tres idiomas.

**requestCount en SQL** — Añadir el conteo como subconsulta correlacionada o LEFT JOIN con GROUP BY. Ejemplo mínimo:
```sql
(SELECT COUNT(*) FROM item_requests ir WHERE ir.item_id = i.id AND ir.status = 'pending')::int AS pending_count
```

## Verification

**Commands:**
- `cd backend && npm run openapi:generate` -- expected: sin errores, `openapi/openapi.json` actualizado con `requestCount` y `firstName`/`lastName`
- `cd backend && npm test` -- expected: todos los tests pasan (incluyendo los nuevos/actualizados)
- `cd regalalo && npm run api:generate` -- expected: sin errores, `src/app/core/api/generated/models/my-item.ts` incluye `requestCount`, `ranked-candidate.ts` incluye `firstName`/`lastName`
- `cd regalalo && npx ng test --watch=false --include="src/app/features/items/mis-objetos/**/*.spec.ts" --include="src/app/shared/components/candidate-row/**/*.spec.ts"` -- expected: todos los tests pasan

## Suggested Review Order

**requestCount — correlated subquery**

- Correlated subquery counts `pending` requests per item directly in `findMyItems` SELECT
  [`user.repository.ts:411`](../../../backend/src/infrastructure/database/supabase/user.repository.ts#L411)

- Mapping row → domain: `parseInt` normalises PostgreSQL's `COUNT` string output
  [`user.repository.ts:431`](../../../backend/src/infrastructure/database/supabase/user.repository.ts#L431)

- Use-case passes `requestCount` through to DTO unchanged
  [`get-my-items.use-case.ts:28`](../../../backend/src/application/use-cases/user/get-my-items.use-case.ts#L28)

- OpenAPI schema registers `requestCount` as a required integer on `MyItem`
  [`user.schemas.ts:83`](../../../backend/src/openapi/schemas/user.schemas.ts#L83)

**requestCount — template display**

- `@if (item.requestCount > 0)` shows person icon + count; `@else` shows "Sin solicitudes aún"
  [`mis-objetos.component.html:149`](../../src/app/features/items/mis-objetos/mis-objetos.component.html#L149)

**firstName/lastName — SQL addition to existing JOIN**

- `u.first_name`/`u.last_name` added to inner SELECT; JOIN on `users` already existed
  [`request.repository.ts:87`](../../../backend/src/infrastructure/database/supabase/request.repository.ts#L87)

- Outer SELECT and result-type shape updated to expose both fields
  [`request.repository.ts:82`](../../../backend/src/infrastructure/database/supabase/request.repository.ts#L82)

- Mapping row → domain adds `firstName`/`lastName`
  [`request.repository.ts:119`](../../../backend/src/infrastructure/database/supabase/request.repository.ts#L119)

- OpenAPI schema adds `firstName`/`lastName` to `RankedCandidate`
  [`item.schemas.ts:93`](../../../backend/src/openapi/schemas/item.schemas.ts#L93)

**firstName/lastName — avatar binding**

- Avatar now receives real name fields; `UserAvatarComponent` uses `initialsFromName` instead of UUID fallback
  [`candidate-row.component.html:11`](../../src/app/shared/components/candidate-row/candidate-row.component.html#L11)

**Peripherals**

- `requestCount` in generated `MyItem` model (regenerated, do not edit manually)
  [`my-item.ts:12`](../../src/app/core/api/generated/models/my-item.ts#L12)

- `firstName`/`lastName` in generated `RankedCandidate` model
  [`ranked-candidate.ts:5`](../../src/app/core/api/generated/models/ranked-candidate.ts#L5)

- i18n keys for singular/plural count in all three locales
  [`es.json:496`](../../public/i18n/es.json#L496)

- Backend test: `requestCount: 3` assertion on `GET /users/me/items`
  [`users-items.test.ts:113`](../../../backend/tests/users-items.test.ts#L113)

- Backend test: `firstName`/`lastName` in `GET /items/:id/requests` response
  [`items-candidates.test.ts:109`](../../../backend/tests/items-candidates.test.ts#L109)

- Frontend test: avatar renders «CL» initials for Carlos López
  [`candidate-row.component.spec.ts:127`](../../src/app/shared/components/candidate-row/candidate-row.component.spec.ts#L127)
