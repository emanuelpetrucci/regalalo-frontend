---
ticket: 1
status: done
type: feature
migrated_from: v6
---

# Story 4.1: Ver detalle de sesión de entrega

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ampliación API 2026-05-23 (contraparte + ítem + rol en GET sesión). -->

## Story

Como donante o receptor,
quiero ver el estado y datos de mi sesión de entrega,
para coordinar la entrega.

## Acceptance Criteria

### Backend — extensión `GET /delivery-sessions/:id` (prerrequisito)

1. **Given** un participante autenticado (donante o receptor)  
   **When** `GET /delivery-sessions/:id`  
   **Then** `200` incluye los campos actuales **más** `role`, `item`, `otherParty` (ver contrato abajo)  
   **And** `role` es `'donor'` o `'receiver'` respecto al usuario autenticado

2. **Given** la sesión existe  
   **When** se construye `item`  
   **Then** incluye `title`, `condition`, `images[]` (URLs públicas, mismo criterio que `GET /items/:id`)  
   **And** no expone `description` ni datos innecesarios del listado

3. **Given** la sesión existe  
   **When** se construye `otherParty`  
   **Then** incluye `userId`, `reputationScore` (puede ser negativo, NFR-F7), `distanceMeters` (distancia ítem ↔ ubicación del otro participante)  
   **And** **no** incluye email, teléfono ni `consecutiveNoShows`

4. **Given** SEC-002 vigente para `contactChannel` (solo receptor, `active`, no purgado)  
   **When** el solicitante es receptor  
   **Then** `contactChannel` sigue la regla actual (sin cambios)

5. **Given** el solicitante es donante, sesión `active` y `contact_purged = false`  
   **When** hay valor almacenado en BD  
   **Then** `sharedContactChannel` devuelve el canal que el donante facilitó (eco read-only para UI «Canal facilitado al receptor»)  
   **And** si no hay valor o sesión no activa o purgado → `sharedContactChannel: null`

6. **Given** el solicitante es receptor o no participa en la condición del AC 5  
   **When** se serializa la respuesta  
   **Then** `sharedContactChannel` es siempre `null` (no confundir con `contactChannel`)

7. **Given** participación, 403, 404, 400, 401  
   **When** aplican  
   **Then** sin regresión en tests `16.1`–`16.8`; añadir tests `16.9`+ para campos nuevos

### Frontend — pantalla `/entregas/:id`

8. **Given** la ruta protegida `/entregas/:id` con UUID válido  
   **When** cargo la página  
   **Then** **un solo** `DeliveryService.deliverySessionsIdGet({ id })` alimenta la UI (sin `itemsIdGet` auxiliar salvo fallback documentado)  
   **And** se muestran campos de sesión + `role` + `item` + `otherParty` + canales según AC 9–11

9. **Given** `contactChannel` no nulo (receptor, SEC-002)  
   **When** renderizo  
   **Then** bloque canal receptor (`ChannelBlock` / prototipo) — sin lógica extra de visibilidad en cliente

10. **Given** `sharedContactChannel` no nulo (donante, sesión activa)  
    **When** renderizo variante donante  
    **Then** bloque «Canal facilitado al receptor» con ese valor

11. **Given** el canal aplicable (`contactChannel` o `sharedContactChannel` según rol) es `null`  
    **When** renderizo  
    **Then** copy i18n «no disponible» — no inventar valores

12. **Given** `otherParty` en respuesta  
    **When** renderizo bloque contraparte  
    **Then** iniciales vía `initialsFromUserId(otherParty.userId)`, score con tono (patrón `CandidateRow`), distancia con `formatDistanceKm` — paridad `Entregas.html` L533–546 / L626–638

13. **Given** `role === 'donor'` y `status === 'active'`  
    **When** veo acciones  
    **Then** botones confirmar / cancelar **visibles** (wire 4.2 / 4.3)

14. **Given** 403 / 404  
    **When** falla el GET  
    **Then** error amigable distinguible + volver a `/entregas` o `/mis-objetos`

15. **Given** éxito en selección de receptor (3.3)  
    **When** el donante pulsa enlace del banner  
    **Then** navega a `/entregas/:sessionId` (deep link)

