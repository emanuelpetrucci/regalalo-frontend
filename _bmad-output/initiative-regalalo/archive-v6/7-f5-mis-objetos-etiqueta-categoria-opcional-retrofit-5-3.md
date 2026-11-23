# Story 7-f5: Mis objetos — etiqueta categoría opcional (retrofit 5.3)

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed - comprehensive developer guide created. Retrofit DLT-004 opcional de Story 5.3 — depende de util 7-f3, tipos GET tras backend 7.7 + 7-f1. -->

## Story

Como donante,
quiero ver la categoría de cada objeto en la lista de mis objetos publicados,
para gestionar mi inventario con contexto taxonómico sin abrir el detalle.

**Diseño de referencia:** [`docs/project/Mis objetos.html`](../../docs/project/Mis%20objetos.html) (`ItemRow` L343–398) — **desviación controlada:** el prototipo aún no dibuja categoría en la fila; añadir etiqueta pill compacta en `.mis-objetos__row-meta` (Regla 4 delta §6 — opcional MVP, **implementar en esta historia**).

**FR:** FR-F31 (lectura de categoría en UI de donante) · **Épica:** 7-f · **Retrofit de:** Story 5.3 (`5-3-ver-mis-objetos-publicados.md`) — **solo ruta `/mis-objetos`**, no tab Donaciones de `/perfil`

## Acceptance Criteria

1. **Etiqueta de categoría en fila de lista (retrofit 5.3 + delta Regla 4)**
   - **Given** `GET /users/me/items` devuelve `category` con enum válido en cada `MyItem`
   - **When** renderizo la lista en `/mis-objetos` (cualquier tab de filtro)
   - **Then** cada fila (`mis-objetos__row`) muestra la **etiqueta visible** de categoría traducida
   - **And** el valor proviene de `itemCategoryLabelKey(category)` + Transloco — **no** strings hardcodeados
   - **And** la etiqueta usa estilo pill compacto coherente con chips existentes (`ItemCategoryChipComponent` size `default` o span con clase `mis-objetos__row-category`)
   - **And** ubicación sugerida: dentro de `.mis-objetos__row-meta`, **antes** del texto de días (`daysAgoLabel`), separada visualmente del meta de estado (solicitudes / expira sesión)

2. **`weightRange` invisible (regla DLT-004)**
   - **Given** la respuesta incluye `weightRange` en el contrato (cuando exista en OpenAPI)
   - **When** renderizo filas de lista o panel detalle inline de mis-objetos
   - **Then** **ningún** elemento muestra peso, rango ni claves `items.weight_range.*`
   - **And** no se usa `itemWeightRangeLabelKey` en este feature

3. **Contrato TypeScript y regeneración (7-f1 / backend 7.7)**
   - **Given** backend historia **7.7** mergeada y `../backend/openapi/openapi.json` con `MyItem.category` required
   - **When** ejecuto `npm run api:generate` (historia **7-f1** si aún no cerrada)
   - **Then** `src/app/core/api/generated/models/my-item.ts` incluye `category` con union enum alineada a `PublishItemMultipart['category']`
   - **And** `MisObjetosComponent` tipa `item.category` sin casts genéricos ni `as any`
   - **And** si `weightRange` aparece en el spec GET, el componente **no** lo referencia en template

4. **Dependencia util 7-f3 y chip 7-f4**
   - **Given** `src/app/core/utils/item-category-label.util.ts` exporta `itemCategoryLabelKey` y tipo `ItemCategory`
   - **When** implemento la etiqueta en lista
   - **Then** importo la util desde `core/utils/` — **no** duplico mapas enum→clave
   - **And** reutilizo `ItemCategoryChipComponent` si **7-f4** ya lo creó; si no existe, crear el componente compartido en `shared/components/item-category-chip/` (mismo contrato que 7-f4) para no duplicar estilos entre detalle y lista
   - **And** si 7-f3 no está mergeado, **implementar 7-f3 primero** o incluir util mínima en el mismo PR

5. **Regresión Story 5.3 — comportamiento existente intacto**
   - **Given** los flujos actuales de `MisObjetosComponent` (tabs, split layout, deep link `?itemId=`, detalle inline, candidatos, pausa, selección receptor, entrega, cancelación, banners éxito)
   - **When** añado la etiqueta de categoría en fila
   - **Then** **todos** los flujos anteriores siguen funcionando sin regresión
   - **And** no se modifica la lógica de `loadPage`, `loadDetail`, filtros por tab ni contadores
   - **And** el panel detalle inline (`mis-objetos__detail`) **no requiere** chip categoría en esta historia (alcance = tarjetas de lista); opcional futuro fuera de AC

