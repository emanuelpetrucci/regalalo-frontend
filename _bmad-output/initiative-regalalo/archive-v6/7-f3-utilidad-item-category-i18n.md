# Story 7-f3: Utilidad item-category e i18n

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed - comprehensive developer guide created. Infraestructura DLT-004 — util centralizada + claves i18n; sin UI de lectura (7-f4/7-f5). -->

## Story

Como desarrollador,
quiero un mapa centralizado de enums `ItemCategory` / `ItemWeightRange` a claves Transloco,
para reutilizar en publicación, detalle y listados sin duplicar tablas de etiquetas ni concatenar strings a mano.

**FR:** FR-F30, FR-F31 (infraestructura de mapeo) · **Épica:** 7-f · **Depende de:** 7-f1 (tipos enum en `PublishItemMultipart`) · **Desbloquea:** 7-f4, 7-f5

## Acceptance Criteria

1. **Util centralizada enum → clave i18n**
   - **Given** un valor `ItemCategory` o `ItemWeightRange` válido según el contrato OpenAPI
   - **When** la UI necesita la clave Transloco de etiqueta visible
   - **Then** existe `src/app/core/utils/item-category-label.util.ts` exportando:
     - Tipos alias `ItemCategory` e `ItemWeightRange` derivados de `PublishItemMultipart` (no duplicar unions en `core/models/` salvo reexport opcional desde el util)
     - Arrays readonly `ITEM_CATEGORIES` (9 valores) e `ITEM_WEIGHT_RANGES` (4 valores) en orden estable documentado en delta §4
     - `itemCategoryLabelKey(category: ItemCategory): string` → `items.category.{valor}` (p. ej. `furniture` → `items.category.furniture`)
     - `itemWeightRangeLabelKey(weightRange: ItemWeightRange): string` → `items.weight_range.{valor}` (p. ej. `1to5` → `items.weight_range.1to5`)
   - **And** los valores enviados al API siguen siendo enums internos — la util **solo** devuelve claves i18n, nunca etiquetas traducidas ni strings para el backend
   - **And** no hay mapas duplicados de enum→etiqueta en features (consolidar en esta util)

2. **Claves i18n trilingües (es, ca, en)**
   - **Given** `public/i18n/es.json`, `ca.json`, `en.json`
   - **When** se inspeccionan los namespaces de taxonomía
   - **Then** existen **todas** las claves bajo `items.category.*` (9) e `items.weight_range.*` (4) con traducciones completas en los tres idiomas
   - **And** las etiquetas en español coinciden con la tabla canónica de `docs/delta-frontend-DLT-004.md` §4 Cambio 1
   - **And** la clave numérica `items.weight_range.1to5` es JSON válida en los tres ficheros (sin comillas especiales en la ruta Transloco)
   - **And** si **7-f2** ya añadió claves idénticas, **verificar paridad** trilingüe — no duplicar namespaces distintos; corregir gaps si faltan `ca`/`en`

3. **Tests unitarios de la util**
   - **Given** `item-category-label.util.spec.ts` (Vitest, patrón `format-distance.util.spec.ts`)
   - **When** ejecuto tests del util
   - **Then** cada enum canónico produce la clave i18n esperada
   - **And** `ITEM_CATEGORIES.length === 9` y `ITEM_WEIGHT_RANGES.length === 4`
   - **And** los arrays contienen exactamente los valores de `PublishItemMultipart` (sin valores inventados)

4. **Retrofit mínimo de publicar (si 7-f2 ya implementó selectores)**
   - **Given** `publicar.component.ts` / template con concatenación inline (`items.category.' + c`) o arrays locales `CATEGORIES`/`WEIGHT_RANGES`
   - **When** cierro 7-f3
   - **Then** el componente importa `ITEM_CATEGORIES`, `ITEM_WEIGHT_RANGES`, `itemCategoryLabelKey`, `itemWeightRangeLabelKey` desde el util
   - **And** el template usa `t(itemCategoryLabelKey(c))` / `t(itemWeightRangeLabelKey(w))` en lugar de strings armadas a mano
   - **And** los tests de `publicar.component.spec.ts` siguen pasando
   - **Nota:** Si 7-f2 **aún no** está implementado, documentar en Completion Notes «retrofit publicar pendiente — 7-f2 debe consumir util desde el inicio»

5. **Alcance acotado — no hacer en 7-f3**
   - **Then** **no** se muestra `category` en `item-detail-panel` ni en tarjetas de mis objetos (**7-f4**, **7-f5**)
   - **And** **no** se renderiza `weightRange` en ninguna vista de lectura (regla architecture §6)
   - **And** **no** se editan ficheros bajo `src/app/core/api/generated/`
   - **And** **no** se añaden claves de formulario publish (`items.publish.field_category`, etc.) — eso es responsabilidad de **7-f2** si aún no existen

