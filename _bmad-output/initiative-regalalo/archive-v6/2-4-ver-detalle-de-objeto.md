# Story 2.4: Ver detalle de objeto

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed. -->

## Story

Como usuario autenticado,
quiero ver el detalle completo de un objeto,
para decidir si solicitarlo o gestionarlo si soy el donante.

## Acceptance Criteria

1. **Given** la ruta protegida `/items/:id` con UUID válido  
   **When** cargo la página  
   **Then** se llama `ItemsService.itemsIdGet({ id })` y se muestra título, descripción, condición, estado, `requestsPaused`, `degradedAt`, distancia, galería de imágenes y donante (`id`, `reputationScore`)

2. **Given** el usuario autenticado es el donante (`session.user.id === item.donor.id`)  
   **When** ve el detalle  
   **Then** no se muestra el CTA «Me interesa»; sí una zona de gestión con enlaces/acciones reservadas para historias 2.5, 2.6 y 3.2 (sin implementar lógica de cancelar/pausar/candidatos en esta historia)

3. **Given** el usuario no es donante, `status === 'active'` y `requestsPaused === false`  
   **When** ve el detalle  
   **Then** se muestra el botón «Me interesa» con estilo del prototipo (handler de solicitud se implementa en historia 3.1)

4. **Given** el usuario no es donante y (`status !== 'active'` o `requestsPaused === true`)  
   **When** ve el detalle  
   **Then** el CTA «Me interesa» no está disponible (oculto o deshabilitado con mensaje de pausa/estado según prototipo `CtaBlock`)

5. **Given** objeto no encontrado (`404`)  
   **When** cargo la ruta  
   **Then** pantalla de error 404 amigable en contexto de ítems (mensaje + volver al tablón), sin romper el shell

6. **Given** `reputationScore` negativo del donante  
   **When** se renderiza la fila de donante  
   **Then** se muestra el valor numérico real (p. ej. `-15`), sin truncar a cero ni ocultar el signo (NFR-F7)

7. **Given** error `401`  
   **When** el token expiró  
   **Then** el interceptor global redirige a login (no duplicar en el feature)

8. **Given** galería con N imágenes (`images.length >= 1`)  
   **When** navego miniaturas o flechas  
   **Then** la imagen principal y el contador «Foto X de N» se actualizan con foco accesible en controles

## Tasks / Subtasks

- [x] **Prerrequisito API — `requestsPaused` en detalle** (AC: 1, 3, 4) — ver «Brecha contrato API»
  - [x] Backend: añadir `requestsPaused` a `ItemDetail`, SQL `findById`, `GetItemResponseDto`, `getItemResponseSchema`
  - [x] `npm run openapi:generate` (backend) → `npm run api:generate` (frontend)
  - [x] Verificar `GetItemResponse.requestsPaused` en `generated/models/get-item-response.ts`

- [x] Registrar ruta y componente detalle (AC: 1, 5, 7)
  - [x] En `items.routes.ts`: `{ path: 'items/:id', loadComponent: () => import('./detalle/detalle.component')... }`
  - [x] Coherente con `ItemFeedCardComponent` que ya usa `routerLink` `['/items', id]`
  - [x] `authGuard` heredado del padre `AppShellComponent` — no duplicar

- [x] Implementar `DetalleComponent` (AC: 1–8)
  - [x] Leer `id` desde `ActivatedRoute` (patrón `login.component.ts`)
  - [x] Estado signals: `item`, `loading`, `error`, `notFound`, `selectedImageIndex`
  - [x] Carga: `itemsIdGet({ id })` en `ngOnInit` + `takeUntilDestroyed`
  - [x] Layout portado de `Explorar v3.html` → `DetailModal` (L546–674): header título + cerrar/volver, grid 2 columnas (galería | info), chips condición + distancia, descripción, `DonorRow`, aviso degradado, bloque CTA
  - [x] Responsive: `@media` del prototipo (modal-grid 1 col en móvil) aplicado a página completa