6. **Accesibilidad**
   - **Given** la etiqueta de categoría visible en fila
   - **When** un lector de pantalla recorre la fila (`role="listitem"`)
   - **Then** la categoría tiene texto visible traducido (no solo color de fondo)
   - **And** contraste WCAG AA en estilos del chip (tokens `colors_and_type.css` / variables del tema)
   - **And** la fila mantiene `aria-describedby` para sufijo pausadas sin conflicto

7. **Tests**
   - **Given** mock de `MyItem` con `category: 'furniture'` (u otro enum)
   - **When** ejecuto tests de `mis-objetos.component.spec.ts`
   - **Then** el DOM de la fila muestra la etiqueta traducida (p. ej. «Muebles» en locale `es` de prueba)
   - **And** no hay nodos con texto de `weightRange` ni claves `items.weight_range`
   - **And** tests existentes de 5.3 (tabs, detalle, candidatos, entrega, cancel) siguen pasando tras actualizar `makeItem()` con `category`

8. **Alcance acotado — no hacer en 7-f5**
   - **Then** **no** se muestra categoría en feed explorar (**7-f4** cubre detalle vía `item-detail-panel`)
   - **Then** **no** se modifica tab Donaciones de `/perfil` (**5.3 perfil** queda fuera — solo retrofit pantalla `/mis-objetos`)
   - **Then** **no** se modifican selectores de publicar (**7-f2**) ni se crea la util i18n (**7-f3** salvo bloqueo)
   - **And** **no** se editan ficheros bajo `src/app/core/api/generated/` manualmente
   - **And** **no** se muestra `weightRange` en ninguna vista

## Tasks / Subtasks

### A. Pre-requisitos y verificación de contrato (AC: 3)

- [x] Confirmar estado backend **7.7**: `MyItem` en `../backend/openapi/openapi.json` debe incluir `category` en `properties` + `required`
- [x] Estado actual repo (2026-05-26): `MyItem` generated **sin** `category` — coordinar **7.7** antes de E2E real
- [x] Ejecutar cadena `docs/api-client.md`: backend `openapi:generate` → frontend `npm run api:generate` (**7-f1**) — **omitido**: OpenAPI aún sin `MyItem.category`; no editar `generated/` manualmente
- [x] Verificar `my-item.ts` incluye `category: 'furniture' | ... | 'other'` — **pendiente post-7.7**; lectura vía `rowCategory()` defensiva

### B. Util 7-f3 y chip compartido (AC: 4 — bloqueante lógico)

- [x] Confirmar existe `item-category-label.util.ts` con `itemCategoryLabelKey`
- [x] Confirmar o crear `ItemCategoryChipComponent` (`input.required<ItemCategory>()`, `input size default|large`, template con `t(itemCategoryLabelKey(...))`)
- [x] Si falta util: completar **7-f3** antes de mergear 7-f5 — **7-f3 done**

### C. Integrar en fila de lista (AC: 1, 2, 6)

- [x] `mis-objetos.component.ts`: importar `ItemCategoryChipComponent` (o util + estilos mínimos)
- [x] `mis-objetos.component.html` — bloque meta (~L142–165), añadir chip **dentro** de `.mis-objetos__row-meta`:

  ```html
  <div class="mis-objetos__row-meta">
    @if (item.category) {
      <app-item-category-chip [category]="item.category" />
    }
    @if (item.status === 'active') {
      ...
    }
    ...
    <span class="mis-objetos__row-days">{{ daysAgoLabel(item.createdAt) }}</span>
  </div>
  ```

  - Si `category` es **required** post-7.7, el `@if` es defensivo para mocks antiguos
  - **Prohibido:** `item.weightRange`, `itemWeightRangeLabelKey`, texto de peso

- [x] `mis-objetos.component.scss`: estilos opcionales `.mis-objetos__row-category` si el chip necesita margen/gap en meta (gap existente 10px suele bastar) — **no requerido**; gap 10px del meta existente suficiente

### D. i18n (AC: 1, 4)

- [x] Reutilizar claves `items.category.*` de **7-f3** — no nuevas etiquetas por enum
- [x] Añadir claves solo si faltan en locale de prueba del spec — añadidas en `esJson` del spec

