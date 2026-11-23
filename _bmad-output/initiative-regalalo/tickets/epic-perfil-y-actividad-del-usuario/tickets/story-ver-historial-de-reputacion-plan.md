---
ticket: 2
status: done
type: feature
migrated_from: v6
---

# Story 5.2: Ver historial de reputación

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed. -->

## Story

Como usuario autenticado,
quiero ver mis eventos de reputación,
para entender cómo cambió mi score a lo largo del tiempo.

## Acceptance Criteria

1. **Given** el tab «Reputación» dentro de `/perfil` (5.1 lo creó como placeholder)
   **When** el usuario activa dicho tab por primera vez
   **Then** se llama `UsersService.usersMeReputationHistoryGet()` **una sola vez** (lazy, no en `ngOnInit`)
   **And** mientras carga se muestra skeleton/spinner coherente con el design system
   **And** los datos llegan y se renderiza la UI de reputación del prototipo

2. **Given** `events.length > 0`
   **When** se renderiza la tab
   **Then** aparece la tarjeta resumen:
   - Label «Puntuación total» (uppercase, fuente `--font-body`, 11 px, muted)
   - Score grande (44 px, `--font-mono`, `+N` o `N` con color `--primary`/`--error`/`fgMuted`)
   - Subtexto con totales positivos (verde `#3A7B4A`) y negativos (rojo `#B33A2A`)
   - Sparkline de hasta 10 barras (último evento a la derecha); barras 9 px ancho, altura = `Math.min(100, abs(delta)/40*100+15)%`; verde/rojo semitransparente
   **And** debajo aparece la lista de eventos (`RepRow` por cada evento):
   - Círculo icono (check/X; fondo verde `#EBF5EE`/rojo `#FDECEA`) con color `#3A7B4A`/`#B33A2A`
   - Texto «Entrega completada» o «No-show declarado»
   - Fecha localizada debajo del label (Intl o pipe del proyecto)
   - A la derecha: chip delta `+N`/`N` con colores `EBF5EE/265533/9DCCA8` o `FDECEA/7D2419/E8A89E`
   **And** al final de la lista: pie «Inicio del historial» (muted, centrado, 11 px)

3. **Given** `events.length === 0`
   **When** el API devuelve array vacío
   **Then** estado vacío: icono estrella + «Sin historial de reputación» + «Completa tu primera entrega para empezar a acumular puntuación.»

4. **Given** el tipo de evento `no_show` con delta negativo acumulativo (ej. -20, -40)
   **When** se renderiza el chip
   **Then** se muestra el valor real negativo (`-20`, `-40`) — **no** valor absoluto (NFR-F7)

5. **Given** error de red u otro (no 401 — ese lo maneja el interceptor)
   **When** `usersMeReputationHistoryGet` rechaza
   **Then** mensaje de error accesible con clave `profile.reputation.error_load` + botón «Reintentar»
   **And** al pulsar reintentar se vuelve a llamar la API y los estados se resetean

6. **Given** el usuario navega a otro tab y vuelve al tab «Reputación»
   **When** los datos ya fueron cargados (sin error)
   **Then** **no** se relanza la petición; se muestran los datos cacheados en el signal

7. **Given** el usuario pulsa «Reintentar» tras error
   **When** la petición anterior falló
   **Then** sí se relanza la petición (forzar recarga, ignorar flag de carga ya realizada)

## Tasks / Subtasks

### A. Lógica en `PerfilComponent` (AC: 1, 5–7)

- [x] **Nuevos signals de reputación** (AC: 1, 5–7)
  - `repEvents = signal<ReputationEvent[]>([])` — importar desde `core/api/generated/models/reputation-event`
  - `repLoading = signal(false)`
  - `repErrorKey = signal<string | null>(null)`
  - `private repLoaded = false` (flag privado; reset a `false` en retry)
  - Método `loadReputation(force = false)`: llama `usersMeReputationHistoryGet()` solo si `!repLoaded || force`; gestiona loading/error/data; `repLoaded = true` en éxito