- [x] Lógica de visibilidad CTA y donante (AC: 2–4)
  - [x] `isDonor = computed(() => session.user()?.id === item()?.donor.id)`
  - [x] `canShowRequestCta = computed(() => !isDonor() && item()?.status === 'active' && !item()?.requestsPaused)`
  - [x] `showPausedCta = computed(() => !isDonor() && item()?.requestsPaused)`
  - [x] Botón «Me interesa»: visible si `canShowRequestCta`; `(click)` vacío o comentario `// 3.1` — no llamar `itemsIdRequestsPost` aún
  - [x] Zona donante: texto/enlaces placeholder hacia futuras rutas (`/items/:id/candidates` épica 3)

- [x] Componentes reutilizables (recomendado)
  - [x] `ItemImageGalleryComponent` en `shared/components/item-image-gallery/` (inputs: `images`, `title` para alt)
  - [x] `ItemDonorRowComponent` en `shared/components/item-donor-row/` (reputación con color por umbral del prototipo L378–400; enlace a `/users/:id` **opcional** — ruta pública en 5.5)
  - [x] Reutilizar `formatDistanceKm` de `core/utils/format-distance.util.ts`

- [x] i18n `items.detail.*` en `public/i18n/{es,ca,en}.json` (AC: 1–6)
  - [x] Título página, volver, foto N de M, donante, estados pausa, CTA, degradado, 404, errores carga, gestión donante
  - [x] Reutilizar `items.publish.condition_*` y `items.explore.distance_km`

- [x] Specs
  - [x] `detalle.component.spec.ts`: carga OK, 404, donante sin CTA, receptor con CTA, reputación negativa, pausa
  - [x] Specs de subcomponentes galería/donante si se extraen

### Review Findings

- [x] [Review][Patch] Condición de carrera en `loadItem` al cambiar `:id` rápido [`detalle.component.ts:127`]
- [x] [Review][Patch] UUID inválido (400) muestra error genérico en lugar de pantalla 404 amigable [`detalle.component.ts:136-146`]
- [x] [Review][Patch] `paramMap` sin `id` deja `loading` en true indefinidamente [`detalle.component.ts:110-114`]
- [x] [Review][Patch] AC8: falta mover foco al cambiar foto (miniaturas/flechas) [`item-image-gallery.component.ts:35-50`]
- [x] [Review][Patch] Galería: `role="tablist"` sin `tabpanel` ni patrón de pestañas completo (ARIA) [`item-image-gallery.component.html:84-98`]
- [x] [Review][Patch] Falta test de CTA no disponible cuando `status !== 'active'` (AC 4) [`detalle.component.spec.ts`]
- [x] [Review][Defer] `resolveStoragePublicUrl` sin test para `STORAGE_DRIVER=local` [`resolve-storage-public-url.ts`] — deferred, pre-existing scope
- [x] [Review][Defer] Resolución de URLs en list/my-items no pedida explícitamente en 2.4 pero coherente con imágenes en feed [`list-items.use-case.ts`] — deferred, mejora transversal

## Dev Notes

### ⛔ Diseño obligatorio

**Fichero:** `docs/project/Explorar v3.html` — `DetailModal` (L546–674), `DonorRow` (L378–401), `CtaBlock` (L404–506).  
**Tokens:** `docs/project/colors_and_type.css`.

| Elemento prototipo | Implementación Angular (historia 2.4) |
|---|---|
| Modal fijo centrado | **Página** bajo shell (`/items/:id`), mismo layout interno (no overlay modal desde feed) |
| Header título + botón cerrar | Título + botón «Volver» → `routerLink="/explorar"` o `Location.back()` |
| Galería 1:1 + thumbs + flechas | `ItemImageGalleryComponent` |
| Chips condición + distancia | Transloco + `formatDistanceKm` |
| Descripción | Texto `description` del API |
| `DonorRow` | `ItemDonorRowComponent`; score con signo real |
| Aviso `item.degraded` | Si `degradedAt != null` — copy prototipo L650–657 |
| `CtaBlock` estados pausa / Me interesa | Solo estados necesarios para 2.4 (sin `requestState` selected/pending — épica 3) |
| Confirm modal solicitud | **Historia 3.1** — no implementar |

**Nota:** El prototipo abre detalle como modal desde el grid; epics exigen ruta `/items/:id`. El feed (`ItemFeedCardComponent`) ya navega a esa ruta — mantener deep linking.

