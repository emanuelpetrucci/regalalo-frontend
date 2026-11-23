# Story 10-f1: Regenerar cliente OpenAPI y architecture v1.6

Status: review

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed - comprehensive developer guide created. Épica 10-f DLT-candidato-contacto — historia fundacional; sin cambios de UI. Backend OpenAPI ya actualizado al momento de create-story. -->

## Story

Como desarrollador frontend,
quiero el cliente API y `docs/architecture.md` alineados con DLT-candidato-contacto (v1.6),
para implementar la historia 10-f2 contra contratos correctos de canal de contacto del receptor.

**FR:** FR-F42, FR-F43 (fundacional) · **Épica:** 10-f (DLT-candidato-contacto)  
**Referencia:** `docs/delta-frontend-DLT-candidato-contacto.md` · `sprint-change-proposal-2026-06-01-DLT-candidato-contacto.md`

## Acceptance Criteria

1. **Given** `../backend/openapi/openapi.json` actualizado con DLT-candidato-contacto  
   **When** ejecuto la cadena de regeneración documentada en `docs/api-client.md`  
   **Then** `npm run api:generate` completa sin error  
   **And** el modelo generado equivalente a `RequestItemRequest` incluye `contactChannel: string` como campo requerido  
   **And** el modelo generado `DeliverySession` incluye `receiverContactChannel: string | null`

2. **Given** el cliente regenerado  
   **When** inspecciono los tipos y métodos clave  
   **Then** cumplen el delta aprobado (`docs/delta-frontend-DLT-candidato-contacto.md`):

   | Modelo / método | Estado esperado post-regeneración |
   |---|---|
   | `RequestItemRequest.contactChannel` | `string` — requerido, `minLength: 1` |
   | `DeliverySession.receiverContactChannel` | `string \| null` — presente |
   | `ItemsService.itemsIdRequestsPost` params | `body: RequestItemRequest` incluido en `ItemsIdRequestsPost$Params` |
   | Métodos y modelos existentes (AuthService, UsersService, etc.) | **sin cambio de firma** |

3. **Given** el delta aprobado (`docs/delta-frontend-DLT-candidato-contacto.md`)  
   **When** reviso `docs/architecture.md`  
   **Then** la cabecera indica **Versión 1.6** con referencia a DLT-candidato-contacto  
   **And** §4 (F4 Flujo de Objetos) actualiza `POST /items/:id/requests`:  
   - El bloque "Payload de entrada" pasa de "vacío (sin body)" a documentar `{ contactChannel: string }` requerido  
   - Se añade error 400 por `contactChannel` ausente o vacío  
   **And** §4 (F6 Sesión de Entrega) actualiza `GET /delivery-sessions/:id`:  
   - La respuesta JSON incluye `receiverContactChannel: string | null`  
   **And** §5 (Modelos TypeScript) actualiza la interfaz `DeliverySession` con `receiverContactChannel: string | null`  
   **And** §6 (Reglas de Presentación) incluye la regla SEC-002c:  
   > **receiverContactChannel (SEC-002c):** el frontend no implementa lógica de visibilidad propia sobre este campo. Si el backend devuelve `receiverContactChannel` con valor no nulo, se renderiza en el bloque de coordinación de la sesión de entrega, visible únicamente para el donante (`role === 'donor'`). Si devuelve `null`, el bloque no se muestra. La decisión de cuándo exponer el campo reside exclusivamente en el backend.

4. **Given** `docs/api-client.md` como guía operativa  
   **When** cierro la historia  
   **Then** la tabla de modelos en `docs/api-client.md` referencia `RequestItemRequest` (nuevo) y `DeliverySession` con `receiverContactChannel`  
   **And** se documenta que `ItemsService.itemsIdRequestsPost` ahora requiere body `{ contactChannel }`

5. **Given** código generado versionado en git  
   **When** termino la regeneración  
   **Then** **no** edito manualmente ningún fichero bajo `src/app/core/api/generated/`  
   **And** el diff del cliente regenerado queda listo para commit (historia fundacional épica 10-f)