- [x] **Activación lazy en cambio de tab** (AC: 1, 6)
  - Crear o actualizar método `selectTab(tab: TabId)` que ya existe en 5.1:
    - Si `tab === 'reputacion'` → llamar `loadReputation()`
  - Alternativamente usar `effect(() => { if (activeTab() === 'reputacion') this.loadReputation(); })` — **elegir el patrón que ya use 5.1 para otros tabs**

- [x] **`computed` para stats de resumen** (AC: 2)
  - `repTotPos = computed(() => this.repEvents().filter(e => e.delta > 0).reduce((a, e) => a + e.delta, 0))`
  - `repTotNeg = computed(() => this.repEvents().filter(e => e.delta < 0).reduce((a, e) => a + e.delta, 0))`
  - `repSparkline = computed(() => this.repEvents().slice(0, 10).reverse())`

### B. Template (AC: 2–5)

- [x] **Sustituir placeholder del tab reputación** (AC: 2–5)
  - Quitar el `@empty`/«Próximamente» del tab `reputacion` que puso 5.1
  - Añadir el bloque `@if (repLoading())` → spinner/skeleton
  - Añadir `@else if (repErrorKey())` → mensaje error + botón retry (aria `role="alert"`)
  - Añadir `@else if (repEvents().length === 0)` → estado vacío (icono estrella SVG, 2 strings i18n)
  - Añadir `@else` → tarjeta resumen + lista

- [x] **Tarjeta resumen** (AC: 2)
  - Container: `bgSurface`, borde `1px solid var(--border)`, `border-radius: 12px`, `box-shadow: var(--sh1)`, `padding: 20px 24px`; flex row con gap 24, flex-wrap
  - Puntuación total label → score grande → subtexto ganados/perdidos
  - Sparkline: `@for (bar of repSparkline(); track bar.id)` — `div` 9 px ancho, `border-radius: 3px`, altura calculada con `[style.height.%]`

- [x] **Lista RepRow** (AC: 2, 4)
  - Container: `bgSurface`, borde, `border-radius: 12px`, `padding: 0 20px`
  - `@for (event of repEvents(); track event.id)` — cada fila: flex row `justify-between`, `padding: 12px 0`, `border-bottom: 1px solid var(--border)`
  - Icono círculo (34 × 34), label, fecha (`Intl.DateTimeFormat` o pipe del proyecto), chip delta
  - Pie: «Inicio del historial» en `<div>` al final del container, no dentro del `@for`

### C. Estilos en `perfil.component.scss` (AC: 2–3)

- [x] Añadir clases:
  - `.perfil__rep-summary` — tarjeta resumen (flex, gap, radios, sombra)
  - `.perfil__rep-score` — score grande (font-mono, 44 px)
  - `.perfil__rep-totals` — row ganados/perdidos (flex, gap 14)
  - `.perfil__rep-sparkline` — flex, `align-items: flex-end`, gap 4, height 52
  - `.perfil__rep-bar` — bar del sparkline (9 px ancho, radios)
  - `.perfil__rep-list` — container lista (padding 0 20, radios)
  - `.perfil__rep-row` — flex row evento (padding 12 0, border-bottom)
  - `.perfil__rep-icon` — círculo 34 × 34 (border-radius 50%)
  - `.perfil__rep-chip` — chip delta (font-mono, 13 px, padding 3 10, border-radius 999)
  - `.perfil__rep-footer` — «Inicio del historial» (padding, centrado, muted, 11 px)
  - `.perfil__rep-empty` — estado vacío (igual patrón que `entregas__empty-card`)

### D. i18n (AC: 2–3, 5)

- [x] Añadir bajo `"profile"` en los 3 ficheros `public/i18n/{es,ca,en}.json`:
  ```json
  "reputation": {
    "total_score":        "Puntuación total",
    "earned":             "+{{value}} ganados",
    "lost":               "{{value}} perdidos",
    "event_delivery":     "Entrega completada",
    "event_no_show":      "No-show declarado",
    "start_of_history":   "Inicio del historial",
    "empty_title":        "Sin historial de reputación",
    "empty_sub":          "Completa tu primera entrega para empezar a acumular puntuación.",
    "error_load":         "No se pudo cargar el historial de reputación.",
    "retry":              "Reintentar"
  }
  ```
  - `ca` y `en`: traducción apropiada (no copiar ES en CA/EN)
  - Verificar que el tab label de «Reputación» ya lo añadió 5.1 en `profile.tabs.reputacion`; si no, añadirlo aquí

