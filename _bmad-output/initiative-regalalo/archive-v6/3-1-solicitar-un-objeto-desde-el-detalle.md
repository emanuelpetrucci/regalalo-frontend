# Story 3.1: Solicitar un objeto desde el detalle

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed. -->

## Story

Como receptor autenticado,
quiero solicitar un objeto que me interesa,
para entrar en el ranking del donante.

## Acceptance Criteria

1. **Given** detalle de objeto ajeno, `status === 'active'`, `requestsPaused === false`  
   **When** pulso «Me interesa» y confirmo en el modal de confirmación  
   **Then** `ItemsService.itemsIdRequestsPost({ id })` se llama sin body y ante `201` la UI muestra el estado «Solicitud enviada» (botón reemplazado por bloque pendiente) y el botón «Me interesa» no vuelve a aparecer en esta sesión

2. **Given** intento solicitar mi propio objeto  
   **When** la UI muestra el botón por error (no debería, `isDonor()` lo oculta)  
   **Then** el botón **no está visible** para el donante; si la API devuelve `400`, se muestra `items.request.errors.own_item`

3. **Given** solicitud duplicada — ya solicité este objeto antes (`409` con `message === 'Already requested this item'`)  
   **When** falla la petición  
   **Then** mensaje `items.request.errors.duplicate` y la UI pasa al estado pendiente igualmente (el usuario ya tiene solicitud activa)

4. **Given** límite de 3 solicitudes activas en 30 días alcanzado (`409` con `message === 'Request limit reached'`)  
   **When** falla la petición  
   **Then** mensaje `items.request.errors.limit_reached` (diferenciado del duplicado) y el botón queda deshabilitado

5. **Given** `requestsPaused === true` (`409` con `message === 'Requests are paused for this item'`)  
   **When** llega el error (raro — la UI ya oculta/deshabilita el botón, pero puede darse por race condition)  
   **Then** mensaje `items.request.errors.paused` (FR-F12: diferenciado)

6. **Given** no autenticado (`401`)  
   **When** solicito  
   **Then** el interceptor global redirige a `/login?returnUrl=/items/:id` (sin duplicar lógica)

7. **Given** el modal de confirmación está abierto  
   **When** uso teclado o lector de pantalla  
   **Then** cumple WCAG AA: `role="dialog"`, `aria-modal="true"`, título/descripción asociados, foco inicial en el diálogo, `Escape` cierra sin confirmar, botones con etiquetas i18n, `disabled` durante petición en curso

## Tasks / Subtasks

- [x] **Componente modal de confirmación** (AC: 1, 7)
  - [x] `ItemRequestDialogComponent` en `shared/components/item-request-dialog/` portado de `ConfirmModal` en `Explorar v3.html` (líneas ~547–640)
  - [x] Inputs: `open`, `itemTitle`, `requesting` (boolean — estado loading)
  - [x] Outputs: `confirmed`, `dismissed`
  - [x] Overlay `rgba(20,23,26,0.5)`, panel `maxWidth:400`, `borderRadius:14`, `sh3`
  - [x] Cuerpo: copy i18n `items.request.dialog_*`; sin mostrar `turnosRestantes` (no disponible en API)
  - [x] Footer: ghost «Cancelar» + primary «Confirmar interés» con icono send
  - [x] Bloquear scroll body mientras abierto (patrón de `item-cancel-dialog`)
  - [x] Focus trap + restaurar foco al trigger (patrón de `item-cancel-dialog`)
  - [x] `Escape` cierra si no `requesting`

- [x] **Implementar `onInterestedClick()` en `DetalleComponent`** (AC: 1, 7)
  - [x] Abrir `requestDialogOpen.set(true)` y guardar `requestTriggerEl` (patrón idéntico a `openCancelDialog`)
  - [x] `requestDialogOpen`, `requesting`, `requestErrorKey`, `requestDone` signals nuevos
  - [x] Mover stub `onInterestedClick()` → abrir modal
  - [x] `closeRequestDialog()` respeta `requesting()` en curso