6. **Given** alcance acotado de 10-f1 (solo contrato + docs)  
   **When** ejecuto `npm run build` tras regenerar  
   **Then** documento en Completion Notes el resultado (éxito o errores TS)  
   **And** **no** implemento `RequestContactBottomSheetComponent` ni el retrofit del detalle de sesión  
   **And** **no** modifico `item-detail`, `delivery-detail`, i18n ni rutas — esos son scope de **10-f2**

## Tasks / Subtasks

### A. Verificar estado del contrato backend (AC: 1)

- [x] Confirmar que `../backend/openapi/openapi.json` tiene los cambios DLT-candidato-contacto:
  - ¿El schema `RequestItemRequest` incluye `contactChannel: string` requerido? (ya confirmado: sí ✅)
  - ¿El schema `DeliverySession` incluye `receiverContactChannel: string | null`? (ya confirmado: sí ✅)
  - Si el spec local estuviera desactualizado: `cd ../backend && npm run openapi:generate`

### B. Regenerar cliente (AC: 1, 2, 5)

- [x] Desde raíz del proyecto frontend (`no-lo-vendo`): `npm run api:generate`
- [x] Verificar salida: comprobar que la regeneración completa sin error y el conteo de modelos/servicios es correcto
- [x] Abrir y contrastar ficheros clave post-regeneración:
  - `src/app/core/api/generated/models/request-item-request.ts` → `RequestItemRequest { contactChannel: string }` presente ✅
  - `src/app/core/api/generated/models/delivery-session.ts` → campo `receiverContactChannel: string | null` añadido ✅
  - `src/app/core/api/generated/fn/items/items-id-requests-post.ts` → `ItemsIdRequestsPost$Params` incluye `body?: RequestItemRequest` ✅
  - `src/app/core/api/generated/services/items.service.ts` → `itemsIdRequestsPost` con firma actualizada ✅
- [x] Confirmar que los métodos existentes (AuthService, UsersService, DeliveryService) mantienen firma sin cambio
- [x] **Prohibido:** editar ficheros en `generated/` a mano

### C. Actualizar `docs/architecture.md` v1.5 → v1.6 (AC: 3)

- [x] Actualizar cabecera del documento:
  - Cambiar `**Versión:** 1.5` a `**Versión:** 1.6`
  - Añadir línea de historial: `> Versión 1.6 — DLT-candidato-contacto: canal de contacto del receptor en solicitud y sesión de entrega (receiverContactChannel, RequestItemRequest). Delta fuente: docs/delta-frontend-DLT-candidato-contacto.md (aprobado 2026-06-01).`

