# Story 7-f2: Publicar — selectores category y weightRange (retrofit 2.2)

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed - comprehensive developer guide created. Retrofit DLT-004 de Story 2.2 — depende de tipos POST en PublishItemMultipart (7-f1). -->

## Story

Como donante autenticado,
quiero elegir categoría y rango de peso al publicar,
para que los datos analíticos sean correctos.

**Diseño de referencia:** [`docs/project/Mis objetos.html`](../../docs/project/Mis objetos.html) (`PublishModal` / `Step1`) — **desviación controlada:** el prototipo aún no incluye `category` ni `weightRange`; añadir dos selectores desplegables tras la grid de condición y antes del código postal, con tokens de `colors_and_type.css` y el patrón `<select>` ya usado en `perfil.component.html`.

**FR:** FR-F6, FR-F30 · **Épica:** 7-f · **Retrofit de:** Story 2.2 (`2-2-publicar-objeto-con-formulario-e-imagenes.md`)

## Acceptance Criteria

1. **Selectores en paso 1 (orden y accesibilidad)**
   - **Given** el formulario en `/mis-objetos/publicar` paso 1 (ruta real del proyecto; epics dice `/items/new` — usar la existente)
   - **When** completo el flujo de publicación
   - **Then** existen selectores accesibles para `category` y `weightRange` **inmediatamente tras** `condition` y **antes de** `postalCode`
   - **And** orden de campos en paso 1: `title` → `description` → `condition` → `category` → `weightRange` → `postalCode`
   - **And** cada selector tiene `<label for="...">`, `aria-invalid` cuando hay error, mensaje inline de validación, y primera opción placeholder deshabilitada (p. ej. «Selecciona…») para forzar elección explícita
   - **And** valores mostrados = etiquetas i18n; valores enviados al API = enums internos (`furniture`, `lt1`, etc.), nunca las etiquetas visibles

2. **Payload POST sin hardcode (retrofit 2.2)**
   - **Given** formulario válido + ≥1 imagen
   - **When** publico
   - **Then** `ItemsService.itemsPost` recibe `PublishItemMultipart` con `category` y `weightRange` tomados del `FormGroup` (elección del usuario)
   - **And** **no** se envían literales fijos `'other'` / `'lt1'` salvo que el usuario los haya elegido explícitamente
   - **And** validación reactiva impide avanzar del paso 1 o enviar si `category` o `weightRange` están vacíos
   - **And** se mantienen AC existentes de 2.2: multipart, redirección a `/mis-objetos?published=:id`, errores HTTP sin perder datos, asistente 3 pasos

3. **Resumen paso 3**
   - **Given** paso 3 (revisión)
   - **When** el usuario revisa antes de publicar
   - **Then** la tabla de resumen incluye filas con etiquetas visibles de `category` y `weightRange` elegidos
   - **And** la tarjeta de preview puede mostrar chip de categoría (opcional, coherente con diseño)

4. **Errores de servidor**
   - **When** el backend responde `400`/`422` con paths `category` o `weightRange`
   - **Then** `mapPublishError` mapea a errores inline en el campo correspondiente (extender `publish-error.util.ts`, no banner genérico si hay path conocido)
   - **And** `earliestStepForFields` devuelve paso 1 para errores de esos campos

5. **i18n trilingüe (NFR — historia 1.4)**
   - **Given** labels de selectores, placeholder, opciones enum y mensajes de validación
   - **When** el usuario cambia idioma (`es`, `ca`, `en`)
   - **Then** todas las cadenas usan Transloco en `public/i18n/{es,ca,en}.json`
   - **And** claves de opciones bajo `items.category.*` y `items.weight_range.*` (convención `docs/architecture.md` §6) — **7-f3** extraerá util centralizada reutilizando estas mismas claves; no duplicar tablas de etiquetas en otro namespace

