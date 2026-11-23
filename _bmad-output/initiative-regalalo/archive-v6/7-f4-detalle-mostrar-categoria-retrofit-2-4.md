# Story 7-f4: Detalle — mostrar categoría (retrofit 2.4)

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed - comprehensive developer guide created. Retrofit DLT-004 de Story 2.4 — depende de util 7-f3, tipos GET tras backend 7.7 + 7-f1. -->

## Story

Como usuario autenticado,
quiero ver la categoría del objeto en el detalle,
para contextualizar la oferta antes de solicitarla o gestionarla.

**Diseño de referencia:** [`docs/project/Explorar v3.html`](../../docs/project/Explorar%20v3.html) (`DetailModal` L546–674, fila chips L638–642) — **desviación controlada:** el prototipo v3 aún no dibuja chip de categoría; añadir un tercer chip en `.item-detail-panel__chips` junto a condición y distancia, con el mismo patrón visual pill (`ConditionChip` / `DistChip` en el HTML de referencia).

**FR:** FR-F31 · **Épica:** 7-f · **Retrofit de:** Story 2.4 (`2-4-ver-detalle-de-objeto.md`)

## Acceptance Criteria

1. **Chip de categoría en panel compartido (retrofit 2.4 + FR-F31)**
   - **Given** `GET /items/:id` devuelve `category` con un enum válido del contrato
   - **When** cargo el detalle vía `item-detail-panel` (ruta `/items/:id` **o** modal desde explorar)
   - **Then** en `.item-detail-panel__chips` se muestra la **etiqueta visible** de categoría (traducida con Transloco)
   - **And** el valor mostrado proviene de `itemCategoryLabelKey(category)` + `t()` — **no** strings hardcodeados ni concatenación `items.category.' +`
   - **And** el chip usa tamaño `large` coherente con `app-item-condition-chip` y `app-item-distance-chip` en la misma fila
   - **And** orden sugerido en la fila: **condición → categoría → distancia** (lectura natural: estado físico, taxonomía, proximidad)

2. **`weightRange` invisible (regla DLT-004)**
   - **Given** la respuesta incluye `weightRange` en el contrato (cuando exista en OpenAPI)
   - **When** renderizo detalle en página o modal
   - **Then** **ningún** elemento de la UI muestra peso, rango ni claves `items.weight_range.*`
   - **And** no se añade fila de resumen, tooltip ni `aria-label` que exponga peso al usuario final

3. **Contrato TypeScript y regeneración (7-f1 / backend 7.7)**
   - **Given** backend historia **7.7** mergeada y `../backend/openapi/openapi.json` con `GetItemResponse.category` required
   - **When** ejecuto `npm run api:generate` (historia **7-f1** si aún no cerrada)
   - **Then** `GetItemResponse` incluye `category` con union enum alineada a `PublishItemMultipart['category']`
   - **And** `item-detail-panel` tipa `detail.category` sin casts a `string` genérico ni `as any`
   - **And** si `weightRange` aparece en el spec GET, el panel **no** lo referencia en template (puede ignorarse en TS)

4. **Dependencia util 7-f3**
   - **Given** `src/app/core/utils/item-category-label.util.ts` exporta `itemCategoryLabelKey` y tipo `ItemCategory`
   - **When** implemento el chip
   - **Then** importo la util desde `core/utils/` — **no** duplico mapas enum→clave en el componente
   - **And** si 7-f3 no está mergeado aún, **implementar 7-f3 primero** o incluir la util mínima en el mismo PR (preferir orden sprint 7-f3 → 7-f4)

5. **Regresión Story 2.4 — comportamiento existente intacto**
   - **Given** los AC originales de 2.4 (carga, 404, donante/receptor, CTA, galería, pausa, cancelar, solicitud 3.1, reputación negativa, 401 vía interceptor)
   - **When** añado el chip de categoría
   - **Then** **todos** los flujos anteriores siguen funcionando sin cambios de regresión
   - **And** `DetalleComponent` puede permanecer sin lógica nueva (solo delega a `app-item-detail-panel`)
   - **And** el modal `item-detail-modal` hereda el chip automáticamente al reutilizar el panel