- [x] **`onRequestConfirm()` en `DetalleComponent`** (AC: 1–6)
  - [x] `requesting.set(true)` → `itemsApi.itemsIdRequestsPost({ id: current.id })`
  - [x] Éxito `201`: `requestDone.set(true)`, cerrar modal, **no** navegar (usuario se queda en detalle)
  - [x] Error `401`: ignorar (interceptor)
  - [x] Error `400`: `items.request.errors.own_item` (bannerKey en modal o detalle)
  - [x] Error `409`: diferenciar por `(err as HttpErrorResponse).error?.message`:
    - `'Already requested this item'` → `items.request.errors.duplicate` + `requestDone.set(true)` (ya tiene solicitud)
    - `'Request limit reached'` → `items.request.errors.limit_reached`
    - `'Requests are paused for this item'` → `items.request.errors.paused`
  - [x] Otros: `items.request.errors.generic`

- [x] **Estado «Solicitud enviada» en detalle** (AC: 1, 3)
  - [x] Computed `showRequestPendingState = computed(() => requestDone())`
  - [x] Cuando `showRequestPendingState()`: reemplazar botón por bloque pendiente portado de `CtaBlock requestState='pending'` (`Explorar v3.html` líneas ~424–460)
  - [x] Bloque: banner verde `C.primaryLight` / `#B5D0C2`, copy «Solicitud enviada», trackers de pasos
  - [x] `canShowRequestCta` ya excluye donante — `requestDone` lo oculta adicionalmente

- [x] **Integrar `ItemRequestDialogComponent` en `DetalleComponent`** (AC: 1, 7)
  - [x] Importar y añadir al array `imports`
  - [x] `@if (requestDialogOpen())` en template junto al `item-cancel-dialog` existente

- [x] **`mapRequestItemError(err)`** (AC: 2–6)
  - [x] Nuevo util `features/items/request-item-error.util.ts` — patrón `cancel-item-error.util.ts`
  - [x] Retorna `{ bannerKey?: string; markDone?: boolean }`:
    - `400` → `{ bannerKey: 'items.request.errors.own_item' }`
    - `409` + message `Already requested` → `{ bannerKey: 'items.request.errors.duplicate', markDone: true }`
    - `409` + message `Request limit reached` → `{ bannerKey: 'items.request.errors.limit_reached' }`
    - `409` + message `Requests are paused` → `{ bannerKey: 'items.request.errors.paused' }`
    - `401` → `{}`
    - Otros → `{ bannerKey: 'items.request.errors.generic' }`

- [x] **i18n `items.request.*`** en `public/i18n/{es,ca,en}.json` (AC: 1, 7)
  - [x] Todas las claves listadas en «i18n — claves nuevas»

- [x] **Specs**
  - [x] `item-request-dialog.component.spec.ts`: apertura, confirm, dismiss, ARIA básico, Escape, loading state
  - [x] `request-item-error.util.spec.ts`: cada caso de error incluyendo diferenciación de 409
  - [x] `detalle.component.spec.ts` (añadir): receptor+active+!paused → botón visible; donante → sin botón; éxito → estado pendiente; 409 paused → error paused; 409 limit → error limit; 409 duplicate → estado pendiente + error duplicate

### Review Findings

