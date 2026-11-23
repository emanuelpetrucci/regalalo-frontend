# Story 3.3: Seleccionar receptor con canal de contacto

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed. -->
<!-- Reconciliación 2026-05-23: éxito en misma página (prototipo + 3.2); ruta /delivery-sessions/:id no existe hasta 4.1 -->

## Story

Como donante,
quiero seleccionar un candidato e indicar mi canal de contacto,
para iniciar la sesión de entrega.

## Acceptance Criteria

1. **Given** tengo un objeto `active` abierto en `/mis-objetos` con candidatos cargados y pulso «Seleccionar» en una fila  
   **When** se abre el modal de selección (prototipo `SelectModal` L901–988)  
   **Then** veo título, copy explicativo, resumen del candidato (iniciales, score tonificado, distancia, antigüedad), selector de tipo de canal (WhatsApp / Email / Teléfono), campo de texto obligatorio, aviso legal y acciones Cancelar / Confirmar selección  
   **And** el modal cumple accesibilidad de `ItemCancelDialog`: `role="dialog"`, `aria-modal`, focus trap, Escape, lock de scroll, backdrop click para cerrar (salvo mientras `submitting`)

2. **Given** el formulario con canal vacío o solo espacios  
   **When** pulso Confirmar  
   **Then** error inline bajo el campo (no envía POST)  
   **And** el foco permanece en el modal

3. **Given** canal válido y `requestId` del candidato abierto  
   **When** confirmo  
   **Then** `ItemsService.itemsIdRequestsRequestIdSelectPost({ id: itemId, requestId, body: { contactChannel } })`  
   **And** `contactChannel` se construye como en el prototipo: prefijo según tipo + valor trim (`WhatsApp: …`, `Email: …`, `Teléfono: …`)

4. **Given** respuesta `200` con `{ sessionId, status: 'active', deadlineAt }`  
   **When** termina la petición  
   **Then** el modal se cierra  
   **And** se refrescan lista (`usersMeItemsGet`) y mapa de sesiones (`usersMeDeliverySessionsGet`)  
   **And** se recarga el detalle del objeto (`itemsIdGet` + `deliverySessionsIdGet` si aplica)  
   **And** el panel pasa a vista `reserved` con banner de plazo (`deadlineAt` formateado) y, si el GET de sesión devuelve `contactChannel` no nulo, caja verde con el canal (SEC-002: solo renderizar si viene en respuesta)  
   **And** la pestaña activa pasa a `reserved` si el objeto ya no es `active`  
   **And** se muestra feedback de éxito accesible (banner o `app-alert-box`) con `sessionId` y fecha límite visibles para el donante

5. **Given** error `400` (validación), `403`, `404` o `409`  
   **When** falla el POST  
   **Then** mensaje en el modal vía `app-alert-box` (clave i18n mapeada), sin cerrar el modal  
   **And** `409` distingue al menos «solicitud ya no pendiente» vs «objeto ya no activo» cuando el body lo permita; genérico en otro caso

6. **Given** `requestsPaused === true` en el objeto activo  
   **When** veo candidatos  
   **Then** botón «Seleccionar» sigue deshabilitado (heredado de 3.2) — el modal no debe abrirse por esa vía

7. **Given** selección exitosa  
   **When** vuelvo a la lista o cambio de objeto  
   **Then** el objeto aparece en pestaña Reservados con meta de expiración coherente (`sessionsByItemId` / `sessionExpiresLabel`)  
   **And** no queda lista de candidatos en panel `reserved`

8. **Given** epics mencionan navegar al detalle de sesión  
   **When** implemento esta historia  
   **Then** **no** navegar a `/delivery-sessions/:id` (ruta inexistente; `EntregasComponent` es stub hasta 4.1)  
   **And** el flujo canónico de éxito es permanecer en `/mis-objetos` con panel `reserved` (prototipo `handleConfirmSelect` L1130–1137)

## Tasks / Subtasks