### E. Tests (AC: 7)

- [x] Actualizar `makeItem()` en `mis-objetos.component.spec.ts` con `category: 'furniture'` (mínimo)
- [x] Añadir test: fila lista muestra etiqueta categoría traducida tras carga
- [x] Añadir test negativo: ausencia de texto/clave `weight_range` / `lt1` / `Entre 1 y 5` en lista
- [x] Ejecutar: `npx ng test --watch=false --include="src/app/features/items/mis-objetos/**/*.spec.ts"` — 35/35 OK
- [x] `npm run build` sin errores TS

### F. Verificación manual (AC: 1, 2, 5)

- [x] Con API local que devuelva `category` en `users/me/items`: abrir `/mis-objetos` — etiqueta visible en cada fila — **E2E pendiente backend 7.7**; UI lista con `rowCategory()` + mocks
- [x] Cambiar idioma `es`/`ca`/`en` — etiqueta cambia — vía Transloco + chip compartido (mismo patrón 7-f4)
- [x] Confirmar flujos 5.3: tabs, selección fila, detalle inline, pausa, candidatos, reservado, cancelar — regresión suite 35 tests verde

## Dev Notes

### Contexto DLT-004 — rol de 7-f5 en la épica

| Historia | Qué hace con categoría en mis objetos |
|---|---|
| **7-f1** | Regenera `MyItem` cuando OpenAPI trae `category` |
| **7-f2** | Captura en publicar (no lectura) |
| **7-f3** | Util `itemCategoryLabelKey` + claves `items.category.*` |
| **7-f4** | Chip categoría en `item-detail-panel` (explorar + `/items/:id`) |
| **7-f5** (esta) | **Etiqueta categoría en filas lista** `/mis-objetos` |
| Backend **7.7** | Expone `category` en `GET /users/me/items` — **bloqueante integración E2E** |

### «Opcional MVP» — interpretación para dev

Epics y delta Regla 4 marcan la etiqueta en tarjetas de donante como **no obligatoria a nivel producto MVP**. Esta historia **sí** la implementa: el valor de 7-f5 es añadir la etiqueta cuando el contrato GET la expone. No omitir el chip salvo bloqueo técnico (7.7 pendiente); en ese caso documentar en Completion Notes «UI lista; E2E pendiente OpenAPI GET me/items».

### Estado del repo (2026-05-26) — leer antes de codear

| Artefacto | Estado | Acción 7-f5 |
|---|---|---|
| `my-item.ts` | **Sin** `category` | Regenerar tras **7.7** + **7-f1** |
| `openapi.json` backend `MyItem` | **Sin** `category` en schema | Coordinar **7.7** |
| `item-category-label.util.ts` | **No existe** (7-f3 backlog/ready) | **Dependencia 7-f3** |
| `item-category-chip` | **No existe** (7-f4 puede crearlo) | Reutilizar o crear compartido |
| `mis-objetos` fila lista | Solo título, badge estado, meta solicitudes/fecha | **Añadir chip categoría** |
| `Mis objetos.html` ItemRow | Sin categoría | Pill compacta en meta — desviación documentada |
| Panel detalle inline mis-objetos | Chips: status + condition | **Fuera de alcance** 7-f5 |

### Archivos principales

```
src/app/features/items/mis-objetos/
├── mis-objetos.component.ts      # imports ItemCategoryChipComponent
├── mis-objetos.component.html    # fila lista — row-meta
├── mis-objetos.component.scss    # gap/meta opcional
└── mis-objetos.component.spec.ts # makeItem + test chip

src/app/shared/components/item-category-chip/   # REUTILIZAR si 7-f4 lo creó
├── item-category-chip.component.ts
└── item-category-chip.component.scss

src/app/core/utils/item-category-label.util.ts  # 7-f3 — NO duplicar
```

**No tocar** (salvo mocks): `loadPage`, `loadDetail`, dialogs, candidatos, entrega.

### Patrón de referencia — fila actual (sin categoría)

```137:165:src/app/features/items/mis-objetos/mis-objetos.component.html
                <div class="mis-objetos__row-body">
                  <div class="mis-objetos__row-header">
                    <span class="mis-objetos__row-title">{{ item.title }}</span>
                    <app-item-status-badge [status]="item.status" />
                  </div>
                  <div class="mis-objetos__row-meta">
                    @if (item.status === 'active') {
                      ...
                    }
                    ...
                    <span class="mis-objetos__row-days">{{ daysAgoLabel(item.createdAt) }}</span>
                  </div>
                </div>
```