- [x] §4 F4 — `POST /items/:id/requests`: actualizar payload de entrada
  - Cambiar "**Payload de entrada:** vacío (sin body)." por:
    ```
    **Payload de entrada:**
    ```json
    {
      "contactChannel": "string (requerido, no vacío)"
    }
    ```
  - Añadir error 400 en tabla de errores: `400 | contactChannel ausente o vacío`

- [x] §4 F6 — `GET /delivery-sessions/:id`: añadir campo en respuesta JSON
  - Añadir `"receiverContactChannel": "string | null"` al bloque JSON de respuesta esperada (200), después de `sharedContactChannel`

- [x] §5 — Interfaz TypeScript `DeliverySession`: añadir campo
  - Añadir `receiverContactChannel: string | null;` en la interfaz `DeliverySession`, después de `sharedContactChannel`

- [x] §6 — Reglas de Presentación: añadir regla SEC-002c
  - Añadir la regla completa de `receiverContactChannel (SEC-002c)` al listado de reglas (ver AC #3 arriba)

### D. Actualizar `docs/api-client.md` (AC: 4)

- [x] En la sección de Modelos, añadir mención de `RequestItemRequest` (nuevo modelo con `contactChannel`)
- [x] Añadir nota sobre `DeliverySession` ganando `receiverContactChannel: string | null`
- [x] Añadir nota DLT-candidato-contacto: `ItemsService.itemsIdRequestsPost` ahora requiere body `{ contactChannel: string }`

### E. Verificación final (AC: 5, 6)

- [x] `npm run build` — documentar resultado en Completion Notes
- [x] Confirmar que no se modificaron componentes, plantillas ni archivos i18n (scope de 10-f2)
- [x] File List y Completion Notes completados en Dev Agent Record

## Dev Notes

### Contexto DLT-candidato-contacto — brecha actual (evidencia en repo, 2026-06-01)

El backend completó el delta DLT-candidato-contacto. Correct Course frontend aprobado 2026-06-01.

| Artefacto | Estado actual (pre-10-f1) | Objetivo post-10-f1 |
|---|---|---|
| `backend/openapi/openapi.json` — `RequestItemRequest` | ✅ Ya tiene `contactChannel: string` (requerido) | Confirmado en spec |
| `backend/openapi/openapi.json` — `DeliverySession.receiverContactChannel` | ✅ Ya presente (`string \| null`) | Confirmado en spec |
| `models/request-item-request.ts` | ❌ No existe aún | `RequestItemRequest { contactChannel: string }` generado |
| `models/delivery-session.ts` | ❌ Sin `receiverContactChannel` (solo `contactChannel` y `sharedContactChannel`) | + `receiverContactChannel: string \| null` |
| `fn/items/items-id-requests-post.ts` — `ItemsIdRequestsPost$Params` | ❌ Solo `{ id: string }`, sin `body` | + `body: RequestItemRequest` |
| `services/items.service.ts` — `itemsIdRequestsPost` | ❌ Sin `body` en params | Firma actualizada con body |
| `docs/architecture.md` | ✅ v1.5 | v1.6 con contratos y regla SEC-002c |
| `docs/api-client.md` | Sin referencia DLT-candidato-contacto | + `RequestItemRequest`, `receiverContactChannel`, nota de body obligatorio |

### Cadena de regeneración (obligatoria)

```bash
# Opcional — si openapi.json backend desactualizado
cd ../backend
npm run openapi:generate

