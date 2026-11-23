# Sprint Change Proposal — DLT-candidato-contacto (frontend)

**Fecha:** 2026-06-01  
**Versión delta de referencia:** `docs/delta-frontend-DLT-candidato-contacto.md` v1.0  
**Versión de arquitectura resultante:** 1.6  
**Estado:** Aprobado por Emanuel (2026-06-01)  

---

## 1. Resumen del problema

El backend ha implementado el delta `DLT-candidato-contacto`, que introduce dos cambios de contrato que afectan flows ya marcados como `done`:

1. **`POST /items/:id/requests`** ahora requiere body `{ contactChannel: string }` obligatorio. La Story 3.1 (done) llama a este endpoint sin body — el flujo actual es incompatible con el contrato nuevo.
2. **`GET /delivery-sessions/:id`** ahora devuelve el campo `receiverContactChannel: string | null`. La Story 4.1 (done) no muestra este campo en el panel del donante — hay un hueco funcional en la UI ya implementada.

Los diseños pixel-perfect ya están actualizados en `docs/project/` para ambos cambios:
- `Detalle de item.html` + `ItemDetail.jsx`: incluyen `RequestSheet` (bottom sheet de captura de canal de contacto del receptor)
- `Entregas.html`: incluye `CoordinationBlock` con `receiverContactChannel` visible para el donante

---

## 2. Análisis de impacto

### 2.1 Impacto en épicas

| Épica | Impacto |
|---|---|
| Épica 3 — Solicitudes | Story 3.1 necesita retrofit: interceptar CTA "Solicitar" con bottom sheet |
| Épica 4 — Entregas | Story 4.1 necesita retrofit: mostrar `receiverContactChannel` en panel donante |
| **Épica 10-f (nueva)** | Agrupa los retrofits y la regeneración del cliente OpenAPI — **2 historias** |

### 2.2 Impacto en artefactos

| Artefacto | Cambio |
|---|---|
| `docs/architecture.md` | Bump a v1.6 · Contrato POST requests con payload · Campo nuevo en DeliverySessionDetail · Regla SEC-002c |
| `epics.md` | Añadir FR-F42, FR-F43 · Definición Épica 10-f con 3 stories |
| `public/i18n/es.json` | 8 claves nuevas (§6.1 y §6.2 del delta) |
| `public/i18n/ca.json` | Idem (traducción paralela) |
| `public/i18n/en.json` | Idem (traducción paralela) |
| `sprint-status.yaml` | Nueva épica 10-f + 3 stories |
| `src/app/core/api/generated/` | Regenerar tras actualización OpenAPI backend |

### 2.3 Impacto técnico

- El agente de desarrollo deberá crear `RequestContactBottomSheetComponent` en `src/app/features/items/components/`
- `ItemsService.requestItem()` debe aceptar y enviar `{ contactChannel }` en el body
- El componente de detalle de sesión (`delivery-detail` o equivalente) debe leer `receiverContactChannel` del DTO y renderizarlo con `*ngIf` / `@if`
- El error 400 del endpoint de solicitud debe mostrarse **inline** en el campo del bottom sheet, no como toast genérico

---

## 3. Camino recomendado

**Opción elegida: Direct Adjustment (Épica 10-f de retrofit)**

Consistente con el patrón establecido en DLT-003 (Épica 6-f), DLT-004 (Épica 7-f) y DLT-email-verification (Épica 8-f). Los cambios son acotados y bien delimitados; no requieren rollback ni reducción de MVP.

**Esfuerzo:** Medio-bajo (3 historias, 2 retrofits de features existentes)  
**Riesgo:** Bajo (backend-driven, diseños ya maquetados, patrón probado)  
**Impacto en timeline:** Mínimo — puede ejecutarse en paralelo con el cierre de Épica 9

---

## 4. Propuestas de cambio detalladas

### 4.1 Nuevos Functional Requirements

**Añadir en `epics.md` — Requirements Inventory:**

```markdown
FR-F42: El receptor proporciona `contactChannel` (texto libre) al solicitar un objeto mediante
        un bottom sheet; el campo es obligatorio, no vacío tras trim(); el backend valida con 400
        si ausente.
FR-F43: El donante ve `receiverContactChannel` del receptor seleccionado en el panel de detalle
        de sesión de entrega activa; el frontend renderiza el campo solo si el backend lo devuelve
        con valor no nulo (SEC-002c; sin lógica de visibilidad propia en cliente).
```