6. **Alcance acotado — no hacer en 7-f2**
   - **Then** **no** se crea `item-category-label.util.ts` (historia **7-f3**)
   - **And** **no** se muestra `category` en detalle ni `weightRange` en vistas de lectura post-publicación (**7-f4**, **7-f5**)
   - **And** **no** se editan ficheros bajo `src/app/core/api/generated/`
   - **And** **no** se cambia el pipeline de imágenes ni rutas del asistente

## Tasks / Subtasks

### A. Pre-requisito tipos POST (AC: 2 — verificar, no bloqueante si ya OK)

- [x] Confirmar `PublishItemMultipart` incluye `category` y `weightRange` required con unions enum (historia **7-f1**; tipos ya presentes en repo)
- [x] Si faltaran enums: ejecutar cadena `docs/api-client.md` antes de implementar UI

### B. Extender FormGroup y constantes (AC: 1, 2)

- [x] `publicar.component.ts`:
  - Añadir controles `category` y `weightRange` al `FormGroup` nonNullable con `Validators.required`
  - Valor inicial: `''` (string vacío) + placeholder en template — **no** preseleccionar `'other'`/`'lt1'`
  - Arrays tipados `CATEGORIES` y `WEIGHT_RANGES` derivados de `PublishItemMultipart['category']` / `['weightRange']`
  - Ampliar tipos `FormField` y `ServerFieldKey` con `'category' | 'weightRange'`
  - `computed()` para claves i18n de etiqueta seleccionada (`categoryLabelKey`, `weightRangeLabelKey`)
  - Suscribir `valueChanges` de ambos campos para limpiar `serverFieldErrorKeys`
  - `continue()` paso 1: marcar `category`/`weightRange` touched; validar antes de avanzar
  - `publish()`: leer `category`/`weightRange` de `getRawValue()` — **eliminar hardcode** líneas 286–287

### C. Template paso 1 y resumen paso 3 (AC: 1, 3, 5)

- [x] `publicar.component.html`:
  - Insertar dos bloques `<select>` tras grid de condición y antes de `postalCode` (patrón accesible de `perfil.component.html` L806–823)
  - `@for` sobre `categories` / `weightRanges` con `[value]` enum interno y texto `t('items.category.' + c)` / `t('items.weight_range.' + w)`
  - Paso 3: filas en `publicar__review-table` para categoría y rango de peso
- [x] `publicar.component.scss`: clase `publicar__select` alineada a `publicar__textarea` / tokens globales (borde, focus, error)

### D. Errores HTTP (AC: 4)

- [x] `publish-error.util.ts`: mapear paths `category`, `weightrange` en `normalizeFieldKey` y entradas en `FIELD_I18N`
- [x] Añadir casos en `publish-error.util.spec.ts`
- [x] `fieldError()` en componente: ramas validación `category_required` / `weight_range_required`

### E. i18n (AC: 5)

- [x] `public/i18n/es.json`, `ca.json`, `en.json`:

  | Clave | ES (referencia — delta §4) |
  |---|---|
  | `items.publish.field_category` | Categoría |
  | `items.publish.field_weight_range` | Peso aproximado |
  | `items.publish.placeholder_category` | Selecciona una categoría |
  | `items.publish.placeholder_weight_range` | Selecciona un rango |
  | `items.publish.validation.category_required` | Elige una categoría |
  | `items.publish.validation.weight_range_required` | Elige un rango de peso |
  | `items.publish.errors.field_category` | Revisa la categoría |
  | `items.publish.errors.field_weight_range` | Revisa el rango de peso |
  | `items.category.furniture` | Muebles |
  | `items.category.electronics` | Electrónica |
  | `items.category.clothing` | Ropa y calzado |
  | `items.category.books` | Libros y material educativo |
  | `items.category.toys` | Juguetes |
  | `items.category.kitchen` | Cocina y hogar |
  | `items.category.sports` | Deporte y ocio |
  | `items.category.tools` | Herramientas |
  | `items.category.other` | Otro |
  | `items.weight_range.lt1` | Menos de 1 kg |
  | `items.weight_range.1to5` | Entre 1 y 5 kg |
  | `items.weight_range.5to20` | Entre 5 y 20 kg |
  | `items.weight_range.gt20` | Más de 20 kg |

  > Nota clave `1to5`: usar ruta Transloco `items.weight_range.1to5` (JSON válido).