## Tasks / Subtasks

### A. Backend (`../backend/`) — extensión contrato

- [x] **Repo enriquecido** (AC: 1–3)
  - [x] Añadir `findByIdForParticipant(sessionId, currentUserId)` o extender `findById` con JOIN en `delivery-session.repository.ts`:
    - `items` → title, condition, image paths (misma regla 30 días que `item.repository.findById`)
    - `users` otro participante → `reputation_score`
    - `ST_Distance(item.location, other_user.location)` → `distance_meters`
  - [x] Dominio: tipo `DeliverySessionParticipantView` en `delivery-session.repository.ts`

- [x] **Use case** (AC: 1–6)
  - [x] Ampliar `GetDeliverySessionResponseDto` y `get-delivery-session.use-case.ts`
  - [x] `role`: donor si `currentUserId === donorId`, else receiver
  - [x] `images`: `resolveStoragePublicUrls` como `get-item.use-case.ts`
  - [x] `contactChannel` / `sharedContactChannel`: reglas SEC-002 y SEC-002b (abajo)
  - [x] Inyectar `IItemRepository` o ampliar solo delivery repo — preferir **una query** en delivery repo para evitar N+1

- [x] **OpenAPI** (AC: 1–6)
  - [x] Extender `deliverySessionSchema` en `delivery.schemas.ts` con `role`, `item`, `otherParty`, `sharedContactChannel`
  - [x] `npm run openapi:generate` en backend

- [x] **Arquitectura** (AC: 4–6)
  - [x] Actualizar `docs/architecture.md` §12.2: añadir §12.2b `sharedContactChannel` (solo donante, active, no purgado)
  - [x] Documentar campos `otherParty` (sin PII)

- [x] **Tests** (AC: 7)
  - [x] `tests/delivery-sessions-get.test.ts`: 16.9 donante → `role`, `item`, `otherParty`, `sharedContactChannel`; 16.10 receptor → `contactChannel`, `sharedContactChannel` null; 16.11 `reputationScore` negativo; 16.12 sin `email` en body

### B. Frontend — regenerar cliente y UI

- [x] **API client** (AC: 8)
  - [x] Tras merge backend: `npm run api:generate` en `regalalo`
  - [x] Verificar `DeliverySession` generado con campos nuevos

- [x] **Rutas y componente** (AC: 8, 14, 15)
  - [x] `delivery.routes.ts`: `entregas/:id` → `entrega-detalle.component`
  - [x] `features/delivery/entrega-detalle/` (ts, html, scss, spec)
  - [x] `ActivatedRoute` + `toSignal`; **solo** `deliverySessionsIdGet`

- [x] **UI prototipo** (AC: 8–13)
  - [x] `DetailPanel`, `DonorDetail`, `ReceiverDetail`, `DeadlinePill`, `StatusBadge` desde `Entregas.html`
  - [x] `ItemImageGalleryComponent` con `session.item.images`
  - [x] Bloque contraparte con `otherParty` + utilidades existentes
  - [x] `@if (session.contactChannel)` receptor; `@if (session.sharedContactChannel)` donante
  - [x] Acciones visibles donante+active (stubs 4.2/4.3)

- [x] **i18n** `delivery.detail.*` en es/ca/en

- [x] **Errores** `delivery-session-error.util.ts` + spec

- [x] **mis-objetos** (AC: 15): enlace banner éxito → `/entregas/{{ sessionId }}`

- [x] **Tests** frontend: entrega-detalle spec, app.routes si aplica

## Dev Notes

### Contrato API ampliado (objetivo)

```typescript
interface DeliverySessionItemSummary {
  title: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'; // ItemCondition del spec
  images: string[];
}

interface DeliverySessionOtherParty {
  userId: string;
  reputationScore: number;
  distanceMeters: number;
}

interface DeliverySession {
  // — existentes —
  id: string;
  itemId: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  contactChannel: string | null;       // SEC-002: solo receptor
  sharedContactChannel: string | null; // SEC-002b: solo donante (eco)
  deadlineAt: string;
  donorConfirmed: boolean;
  noShowDeclared: boolean;
  createdAt: string;
  completedAt: string | null;
  // — nuevos —
  role: 'donor' | 'receiver';
  item: DeliverySessionItemSummary;
  otherParty: DeliverySessionOtherParty;
}
```