**Añadir en FR Coverage Map:**
```
FR-F42: Épica 10-f — Bottom sheet contactChannel en solicitud
FR-F43: Épica 10-f — receiverContactChannel en detalle sesión (donante)
```

---

### 4.2 Nueva Épica 10-f

**Añadir al final de la lista de épicas en `epics.md`:**

```markdown
### Epic 10-f: Canal de contacto receptor en solicitud (DLT-candidato-contacto — frontend)

Alinea el flujo de solicitud de objetos y el detalle de sesión de entrega con el contrato backend
DLT-candidato-contacto (`docs/delta-frontend-DLT-candidato-contacto.md`, `architecture.md` v1.6).
Retrofit de stories 3.1 y 4.1 ya cerradas.

**FRs cubiertos:** FR-F42, FR-F43 (amplía FR-F11 y FR-F15)
**UX:** `docs/project/Detalle de item.html` + `ItemDetail.jsx` (RequestSheet), `Entregas.html` (CoordinationBlock con receiver)
**Referencia:** Correct Course `sprint-change-proposal-2026-06-01-DLT-candidato-contacto.md` (aprobado 2026-06-01)
```

---

### 4.3 Story 10-f1 — Regenerar cliente OpenAPI y architecture v1.6

```markdown
### Story 10-f1: Regenerar cliente OpenAPI y architecture v1.6

Como desarrollador frontend,
quiero el cliente API y `docs/architecture.md` alineados con DLT-candidato-contacto,
para implementar las historias siguientes contra contratos correctos.

**Acceptance Criteria:**

**Given** `../backend/openapi/openapi.json` actualizado con DLT-candidato-contacto
**When** ejecuto `npm run api:generate`
**Then** `RequestItemBody` (o equivalente generado) incluye `contactChannel: string` como campo requerido
**And** `DeliverySessionDetail` (o equivalente) incluye `receiverContactChannel: string | null`

**Given** el delta aprobado
**When** actualizo `docs/architecture.md`
**Then** versión **1.6** con:
  - Contrato `POST /items/:id/requests` actualizado (payload `{ contactChannel }`)
  - Contrato `GET /delivery-sessions/:id` actualizado (campo `receiverContactChannel`)
  - Regla SEC-002c añadida en §5 (reglas de presentación)
  - Bump de versión en historial de cambios

**Nota:** Si el spec OpenAPI del backend aún no está actualizado, crear tipos provisionales en
`src/app/core/models/` marcados como `// TODO: eliminar tras regeneración`.
```

---

### 4.4 Story 10-f2 — Retrofits UI de canal de contacto (3.1 + 4.1)

**Diseño de referencia:** `docs/project/Detalle de item.html` + `docs/project/ItemDetail.jsx` (RequestSheet) · `docs/project/Entregas.html` (CoordinationBlock)

```markdown
### Story 10-f2: Retrofits UI canal de contacto — solicitud y sesión de entrega (3.1 + 4.1)

Como receptor autenticado,
quiero proporcionar mi canal de contacto al solicitar un objeto,
para que el donante pueda coordinarse conmigo si me selecciona.

Como donante,
quiero ver el canal de contacto del receptor en el detalle de sesión de entrega,
para poder contactarle y coordinar la recogida.

**Acceptance Criteria — Retrofit 3.1: bottom sheet de solicitud**

**Given** detalle de objeto ajeno, `active`, `requestsPaused === false`
**When** pulso el CTA de solicitar
**Then** se abre `RequestContactBottomSheetComponent` — NO se llama directamente al servicio
**And** el bottom sheet sigue el diseño de `RequestSheet` en `ItemDetail.jsx` (pixel-perfect)

**Given** el bottom sheet abierto
**When** el campo `contactChannel` tiene valor (trim no vacío)
**Then** el botón "Enviar solicitud" está habilitado
**When** el campo está vacío
**Then** el botón está deshabilitado (`disabled`)

**Given** el usuario pulsa "Enviar solicitud" con campo válido
**When** se llama `ItemsService.itemsIdRequestsPost(itemId, { contactChannel })`
**Then** ante 201: cerrar sheet → estado "Ya solicitado" en detalle (mismo comportamiento post-solicitud de Story 3.1)