### E. Tests en `perfil.component.spec.ts` (AC: 1–7)

- [x] Mock: `UsersService.usersMeReputationHistoryGet` → `Promise.resolve({ events: [eventA, eventB] })`
- [x] Tab activado → verifica que `usersMeReputationHistoryGet` se llama **1 vez**
- [x] Tab reactivado (ya cargado) → `usersMeReputationHistoryGet` sigue siendo **1 llamada** (cache)
- [x] `delta: -40` (no_show) → chip muestra `-40` (no `40` ni `-40` → `40`)
- [x] `delta: 20` → chip muestra `+20`
- [x] `events: []` → estado vacío visible
- [x] Error API → mensaje error visible + botón retry; clic retry → 2.ª llamada
- [x] Loading → spinner/skeleton presente
- [x] `TranslocoTestingModule` con `es.json` parcial (incluir claves `profile.reputation.*`)

### F. Verificación manual

- [ ] Login → `/perfil` → clic tab «Reputación» → historial real del backend
- [ ] Volver a tab «Configuración» → volver a «Reputación» → sin segunda petición (Network devtools)
- [ ] Backend con eventos no_show → deltas negativos visibles con valor real
- [ ] Comparar visualmente con `docs/project/Perfil.html` estado `tab: 'reputacion'`

### Review Findings

- [x] [Review][Patch] Peticiones duplicadas si se activa el tab durante una carga en curso [`perfil.component.ts:169`]
- [x] [Review][Patch] Falta test de regresión para carga concurrente / doble clic en tab reputación [`perfil.component.spec.ts`]
- [x] [Review][Defer] Verificación manual sección F sin completar — proceso de QA, no bloqueo de código
- [x] [Review][Defer] Patrón ARIA tabs sin `tabindex` roving en botones — heredado de 5.1, fuera de alcance 5.2

## Dev Notes

### Contrato API (solo lectura)

```typescript
// GET /users/me/reputation-history → ReputationHistoryResponse
// src/app/core/api/generated/models/reputation-history-response.ts
interface ReputationHistoryResponse {
  events: Array<ReputationEvent>;
}

// src/app/core/api/generated/models/reputation-event.ts
interface ReputationEvent {
  id: string;
  type: 'delivery_completed' | 'no_show';
  delta: number;              // negativo en no_show; no_show -20 ó -40 (acumulativo)
  sessionId: string | null;
  createdAt: string;          // ISO8601
}
```

**Método:** `UsersService.usersMeReputationHistoryGet()` — `Promise<ReputationHistoryResponse>`  
**Path generado:** `/users/me/reputation-history`  
**No editar** `src/app/core/api/generated/` — si falla, regenerar con `npm run api:generate`

### Decisión de diseño: tab inline vs ruta hija

El prototipo `Perfil.html` usa tabs dentro de una sola página (`/perfil`), no rutas hijas. Las épicas mencionan «sección o ruta `/profile/reputation`» pero la palabra «sección» indica que se acepta como tab sin ruta propia.  
**Implementar como contenido del tab en `PerfilComponent`, sin ruta hija.**  
Si en el futuro se necesita enlace profundo a la tab de reputación (historia futura), añadir child route entonces.

### Diseño — `Perfil.html` (obligatorio, UX-DR8 bloqueante)

| Zona prototipo | Líneas | Implementación 5.2 |
|----------------|--------|--------------------|
| `RepRow` (icono + label + fecha + chip) | 518–554 | `@for` en lista |
| `ReputationTab` — tarjeta resumen | 558–598 | Computed totPos/totNeg + sparkline |
| `ReputationTab` — lista + footer | 601–610 | Container + RepRow + pie |
| Empty state (`!history.length`) | 559–562 | Estado vacío i18n |