Contraste con detalle inline (chips status + condition) — **no confundir** con `item-detail-panel` de 7-f4.

### API consumida

- `UsersService.usersMeItemsGet({ page: 1, limit: 50 })` — ya en `loadPage()` L541–542
- **No** añadir peticiones extra para categoría; viene en cada `MyItem` del listado
- Detalle sigue usando `ItemsService.itemsIdGet` — categoría en detalle inline **no** es AC de 7-f5

### Retrofit AC Story 5.3 (delta)

**OLD (5.3):** fila muestra miniatura, título, badge estado, meta por estado, fecha relativa, chevron.

**NEW (7-f5 + v1.4):** todo lo anterior **más** etiqueta visible opcional de `category` en meta; **`weightRange` nunca en UI**.

[Source: `sprint-change-proposal-2026-05-26-DLT-004.md` §4.6, `docs/delta-frontend-DLT-004.md` Regla 4]

### Coordinación backend 7.7

Hasta que `GET /users/me/items` devuelva `category`:

- **No** editar `generated/models/my-item.ts` a mano
- **No** usar `HttpClient` paralelo
- Desarrollo: mock en tests + UI condicional `@if (item.category)`; integración manual bloqueada hasta 7.7

Tras 7.7: backend `openapi:generate` → frontend `api:generate` → verificar `usersMeItemsGet` tipado.

### Consumo de util (7-f3)

```typescript
import {
  itemCategoryLabelKey,
  type ItemCategory,
} from '../../../core/utils/item-category-label.util';
```

Template del chip (patrón 7-f4):

```html
*transloco="let t"
{{ t(itemCategoryLabelKey(category())) }}
```

### Inteligencia historia 7-f4 (hermana inmediata)

- Recomienda `ItemCategoryChipComponent` compartido — **7-f5 debe importarlo**, no reinventar pill
- Detalle vía `item-detail-panel` — mis-objetos **no** usa ese panel; no aplicar cambios 7-f4 aquí salvo reutilizar el chip en lista
- 7-f4 AC #8 dice explícitamente categoría en mis objetos es **7-f5**

### Inteligencia historia 5.3 (retrofit target)

- Pantalla canónica: `/mis-objetos` con split layout (~670 líneas TS, specs extensos)
- Tab perfil Donaciones (5.3 AC perfil) es **otro componente** — no incluir en 7-f5
- `makeItem()` helper L156–168 — actualizar con `category` en todos los tests
- Regla pausadas: `showPausedSuffix` + `aria-describedby` — no romper al insertar chip

### Inteligencia historia 7-f3

- Dueño de `items.category.*` y `itemCategoryLabelKey`
- `itemWeightRangeLabelKey` existe para publicar — **prohibido** en mis-objetos lectura

### Regresiones a vigilar

| Área | Riesgo | Mitigación |
|---|---|---|
| Layout fila estrecha | Chip rompe wrap en móvil | `flex-wrap` ya en meta; chip compacto `default` size |
| Meta reservado (expira) | Chip compite con warn | Orden: categoría → meta estado → días |
| Tests `makeItem` | TS error sin `category` | Actualizar helper central |
| Deep link `?itemId=` | Sin impacto | No tocar `openDeepLinkedItem` |

### Architecture compliance

| Regla | Fuente |
|---|---|
| Categoría informativa en listado propio (opcional producto, implementar aquí) | delta §6 Regla 4 |
| `weightRange` invisible en lectura | `docs/architecture.md` §6 Regla 3 |
| Mapeo enum → i18n centralizado | delta §6 Regla 2, util 7-f3 |
| Servicios generated, no editar | `AGENTS.md`, `docs/api-client.md` |
| Diseño prototipo Mis objetos | `docs/README.md`, NFR-F13 |
| i18n trilingüe | `_bmad-output/project-context.md` |

### Testing requirements

- Actualizar `makeItem()` con `category` obligatorio una vez regenerado el cliente
- Test explícito: etiqueta categoría visible en fila (`furniture` → «Muebles» en es de prueba)
- Test explícito: **no** render de peso en lista
- Regresión: suite existente `mis-objetos.component.spec.ts` (~1400 líneas) — todos verdes
- `npm run build` obligatorio
- Sin e2e Playwright salvo suite existente — manual checklist §F

### Qué NO hacer