### F. Tests (AC: 1–4)

- [x] Actualizar `publicar.component.spec.ts`:
  - `fillStep1()` incluye `category: 'furniture'`, `weightRange: '1to5'`
  - Expectativa `itemsPost` **sin** hardcode `'other'`/`'lt1'` por defecto
  - Test: bloquea paso 1 si falta `category` o `weightRange`
  - Test: error 400 en `category` → inline + paso 1
- [x] Ejecutar: `npx ng test --watch=false --include="src/app/features/items/publicar/**/*.spec.ts"`

### G. Verificación final

- [x] `npm run build` sin errores TS
- [x] Smoke manual: publicar con categoría/peso distintos de other/lt1 → inspeccionar payload en red
- [x] Completar Dev Agent Record (File List, Completion Notes)

## Dev Notes

### Contexto DLT-004 — deuda actual (evidencia repo, 2026-05-26)

| Artefacto | Estado | Acción 7-f2 |
|---|---|---|
| `PublishItemMultipart` | ✅ enums `category` + `weightRange` | Consumir tipos; no editar |
| `publicar.component.ts` L286–287 | ❌ Hardcode `'other'`, `'lt1'` | **Eliminar** — usar FormGroup |
| Paso 1 template | ❌ Sin selectores | Añadir `<select>` |
| `publish-error.util.ts` | ❌ Sin `category`/`weightRange` | Extender mapper |
| i18n `items.category.*` | ❌ Ausente | Añadir (7-f3 reutilizará claves) |
| `publicar.component.spec.ts` L175–176 | ❌ Assert hardcode | Actualizar expectativas |

Evidencia hardcode (introducido en 6-f1 como parche temporal):

```281:288:src/app/features/items/publicar/publicar.component.ts
      const body: PublishItemMultipart = {
        title: title.trim(),
        description: description.trim(),
        condition,
        postalCode: postalCode.trim(),
        category: 'other',
        weightRange: 'lt1',
        images: this.imageBlobs(),
      };
```

### Ruta real vs epics

| Epics.md | Proyecto | Acción |
|---|---|---|
| `/items/new` | `/mis-objetos/publicar` | **Mantener ruta existente** — no crear ruta nueva |

### Enums canónicos (POST — no inventar valores)

**`category`:** `furniture`, `electronics`, `clothing`, `books`, `toys`, `kitchen`, `sports`, `tools`, `other`

**`weightRange`:** `lt1`, `1to5`, `5to20`, `gt20`

[Source: `src/app/core/api/generated/models/publish-item-multipart.ts`, `docs/delta-frontend-DLT-004.md` §4 Cambio 1]

### Patrón UI — selectores desplegables

Delta §6 Regla 1 exige **selectores desplegables**, no grid de botones (a diferencia de `condition`).

Referencia de implementación existente:

```806:823:src/app/features/profile/perfil/perfil.component.html
                <div class="field">
                  <label class="field__label" for="settings-language">
                    {{ t('profile.settings.language_label') }}
                  </label>
                  <select
                    id="settings-language"
                    class="field__input perfil__settings-select"
                    formControlName="preferredLanguage"
                    ...
                  >
```

Adaptar clases a `publicar__field` / `publicar__select` para coherencia con el asistente de publicación.

**Placeholder obligatorio:** primera `<option value="" disabled selected hidden>` para cumplir AC «elección explícita» — el control `required` de Angular rechaza string vacío.

### Estado del componente — cambios esperados