### Ruta brownfield

| Epics.md | Proyecto | Acción |
|---|---|---|
| `/items/:id` | No existe aún en `items.routes.ts` | **Añadir** lazy route |
| Feed en `/explorar` | `ItemFeedCard` → `['/items', id]` | Ya preparado |
| Publicar redirige a detalle | 2.2 redirige a `/mis-objetos` | Opcional: tras 2.4, actualizar 2.2 a `/items/:id` (fuera de alcance salvo acuerdo) |

### API — contrato exacto

**Servicio:** `ItemsService.itemsIdGet` — `src/app/core/api/generated/services/items.service.ts`  
**Path:** `GET /items/{id}`  
**Respuesta:** `GetItemResponse` (regenerar tras fix backend)

```typescript
const item = await this.itemsApi.itemsIdGet({ id: routeId });
this.item.set(item);
```

**Campos esperados tras regeneración:**

| Campo | UI |
|---|---|
| `title`, `description`, `condition` | Header + cuerpo |
| `status` | Badge/chip (donante y contexto) |
| `requestsPaused` | CTA pausado vs activo |
| `degradedAt` | Banner degradado |
| `distanceMeters` | Chip km |
| `images[]` | Galería; `<img>` directo (NFR-F6) |
| `donor.id`, `donor.reputationScore` | Fila donante; comparar con `SessionService.user().id` |
| `createdAt` | Opcional «miembro desde» si hay util de fecha; no bloqueante |

### ⚠️ Brecha contrato API — `requestsPaused` en GET detalle

Los AC de epics exigen `requestsPaused` en detalle. **Hoy falta en toda la cadena de detalle:**

| Capa | Estado |
|---|---|
| `ItemDetail` / `findById` SQL | No selecciona `requests_paused` |
| `GetItemResponseDto` | Sin campo |
| `getItemResponseSchema` (Zod) | Sin campo |
| `GetItemResponse` generado (frontend) | Sin campo |
| `docs/architecture.md` § Cambio 2 | Documenta el campo (spec deseado) |

**Acción obligatoria antes o en la misma PR que 2.4:**

1. `backend/src/domain/repositories/item.repository.ts` — `requestsPaused: boolean` en `ItemDetail`
2. `backend/src/infrastructure/database/supabase/item.repository.ts` — `i.requests_paused` en SELECT y mapeo
3. `backend/src/application/dtos/get-item.dto.ts` + `get-item.use-case.ts` — mapear campo
4. `backend/src/openapi/schemas/item.schemas.ts` — añadir a `getItemResponseSchema`
5. Regenerar OpenAPI + `npm run api:generate` en frontend

Sin esto, AC#1 y AC#3–4 no son verificables.

### Imágenes y reputación

- URLs Storage en `images[]` — `<img [src]="url" [alt]="...">`, `loading="lazy"`; **no** `NgOptimizedImage`
- `reputationScore < 0`: mostrar tal cual (`-20`), color según umbrales prototipo (≥60 primary, ≥20 warn, else error) — **no** usar `Math.max(0, score)`
- `images.length === 0`: placeholder icono (objeto cancelado/completado >30 días puede devolver array vacío según backend L199–208)

### Visibilidad CTA (matriz)

| isDonor | status | requestsPaused | UI CTA |
|---|---|---|---|
| sí | * | * | Sin «Me interesa»; bloque gestión donante |
| no | `active` | `false` | Botón «Me interesa» visible (click → 3.1) |
| no | `active` | `true` | Bloque pausa (deshabilitado) |
| no | ≠ `active` | * | Sin solicitud; indicar estado (`reserved`, etc.) |

### Fuera de alcance (historias siguientes)

| Funcionalidad | Historia |
|---|---|
| `POST` solicitar objeto | 3.1 |
| Cancelar objeto | 2.5 / 4.5 |
| Toggle pausa | 2.6 |
| Lista candidatos | 3.2 |
| Perfil público `/users/:id` | 5.5 |
| Turnos restantes 3/30 días | 3.1 (API + UI); en 2.4 no inventar contador |

### Errores HTTP