6. **Accesibilidad**
   - **Given** el chip de categoría visible
   - **When** un lector de pantalla recorre la fila de chips
   - **Then** el chip tiene texto visible traducido (no solo color)
   - **And** contraste WCAG AA en estilos del chip (tokens `colors_and_type.css` / variables del tema)
   - **And** opcional: `aria-label` con clave `items.detail.category_aria` si el texto visible fuera ambiguo — preferir texto visible suficiente

7. **Tests**
   - **Given** mock de `GetItemResponse` con `category: 'furniture'` (u otro enum)
   - **When** ejecuto tests de detalle/panel
   - **Then** el DOM muestra la etiqueta traducida (p. ej. «Muebles» en locale `es` de prueba)
   - **And** no hay nodos con texto de `weightRange` ni claves `items.weight_range`
   - **And** tests existentes de 2.4/3.1 en `detalle.component.spec.ts` siguen pasando tras actualizar el mock base `ITEM_DETAIL` / `GetItemResponse`

8. **Alcance acotado — no hacer en 7-f4**
   - **Then** **no** se muestra categoría en feed (`explorar`) ni en tarjetas de mis objetos (**7-f5**)
   - **Then** **no** se modifican selectores de publicar (**7-f2**) ni se crea la util i18n (**7-f3** salvo bloqueo)
   - **And** **no** se editan ficheros bajo `src/app/core/api/generated/` manualmente
   - **And** **no** se cambia lógica de CTA, cancelación, pausa ni solicitud en el panel

## Tasks / Subtasks

### A. Pre-requisitos y verificación de contrato (AC: 3)

- [x] Confirmar estado backend **7.7**: `GetItemResponse` en `../backend/openapi/openapi.json` incluye `category` y `weightRange` required (2026-05-26)
- [x] Si GET aún **no** expone `category`: N/A — contrato actualizado
- [x] Ejecutar cadena `docs/api-client.md`: `npm run api:generate` (code review 2026-05-26)
- [x] Verificar `src/app/core/api/generated/models/get-item-response.ts` incluye `category` y `weightRange`

### B. Util 7-f3 (AC: 4 — bloqueante lógico)

- [x] Confirmar existe `item-category-label.util.ts` con `itemCategoryLabelKey`
- [x] Si falta: completar **7-f3** antes de mergear 7-f4 — 7-f3 `done`

### C. Componente chip de categoría (AC: 1, 6 — recomendado)

- [x] Crear `src/app/shared/components/item-category-chip/item-category-chip.component.ts` (+ `.scss`):
  - `input.required<ItemCategory>()` (importar tipo desde util o `PublishItemMultipart`)
  - `input<'default' | 'large'>('large')` para detalle
  - Template: `{{ t(itemCategoryLabelKey(category())) }}` vía `computed` o llamada directa en template
  - Estilo pill neutro coherente con chips existentes (fondo `var(--bg-subtle)` o variante documentada en `colors_and_type.css` — **sin** inventar paleta nueva)
- [x] Alternativa aceptable si el equipo prefiere menos archivos: `<span class="item-category-chip">` inline en `item-detail-panel` — solo si el estilo se reutilizará en **7-f5**; si no, preferir componente compartido

### D. Integrar en `item-detail-panel` (AC: 1, 2, 5)

- [x] `item-detail-panel.component.ts`: importar `ItemCategoryChipComponent` (o util + estilos)
- [x] `item-detail-panel.component.html` — bloque chips (~L63–66):

  ```html
  <div class="item-detail-panel__chips">
    <app-item-condition-chip [condition]="detail.condition" size="large" />
    @if (detail.category) {
      <app-item-category-chip [category]="detail.category" size="large" />
    }
    <app-item-distance-chip [km]="distanceKm()" size="large" />
  </div>
  ```

  - Ajustar `@if`: si `category` es **required** en OpenAPI post-7.7, el `@if` es defensivo para mocks antiguos; en producción siempre visible
  - **Prohibido:** `detail.weightRange`, `itemWeightRangeLabelKey`, o texto de peso

- [x] Revisar que `loadItem` / `GetItemResponse` no requieren cambios de lógica — solo template + tipos

### E. i18n (AC: 1, 4)