**Colores exactos del prototipo (no inventar):**
- Positivo bg: `#EBF5EE` · fg: `#265533` · border chip: `#9DCCA8` · icon: `#3A7B4A`
- Negativo bg: `#FDECEA` · fg: `#7D2419` · border chip: `#E8A89E` · icon: `#B33A2A`
- Totales: ganados `#3A7B4A`, perdidos `#B33A2A`
- Score: `var(--primary)` si > 0, `var(--error)` si < 0, `var(--fg-muted)` si === 0

**Sparkline (últimos 10 eventos, orden cronológico → derecha = más reciente):**
```
height = `${Math.min(100, Math.abs(event.delta) / 40 * 100 + 15)}%`
background positive = `rgba(58,115,88, ${0.4 + i/history.length*0.6})`
background negative = `rgba(179,58,42, ${0.4 + i/history.length*0.6})`
```
Nota: `history.slice(0,10).reverse()` en el prototipo — en Angular, usar `computed` ya que signals son inmutables.

### NFR-F7 — Reputación negativa (no regresionar)

Patrón idéntico al establecido en `ItemDonorRowComponent` y reforzado en 5.1:
```typescript
scoreDisplay = score > 0 ? `+${score}` : String(score);
// Prohibido: Math.abs, Math.max(0, …), ocultar si negativo
```
Aplicar a `delta` en RepRow y al `reputationScore` del resumen.

### Dependencia en 5.1 — lo que debe existir antes de implementar

Esta historia presupone que 5.1 entregó:
- `PerfilComponent` con signal `activeTab: Signal<'donaciones'|'solicitudes'|'reputacion'|'configuracion'>`
- Método (o efecto) `selectTab(tab)` que gestiona el cambio de tab
- Bloque `@case 'reputacion'` (o equivalente) con placeholder `profile.tabs.coming_soon_reputacion`
- Inyección de `UsersService` ya presente en el componente
- Clases CSS base de tabs y containers definidas en `perfil.component.scss`
- Claves i18n `profile.tabs.*` añadidas en los 3 JSON

Si 5.1 **no** entregó alguno de estos puntos, completarlos en esta historia antes de proceder.

### Brownfield — reutilizar patrones existentes

| Pieza | Ubicación | Uso 5.2 |
|-------|-----------|---------|
| `UsersService.usersMeReputationHistoryGet` | `generated/services/users.service.ts` L98 | llamada API |
| `ReputationHistoryResponse` | `generated/models/reputation-history-response.ts` | tipo retorno |
| `ReputationEvent` | `generated/models/reputation-event.ts` | tipo ítem lista |
| Patrón loading/error/retry | `entregas.component.ts` — signals `loading`, `listErrorKey` | misma estructura |
| Score display NFR-F7 | `item-donor-row.component.ts` / `5.1 PerfilComponent` | chip delta + color |
| `TranslocoModule` | ya importado en `PerfilComponent` por 5.1 | sin cambios imports |
| Pie `Intl.DateTimeFormat` o pipe fecha | patrón usado en `entregas` / `items` | formatear `createdAt` |

### Fuera de alcance (historias siguientes)

| Historia | Contenido |
|----------|-----------|
| 5.3 | Tab «Donaciones» — `GET /users/me/items` |
| 5.4 | Tab «Solicitudes» — `GET /users/me/requests` |
| 5.5 | Perfil público `/users/:id` |

No implementar `usersMeItemsGet` ni `usersMeRequestsGet` en esta historia.

### Errores

| Código | Comportamiento |
|--------|----------------|
| 401 | Interceptor JWT global → redirect login; el componente no duplicar |
| Red / 5xx | `repErrorKey('profile.reputation.error_load')` + botón retry |
| Respuesta vacía/malformada | Tratar como error |

### Project Structure Notes

```
src/app/features/profile/
  perfil/
    perfil.component.ts      # UPDATE — añadir repEvents, repLoading, repErrorKey, loadReputation()
    perfil.component.html    # UPDATE — sustituir placeholder tab reputación
    perfil.component.scss    # UPDATE — añadir estilos RepRow, resumen, sparkline, empty
    perfil.component.spec.ts # UPDATE — añadir casos test reputación
public/i18n/
  es.json                    # UPDATE — profile.reputation.*
  ca.json                    # UPDATE — profile.reputation.*
  en.json                    # UPDATE — profile.reputation.*
```