```typescript
// Ampliar FormGroup (valores iniciales vacíos + required)
readonly categories = CATEGORIES;
readonly weightRanges = WEIGHT_RANGES;

readonly form = this.fb.nonNullable.group({
  title: [/* existente */],
  description: [/* existente */],
  condition: ['good' as PublishItemMultipart['condition'], Validators.required],
  category: ['' as PublishItemMultipart['category'] | '', Validators.required],
  weightRange: ['' as PublishItemMultipart['weightRange'] | '', Validators.required],
  postalCode: [/* existente */],
});

// publish() — body desde formulario
const { title, description, condition, category, weightRange, postalCode } =
  this.form.getRawValue();
const body: PublishItemMultipart = {
  title: title.trim(),
  description: description.trim(),
  condition,
  category: category as PublishItemMultipart['category'],
  weightRange: weightRange as PublishItemMultipart['weightRange'],
  postalCode: postalCode.trim(),
  images: this.imageBlobs(),
};
```

> Tipado: tras validación exitosa, cast seguro; alternativa — tipos auxiliares `PublishFormValue` si el compilador protesta por `''`.

### Validación paso 1 — regresión a preservar

Comportamientos de 2.2 que **no** deben romperse:

- `nonWhitespaceValidator` en título/descripción
- Grid condición 2×2 con `setCondition()` / `aria-pressed`
- `goBack()` limpia `serverFieldErrorKeys` y revoca preview URL
- `onFormEnter()` previene submit accidental en pasos 1–2
- `inFlight` + `submitting` en doble clic
- `earliestStepForFields`: `images` → paso 2; resto campos paso 1 → paso 1

Ampliar `continue()` paso 1 para marcar touched `category`, `weightRange` junto a los demás.

### Paso 3 — qué mostrar

- **Mostrar** etiquetas de categoría y peso en tabla resumen — el donante acaba de elegirlos; ayuda a confirmar antes de publicar.
- **Regla architecture §6:** `weightRange` invisible en detalle/listados de lectura (**7-f4**). No confundir con el formulario de captura.

### Errores — extensión publish-error.util

Añadir a `FIELD_I18N`:

```typescript
category: 'items.publish.errors.field_category',
weightRange: 'items.publish.errors.field_weight_range',
```

En `normalizeFieldKey`: `category`, `weightrange` → `weightRange`.

### Coordinación épica 7-f

| Historia | Relación con 7-f2 |
|---|---|
| **7-f1** | Tipos POST — prerequisito documental; enums ya en repo |
| **7-f3** | Reutilizará claves `items.category.*` / `items.weight_range.*` — **no** crear util aquí |
| **7-f4** | Muestra categoría en detalle — no tocar |
| Backend **7.7** | GET con `category` — **no bloquea** 7-f2 (solo POST) |

### Inteligencia historia 6-f2 (retrofit análogo)

Patrón probado en registro DLT-003:

- Extender `FormGroup` + template en orden delta
- i18n trilingüe bajo namespace acordado
- Extender error mapper para paths nuevos
- Actualizar specs con payload completo
- **No** tocar `generated/`
- Alcance acotado explícito (no mezclar historias vecinas)

### Inteligencia historia 2.2 (base del retrofit)

- Asistente 3 pasos completo — **solo ampliar paso 1 y resumen paso 3**
- `ImagePickerComponent` sin cambios
- 11+ tests unitarios — actualizar, no reescribir desde cero
- Code review 2026-05-22: preservar parches (trim, goBack, Enter, earliestStep, images[0])

### Qué NO hacer

| Prohibido | Hacer en su lugar |
|---|---|
| Hardcode `'other'`/`'lt1'` | Valores del FormGroup |
| Grid de botones para category | `<select>` según delta §6 |
| Crear `item-category-label.util.ts` | Claves i18n directas; util en **7-f3** |
| Editar `generated/` | Usar tipos existentes |
| Mostrar categoría en detalle | Historia **7-f4** |
| Duplicar compresión imágenes | Mantener `ImagePickerComponent` |
| Nueva ruta `/items/new` | `/mis-objetos/publicar` |

### Architecture compliance