# Obligatorio — desde raíz regalalo
cd ../regalalo
npm run api:generate
```

Config: `openapi-ng.config.json` → input `../backend/openapi/openapi.json`, output `src/app/core/api/generated`, `removeStaleFiles: true`.

**Diferencia clave respecto a 8-f1:** el backend OpenAPI **ya está completamente actualizado** al momento de create-story (confirmado al revisar el spec). No hay pendientes de backend. La regeneración debería producir tipos correctos en un solo paso.

### Archivos generados clave (inspección post-regeneración)

| Fichero | Qué validar |
|---|---|
| `models/request-item-request.ts` | `RequestItemRequest { contactChannel: string }` — nuevo modelo |
| `models/delivery-session.ts` | Campo `receiverContactChannel: string \| null` añadido |
| `fn/items/items-id-requests-post.ts` | `ItemsIdRequestsPost$Params` incluye `body: RequestItemRequest` |
| `services/items.service.ts` | Método `itemsIdRequestsPost` con body en params |

**No tocar manualmente:** todo `src/app/core/api/generated/**`

### Impacto build: análisis de compatibilidad

Tras regenerar con `ItemsIdRequestsPost$Params` ganando `body: RequestItemRequest`:

| Escenario | Comportamiento esperado |
|---|---|
| `item-detail.component.ts` llama `itemsIdRequestsPost({ id })` sin body | **Build puede fallar** — ahora `body` es requerido en params. Story 10-f2 arregla esto con el bottom sheet. Si el build falla en 10-f1, documentarlo en Completion Notes — **no arreglar la llamada en 10-f1** |
| `delivery-session.ts` añade `receiverContactChannel` | **Build pasa** — campo nuevo aditivo; si el componente de detalle no lo referencia, sin impacto de compilación |
| Build general | Posible error TS por `itemsIdRequestsPost` sin body — documentar y deferir a 10-f2 |

> **Si el build falla en 10-f1:** no arreglar la llamada al endpoint — es scope de 10-f2. Documentar el error en Completion Notes con suficiente detalle para que 10-f2 lo resuelva.

### Qué NO hacer en esta historia

- ❌ Crear `RequestContactBottomSheetComponent` (historia **10-f2**)
- ❌ Modificar `item-detail.component.ts` ni el CTA de solicitar (historia **10-f2**)
- ❌ Modificar `delivery-detail` para añadir `receiverContactChannel` en la UI (historia **10-f2**)
- ❌ Añadir claves i18n `items.request.contact_sheet.*` o `delivery.session.contact.*` (historia **10-f2**)
- ❌ Editar ficheros en `generated/` a mano
- ❌ Crear tipos provisionales en `core/models/` — el spec ya está actualizado, no son necesarios

### Secciones exactas a modificar en `docs/architecture.md`

La arquitectura v1.5 tiene estas líneas que deben cambiar:

**Cabecera (líneas 2-4):**
```
**Versión:** 1.5  
```
→ `**Versión:** 1.6`; añadir `> Versión 1.6 — DLT-candidato-contacto: ...` en el bloque de historial de versiones.

**§4 F4 — POST /items/:id/requests (línea ~420 del archivo actual):**
Actualmente: `**Payload de entrada:** vacío (sin body).`
Reemplazar con el bloque de payload JSON y actualizar tabla de errores.

**§4 F6 — GET /delivery-sessions/:id — respuesta JSON (línea ~505):**
Añadir `"receiverContactChannel": "string | null"` después de `"sharedContactChannel"`.

**§5 — TypeScript `DeliverySession` (línea ~923):**
```typescript
export interface DeliverySession {
  // ... campos existentes ...
  contactChannel: string | null;
  sharedContactChannel: string | null;  // ya presente
  // añadir aquí:
  receiverContactChannel: string | null;
```

**§6 — Reglas de Presentación (final de sección):**
Añadir el bullet de SEC-002c después de la última regla de cookies/legal.

### Inteligencia de historia 8-f1 (épica anterior análoga)

Patrón probado en `8-f1-regenerar-cliente-openapi-y-architecture-v1-5.md` (done):

- Regenerar sin tocar `generated/` a mano — cumplir estrictamente
- Completar `docs/architecture.md` en §4, §5 y §6 para los cambios del delta
- Actualizar `docs/api-client.md` con nuevos campos/tipos
- Si `npm run build` falla por features que usan la API modificada: **documentar error y deferir** — no arreglar UI en historia fundacional
- En 8-f1 el build fue exit 0 (cambio aditivo de email-verification). Aquí `body` se vuelve requerido en `itemsIdRequestsPost` — es probable un error de compilación en `item-detail.component.ts` hasta que 10-f2 resuelva el retrofit.

**Diferencia clave:** en 8-f1 el cambio era plenamente aditivo (nuevos métodos). En 10-f1, `itemsIdRequestsPost$Params` pierde la compatibilidad al hacerse `body` obligatorio. Documentar y deferir.

### Architecture compliance

| Regla | Fuente |
|---|---|
| Cliente OpenAPI canónico | `docs/api-client.md`, `project-context.md` |
| No editar `generated/` | `docs/api-client.md` regla #1 |
| `apiUrl` termina en `/api` | `environment*.ts` — sin cambio en 10-f1 |
| Contratos §4 referencia | `docs/architecture.md` v1.6 (post-historia) |
| Delta fuente aprobado | `docs/delta-frontend-DLT-candidato-contacto.md` |
| Correct Course | `_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-01-DLT-candidato-contacto.md` |

### Dependencias de la épica 10-f

```
10-f1 (OpenAPI + docs v1.6) → 10-f2 (bottom sheet + retrofit detalle sesión)
```

**10-f1 desbloquea 10-f2.** La historia 10-f2 no puede implementarse sin los tipos generados de `RequestItemRequest` y el campo `receiverContactChannel` en `DeliverySession`.

### Testing requirements

- **Sin tests nuevos** en 10-f1 (historia de infraestructura/documentación).
- Verificación manual: inspección de tipos generados + `npm run build` report.
- Historia 10-f2 creará el componente `RequestContactBottomSheetComponent` y sus specs.

### Referencias obligatorias

- [Source: docs/api-client.md] — regeneración y reglas de uso
- [Source: docs/delta-frontend-DLT-candidato-contacto.md] — delta DLT-candidato-contacto completo (§2 contratos, §3 bottom sheet, §4 receiverContactChannel, §8 tipos post-regeneración)
- [Source: docs/architecture.md] — v1.5 base; actualizar a v1.6
- [Source: _bmad-output/planning-artifacts/epics.md#Story-10-f1] — AC originales
- [Source: _bmad-output/planning-artifacts/sprint-change-proposal-2026-06-01-DLT-candidato-contacto.md] — Correct Course DLT-candidato-contacto
- [Source: _bmad-output/implementation-artifacts/8-f1-regenerar-cliente-openapi-y-architecture-v1-5.md] — patrón historia fundacional (done)
- [Source: ../backend/openapi/openapi.json] — spec OpenAPI fuente de verdad (ya actualizado)
- [Source: openapi-ng.config.json] — config ng-openapi-gen
- [Source: src/app/core/api/generated/models/delivery-session.ts] — estado actual pre-10-f1 (sin receiverContactChannel)
- [Source: src/app/core/api/generated/fn/items/items-id-requests-post.ts] — estado actual pre-10-f1 (sin body en params)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- **Tarea A:** Spec backend `../backend/openapi/openapi.json` confirmado con `RequestItemRequest.contactChannel` (string, requerido, minLength:1) y `DeliverySession.receiverContactChannel` (string|null). Sin necesidad de regenerar backend.
- **Tarea B:** `npm run api:generate` completado sin errores — 46 modelos, 6 servicios. Archivos clave verificados: `request-item-request.ts` (nuevo, `RequestItemRequest { contactChannel: string }`), `delivery-session.ts` (ganó `receiverContactChannel: string | null`), `fn/items/items-id-requests-post.ts` (`body?: RequestItemRequest` en params — ng-openapi-gen genera el body como opcional aunque el spec lo marca requerido; la validación ocurre en runtime), `services/items.service.ts` (firma actualizada). También se generaron nuevos archivos para el endpoint `/jobs/nearby-items-digest`: `fn/jobs/jobs-nearby-items-digest-post.ts` y `services/jobs.service.ts`.
- **Tarea C:** `docs/architecture.md` actualizado a v1.6: cabecera + historial de versiones, §4 F4 payload de `POST /items/:id/requests` (json block + error 400), §4 F6 respuesta JSON con `sharedContactChannel` y `receiverContactChannel`, §5 interfaz TypeScript `DeliverySession` con ambos campos, §6 regla SEC-002c.
- **Tarea D:** `docs/api-client.md` actualizado: `RequestItemRequest` referenciado en lista de ejemplos, párrafo DLT-candidato-contacto con nota de body obligatorio en `itemsIdRequestsPost` y `receiverContactChannel` en `DeliverySession`.
- **Tarea E (build):** `npm run build` — **exit 0**, sin errores TypeScript. El body se genera como `body?:` (opcional en firma TS) por comportamiento estándar de ng-openapi-gen, por lo que las llamadas existentes en `item-detail.component.ts` sin body no rompen la compilación. Historia 10-f2 añadirá el bottom sheet y pasará el body correctamente. Solo warnings de presupuesto CSS preexistentes (perfil, onboarding, landing, mis-objetos — sin relación con esta historia).
- **Scope confirmado:** ningún componente, template, archivo i18n ni ruta modificado en esta historia — todo en scope de 10-f2.

### File List

- `src/app/core/api/generated/models/request-item-request.ts` (nuevo — generado)
- `src/app/core/api/generated/models/delivery-session.ts` (modificado — generado)
- `src/app/core/api/generated/fn/items/items-id-requests-post.ts` (modificado — generado)
- `src/app/core/api/generated/fn/jobs/jobs-nearby-items-digest-post.ts` (nuevo — generado)
- `src/app/core/api/generated/services/items.service.ts` (modificado — generado)
- `src/app/core/api/generated/services/jobs.service.ts` (nuevo — generado)
- `src/app/core/api/generated/functions.ts` (modificado — generado)
- `src/app/core/api/generated/models.ts` (modificado — generado)
- `src/app/core/api/generated/services.ts` (modificado — generado)
- `docs/architecture.md` (modificado — v1.5 → v1.6)
- `docs/api-client.md` (modificado — referencias DLT-candidato-contacto)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modificado — status in-progress)