**Given** el backend responde 400 (`contactChannel` ausente o vacío)
**When** el error llega al componente
**Then** se muestra el error **inline** bajo el campo con clave i18n `items.request.contact_channel.error.required`
**And** el sheet permanece abierto (no se cierra)

**Given** el backend responde 409
**When** el error llega al componente
**Then** cerrar el sheet → error estándar en pantalla (comportamiento previo Story 3.1)

**Given** el usuario pulsa "Cancelar" o el backdrop
**When** no se ha enviado la solicitud
**Then** el sheet se cierra sin cambiar el estado del botón de solicitar

**Ubicación del componente:** `src/app/features/items/components/request-contact-bottom-sheet/`
**El campo NO se pre-rellena** con el campo `phone` del perfil del usuario.

---

**Acceptance Criteria — Retrofit 4.1: receiverContactChannel en panel donante**

**Given** el backend devuelve `receiverContactChannel` con valor no nulo en `GET /delivery-sessions/:id`
**When** soy donante (`role === 'donor'`) y veo el panel de detalle de sesión
**Then** se renderiza el canal del receptor en el bloque de coordinación (CoordinationBlock del prototipo)
**And** aparece bajo `sharedContactChannel` (canal propio del donante)

**Given** `receiverContactChannel` es `null`
**When** veo el panel de detalle
**Then** el bloque del receptor NO se renderiza — sin lógica adicional de visibilidad (SEC-002c)

**Given** soy receptor (`role === 'receiver'`)
**When** veo el panel de detalle
**Then** `receiverContactChannel` NO es visible — la regla aplica solo para el donante

---

**Acceptance Criteria — i18n (§6.1 + §6.2 del delta)**

**Given** las claves i18n del §6.1 (bottom sheet) y §6.2 (coordinación entrega)
**When** se añaden en `public/i18n/es.json`
**Then** no existe conflicto con claves existentes bajo `items.request.*` ni `delivery.session.*`
**And** si `delivery.session.coordination.title` ya existe, se reutiliza sin duplicar
**And** se añaden traducciones equivalentes en `ca.json` y `en.json`

**Dependencia:** Story 10-f1 (tipos generados o provisionales disponibles).
```

---

### 4.5 Referencia de diseño por historia — añadir a tabla en `epics.md`

```markdown
| 10-f2 | `Detalle de item.html`, `ItemDetail.jsx` (RequestSheet), `Entregas.html` (CoordinationBlock) |
```

---

## 5. Plan de implementación y handoff

### Scope: Moderado — retrofit de features existentes con patrón ya establecido

| Paso | Responsable | Acción |
|---|---|---|
| 1 | Dev Agent | Actualizar `epics.md`: añadir FR-F42/F43, Coverage Map, Épica 10-f, 2 stories, tabla de diseño |
| 2 | Dev Agent | Actualizar `sprint-status.yaml`: añadir epic-10-f y stories 10-f1/f2 como `backlog` |
| 3 | Dev Agent | Crear story files (create-story) en orden: 10-f1 → 10-f2 |
| 4 | Dev Agent | Implementar 10-f1: tipos provisionales + architecture v1.6 |
| 5 | Dev Agent | Implementar 10-f2: bottom sheet (retrofit 3.1) + receiverContactChannel (retrofit 4.1) + i18n |

### Criterios de éxito

- [ ] `RequestContactBottomSheetComponent` abierto desde el CTA de solicitar; llamada al servicio incluye `{ contactChannel }`
- [ ] Error 400 manejado inline (no toast genérico)
- [ ] `receiverContactChannel` visible para donante solo si backend devuelve valor no nulo
- [ ] 8 claves i18n (es/ca/en) sin conflictos
- [ ] `architecture.md` en v1.6 con SEC-002c y contratos actualizados
- [ ] Campo NO pre-relleno con `phone` del perfil

---

## 6. Impacto en MVP

El MVP no se ve afectado en scope. Los cambios son additive: se mejora la coordinación donante-receptor sin retirar funcionalidad existente. La Épica 9 (cookies, en progreso) puede continuar en paralelo sin interferencia.

---

*Generado por bmad-correct-course · Proyecto: regalalo · 2026-06-01*