| Regla | Fuente |
|---|---|
| Selectores obligatorios tras condition, antes postalCode | `docs/architecture.md` §6, delta §6 Regla 1 |
| Enums internos al API, etiquetas i18n en UI | delta §6 Regla 1, FR-F30 |
| Cliente OpenAPI canónico | `docs/api-client.md`, `AGENTS.md` |
| Diseño tokens | `docs/project/colors_and_type.css`, `docs/README.md` |
| `weightRange` invisible en lectura | §6 Regla 3 — aplica post-publicación, no al formulario |
| Claves i18n `items.category.*` | `docs/architecture.md` §6 |

### Testing requirements

- Actualizar specs existentes en `publicar/` — no e2e en esta historia
- Comando: `npx ng test --watch=false --include="src/app/features/items/publicar/**/*.spec.ts"`
- Casos mínimos nuevos: validación paso 1 sin category/weightRange; payload con valores elegidos; error 400 category → paso 1
- `npm run build` debe pasar tras cambios

### Referencias obligatorias

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 7-f2, Story 2.2 AC actualizados DLT-004]
- [Source: `docs/delta-frontend-DLT-004.md` — §4 Cambio 1, §6 Regla 1]
- [Source: `docs/architecture.md` — v1.4 §4 POST, §6 reglas UI]
- [Source: `_bmad-output/implementation-artifacts/2-2-publicar-objeto-con-formulario-e-imagenes.md` — implementación base]
- [Source: `_bmad-output/implementation-artifacts/7-f1-regenerar-cliente-openapi-y-architecture-v1-4.md` — deuda hardcode]
- [Source: `_bmad-output/implementation-artifacts/6-f2-registro-firstname-lastname-phone-retrofit-1-3.md` — patrón retrofit]
- [Source: `src/app/features/items/publicar/publicar.component.ts` — hardcode a eliminar]
- [Source: `src/app/core/api/generated/models/publish-item-multipart.ts` — unions enum]
- [Source: `docs/project/Mis objetos.html` — PublishModal Step1 layout]

## Dev Agent Record

### Agent Model Used

Composer (dev-story 2026-05-26)

### Debug Log References

- `PublishItemMultipart` ya incluía `category` y `weightRange` (7-f1); no regeneración OpenAPI.
- Tests: `npx ng test --watch=false --include="src/app/features/items/publicar/**/*.spec.ts"` → 19 passed.
- Build: `npm run build` → OK.

### Completion Notes List

- Retrofit DLT-004 en `/mis-objetos/publicar`: selectores accesibles `category` y `weightRange` tras condición y antes de CP; placeholder obligatorio; sin hardcode `other`/`lt1`.
- Paso 3: filas de resumen + chip de categoría en preview.
- `publish-error.util` mapea paths `category` / `weightRange` (y alias `weightrange`).
- i18n trilingüe: `items.publish.*` + `items.category.*` + `items.weight_range.*` (claves para 7-f3).
- 2 tests nuevos en componente + 2 en publish-error util.

### File List

- `src/app/features/items/publicar/publicar.component.ts`
- `src/app/features/items/publicar/publicar.component.html`
- `src/app/features/items/publicar/publicar.component.scss`
- `src/app/features/items/publicar/publicar.component.spec.ts`
- `src/app/features/items/publicar/publish-error.util.ts`
- `src/app/features/items/publicar/publish-error.util.spec.ts`
- `public/i18n/es.json`
- `public/i18n/ca.json`
- `public/i18n/en.json`

### Change Log

- 2026-05-26: Story 7-f2 — selectores category/weightRange en publicar; eliminado hardcode POST; i18n y errores HTTP; tests actualizados.

### Review Findings

- 2026-05-26 (code-review): **0 decision-needed, 0 patch, 1 defer, 0 dismissed as noise.**
- [x] [Review][Defer] `fieldError('condition')` sin rama cliente — condición siempre tiene default `good`; errores servidor OK vía `serverFieldErrorKeys` [`publicar.component.ts:188`] — pre-existing pattern, no bloqueante.

### Senior Developer Review (AI)

**Outcome:** Aprobado — AC 1–6 cumplidos; hardcode eliminado; i18n trilingüe; `mapPublishError` extendido; build OK.