## Tasks / Subtasks

### A. Crear util y tipos (AC: 1)

- [x] Crear `src/app/core/utils/item-category-label.util.ts`:
  ```typescript
  import type { PublishItemMultipart } from '../api/generated/models/publish-item-multipart';

  export type ItemCategory = PublishItemMultipart['category'];
  export type ItemWeightRange = PublishItemMultipart['weightRange'];

  export const ITEM_CATEGORIES: readonly ItemCategory[] = [
    'furniture', 'electronics', 'clothing', 'books', 'toys',
    'kitchen', 'sports', 'tools', 'other',
  ] as const;

  export const ITEM_WEIGHT_RANGES: readonly ItemWeightRange[] = [
    'lt1', '1to5', '5to20', 'gt20',
  ] as const;

  export function itemCategoryLabelKey(category: ItemCategory): string {
    return `items.category.${category}`;
  }

  export function itemWeightRangeLabelKey(weightRange: ItemWeightRange): string {
    return `items.weight_range.${weightRange}`;
  }
  ```
- [x] Verificar compilación TS: unions del util = unions de `publish-item-multipart.ts` (regenerar tras 7-f1 si difieren)

### B. i18n trilingüe (AC: 2)

- [x] Añadir o completar en `public/i18n/es.json`, `ca.json`, `en.json` bajo `items`:

  | Clave | ES (canónico — delta §4) | CA (referencia) | EN (referencia) |
  |---|---|---|---|
  | `items.category.furniture` | Muebles | Mobles | Furniture |
  | `items.category.electronics` | Electrónica | Electrònica | Electronics |
  | `items.category.clothing` | Ropa y calzado | Roba i calçat | Clothing & footwear |
  | `items.category.books` | Libros y material educativo | Llibres i material educatiu | Books & educational material |
  | `items.category.toys` | Juguetes | Joguines | Toys |
  | `items.category.kitchen` | Cocina y hogar | Cuina i llar | Kitchen & home |
  | `items.category.sports` | Deporte y ocio | Esport i oci | Sports & leisure |
  | `items.category.tools` | Herramientas | Eines | Tools |
  | `items.category.other` | Otro | Altres | Other |
  | `items.weight_range.lt1` | Menos de 1 kg | Menys d'1 kg | Less than 1 kg |
  | `items.weight_range.1to5` | Entre 1 y 5 kg | Entre 1 i 5 kg | Between 1 and 5 kg |
  | `items.weight_range.5to20` | Entre 5 y 20 kg | Entre 5 i 20 kg | Between 5 and 20 kg |
  | `items.weight_range.gt20` | Más de 20 kg | Més de 20 kg | More than 20 kg |

- [x] Mantener orden alfabético o agrupado coherente con el resto de `items` en cada JSON
- [x] No mezclar namespace `items.publish.condition_*` (condición del objeto) con `items.category.*` (taxonomía analítica)

### C. Tests (AC: 3)

- [x] Crear `src/app/core/utils/item-category-label.util.spec.ts`:
  - Snapshot de claves para cada valor de `ITEM_CATEGORIES` e `ITEM_WEIGHT_RANGES`
  - Assert longitudes de arrays
  - Caso especial: `itemWeightRangeLabelKey('1to5') === 'items.weight_range.1to5'`
- [x] Ejecutar: `npx ng test --watch=false --include="src/app/core/utils/item-category-label.util.spec.ts"`

### D. Retrofit publicar (AC: 4 — condicional)

- [x] Si existen selectores en `publicar.component.*` (post 7-f2):
  - Reemplazar arrays locales por `ITEM_CATEGORIES` / `ITEM_WEIGHT_RANGES`
  - Reemplazar `categoryLabelKey` / `weightRangeLabelKey` computed inline por funciones del util
  - Template: `t(itemCategoryLabelKey(c))` en `@for`
- [x] Actualizar imports en spec si cambian símbolos exportados

### E. Verificación final

- [x] `npm run build` sin errores TS
- [x] Grep repo: no quedan concatenaciones `items.category.' +` ni `items.weight_range.' +` fuera del util (salvo tests del propio util)
- [x] Completar Dev Agent Record (File List, Completion Notes)

## Dev Notes

### Contexto DLT-004 — rol de 7-f3 en la épica

| Historia | Qué hace con categoría/peso |
|---|---|
| **7-f1** | Tipos OpenAPI + docs v1.4 ✅ |
| **7-f2** | Selectores UI en publicar; claves i18n de formulario; **delega util a 7-f3** |
| **7-f3** (esta) | **Util + claves enum i18n** — infraestructura compartida |
| **7-f4** | Muestra categoría en detalle usando util + `t()` |
| **7-f5** | Chip categoría opcional en mis objetos |
| Backend **7.7** | GET con `category` — no bloquea 7-f3 |