- [x] **`ItemSelectReceiverDialogComponent`** (AC: 1–2, 5)
  - [x] Crear `shared/components/item-select-receiver-dialog/` (paridad estructural con `item-cancel-dialog`)
  - [x] Inputs: `candidate: RankedCandidate`, `submitting`, `errorKey`
  - [x] Outputs: `confirmed(contactChannel: string)`, `dismissed`
  - [x] Formulario reactivo: `channelType` (`whatsapp` | `email` | `phone`), `channelValue`; validador required + trim
  - [x] Helper `buildContactChannel(type, value): string` — misma lógica que prototipo L910–911
  - [x] Resumen candidato: reutilizar `initialsFromUserId`, tonos score, `formatDistanceKm`, claves `request_ago` / `days_*`
  - [x] Estilos: extraer de `Mis objetos.html` L914–987 → SCSS con tokens (`--color-primary-light`, `--color-warning-*`, etc.); `max-width: 440px` en panel
  - [x] Host: Escape, focus trap, body scroll lock (copiar patrón probado de `ItemCancelDialogComponent`)

- [x] **Integración en `MisObjetosComponent`** (AC: 3–7)
  - [x] Sustituir stub HTML L376–397 por `<app-item-select-receiver-dialog>`
  - [x] Signals: `selectSubmitting`, `selectErrorKey`; pasar `selectModalCandidate()` al dialog
  - [x] `onSelectConfirm(contactChannel)`: POST → en éxito `closeSelectModal()`, `loadPage()`, re-`selectItem` o `loadDetail` con id actual, `activeTab.set('reserved')`, banner éxito
  - [x] En error: `mapSelectReceiverError(err)` → `selectErrorKey`; no cerrar modal
  - [x] Mantener: cerrar modal al cambiar objeto / cerrar detalle (ya en 3.2)

- [x] **`mapSelectReceiverError` util** (AC: 5)
  - [x] `src/app/features/items/select-receiver-error.util.ts` + spec
  - [x] 401 → `{}` (interceptor); 400 → validation; 403 → forbidden; 404 → not_found; 409 → parse message si existe (`pending` / `active`); default generic

- [x] **i18n** `items.my_objects.select_*` en `es`, `ca`, `en` (AC: 1–5)
  - [x] Sustituir `select_modal_placeholder` por claves reales: `select_modal_title`, `select_modal_lead`, `select_channel_label`, tipos, placeholders por tipo, `select_channel_required`, `select_legal_warning`, `select_confirm`, `select_cancel`, `select_success` (con `{{date}}`), errores `select_errors.*`
  - [x] Eliminar o dejar de usar textos «próximamente»

- [x] **Panel `reserved` — paridad opcional mínima** (AC: 4, 7)
  - [x] Verificar bloque L311–337 ya muestra sesión; tras select, `deliverySession` debe poblarse
  - [x] No implementar acciones «Confirmar entrega» / «Cancelar sesión» (épica 4) salvo stubs ya existentes

- [x] **Tests** (AC: 1–7)
  - [x] `item-select-receiver-dialog.component.spec.ts`: validación vacía, build channel, emit confirmed, dismiss Escape
  - [x] `mis-objetos.component.spec.ts`: POST al confirmar; éxito cierra modal y llama refresh; 409 muestra error; stub reemplazado
  - [x] `select-receiver-error.util.spec.ts`: códigos HTTP

## Dev Notes

### ⛔ Diseño obligatorio — `SelectModal` en `Mis objetos.html`

**Fichero:** `docs/project/Mis objetos.html` L901–988 (`SelectModal`), wire L1129–1137 (`handleSelect` / `handleConfirmSelect`)  
**Tokens:** `docs/project/colors_and_type.css`

| Elemento prototipo | Implementación |
|---|---|
| Overlay `rgba(20,23,26,0.55)` z-index 500 | `.item-select-receiver-dialog__backdrop` (alinear z-index con cancel dialog ~300 si es convención del proyecto) |
| Panel `maxWidth: 440`, `borderRadius: 16`, `padding 28px 26px` | Panel SCSS |
| Resumen candidato fondo primary light + borde | `.item-select-receiver-dialog__summary` |
| Pills tipo canal | Tres botones toggle (no inventar `<select>` Material) |
| Input con borde error | `FieldInputComponent` **o** input nativo estilizado como en prototipo — revisar si existe input compartido en auth |
| Warning box amarillo | Reutilizar patrón `.mis-objetos__warn-box` / tokens warning |
| Botones ghost + primary flex | `app-btn` |

### Flujo post-confirmación (reconciliación epics vs código)