- [x] [Review][Decision] **Turnos restantes en modal/CTA vs spec de tareas** — Resuelto 2026-05-23: **1A** — mantener `usersMeRequestsGet` + hints en CTA/modal como mejora UX alineada con prototipo.
- [x] [Review][Decision] **Refactor `ItemDetailPanel` + modal en Explorar** — Resuelto 2026-05-23: **2A** — aceptado como alcance válido de 3.1 (detalle + feed comparten flujo de solicitud).
- [x] [Review][Patch] **`ItemRequestDialog` sin `BtnComponent`** [item-request-dialog.component.html:50-84] — Corregido: footer con `app-btn` ghost + primary (paridad con cancel dialog).
- [x] [Review][Patch] **Matching 409 demasiado amplio en `mapRequestItemError`** [request-item-error.util.ts:33] — Corregido: igualdad exacta con mensajes del backend.
- [x] [Review][Patch] **Falta test integración 400 `own_item`** [detalle.component.spec.ts] — Añadido spec `shows own_item error on 400 (AC 2)`.
- [x] [Review][Patch] **`usersMeRequestsGet({ limit: 50 })` puede subcontar slots** [item-detail-panel.component.ts:404] — Corregido: dos llamadas `status=pending` y `status=selected` con `limit: 50` cada una.
- [x] [Review][Defer] **Estado pendiente no persiste al recargar** [item-detail-panel.component.ts:365] — AC1 exige ocultar «Me interesa» «en esta sesión» tras 201; recargar página resetea `requestDone`. Hidratar desde API sería mejora posterior.
- [x] [Review][Defer] **Verificación visual pixel-perfect** — Tokens CSS alineados con variables del design system; no hay prueba automatizada contra `Explorar v3.html` (ConfirmModal / CtaBlock pending).

## Dev Notes

### ⛔ Diseño obligatorio

**Fichero:** `docs/project/Explorar v3.html`  
**Tokens:** `docs/project/colors_and_type.css`

| Elemento prototipo | Implementación |
|---|---|
| `ConfirmModal` (L~547–640) | `ItemRequestDialogComponent` — overlay, panel, copy, footer ghost+primary |
| `CtaBlock requestState='pending'` (L~424–460) | Bloque "Solicitud enviada" en `detalle.component.html` |
| `CtaBlock itemPausada` (L~451–470) | Ya implementado en `showPausedCta` — **no tocar** |
| `CtaBlock turnosRestantes===0` (L~471–490) | Solo mostrar tras error 409 limit_reached — **no** precargar slots |

**Tokens clave a portar:**
- Overlay: `background:'rgba(20,23,26,0.5)'`
- Panel: `background:C.bgSurface`, `borderRadius:14`, `boxShadow:C.sh3`, `padding:'28px 26px'`, `maxWidth:400`
- Banner confirmación (pending): `background:C.primaryLight`, `border:1px solid #B5D0C2`, `borderRadius:10`, `padding:'14px 16px'`
- Título modal: Playfair Display 20px fontWeight:600 `color:C.fg`

### Estado actual de `DetalleComponent` — QUÉ EXISTE HOY

El componente en `src/app/features/items/detalle/detalle.component.ts` ya tiene:
- `onInterestedClick(): void {}` stub vacío con comentario `// Historia 3.1 — solicitar objeto`
- `canShowRequestCta = computed(() => !isDonor() && status==='active' && !requestsPaused)` — ya correcto
- `showPausedCta = computed(() => !isDonor() && requestsPaused)` — no tocar
- `showUnavailableCta` — no tocar
- Template en `detalle.component.html:141–148`: botón «Me interesa» conectado a `(click)="onInterestedClick()"`
- Patrón completo de dialog (cancel): signals `cancelDialogOpen`, `cancelling`, `cancelErrorKey`, focus trap con `cancelTriggerEl` — **replicar exactamente este patrón para request**

Solo hay que **añadir** la funcionalidad de solicitar, NO refactorizar el código existente.

### API — contrato exacto

**Servicio:** `ItemsService.itemsIdRequestsPost`  
**Path:** `POST /items/{id}/requests`  
**Params:** `{ id: string }` — sin body  
**Respuesta (201):** `RequestItemResponse { requestId: string; status: 'pending'; createdAt: string }`

```typescript
// En onRequestConfirm():
const res = await this.itemsApi.itemsIdRequestsPost({ id: current.id });
// 201 → res.requestId disponible pero no es necesario mostrarlo en UI
this.requestDone.set(true);
this.requestDialogOpen.set(false);
```

**Errores 409 — diferenciación por message (campo string en error body):**