### SEC-002 y SEC-002b (visibilidad canales — backend only)

| Campo | Visible cuando |
|---|---|
| `contactChannel` | `currentUser === receiver` ∧ `status === active` ∧ `!contactPurged` |
| `sharedContactChannel` | `currentUser === donor` ∧ `status === active` ∧ `!contactPurged` ∧ valor en BD |

El frontend **no** decide visibilidad: renderiza cada bloque solo si el campo correspondiente viene no nulo.

### ⛔ Diseño — `Entregas.html`

| Elemento prototipo | Fuente en API ampliado |
|---|---|
| `session.item.title`, imágenes | `item.title`, `item.images` |
| `session.other.initials/score/distance` | `otherParty` + `initialsFromUserId`, tonos score, `formatDistanceKm` |
| Canal donante «facilitado» | `sharedContactChannel` |
| Canal receptor | `contactChannel` |
| `session.role` | `role` (no inferir con `itemsIdGet`) |

### Orden de implementación

```
1. Backend: repo + use case + OpenAPI + tests 16.9+
2. npm run openapi:generate (backend) → npm run api:generate (frontend)
3. Frontend: entrega-detalle con un solo GET
4. Enlace mis-objetos (opcional pero recomendado)
```

### SQL orientativo (otherParty distance)

Misma semántica que candidatos: distancia entre `items.location` y `users.location` del **otro** participante (no del viewer).

```sql
-- other_user_id = CASE WHEN current = donor THEN receiver_id ELSE donor_id END
ROUND(ST_Distance(i.location, other_u.location))::int AS distance_meters
```

### Brownfield

| Pieza | Acción |
|---|---|
| `GET /delivery-sessions/:id` base | Hecho (backend historia 4.2 interna) — **extender**, no reescribir |
| `mis-objetos` `deliverySessionsIdGet` | Tras ampliación, tipos generados ganan campos; panel `reserved` puede ignorar extras |
| `itemsIdGet` en detalle entrega | **Eliminar** del flujo 4.1 (sustituido por embed `item`) |

### Anti-patterns

| Prohibido | Hacer |
|---|---|
| Segundo GET `itemsIdGet` en detalle entrega | Un solo `deliverySessionsIdGet` |
| Calcular `role` en cliente comparando ítem | Usar `session.role` del API |
| Mostrar email de contraparte | Solo `userId` + score + distancia |
| Filtrar `contactChannel` en TS | Confiar en backend SEC-002 / 002b |
| Editar `generated/` | Regenerar cliente |

### Fuera de alcance (sin cambio)

| Funcionalidad | Historia |
|---|---|
| Listado sesiones | 4.4 |
| POST confirm / cancel | 4.2, 4.3 |
| Cancelar objeto con sesión activa | 4.5 |
| Perfil público contraparte (enlace) | 5.5 opcional |

### Previous Story Intelligence (3.3)

- Tras select, `sessionId` listo para `/entregas/:sessionId`.
- `initialsFromUserId`, `formatDistanceKm`, tonos score: copiar de `candidate-row` / `item-select-receiver-dialog`.

### Testing

```bash
# Backend
cd ../backend && npx vitest run tests/delivery-sessions-get.test.ts

# Frontend (tras api:generate)
npx ng test --watch=false --include="src/app/features/delivery/**/*.spec.ts"
```

### References