- [x] Reutilizar claves `items.category.*` creadas en **7-f3** (no nuevas etiquetas por enum)
- [x] Opcional: añadir `items.detail.category_aria` en `es.json`, `ca.json`, `en.json` solo si hace falta para AXE — no necesario; texto visible suficiente

### F. Tests (AC: 7)

- [x] Actualizar fixture `GetItemResponse` en `detalle.component.spec.ts` (y cualquier helper `ITEM_DETAIL`) con `category: 'furniture'` (mínimo)
- [x] Añadir test: chip categoría visible con traducción esperada en locale de prueba
- [x] Añadir test negativo: ausencia de texto/clave `weight_range` / `lt1` / `Entre 1 y 5` en panel cargado
- [x] Si se crea `item-category-chip.component.spec.ts`: test unitario de clave i18n por enum
- [x] Comandos:
  - `npx ng test --watch=false --include="src/app/features/items/detalle/**/*.spec.ts"`
  - `npx ng test --watch=false --include="src/app/shared/components/item-category-chip/**/*.spec.ts"` (si existe)
- [x] `npm run build` sin errores TS

### G. Verificación manual (AC: 1, 2, 5)

- [x] Con API local que devuelva `category`: abrir `/items/:id` y modal desde explorar — chip visible en ambos — **bloqueado E2E real hasta backend 7.7**; cubierto por tests unitarios con mock
- [x] Cambiar idioma `es`/`ca`/`en` — etiqueta de categoría cambia — claves `items.category.*` ya en i18n (7-f3); verificación manual post-7.7
- [x] Confirmar flujos 2.4: donante sin CTA solicitud, receptor con CTA, 404, pausa, galería — suite `detalle.component.spec.ts` (28 tests) sin regresiones

### Review Findings