```typescript
if (err instanceof HttpErrorResponse && err.status === 409) {
  const msg: string = err.error?.message ?? '';
  if (msg.includes('paused'))  { this.requestErrorKey.set('items.request.errors.paused'); }
  else if (msg.includes('limit')) { this.requestErrorKey.set('items.request.errors.limit_reached'); }
  else if (msg.includes('Already')) {
    this.requestErrorKey.set('items.request.errors.duplicate');
    this.requestDone.set(true); // ya tiene solicitud activa
  } else { this.requestErrorKey.set('items.request.errors.generic'); }
}
```

**Mensajes exactos del backend (`request-item.use-case.ts`, `request.repository.ts`):**
- `'Requests are paused for this item'` — `requestsPaused === true`
- `'Request limit reached'` — ≥ 3 solicitudes activas en 30 días
- `'Already requested this item'` — duplicado (unique constraint)

### Flujo UX

```
Usuario → «Me interesa» (canShowRequestCta)
    → RequestDialog abre (confirmar / cancelar)
        → Cancelar: cerrar, restaurar foco
        → Confirmar: requesting=true → POST /items/:id/requests
            → 201: requestDone=true, dialog cierra, UI muestra «Solicitud enviada»
            → 409 duplicate: requestDone=true + errorKey (banner en dialog antes de cerrar)
            → 409 limit: errorKey (banner en dialog, NO requestDone)
            → 409 paused: errorKey (banner en dialog)
            → 400/otros: errorKey genérico
```

**Nota sobre errores en el diálogo:** El error puede mostrarse:
a) Dentro del modal (como `AlertBoxComponent`) mientras `requestDialogOpen()` sigue abierto, o  
b) Cerrar el modal y mostrar `requestErrorKey` en el detalle (banner encima del CTA).  
Preferir opción **b** para errores no recuperables (limit, paused); opción **a** puede usarse para duplicate (cerrar + requestDone inmediatamente). Patrón libre pero consistente.

### Componentes existentes a reutilizar

| Componente | Uso |
|---|---|
| `BtnComponent` (variantes: `primary`, `secondary`) | Footer del dialog |
| `AlertBoxComponent` (variant: `error` o `warn`) | Errores inline en detalle |
| `ItemCancelDialogComponent` | Patrón arquitectura: focus trap, scroll lock, ARIA — **copiar patrón, NO el componente** |
| `SessionService.user()` | `isDonor()` — ya usa esto el componente |
| `ItemsService.itemsIdRequestsPost` | Llamada API |

### Estructura de archivos

```
src/app/shared/components/item-request-dialog/
├── item-request-dialog.component.ts     ← NUEVO
├── item-request-dialog.component.html   ← NUEVO
├── item-request-dialog.component.scss   ← NUEVO
└── item-request-dialog.component.spec.ts ← NUEVO

src/app/features/items/
├── request-item-error.util.ts           ← NUEVO
└── request-item-error.util.spec.ts      ← NUEVO

src/app/features/items/detalle/
├── detalle.component.ts                 ← UPDATE (onInterestedClick + signals request*)
├── detalle.component.html               ← UPDATE (dialog + pending state)
└── detalle.component.spec.ts            ← UPDATE (tests request flow)

public/i18n/{es,ca,en}.json             ← UPDATE items.request.*
```

### i18n — claves nuevas (`items.request.*`)

| Clave | ES (referencia) |
|---|---|
| `dialog_title` | ¿Confirmar interés? |
| `dialog_body` | Si el donante te elige, verás su canal de contacto aquí mismo. El sistema valora tu reputación, cercanía y antigüedad de la solicitud. |
| `confirm` | Confirmar interés |
| `confirming` | Enviando… |
| `dismiss` | Cancelar |
| `pending_title` | Solicitud enviada |
| `pending_body` | Estás en el ranking. Si el donante te elige, recibirás aquí el canal de contacto. |
| `pending_step_sent` | Solicitud enviada |
| `pending_step_waiting` | Esperando decisión |
| `pending_step_contact` | Contacto recibido |
| `errors.own_item` | No puedes solicitar tu propio objeto |
| `errors.duplicate` | Ya tienes una solicitud activa para este objeto |
| `errors.limit_reached` | Has alcanzado el límite de 3 solicitudes activas. Espera a que alguna se resuelva. |
| `errors.paused` | El donante ha pausado temporalmente las solicitudes de este objeto |
| `errors.generic` | No se pudo enviar la solicitud. Inténtalo de nuevo. |
| `errors.connection` | Error de conexión. Comprueba tu red. |