| Código | Manejo |
|---|---|
| `401` | Interceptor — no duplicar |
| `404` | Vista `notFound` + CTA «Volver al tablón» |
| Red / 5xx | Banner reintentar (`AlertBoxComponent`) |
| UUID inválido en ruta | Tratar como error carga o 404 según respuesta API |

### Componentes compartidos existentes

| Componente | Uso en 2.4 |
|---|---|
| `BtnComponent` | Volver, reintentar, CTA |
| `AlertBoxComponent` | Error de carga |
| `ItemFeedCardComponent` | Solo enlace entrante — no modificar salvo copy |
| `formatDistanceKm` | Chip distancia |

### Estructura de archivos

```
src/app/features/items/detalle/
├── detalle.component.ts
├── detalle.component.html
├── detalle.component.scss
└── detalle.component.spec.ts

src/app/shared/components/item-image-gallery/   ← NUEVO (recomendado)
src/app/shared/components/item-donor-row/         ← NUEVO (recomendado)

src/app/features/items/items.routes.ts            ← UPDATE: ruta items/:id
```

**NO modificar** `src/app/core/api/generated/` manualmente.

### i18n — claves nuevas (`items.detail.*`)

Añadir en `es`, `ca`, `en` (referencia ES):

| Clave | ES |
|---|---|
| `back` | Volver al tablón |
| `photo_of` | Foto {{current}} de {{total}} |
| `donor_label` | Donante |
| `member_since` | Miembro desde {{date}} |
| `reputation_good` | Buen historial |
| `reputation_fair` | Historial regular |
| `reputation_low` | Historial bajo |
| `degraded_notice` | Este objeto lleva un tiempo publicado. El donante aún puede elegir receptor. |
| `cta_interested` | Me interesa |
| `cta_paused_title` | Solicitudes pausadas |
| `cta_paused_body` | El donante ha pausado nuevas solicitudes temporalmente. |
| `cta_unavailable` | No disponible para solicitar |
| `donor_manage_hint` | Gestiona este objeto desde Mis objetos (cancelar y pausar en próximas historias). |
| `status_active` | Disponible |
| `status_reserved` | Reservado |
| `status_completed` | Completado |
| `status_cancelled` | Cancelado |
| `not_found_title` | Objeto no encontrado |
| `not_found_body` | Puede que se haya cancelado o ya no esté disponible. |
| `loading` | Cargando objeto… |
| `errors.load_failed` | No se pudo cargar el objeto. |
| `errors.retry` | Reintentar |

### Testing

```bash
npx ng test --watch=false --include="src/app/features/items/detalle/**/*.spec.ts"
```

- Mock `ItemsService.itemsIdGet` con `GetItemResponse` completo
- Caso `reputationScore: -10` → template muestra `-10`
- Donante: `SessionService` mock con mismo `id` que `donor.id` → sin botón solicitar
- `404` → `not_found_title` visible

### Previous Story Intelligence (2.3 — in-progress / feed)

- `ItemFeedCardComponent` ya enlaza a `/items/:id` — **esta historia desbloquea el destino**
- i18n `items.explore.*` ya existe en `es.json`; explorar puede seguir en stub — detalle no depende del feed implementado
- Patrón imágenes: `<img>` + alt con Transloco; `formatDistanceKm` ya en core
- Brecha `degradedAt` en listado documentada en 2.3 — detalle **sí** trae `degradedAt` del API actual

### Previous Story Intelligence (2.2 — done)

- Tras publicar se navega a `/mis-objetos`; opcional enlazar al detalle cuando exista 2.4
- Condiciones y validación postal — reutilizar claves `items.publish.condition_*`
- Patrones: OnPush, signals, `inject()`, `takeUntilDestroyed`, specs con `TranslocoTestingModule`

### Git intelligence reciente

- `827a591` — feature items/publicar; seguir misma estructura feature + i18n trilingüe
- `5353a1e` — convención claves `items.*` anidadas
- No introducir `HttpClient` manual ni tipos duplicados del contrato

### Anti-patterns (prohibido)