No crear componente separado para `RepRow` ni `ReputationTab` a menos que se reutilice en 5.5 (perfil público). Para esta historia, implementar inline en el template de `PerfilComponent`.

### Referencias

- [Source: `_bmad-output/initiative-regalalo/archive-v6/epics.md` — Epic 5, Story 5.2, L851–869]
- [Source: `docs/project/Perfil.html` — RepRow L518–554, ReputationTab L558–611]
- [Source: `docs/architecture.md` — GET /users/me/reputation-history L664–688, NFR-F7 L805]
- [Source: `docs/api-client.md` — UsersService L60]
- [Source: `src/app/core/api/generated/services/users.service.ts` — usersMeReputationHistoryGet L98–100]
- [Source: `src/app/core/api/generated/models/reputation-event.ts`]
- [Source: `src/app/core/api/generated/models/reputation-history-response.ts`]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/5-1-ver-perfil-privado.md` — tab shell, fuera de alcance 5.1 L194]
- [Source: `_bmad-output/project-context.md` — diseño, i18n, API generada]
- [Source: `backend/tests/users-reputation-history.test.ts` — contrato 22.x (backend listo)]

## Previous story intelligence (5.1)

- `PerfilComponent` crea el shell de tabs con signal `activeTab` — 5.2 **extiende**, no reemplaza.
- 5.1 prohíbe explícitamente llamar `usersMeReputationHistoryGet` — 5.2 es la primera historia que lo llama.
- Patrón signals + retry idéntico al de `EntregasComponent`; no inventar nuevo patrón.
- i18n obligatorio en todos los strings visibles; `TranslocoTestingModule` en specs.
- Diseño pixel-perfect bloqueante (UX-DR8); revisar `Perfil.html` completo antes de escribir SCSS.
- Code review 4.5: preferir CTAs reales frente a hints silenciosos — estado vacío debe ser explícito e i18n.

## Git intelligence summary

Commits recientes (épicas 3–4): componentes feature con specs extensos, claves i18n triplicadas, servicios generados, utilidades en `core/utils/`. Patrón constante: `signal()` + `computed()` + `inject()` sin constructor. Tests con `TranslocoTestingModule.forRoot({ langs: { es: esJson } })`.

## Latest tech information

- **Angular 21:** standalone, signals, `OnPush`, `inject()` — sin cambios desde historias anteriores.
- **`@jsverse/transloco`:** pipe `| transloco` o directiva `*transloco="let t"` — usar según volumen de claves.
- **`usersMeReputationHistoryGet()`** devuelve `Promise<ReputationHistoryResponse>` (OpenAPI gen actual); no requiere `api:generate` salvo cambio de contrato backend.
- **`ReputationEvent.delta`:** `number` (puede ser negativo); el tipo generado no tiene `note` — el prototipo muestra un `event.note` opcional pero **no está en el contrato API**, ignorarlo.

## Dev Agent Record

### Agent Model Used

Composer (dev-story 2026-05-24)

### Debug Log References

### Completion Notes List

- Tab «Reputación» en `PerfilComponent`: carga lazy vía `setTab('reputacion')` → `loadReputation()` con cache `repLoaded`.
- UI alineada con `Perfil.html`: tarjeta resumen (score, totales, sparkline), lista RepRow, vacío y error+retry.
- NFR-F7: `formatDelta()` muestra signo real (`+20`, `-40`); sin `Math.abs`.
- i18n `profile.reputation.*` en es/ca/en.
- 25 tests en `perfil.component.spec.ts` (8 nuevos de reputación); todos pasan.
- Verificación manual (sección F) pendiente para el revisor.

### File List

- src/app/features/profile/perfil/perfil.component.ts
- src/app/features/profile/perfil/perfil.component.html
- src/app/features/profile/perfil/perfil.component.scss
- src/app/features/profile/perfil/perfil.component.spec.ts
- public/i18n/es.json
- public/i18n/ca.json
- public/i18n/en.json

### Change Log

- 2026-05-24: Historia 5.2 — historial de reputación en tab `/perfil` (frontend).