```
Click «Seleccionar» → selectModalCandidate set
  → Modal completo → Confirmar
      → POST select
          → 200: close modal, loadPage(), loadDetail(id), tab reserved, success banner
          → 4xx: error en modal
```

**No hacer:** `router.navigate(['/delivery-sessions', sessionId])` — la ruta no está registrada (`delivery.routes.ts` solo `/entregas` stub). Historia **4.1** añadirá detalle de sesión; opcional en 4.1 enlazar desde banner de éxito.

### API — contrato exacto

**Método:** `itemsApi.itemsIdRequestsRequestIdSelectPost`

```typescript
// Params
{ id: string; requestId: string; body: { contactChannel: string } }

// Response 200
interface SelectReceiverResponse {
  sessionId: string;
  status: 'active';
  deadlineAt: string; // ISO8601
}
```

| Código | Origen backend | UI |
|---|---|---|
| 400 | Zod `contactChannel` min 1 | `select_errors.validation` inline o banner |
| 401 | No auth | Interceptor |
| 403 | No donante / request ajena | `select_errors.forbidden` |
| 404 | Item not found (use case) | `select_errors.not_found` |
| 409 | `ConflictException`: pending / active | `select_errors.conflict_*` |
| Otros | — | `select_errors.generic` |

**SEC-002:** En panel `reserved`, mostrar `session.contactChannel` solo con `@if (session.contactChannel)` — ya implementado L328–332; no añadir lógica de visibilidad en cliente.

### Estado brownfield — reemplazar stub 3.2

**Ya existe:**
- `selectModalCandidate` signal + handlers en `mis-objetos.component.ts`
- Stub modal L376–397 y estilos `.mis-objetos__select-modal-*` (reutilizar/migrar a componente)
- Panel `reserved` con `deliverySessionsIdGet`
- `CandidateRow` con output `select` y `selectDisabled` si pausa

**Implementar:**
- Componente dialog completo (sustituye stub)
- POST + refresh + UX éxito
- Mapper de errores
- i18n definitivo

### Estructura de archivos

```
src/app/shared/components/item-select-receiver-dialog/   ← NUEVO
src/app/features/items/select-receiver-error.util.ts     ← NUEVO
src/app/features/items/mis-objetos/                      ← UPDATE (wire dialog, onSelectConfirm)
public/i18n/{es,ca,en}.json                              ← UPDATE items.my_objects.select_*
```

**No crear:** ruta nueva, pantalla `/select`, editar `generated/`.

### Anti-patterns (prohibido)

| Prohibido | Hacer |
|---|---|
| Dejar stub «próximamente» | Modal funcional según prototipo |
| Navegar a detalle sesión inexistente | Quedarse en mis-objetos + panel reserved |
| Enviar solo el número sin prefijo | `buildContactChannel` como prototipo |
| `HttpClient` manual | `ItemsService` generado |
| Toast sin i18n | Claves `items.my_objects.select_*` |
| Duplicar focus trap ad hoc incompleto | Mismo patrón que `ItemCancelDialog` |
| Mostrar canal si API devuelve `null` | `@if (session.contactChannel)` |

### Fuera de alcance

| Funcionalidad | Historia |
|---|---|
| Detalle sesión `/delivery-sessions/:id` o `/entregas/:id` | 4.1 |
| Confirmar entrega / cancelar sesión | 4.2, 4.3 |
| Perfil del candidato desde modal | 5.5 |
| Email TPL-003 | Backend only |

### Previous Story Intelligence (3.2)

- Modal stub **debe** sustituirse con focus trap (diferido explícitamente a 3.3 en `deferred-work.md`).
- Candidatos solo en `/mis-objetos`, sin rutas `/candidates` ni `/select`.
- Al cambiar de ítem: `selectModalCandidate.set(null)` — mantener.
- `?itemId=` sync — no romper al cerrar modal tras éxito (mantener `itemId` del objeto reservado).
- Reutilizar `user-initials.util.ts`, `formatDistanceKm`, tonos score de `CandidateRow`.

### Git intelligence (reciente)

- `5c6ad71` — candidatos, selección stub, pausa: patrones en `mis-objetos`, `candidate-row`, i18n `my_objects`.
- Seguir: signals, OnPush, `TranslocoTestingModule` en specs, mocks `ItemsService` / `DeliveryService`.