| Prohibido | Hacer en su lugar |
|---|---|
| Modal-only sin ruta | Ruta `/items/:id` + layout prototipo |
| `itemsIdRequestsPost` en 2.4 | Deferir a 3.1 |
| Cancelar/pausar en 2.4 | Deferir a 2.5 / 2.6 |
| `Math.max(0, reputationScore)` | Valor real |
| `NgOptimizedImage` en URLs API | `<img>` |
| Strings en template | Transloco |
| Editar `generated/` | Regenerar API |
| Duplicar guard JWT | `authGuard` padre |

### Project Structure Notes

- Ruta bajo `features/items/detalle/` alineada con `explorar/`, `publicar/`.
- Galería/donante en `shared/` si otros flujos (mis objetos, candidatos) las reutilizarán en 3.x/5.x.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 2.4, FR-F8, UX-DR5, tabla diseño 2.4]
- [Source: `docs/architecture.md` — GET /items/:id, § requestsPaused]
- [Source: `docs/api-client.md` — ItemsService.itemsIdGet]
- [Source: `docs/project/Explorar v3.html` — DetailModal, DonorRow, CtaBlock]
- [Source: `../backend/src/application/use-cases/item/get-item.use-case.ts`]
- [Source: `../backend/src/infrastructure/database/supabase/item.repository.ts` — findById]
- [Source: `_bmad-output/implementation-artifacts/2-3-listar-objetos-disponibles-feed-geografico.md`]
- [Source: `_bmad-output/implementation-artifacts/2-2-publicar-objeto-con-formulario-e-imagenes.md`]
- [Source: `_bmad-output/project-context.md`]
- [Source: `src/app/shared/components/item-feed-card/item-feed-card.component.ts`]
- [Source: `src/app/features/items/items.routes.ts`]

## Dev Agent Record

### Agent Model Used

Composer (dev-story)

### Debug Log References

- Brecha API `requestsPaused`: añadido en backend `findById` + OpenAPI; regenerado cliente frontend.
- Tests landing preexistentes fallan (IntersectionObserver / i18n) — no relacionados con 2.4.

### Completion Notes List

- Página `/items/:id` con layout DetailModal (grid 2 col, responsive 1 col móvil).
- `ItemsService.itemsIdGet` + estados loading/404/error; 401 delegado al interceptor.
- CTA «Me interesa» / pausa / no disponible / zona donante según matriz AC 2–4.
- `ItemImageGalleryComponent` y `ItemDonorRowComponent` (reputación negativa sin truncar).
- i18n `items.detail.*` en es/ca/en.
- Backend: `requestsPaused` en GET detalle; tests `items-get.test.ts` actualizados (7/7).
- Frontend: 8 tests nuevos (detalle 6, galería 1, donante 1) — todos pasan.

### File List

**Backend**
- src/domain/repositories/item.repository.ts
- src/infrastructure/database/supabase/item.repository.ts
- src/application/dtos/get-item.dto.ts
- src/application/use-cases/item/get-item.use-case.ts
- src/openapi/schemas/item.schemas.ts
- openapi/openapi.json
- tests/items-get.test.ts

**Frontend**
- src/app/features/items/items.routes.ts
- src/app/features/items/detalle/detalle.component.ts
- src/app/features/items/detalle/detalle.component.html
- src/app/features/items/detalle/detalle.component.scss
- src/app/features/items/detalle/detalle.component.spec.ts
- src/app/shared/components/item-image-gallery/item-image-gallery.component.ts
- src/app/shared/components/item-image-gallery/item-image-gallery.component.html
- src/app/shared/components/item-image-gallery/item-image-gallery.component.scss
- src/app/shared/components/item-image-gallery/item-image-gallery.component.spec.ts
- src/app/shared/components/item-donor-row/item-donor-row.component.ts
- src/app/shared/components/item-donor-row/item-donor-row.component.html
- src/app/shared/components/item-donor-row/item-donor-row.component.scss
- src/app/shared/components/item-donor-row/item-donor-row.component.spec.ts
- src/app/core/api/generated/models/get-item-response.ts
- public/i18n/es.json
- public/i18n/ca.json
- public/i18n/en.json

### Change Log

- 2026-05-22: Historia 2.4 — detalle de objeto, brecha `requestsPaused` en API, ruta `/items/:id`, galería y fila donante compartidas.
- 2026-05-22: Code review — race en carga, 400→404, ARIA/foco galería, tests AC4/AC5.