Evidencia de deuda actual (2026-05-26):

| Artefacto | Estado | Acción 7-f3 |
|---|---|---|
| `item-category-label.util.ts` | ❌ No existe | **Crear** |
| `items.category.*` en i18n | ❌ Ausente | **Añadir** (7-f2 también las planifica — 7-f3 es dueño canónico del namespace enum) |
| `publicar.component.ts` | Hardcode `'other'`/`'lt1'` en POST | Fuera de alcance directo (**7-f2**); retrofit imports si selectores ya existen |
| `item-detail-panel` | Sin chip categoría | **No tocar** (**7-f4**) |
| `perfil.component` `conditionLabelKey` | Patrón local `items.publish.condition_*` | **Referencia** — categoría usa util central, no método en componente |

### Enums canónicos — no inventar valores

**`ItemCategory`:** `furniture`, `electronics`, `clothing`, `books`, `toys`, `kitchen`, `sports`, `tools`, `other`

**`ItemWeightRange`:** `lt1`, `1to5`, `5to20`, `gt20`

[Source: `src/app/core/api/generated/models/publish-item-multipart.ts`, `docs/delta-frontend-DLT-004.md` §4 Cambio 1]

### Patrón de proyecto — utils en `core/utils/`

Seguir convenciones de utils existentes:

```1:12:src/app/core/utils/format-distance.util.ts
/** Convierte metros a kilómetros con redondeo coherente con el prototipo (DistChip). */
export function formatDistanceKm(meters: number): string {
  ...
}
```

- Funciones puras, sin inyectar `TranslocoService`
- El componente llama `t(itemCategoryLabelKey(value))` — separación clave vs traducción
- Tests con Vitest en colocated `*.spec.ts`
- Ubicación: `src/app/core/utils/` (no `features/items/` — taxonomía es transversal)

**Anti-patrón a evitar** (como `conditionLabelKey` en perfil):

```337:339:src/app/features/profile/perfil/perfil.component.ts
  conditionLabelKey(condition: MyItem['condition']): string {
    return `items.publish.condition_${condition}`;
  }
```

Para categoría/peso, **importar util** en lugar de replicar template strings en cada feature.

### Convención de claves i18n (architecture §6 + delta)

| Namespace | Uso |
|---|---|
| `items.category.{enum}` | Etiqueta visible de categoría (lectura y selectores) |
| `items.weight_range.{enum}` | Etiqueta visible de rango de peso (**solo formulario/resumen publicar** — nunca detalle/listados) |
| `items.publish.field_*` | Labels de formulario publicar (**7-f2**) |
| `items.publish.validation.*` | Errores cliente publicar (**7-f2**) |

Clave especial **`1to5`:** en JSON es `"1to5": "Entre 1 y 5 kg"` anidado bajo `weight_range`; Transloco resuelve `items.weight_range.1to5` correctamente.

### Consumidores futuros (guía para 7-f4 / 7-f5 — no implementar aquí)

**Detalle (`item-detail-panel`) — 7-f4:**

```html
<!-- Ejemplo futuro — NO implementar en 7-f3 -->
<app-item-condition-chip [condition]="detail.condition" size="large" />
<!-- Añadir chip categoría cuando GET traiga category: -->
<span class="item-detail-panel__chip">{{ t(itemCategoryLabelKey(detail.category)) }}</span>
```

**Mis objetos — 7-f5:** chip opcional con misma función.

**Publicar paso 3 resumen — 7-f2 o retrofit 7-f3:**

```html
{{ t(itemCategoryLabelKey(form.controls.category.value)) }}
```

### Coordinación con 7-f2 (orden de implementación)

Escenario A — **7-f2 no implementado aún** (estado repo 2026-05-26):