### Testing

```bash
npx ng test --watch=false --include="src/app/shared/components/item-select-receiver-dialog/**/*.spec.ts"
npx ng test --watch=false --include="src/app/features/items/mis-objetos/**/*.spec.ts"
npx ng test --watch=false --include="src/app/features/items/select-receiver-error.util.spec.ts"
```

### References

- [Source: `docs/project/Mis objetos.html` — SelectModal L901–988, handleConfirmSelect L1130–1137]
- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 3.3, FR-F14, tabla diseño 3.3]
- [Source: `docs/architecture.md` — POST /items/:id/requests/:requestId/select, SEC-002]
- [Source: `src/app/shared/components/item-cancel-dialog/` — patrón modal accesible]
- [Source: `_bmad-output/implementation-artifacts/3-2-ver-candidatos-rankeados-vista-donante.md]
- [Source: `backend/src/infrastructure/database/supabase/delivery-session.repository.ts` — selectReceiver, 409]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- Modal `ItemSelectReceiverDialogComponent` con formulario reactivo, pills de canal, validación inline, focus trap y paridad visual con prototipo SelectModal.
- `MisObjetosComponent`: POST `itemsIdRequestsRequestIdSelectPost`, refresh lista/sesiones/detalle, pestaña `reserved`, banner de éxito; sin navegación a `/delivery-sessions/:id`.
- Utilidades `buildContactChannel` y `mapSelectReceiverError` con specs; i18n `select_*` en es/ca/en.
- 31 tests pasando (dialog, mis-objetos, error util, channel util).

### File List

- src/app/shared/components/item-select-receiver-dialog/item-select-receiver-dialog.component.ts
- src/app/shared/components/item-select-receiver-dialog/item-select-receiver-dialog.component.html
- src/app/shared/components/item-select-receiver-dialog/item-select-receiver-dialog.component.scss
- src/app/shared/components/item-select-receiver-dialog/item-select-receiver-dialog.component.spec.ts
- src/app/features/items/select-receiver-channel.util.ts
- src/app/features/items/select-receiver-channel.util.spec.ts
- src/app/features/items/select-receiver-error.util.ts
- src/app/features/items/select-receiver-error.util.spec.ts
- src/app/features/items/mis-objetos/mis-objetos.component.ts
- src/app/features/items/mis-objetos/mis-objetos.component.html
- src/app/features/items/mis-objetos/mis-objetos.component.scss
- src/app/features/items/mis-objetos/mis-objetos.component.spec.ts
- public/i18n/es.json
- public/i18n/ca.json
- public/i18n/en.json

### Review Findings

- [x] [Review][Patch] Banner `selectSuccess` no se limpia al cambiar de objeto, pestaña o abrir otro modal [`mis-objetos.component.ts:159,253,256`] — `clearSelectSuccess()` en `onCandidateSelect`, `selectItem` y `closeDetail`.
- [x] [Review][Patch] Tras POST 200 exitoso, fallo en `loadPage`/`loadDetail` no se maneja [`mis-objetos.component.ts:201-203`] — clave `select_refresh_failed` si falla el refresh.
- [x] [Review][Patch] `closeDetail()` permite cerrar el panel durante `selectSubmitting` [`mis-objetos.component.ts:264-274`] — guard al inicio de `closeDetail`.
- [x] [Review][Patch] Pills de tipo de canal sin `aria-pressed` [`item-select-receiver-dialog.component.html:53-61`] — `[attr.aria-pressed]` en cada pill.
- [x] [Review][Defer] Mapeo 409 por subcadena `pending`/`active` en mensaje [`select-receiver-error.util.ts:43-49`] — deferred, aceptable mientras el backend mantenga textos fijos; endurecer si cambian los mensajes.

## Change Log

- 2026-05-23: Contexto historia 3.3 creado — seleccionar receptor con canal de contacto; modal completo en mis-objetos; éxito inline sin ruta delivery hasta 4.1.
- 2026-05-23: Implementación completa — modal selección receptor, POST select, refresh y panel reserved; estado → review.
- 2026-05-23: Code review — 4 patch, 0 decision-needed, 1 defer, 9 dismissed.
- 2026-05-23: Patches de code review aplicados; historia → done.