(Traducir a CA/EN en los tres JSON.)

### Anti-patterns (prohibido)

| Prohibido | Hacer en su lugar |
|---|---|
| Precargar `turnosRestantes` del usuario | Solo mostrar límite tras error 409 `limit_reached` — no hay endpoint de slots |
| `HttpClient` directo o URL hardcodeada | `itemsApi.itemsIdRequestsPost({ id })` |
| Un solo mensaje genérico para todos los 409 | Diferenciar por `err.error?.message` con los tres casos |
| Reinventar dialog — usar CDK Dialog u otro | Copiar patrón de `item-cancel-dialog` con div+overlay propio |
| Duplicar guard 401 | El interceptor global maneja 401 |
| Navegar fuera del detalle tras éxito | Usuario se queda en `/items/:id` viendo estado «pendiente» |
| Usar `ngClass` o `ngStyle` | Clases CSS con tokens |
| Modificar computed signals `canShowRequestCta` / `showPausedCta` | Ya están correctos — solo añadir `requestDone` |
| Editar `generated/` | `ItemsService` ya tiene `itemsIdRequestsPost` |
| Strings hardcodeados en template | Transloco `items.request.*` |

### Fuera de alcance

| Funcionalidad | Historia |
|---|---|
| Ver candidatos rankeados (donante) | 3.2 |
| Seleccionar receptor + canal de contacto | 3.3 |
| `turnosRestantes` preemptivo en detalle | No existe API para ello |
| Persistir estado pendiente entre sesiones | Session-only; recarga de página resetea (no crítico para MVP) |

### Previous Story Intelligence (2.5 — done, patrón de referencia)

La historia 2.5 (cancelar objeto) estableció el patrón de dialog que DEBES seguir:

**Patrón signals en DetalleComponent:**
```typescript
// Existente (cancelar):
readonly cancelDialogOpen = signal(false);
readonly cancelling = signal(false);
readonly cancelErrorKey = signal<string | null>(null);
private cancelTriggerEl: HTMLElement | null = null;

// Añadir (solicitar) — mismo patrón:
readonly requestDialogOpen = signal(false);
readonly requesting = signal(false);
readonly requestErrorKey = signal<string | null>(null);
readonly requestDone = signal(false);
private requestTriggerEl: HTMLElement | null = null;
```

**Review findings clave de 2.5 que se aplican a 3.1:**
- Focus trap obligatorio (Tab no debe salir del modal)
- Restaurar foco al trigger al cerrar
- Bloquear scroll del body con modal abierto
- Estado `loading/requesting` deshabilita botones del diálogo (Escape bloqueado también)

### Previous Story Intelligence (2.6 — ready-for-dev, contexto relevante)

- Historia 2.6 añade `ToggleSwitchComponent` en la zona donante del detalle
- La historia 2.6 puede estar en desarrollo o incompleta; la historia 3.1 trabaja en la zona **no-donante** del detalle
- Ambas historias modifican `detalle.component.ts/html` — si se desarrollan en paralelo, coordinar para no crear conflictos en la zona CTA

### Git intelligence reciente

- `8fbd373` — cancelar objeto (2.5): patrón dialog, focus trap, BtnComponent variantes danger
- `c95fb54` — detalle de objeto (2.4): `DetalleComponent` completo, signals, computed, `ItemCancelDialogComponent` integrado
- `669f284` — feed (2.3): `ExplorarComponent`, `ItemFeedCardComponent`, paginación