- 7-f3 crea util + i18n enum
- Dev de 7-f2 debe importar util desde el inicio (story 7-f2 AC #5 ya lo indica)
- No hay retrofit de publicar en 7-f3

Escenario B — **7-f2 ya implementado**:

- 7-f3 crea util + i18n
- Refactor publicar: eliminar arrays/`computed` duplicados; usar util
- Verificar paridad i18n (7-f2 pudo añadir claves — no duplicar)

### Qué NO hacer

| Prohibido | Hacer en su lugar |
|---|---|
| Traducir dentro del util (`transloco.translate`) | Devolver solo clave; `t()` en template |
| Duplicar unions en `core/models/item-taxonomy.ts` | Alias desde `PublishItemMultipart` en el util |
| Mostrar categoría en detalle/listados | Historias **7-f4**, **7-f5** |
| Mostrar `weightRange` en UI de lectura | Regla architecture §6 Regla 3 |
| Editar `generated/` | Usar tipos importados |
| Añadir `items.detail.category_label` | Opcional en **7-f4** si hace falta label accesible |

### Architecture compliance

| Regla | Fuente |
|---|---|
| Mapeo cliente enum → etiqueta visible | `docs/delta-frontend-DLT-004.md` §6 Regla 2 |
| `weightRange` invisible en lectura | `docs/architecture.md` §6, delta §6 Regla 3 |
| Claves `items.category.*` | `docs/architecture.md` §6, sprint-change-proposal §4.6 |
| i18n trilingüe obligatorio | `_bmad-output/project-context.md`, historia 1.4 |
| Tipos canónicos en OpenAPI generado | `docs/api-client.md`, `AGENTS.md` |

### Testing requirements

- Tests unitarios del util (Vitest) — obligatorios
- Comando: `npx ng test --watch=false --include="src/app/core/utils/item-category-label.util.spec.ts"`
- Si retrofit publicar: `npx ng test --watch=false --include="src/app/features/items/publicar/**/*.spec.ts"`
- `npm run build` debe pasar
- Sin e2e en esta historia

### Inteligencia historia 7-f2 (predecesora inmediata en épica)

- 7-f2 planifica claves `items.category.*` en i18n pero **prohíbe** crear util (AC #6)
- Arrays `CATEGORIES`/`WEIGHT_RANGES` locales en publicar — **7-f3 los centraliza** en `ITEM_*` exports
- Orden sugerido sprint: 7-f2 puede ir antes o después; 7-f3 es compatible en ambos órdenes gracias al retrofit condicional AC #4

### Inteligencia historia 6-f3 (patrón util transversal)

Historia 6-f3 creó `user-initials.util.ts` + `UserAvatarComponent` como regla transversal. 7-f3 sigue el mismo espíritu: **una fuente de verdad** para mapeo enum→presentación, consumida por múltiples features.

### Referencias obligatorias

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 7-f3]
- [Source: `docs/delta-frontend-DLT-004.md` — §4 Cambio 1 (tabla etiquetas), §6 Reglas 2–3]
- [Source: `docs/architecture.md` — v1.4 §5 ItemCategory/ItemWeightRange, §6 reglas DLT-004]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-26-DLT-004.md` — §4.6 Util + i18n]
- [Source: `_bmad-output/implementation-artifacts/7-f2-publicar-selectores-category-weight-range-retrofit-2-2.md` — delegación util, claves i18n]
- [Source: `_bmad-output/implementation-artifacts/7-f1-regenerar-cliente-openapi-y-architecture-v1-4.md` — enums POST]
- [Source: `src/app/core/api/generated/models/publish-item-multipart.ts` — unions canónicas]
- [Source: `src/app/core/utils/format-distance.util.ts` + `.spec.ts` — patrón util + test]
- [Source: `_bmad-output/project-context.md` — convenciones i18n]

## Dev Agent Record

### Agent Model Used

Composer (dev-story 2026-05-26)

### Debug Log References

- `npx ng test --watch=false --include="src/app/core/utils/item-category-label.util.spec.ts"` — 5/5 OK
- `npx ng test --watch=false --include="src/app/features/items/publicar/**/*.spec.ts"` — 19/19 OK
- `npm run build` — OK (warnings SCSS budget preexistentes)

### Completion Notes List

- Util `item-category-label.util.ts`: tipos alias desde `PublishItemMultipart`, arrays `ITEM_CATEGORIES` (9) / `ITEM_WEIGHT_RANGES` (4), funciones `itemCategoryLabelKey` / `itemWeightRangeLabelKey`.
- i18n trilingüe `items.category.*` y `items.weight_range.*` ya presentes en es/ca/en (7-f2); verificada paridad y clave `1to5` JSON válida — sin cambios en JSON.
- Retrofit `publicar`: arrays locales eliminados; template usa `t(itemCategoryLabelKey(c))` / `t(itemWeightRangeLabelKey(w))`; computed de resumen delegan al util.
- Alcance respetado: sin cambios en detalle, mis objetos ni `generated/`.

### File List

- `src/app/core/utils/item-category-label.util.ts` (nuevo)
- `src/app/core/utils/item-category-label.util.spec.ts` (nuevo)
- `src/app/features/items/publicar/publicar.component.ts` (modificado)
- `src/app/features/items/publicar/publicar.component.html` (modificado)

### Review Findings

- 2026-05-26 (code review): ✅ Revisión limpia — util pura, i18n trilingüe verificado (es/ca/en), retrofit publicar sin duplicados, tests 5/5, alcance AC #5 respetado.

### Change Log

- 2026-05-26: Code review aprobado → `done`.
- 2026-05-26: Infraestructura DLT-004 — util centralizada enum→clave i18n + retrofit publicar (dev-story).