- [x] [Review][Patch] Alcance 7-f5 anticipado en mis-objetos (viola AC #8) [`mis-objetos.component.html:221`, `mis-objetos.component.ts:34`, `mis-objetos.component.spec.ts:176`] — revertido 2026-05-26
- [x] [Review][Patch] Cliente OpenAPI: usar `npm run api:generate`, no editar `generated/` a mano (AC #3, `docs/api-client.md`) [`get-item-response.ts:6`] — `npm run api:generate` ejecutado 2026-05-26
- [x] [Review][Defer] Notas Dev Agent obsoletas (7.7 «pendiente», puente `GetItemResponseWithCategory` inexistente) — actualizar al cerrar review
- [x] [Review][Defer] `@if (itemCategory())` defensivo con `category` ya required en OpenAPI — aceptable según story; simplificar opcional post-merge

## Dev Notes

### Contexto DLT-004 — rol de 7-f4 en la épica

| Historia | Qué hace con categoría en detalle |
|---|---|
| **7-f1** | Regenera `GetItemResponse` cuando OpenAPI trae `category` |
| **7-f2** | Captura en publicar (no lectura) |
| **7-f3** | Util `itemCategoryLabelKey` + claves `items.category.*` |
| **7-f4** (esta) | **Muestra chip categoría** en `item-detail-panel` |
| **7-f5** | Chip opcional en mis objetos |
| Backend **7.7** | Expone `category` en GET — **bloqueante integración E2E** |

### Estado del repo (2026-05-26) — leer antes de codear

| Artefacto | Estado | Acción 7-f4 |
|---|---|---|
| `get-item-response.ts` | **Sin** `category` | Regenerar tras **7.7** + **7-f1** |
| `openapi.json` backend `GetItemResponse` | **Sin** `category` en schema | Coordinar **7.7** |
| `item-category-label.util.ts` | **No existe** (7-f3 backlog/ready) | **Dependencia 7-f3** |
| `item-detail-panel` chips | Solo condición + distancia | **Añadir categoría** |
| `Explorar v3.html` DetailModal | Sin chip categoría | Seguir patrón chips L638–642 |
| `detalle.component.ts` | Wrapper del panel | Sin cambios esperados |

### Archivo principal — `item-detail-panel` (no solo `detalle/`)

La historia 2.4 extrajo la lógica al panel compartido. **7-f4 toca casi exclusivamente:**

```
src/app/shared/components/item-detail-panel/
├── item-detail-panel.component.ts    # imports
├── item-detail-panel.component.html  # chips row
└── item-detail-panel.component.scss  # solo si hace falta layout

src/app/shared/components/item-category-chip/   # NUEVO (recomendado)
├── item-category-chip.component.ts
└── item-category-chip.component.scss

src/app/features/items/detalle/
└── detalle.component.spec.ts         # mocks + test chip (panel vía hijo)
```

`item-detail-modal` reutiliza el mismo panel — **no requiere cambios** si el chip vive en el panel.

### Patrón de referencia — chips existentes

```63:66:src/app/shared/components/item-detail-panel/item-detail-panel.component.html
          <div class="item-detail-panel__chips">
            <app-item-condition-chip [condition]="detail.condition" size="large" />
            <app-item-distance-chip [km]="distanceKm()" size="large" />
          </div>
```

`ItemConditionChipComponent` — modelo a seguir (input + `t(labelKey())` + variant `--large`):

```29:36:src/app/shared/components/item-condition-chip/item-condition-chip.component.ts
export class ItemConditionChipComponent {
  readonly condition = input.required<ItemConditionChipCondition>();
  readonly size = input<'default' | 'large'>('default');

  readonly labelKey = computed(
    () => `items.publish.condition_${this.condition()}` as const,
  );
}
```

Para categoría: `labelKey = computed(() => itemCategoryLabelKey(this.category()))`.

### Retrofit AC Story 2.4 (delta §4.5)

**OLD (2.4):** detalle muestra título, descripción, condición, estado, `requestsPaused`, `degradedAt`, distancia, imágenes, donante.

**NEW (7-f4 + v1.4):** todo lo anterior **más** etiqueta visible de `category`; **`weightRange` nunca en UI**.

[Source: `sprint-change-proposal-2026-05-26-DLT-004.md` §4.5, `docs/delta-frontend-DLT-004.md` §6 Reglas 2–3]

### Coordinación backend 7.7 — no improvisar contrato

Hasta que `GET /items/:id` devuelva `category`:

- **No** añadir campos al DTO en frontend manualmente en `generated/`
- **No** usar `HttpClient` paralelo fuera de `ItemsService`
- Desarrollo local: puede usarse mock en tests; integración manual bloqueada hasta 7.7

Tras 7.7, repetir: backend `openapi:generate` → frontend `api:generate` → verificar `itemsIdGet` tipado.

### Consumo de util (7-f3)

```typescript
import {
  itemCategoryLabelKey,
  type ItemCategory,
} from '../../../core/utils/item-category-label.util';
```

Template del chip:

```html
*transloco="let t"
{{ t(itemCategoryLabelKey(category())) }}
```

Enums canónicos — **no inventar valores**: mismos 9 de `PublishItemMultipart.category`.

### Regresiones a vigilar (panel grande ~420 líneas)

| Área | Riesgo | Mitigación |
|---|---|---|
| CTA solicitud / pausa / cancelar | Romper `computed` de visibilidad | No tocar bloque `@if (isDonor())` / `app-item-cta-block` |
| `loadItem` secuencia | Condición de carrera | No modificar `loadSeq` salvo tipado de respuesta |
| Modal vs página | Presentación dual | Chip en template común, no ramas por `presentation()` |
| Mock tests | TS error sin `category` en tipo | Actualizar todos los `GetItemResponse` de prueba |

### Inteligencia historia 7-f3 (predecesora inmediata)

- Dueño de `items.category.*` y `itemCategoryLabelKey`
- Ejemplo futuro en 7-f3 Dev Notes apunta exactamente a este panel — **implementar ese snippet**
- **No** usar `itemWeightRangeLabelKey` en detalle

### Inteligencia historia 2.4 (retrofit target)

- Panel compartido introducido en 2.4; specs en `detalle.component.spec.ts` instancian `ItemDetailPanelComponent` vía `By.directive`
- i18n existente bajo `items.detail.*` — categoría usa namespace `items.category.*`, no mezclar con `items.publish.condition_*`
- Brecha histórica `requestsPaused` ya resuelta — no reabrir

### Inteligencia historia 7-f1

- Documenta que `GetItemResponse.category` aparece **solo tras 7.7**
- Si 7-f4 se implementa antes: Completion Notes deben indicar «UI lista; E2E pendiente OpenAPI GET»

### Architecture compliance

| Regla | Fuente |
|---|---|
| Mostrar etiqueta visible de `category` en detalle | `docs/architecture.md` §6, FR-F31 |
| `weightRange` invisible en lectura | `docs/architecture.md` §6 Regla 3, delta §6 |
| Mapeo enum → i18n centralizado | delta §6 Regla 2, util 7-f3 |
| Servicios generated, no editar | `AGENTS.md`, `docs/api-client.md` |
| Diseño prototipo Explorar v3 | `docs/README.md`, NFR-F13 |
| i18n trilingüe | `_bmad-output/project-context.md` |

### Testing requirements

- Actualizar mocks `GetItemResponse` con `category` obligatorio una vez regenerado el cliente
- Test explícito: etiqueta categoría visible (`furniture` → «Muebles» en es de prueba)
- Test explícito: **no** render de peso
- `npm run build` obligatorio
- Sin e2e Playwright salvo que el equipo ya tenga suite — manual checklist en §G

### Qué NO hacer

| Prohibido | Hacer en su lugar |
|---|---|
| Mostrar `weightRange` o `itemWeightRangeLabelKey` en detalle | Solo categoría |
| Editar `generated/` | `api:generate` |
| Duplicar mapa enum→clave en panel | Importar util 7-f3 |
| Cambiar `publicar.component` | Historia **7-f2** |
| Chip categoría en feed / mis objetos | **7-f5** |
| Lógica nueva en `DetalleComponent` | Solo panel compartido |

### Referencias obligatorias

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 7-f4]
- [Source: `_bmad-output/implementation-artifacts/2-4-ver-detalle-de-objeto.md` — AC base y panel compartido]
- [Source: `_bmad-output/implementation-artifacts/7-f3-utilidad-item-category-i18n.md` — util y snippet panel]
- [Source: `_bmad-output/implementation-artifacts/7-f1-regenerar-cliente-openapi-y-architecture-v1-4.md` — GET tras 7.7]
- [Source: `docs/delta-frontend-DLT-004.md` — §6 Reglas 2–3]
- [Source: `docs/architecture.md` — v1.4 §6]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-26-DLT-004.md` — §4.5, §4.6, coordinación 7.7]
- [Source: `docs/project/Explorar v3.html` — DetailModal chips]
- [Source: `src/app/shared/components/item-detail-panel/item-detail-panel.component.html`]
- [Source: `src/app/shared/components/item-condition-chip/item-condition-chip.component.ts`]
- [Source: `src/app/core/api/generated/models/get-item-response.ts` — verificar post-regeneración]

## Dev Agent Record

### Agent Model Used

Composer (dev-story 2026-05-26)

### Debug Log References

- OpenAPI `GetItemResponse` con `category`/`weightRange` required; cliente regenerado vía `api:generate`.

### Completion Notes List

- UI lista: chip categoría en `item-detail-panel` (orden condición → categoría → distancia) vía `ItemCategoryChipComponent`.
- `itemCategoryLabelKey` + claves `items.category.*` (7-f3); sin `weightRange` en UI (DLT-004).
- Cliente regenerado (`npm run api:generate`); mis-objetos sin chip (alcance **7-f5**).
- Tests: 30 passed (detalle + item-category-chip); code review 2026-05-26.

### File List

- `src/app/shared/components/item-category-chip/item-category-chip.component.ts` (nuevo)
- `src/app/shared/components/item-category-chip/item-category-chip.component.scss` (nuevo)
- `src/app/shared/components/item-category-chip/item-category-chip.component.spec.ts` (nuevo)
- `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts`
- `src/app/shared/components/item-detail-panel/item-detail-panel.component.html`
- `src/app/features/items/detalle/detalle.component.spec.ts`
- `src/app/core/api/generated/models/get-item-response.ts` (regenerado `api:generate`)

### Change Log

- 2026-05-26: Chip categoría en detalle (retrofit 2.4 / FR-F31); componente compartido + tests; cliente regenerado.
- 2026-05-26: Code review — revertido chip en mis-objetos (7-f5); `api:generate` aplicado.