**Ficheros más relevantes para la implementación:**
```
src/app/features/items/detalle/detalle.component.ts          ← leer completo antes de tocar
src/app/shared/components/item-cancel-dialog/                ← plantilla estructural del nuevo dialog
src/app/features/items/cancel-item-error.util.ts             ← plantilla del nuevo util de errores
```

### Testing

```bash
npx ng test --watch=false --include="src/app/shared/components/item-request-dialog/**/*.spec.ts"
npx ng test --watch=false --include="src/app/features/items/request-item-error.util.spec.ts"
npx ng test --watch=false --include="src/app/features/items/detalle/**/*.spec.ts"
```

**Casos mínimos obligatorios:**
- `item-request-dialog.spec`: apertura, confirm output, dismiss output, Escape cierra, requesting=true bloquea botones/Escape, ARIA básico (`role="dialog"`)
- `request-item-error.util.spec`: 400→own_item; 409+paused→paused; 409+limit→limit_reached; 409+Already→duplicate+markDone; 401→vacío; 5xx→generic
- `detalle.component.spec` (additions): receptor+active+!paused → botón visible; donante → sin botón; `itemsIdRequestsPost` 201 → `requestDone=true`; 409 limit → key limit_reached; 409 duplicate → requestDone=true; 401 → interceptor (sin doble redirect)

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 3.1, FR-F11, FR-F12, UX-DR5, tabla diseño 3.1]
- [Source: `docs/architecture.md` — POST /items/:id/requests, §Cambio 4, §Sección 6]
- [Source: `docs/api-client.md` — ItemsService.itemsIdRequestsPost]
- [Source: `docs/project/Explorar v3.html` — CtaBlock, ConfirmModal]
- [Source: `_bmad-output/project-context.md` — reglas i18n, stack, diseño bloqueante]
- [Source: `../backend/src/application/use-cases/item/request-item.use-case.ts`]
- [Source: `../backend/src/infrastructure/database/supabase/request.repository.ts`]
- [Source: `src/app/features/items/detalle/detalle.component.ts` — estado actual]
- [Source: `src/app/shared/components/item-cancel-dialog/` — patrón dialog]
- [Source: `src/app/features/items/cancel-item-error.util.ts` — patrón util errores]
- [Source: `src/app/core/api/generated/services/items.service.ts` — itemsIdRequestsPost]
- [Source: `src/app/core/api/generated/models/request-item-response.ts`]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

(n/a)

### Completion Notes List

- Modal `ItemRequestDialogComponent` con ARIA, focus trap, scroll lock y confirmación vía `ItemsService.itemsIdRequestsPost`.
- `DetalleComponent`: flujo solicitar, estado pendiente post-201/409 duplicado, banner límite 409 con botón deshabilitado, errores mapeados con `mapRequestItemError`.
- i18n `items.request.*` en es/ca/en. 41 tests unitarios pasando (dialog, util, detalle).

### File List

- src/app/shared/components/item-request-dialog/item-request-dialog.component.ts
- src/app/shared/components/item-request-dialog/item-request-dialog.component.html
- src/app/shared/components/item-request-dialog/item-request-dialog.component.scss
- src/app/shared/components/item-request-dialog/item-request-dialog.component.spec.ts
- src/app/features/items/request-item-error.util.ts
- src/app/features/items/request-item-error.util.spec.ts
- src/app/features/items/detalle/detalle.component.ts
- src/app/features/items/detalle/detalle.component.html
- src/app/features/items/detalle/detalle.component.scss
- src/app/features/items/detalle/detalle.component.spec.ts
- public/i18n/es.json
- public/i18n/ca.json
- public/i18n/en.json

## Change Log

- 2026-05-22: Contexto historia 3.1 creado — solicitar objeto desde detalle.
- 2026-05-22: Implementación completa — modal solicitud, CTA pendiente, errores 409 diferenciados, tests.