- [Source: `docs/project/Entregas.html` — DonorDetail, ReceiverDetail, DetailPanel]
- [Source: `backend/docs/architecture.md` — §12.2 + nueva §12.2b]
- [Source: `backend/tests/delivery-sessions-get.test.ts`]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/3-3-seleccionar-receptor-con-canal-de-contacto.md`]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- Backend: `findByIdForParticipant` con JOIN ítem/otro usuario, SEC-002/002b, tests 16.1–16.12 en verde.
- Frontend: pantalla `/entregas/:id` con un solo `deliverySessionsIdGet`, i18n es/ca/en, enlace desde banner de éxito en mis-objetos.
- Fix colateral OpenAPI: `requestsPaused` restaurado en `MyItem` para no romper mis-objetos tras `api:generate`.

### File List

**Backend**
- `src/domain/repositories/delivery-session.repository.ts`
- `src/infrastructure/database/supabase/delivery-session.repository.ts`
- `src/application/dtos/get-delivery-session.dto.ts`
- `src/application/use-cases/delivery-session/get-delivery-session.use-case.ts`
- `src/openapi/schemas/delivery.schemas.ts`
- `src/openapi/schemas/user.schemas.ts`
- `docs/architecture.md`
- `openapi/openapi.json`
- `tests/delivery-sessions-get.test.ts`

**Frontend**
- `src/app/features/delivery/delivery.routes.ts`
- `src/app/features/delivery/delivery-session-error.util.ts`
- `src/app/features/delivery/delivery-session-error.util.spec.ts`
- `src/app/features/delivery/entrega-detalle/entrega-detalle.component.ts`
- `src/app/features/delivery/entrega-detalle/entrega-detalle.component.html`
- `src/app/features/delivery/entrega-detalle/entrega-detalle.component.scss`
- `src/app/features/delivery/entrega-detalle/entrega-detalle.component.spec.ts`
- `src/app/shared/components/delivery-session-status-badge/delivery-session-status-badge.component.ts`
- `src/app/shared/components/delivery-session-status-badge/delivery-session-status-badge.component.scss`
- `src/app/shared/components/delivery-session-step-trail/delivery-session-step-trail.component.ts`
- `src/app/shared/components/delivery-session-step-trail/delivery-session-step-trail.component.scss`
- `src/app/features/items/mis-objetos/mis-objetos.component.html`
- `src/app/features/items/mis-objetos/mis-objetos.component.scss`
- `public/i18n/es.json`
- `public/i18n/ca.json`
- `public/i18n/en.json`
- `src/app/core/api/generated/models/delivery-session.ts`
- `src/app/core/api/generated/models/delivery-session-item-summary.ts`
- `src/app/core/api/generated/models/delivery-session-other-party.ts`
- `src/app/core/api/generated/models/my-item.ts`

## Change Log

- 2026-05-23: Contexto historia 4.1 creado — detalle sesión en `/entregas/:id`, SEC-002, acciones visibles para 4.2/4.3.
- 2026-05-23: **Ampliación API** — `role`, `item`, `otherParty`, `sharedContactChannel`; backend prerrequisito; frontend un solo GET; paridad prototipo Entregas (contraparte + canal donante).
- 2026-05-23: Implementación completa dev-story — backend + frontend + tests; estado `review`.
- 2026-05-23: Code review BMad — 1 decision-needed, 6 patch, 2 defer, 3 dismissed.
- 2026-05-23: Code review patches aplicados — StepTrail, COALESCE distancia, tests AC 14/15; estado `done`.
- 2026-05-23: **Correct Course** — UI canónica pasa a panel en `/entregas` (historia 4.4); `entrega-detalle` se reutiliza, no segunda pantalla. Ver `sprint-change-proposal-2026-05-23.md`.

### Review Findings

- [x] [Review][Decision] Step trail portado — `app-delivery-session-step-trail` en detalle (paridad `Entregas.html`).

- [x] [Review][Patch] `distanceMeters` sin guarda ante `NULL` SQL [`delivery-session.repository.ts:359`]
- [x] [Review][Patch] Test 403 distingue de 404 en detalle [`entrega-detalle.component.spec.ts`]
- [x] [Review][Patch] Test UUID inválido → `not_found` [`entrega-detalle.component.spec.ts`]
- [x] [Review][Patch] Test deep link banner → `/entregas/:sessionId` (AC 15) [`mis-objetos.component.spec.ts`]
- [x] [Review][Patch] Test copy canal «no disponible» con sesión activa y canal null [`entrega-detalle.component.spec.ts`]
- [x] [Review][Patch] Ruta protegida `/entregas/:id` en spec de rutas [`app.routes.spec.ts`]

- [x] [Review][Defer] Refactor logging/recaptcha en backend (mismo working tree, fuera file list 4.1) — deferred, pre-existing
- [x] [Review][Defer] Cambios en `language-selector.component.ts` sin relación con 4.1 — deferred, pre-existing