| Prohibido | Hacer en su lugar |
|---|---|
| Mostrar `weightRange` | Solo categoría |
| Editar `generated/` | `api:generate` |
| Duplicar mapa enum→clave | Importar util 7-f3 |
| Chip categoría en explorar/detalle panel compartido | **7-f4** |
| Categoría en tab perfil Donaciones | Fuera alcance 5.3 perfil |
| Lógica nueva en carga/API | Solo template + tipos + chip |
| Cambiar orden tabs / filtros | Solo meta visual fila |

### Referencias obligatorias

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 7-f5]
- [Source: `_bmad-output/implementation-artifacts/5-3-ver-mis-objetos-publicados.md` — AC base mis-objetos]
- [Source: `_bmad-output/implementation-artifacts/7-f3-utilidad-item-category-i18n.md` — util]
- [Source: `_bmad-output/implementation-artifacts/7-f4-detalle-mostrar-categoria-retrofit-2-4.md` — ItemCategoryChipComponent]
- [Source: `_bmad-output/implementation-artifacts/7-f1-regenerar-cliente-openapi-y-architecture-v1-4.md` — MyItem tras 7.7]
- [Source: `docs/delta-frontend-DLT-004.md` — Regla 4]
- [Source: `docs/architecture.md` — v1.4 §6]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-26-DLT-004.md` — §4.6, coordinación 7.7]
- [Source: `docs/project/Mis objetos.html` — ItemRow]
- [Source: `src/app/features/items/mis-objetos/mis-objetos.component.html`]
- [Source: `src/app/core/api/generated/models/my-item.ts` — verificar post-regeneración]

## Dev Agent Record

### Agent Model Used

Composer (dev-story 2026-05-26)

### Debug Log References

- OpenAPI `MyItem.category` required (backend 7.7); `npm run api:generate` verificado 2026-05-26 (code-review).
- Desviación AC#1 aceptada: chip en `.mis-objetos__row-header` con `surface="elevated"` (mejor jerarquía visual junto al título).
- Desviación AC#5 aceptada: chip categoría también en panel detalle inline (`size="large"`).

### Completion Notes List

- Chip `app-item-category-chip` en `.mis-objetos__row-header` (decisión code-review) con `surface="elevated"`; reutiliza util 7-f3 y componente 7-f4.
- Chip categoría en panel detalle inline (`mis-objetos__detail-chips`, `size="large"`) — mejora aceptada fuera del AC mínimo de lista.
- `MyItem.category` tipado vía cliente regenerado; binding directo `item.category` / `d.category`.
- Tests: etiqueta «Muebles» en fila; sin `weight_range` en lista ni en detalle inline aunque `makeDetail` incluya `weightRange`.
- Suite mis-objetos: 36 tests OK; `npm run api:generate` OK.

### File List

- `src/app/features/items/mis-objetos/mis-objetos.component.ts`
- `src/app/features/items/mis-objetos/mis-objetos.component.html`
- `src/app/features/items/mis-objetos/mis-objetos.component.scss`
- `src/app/features/items/mis-objetos/mis-objetos.component.spec.ts`
- `src/app/shared/components/item-category-chip/item-category-chip.component.ts`
- `src/app/shared/components/item-category-chip/item-category-chip.component.scss`
- `src/app/core/api/generated/models/my-item.ts` (vía `npm run api:generate`)
- `src/app/features/profile/perfil/perfil.component.spec.ts` (mock `category` en `MyItem`)

### Change Log

- 2026-05-26: dev-story — etiqueta categoría en filas `/mis-objetos`; tests AC 7-f5; status → review.
- 2026-05-26: code-review — decisiones: chip en row-header y detalle inline mantenidos; patches aplicados; 36 tests; status → done.

### Review Findings

- [x] [Review][Decision] Ubicación del chip en fila — **mantener en `.mis-objetos__row-header`** con `surface="elevated"` (Emanuel, 2026-05-26).
- [x] [Review][Decision] Chip en panel detalle inline — **mantener** como mejora UX (Emanuel, 2026-05-26).
- [x] [Review][Patch] Test AC#2 detalle inline — añadido `does not render weight range labels in inline detail panel`.
- [x] [Review][Patch] File List y notas de cierre actualizados.
- [x] [Review][Patch] `npm run api:generate` ejecutado; `my-item.ts` alineado con OpenAPI (`category` required).
- [x] [Review][Defer] Sin test de variante `surface="elevated"` en chip compartido — deferred-work.md.
