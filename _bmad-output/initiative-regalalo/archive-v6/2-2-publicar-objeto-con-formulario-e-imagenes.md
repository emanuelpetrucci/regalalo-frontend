# Story 2.2: Publicar objeto con formulario e imágenes

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed. -->

## Story

Como donante autenticado,
quiero publicar un objeto con datos e imágenes,
para ofrecerlo a la comunidad.

## Acceptance Criteria

1. **Given** la ruta protegida de publicación (`/mis-objetos/publicar`, ya registrada y bajo `authGuard` vía `AppShellComponent`)  
   **When** completo título, descripción, condición, código postal del objeto y 1–5 imágenes comprimidas  
   **Then** se llama `ItemsService.itemsPost` con cuerpo `multipart/form-data` (objeto `PublishItemMultipart` con `images: Blob[]`; el cliente generado construye `FormData` automáticamente)  
   **And** ante `201` se redirige a `/mis-objetos` con feedback de éxito (detalle `/items/:id` queda para historia 2.4)

2. **Given** payload inválido (`400`/`422` con `ValidationError`) o imagen rechazada por el servidor  
   **When** falla la publicación  
   **Then** se muestran errores de campo o banner sin perder los valores ya válidos del formulario ni las imágenes ya seleccionadas en el picker

3. **Given** el formulario en cualquier paso del asistente  
   **When** faltan campos obligatorios o no hay al menos una imagen en el paso final  
   **Then** la validación reactiva impide avanzar o enviar, con mensajes inline accesibles

## Tasks / Subtasks

- [x] Implementar asistente de 3 pasos en `PublicarComponent` (AC: 1, 3) — diseño `Mis objetos.html` `PublishModal` / `Step1`–`Step3`
  - [x] Paso 1: `FormGroup` con `title`, `description`, `condition`, `postalCode` + validadores alineados con OpenAPI
  - [x] Paso 2: integrar `<app-image-picker (imagesChange)="onImages($event)" />` — **reutilizar** componente de 2.1, no reimplementar compresión
  - [x] Paso 3: resumen de datos + imágenes + aviso post-publicación del prototipo
  - [x] Barra de progreso (3 pasos), botones Atrás / Continuar / Publicar, estados `submitting`

- [x] Envío multipart vía API generada (AC: 1, 2)
  - [x] `ItemsService.itemsPost({ body: { title, description, condition, postalCode, images } })`
  - [x] Blobs en orden del picker (principal = índice 0)
  - [x] Mapper de errores `publish-error.util.ts` (patrón `login-error.util.ts` / `register-error.util.ts`)

- [x] i18n `items.publish.*` en `public/i18n/{es,ca,en}.json` (AC: 1–3)
  - [x] Títulos de pasos, labels, placeholders, condiciones, errores, éxito, botones

- [x] Estilos SCSS del asistente portados del prototipo (AC: 1, 3)
  - [x] Tokens `colors_and_type.css` vía variables globales (`--color-primary-500`, `--border-error`, etc.)
  - [x] Grid condición 2×2, contador caracteres título/descripción

- [x] Specs `publicar.component.spec.ts`
  - [x] Validación paso 1 y obligatoriedad de ≥1 imagen antes de submit
  - [x] Submit llama `itemsPost` con body correcto (mock `ItemsService`)
  - [x] `400` muestra errores sin vaciar formulario
  - [x] `201` navega a `/mis-objetos`

### Review Findings

<!-- Code review 2026-05-22 — 0 decision-needed, 9 patch, 2 defer, 8 dismissed -->

- [x] [Review][Patch] Errores de servidor en `images` no visibles en paso 2 [`publicar.component.html:88-90`, `publicar.component.ts:268-275`]
- [x] [Review][Patch] Errores de servidor en `condition` sin mensaje inline accesible [`publicar.component.html:58-73`, `publicar.component.ts:118-149`]
- [x] [Review][Patch] `goBack()` no limpia `serverFieldErrorKeys` (errores fantasma al cambiar de paso) [`publicar.component.ts:176-183`]
- [x] [Review][Patch] `goBack()` desde paso 3 no revoca `previewUrl` (fuga de object URL) [`publicar.component.ts:176-183`]
- [x] [Review][Patch] Título/descripción solo espacios pasan validación del paso 1 [`publicar.component.ts:188-198`]
- [x] [Review][Patch] Enter en inputs del paso 1–2 puede disparar `ngSubmit`/`publish()` [`publicar.component.html:23`]
- [x] [Review][Patch] Carrera en doble clic: `submitting` se activa tras validación, no al inicio [`publicar.component.ts:216-235`]
- [x] [Review][Patch] Varios campos con error: solo el primero en `Object.keys` cambia de paso [`publicar.component.ts:270-275`]
- [x] [Review][Patch] `normalizeFieldKey` no reconoce rutas tipo `images[0]` [`publish-error.util.ts:16-23`]

- [x] [Review][Defer] Cobertura de tests incompleta (trim, 422, máx. 5 fotos, error imágenes en componente) [`publicar.component.spec.ts`] — deferred, ampliar en pasada QA dedicada
- [x] [Review][Defer] Sin tope defensivo `images.slice(0, 5)` en submit [`publicar.component.ts:239-245`] — deferred, `ImagePickerComponent` ya limita a 5

## Dev Notes

### ⛔ Diseño obligatorio

**Fichero:** `docs/project/Mis objetos.html` — `PublishModal`, `Step1`, `Step2`, `Step3` (líneas ~699–898).  
**Tokens:** `docs/project/colors_and_type.css` → `src/styles.scss`.

| Elemento prototipo | Implementación Angular |
|---|---|
| Modal 3 pasos, barra progreso | Página completa en `/mis-objetos/publicar` (misma jerarquía visual: header paso, progress 3px, footer fijo) |
| Step1: título 80 chars UI | Validar `maxLength(100)` (OpenAPI); mostrar contador `/100` o `/80` si el diseño exige 80 — **preferir límite API 100** y ajustar contador |
| Step1: descripción 500 UI | OpenAPI `maxLength: 1000` — validar 1000, contador acorde |
| Step1: condición 4 botones | `condition` enum: `new`, `like_new`, `good`, `fair` |
| Step1: **sin CP en prototipo** | **Añadir** campo código postal (requerido API) con mismo estilo `FieldInput` / input del prototipo |
| Step2: grid fotos | `<app-image-picker>` (ya implementado en 2.1) |
| Step3: resumen + caja éxito verde | Replicar copy y layout antes del botón Publicar |
| Footer: Atrás / Continuar / Publicar | `app-btn` variantes |

### Ruta y autenticación (brownfield — no reinventar)

| Epics.md dice | Proyecto real | Acción dev |
|---|---|---|
| `/items/new` | `/mis-objetos/publicar` | **Usar la ruta existente** en `items.routes.ts` y `app-shell` navbar |
| — | `authGuard` en hijos de `AppShellComponent` | Ya protegida; no duplicar guard en feature |

Tras `201`, **no** navegar a `/items/:id` hasta historia 2.4 (ruta inexistente). Redirigir:

```typescript
await this.router.navigate(['/mis-objetos'], {
  queryParams: { published: res.id }, // opcional para toast futuro
});
```

Mostrar mensaje de éxito en la misma pantalla (signal) antes de navegar, o `AlertBox` + delay corto — elegir un patrón y mantenerlo.

### API — contrato exacto

**Servicio:** `ItemsService` en `src/app/core/api/generated/services/items.service.ts`  
**Modelo:** `PublishItemMultipart` — `src/app/core/api/generated/models/publish-item-multipart.ts`

```typescript
// Envío (NO construir FormData a mano salvo debugging)
const body: PublishItemMultipart = {
  title: form.value.title.trim(),
  description: form.value.description.trim(),
  condition: form.value.condition, // 'new' | 'like_new' | 'good' | 'fair'
  postalCode: form.value.postalCode.trim(),
  images: this.imageBlobs(), // Blob[] WebP del picker, 1–5
};
await this.itemsApi.itemsPost({ body });
```

El `RequestBuilder` del cliente generado convierte `images: Blob[]` en múltiples `formData.append('images', blob)` — clave **`images`**, no `images[]`.  
[Source: `src/app/core/api/generated/request-builder.ts` L271–291]

**OpenAPI límites** (`../backend/openapi/openapi.json` → `PublishItemMultipart`):

| Campo | Reglas |
|---|---|
| `title` | required, 1–100 |
| `description` | required, 1–1000 |
| `condition` | required, enum 4 valores |
| `postalCode` | required, 1–10 (UI: patrón `^\d{5}$` como registro) |
| `images` | array max 5; negocio exige ≥1 antes de submit |

**Respuesta 201:** `PublishItemResponse` `{ id, title, status, createdAt }`.

**Errores:** `400`/`422` → `ValidationError` con `errors?: Record<string, string[]>`; `401` → interceptor (no mapear en feature).

### Estado del componente (patrones 1.5 / 1.6 / 2.1)

```typescript
readonly step = signal<1 | 2 | 3>(1);
readonly submitting = signal(false);
readonly bannerError = signal<string | null>(null);
readonly imageBlobs = signal<Blob[]>([]);
readonly serverFieldErrorKeys = signal<Record<string, string>>({});

readonly form = this.fb.nonNullable.group({
  title: ['', [Validators.required, Validators.maxLength(100)]],
  description: ['', [Validators.required, Validators.maxLength(1000)]],
  condition: ['good' as PublishItemMultipart['condition'], Validators.required],
  postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
});
```

- `ChangeDetectionStrategy.OnPush`, `inject()`, signals.
- `DestroyRef` + flag `destroyed` si hay `await` antes de navegar (patrón login).
- Limpiar `serverFieldErrorKeys` en `valueChanges` del campo tocado.

**Avance entre pasos:**

- Paso 1 → 2: marcar controles paso 1 `touched`; si inválido, no incrementar `step`.
- Paso 2 → 3: exigir `imageBlobs().length >= 1`; si no, error i18n `items.publish.errors.photos_required` (equivalente prototipo `errors.photos`).
- Paso 3: submit solo si form válido + imágenes.

### Integración `ImagePickerComponent` (historia 2.1 — NO duplicar)

```html
<app-image-picker (imagesChange)="onImages($event)" />
```

```typescript
onImages(blobs: Blob[]): void {
  this.imageBlobs.set(blobs);
  // opcional: limpiar error de fotos si blobs.length > 0
}
```

Ubicación: `src/app/shared/components/image-picker/`.  
Compresión WebP ya aplicada; **no** volver a comprimir en publicar.

### Componentes compartidos existentes

| Componente | Uso en publicar |
|---|---|
| `FieldInputComponent` | título, descripción, código postal |
| `BtnComponent` | Continuar, Atrás, Publicar |
| `AlertBoxComponent` | errores globales / éxito |
| `ImagePickerComponent` | paso 2 |

Condición: botones custom en grid 2×2 (no hay componente radio-group compartido aún) — estilos en `publicar.component.scss` copiando prototipo.

### Mapeo de errores HTTP

Crear `src/app/features/items/publicar/publish-error.util.ts`:

- `400`/`422` + `errors.title` → clave i18n campo título
- Igual para `description`, `condition`, `postalCode`, `images`
- Fallback: `items.publish.errors.generic`
- No tratar `401` (interceptor)

Usar `TranslocoService` para mensajes finales, igual que `mapRegisterError`.

### Estructura de archivos

```
src/app/features/items/publicar/
├── publicar.component.ts          ← REEMPLAZAR stub actual
├── publicar.component.html
├── publicar.component.scss
├── publicar.component.spec.ts     ← NUEVO
└── publish-error.util.ts          ← NUEVO
```

**NO modificar** `src/app/core/api/generated/`.  
**NO** crear `ApiService` manual ni `HttpClient` con URL hardcodeada.

### i18n — claves nuevas (`items.publish.*`)

Añadir en `es`, `ca`, `en` (snake_case, sin strings en template):

| Clave sugerida | Contenido ES (referencia prototipo) |
|---|---|
| `step1_title` | ¿Qué regalas? |
| `step2_title` | Añade fotos |
| `step3_title` | Revisa y publica |
| `step_indicator` | Paso {{current}} de {{total}} |
| `field_title` | Título |
| `field_description` | Descripción |
| `field_postal_code` | Código postal del objeto |
| `field_condition` | Condición |
| `condition_new` | A estrenar |
| `condition_like_new` | Como nuevo |
| `condition_good` | Buen estado |
| `condition_fair` | Aceptable |
| `photos_intro` | Añade hasta 5 fotos. La primera será la principal… |
| `review_notice` | Revisa los datos antes de publicar… |
| `success_hint` | Después de publicar puedes pausar solicitudes… |
| `btn_continue` | Continuar |
| `btn_back` | Atrás |
| `btn_publish` | Publicar objeto |
| `errors.photos_required` | Añade al menos una foto. |
| `errors.generic` | No se pudo publicar. Revisa los datos e inténtalo de nuevo. |
| `success.title` | Objeto publicado |

Reutilizar `items.image_picker.*` del picker (ya existe).

### Testing

- `TranslocoTestingModule.forRoot` con fragmento `items.publish` + `items.image_picker`.
- Mock `ItemsService.itemsPost` → resolve/reject.
- Mock `Router.navigate`.
- No tests e2e en esta historia.

Ejecutar: `npx ng test --watch=false --include="src/app/features/items/publicar/publicar.component.spec.ts"`

### Previous Story Intelligence (2.1)

- `ImageCompressionService` + `ImagePickerComponent` listos; 29 tests en specs de imagen.
- Patrones post-review: try/catch en compresión, `slotErrors`, `aria-live="assertive"`, hint «por imagen».
- **Deferred relevante:** `originalName` en output del picker no implementado — no bloquea multipart (orden de blobs importa).
- Archivos tocados en 2.1 listados en story 2.1 `File List` — no romper exports del picker.

### Git intelligence reciente

- `5353a1e` — i18n image_picker + deferred work (continuar convención i18n trilingüe).
- Features auth usan `FieldInput`, `AlertBox`, `Btn`, formularios reactivos nonNullable.

### Anti-patterns (prohibido)

| Prohibido | Hacer en su lugar |
|---|---|
| Duplicar compresión de imágenes | Solo `ImagePickerComponent` |
| `HttpClient.post('/items')` manual | `ItemsService.itemsPost` |
| Strings visibles en HTML | Transloco |
| Ruta nueva `/items/new` sin acuerdo | Mantener `/mis-objetos/publicar` |
| `NgOptimizedImage` en previews del picker | Ya documentado en 2.1 |
| Editar `generated/` | Regenerar API si cambia contrato |

### Project Structure Notes

- Feature boundary: `features/items/publicar/` — coherente con `explorar/`, `mis-objetos/`.
- Lazy route ya configurada en `items.routes.ts`.
- Navbar CTA ya apunta a `/mis-objetos/publicar` (`app-shell.component.ts`).

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 2.2, UX-DR6, tabla diseño 2.2]
- [Source: `docs/architecture.md` §3 compresión, §F4 POST /items]
- [Source: `docs/api-client.md` — Multipart publicar objeto]
- [Source: `docs/project/Mis objetos.html` — PublishModal]
- [Source: `_bmad-output/implementation-artifacts/2-1-pipeline-de-compresion-de-imagenes-en-cliente.md`]
- [Source: `_bmad-output/project-context.md`]
- [Source: `src/app/features/items/publicar/publicar.component.ts` — stub a reemplazar]
- [Source: `../backend/openapi/openapi.json` — PublishItemMultipart]

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Debug Log References

- Tests publicar: `npx ng test --watch=false --include="src/app/features/items/publicar/**/*.spec.ts"` — 11/11 OK
- Suite completa: 140/142 OK (2 fallos preexistentes en `landing.component.spec.ts`, no relacionados)

### Completion Notes List

- Asistente 3 pasos en `/mis-objetos/publicar` con barra de progreso, validación reactiva y diseño alineado a `Mis objetos.html` PublishModal.
- Publicación vía `ItemsService.itemsPost` + `PublishItemMultipart`; errores mapeados en `publish-error.util.ts` (record/array + geocoding).
- i18n trilingüe `items.publish.*`; 11 tests unitarios (componente + mapper).
- Tras `201`: banner de éxito breve y redirección a `/mis-objetos?published=:id`.

### File List

- `src/app/features/items/publicar/publicar.component.ts` (modified)
- `src/app/features/items/publicar/publicar.component.html` (new)
- `src/app/features/items/publicar/publicar.component.scss` (new)
- `src/app/features/items/publicar/publicar.component.spec.ts` (new)
- `src/app/features/items/publicar/publish-error.util.ts` (new)
- `src/app/features/items/publicar/publish-error.util.spec.ts` (new)
- `public/i18n/es.json` (modified)
- `public/i18n/ca.json` (modified)
- `public/i18n/en.json` (modified)

## Change Log

- 2026-05-22: Implementado flujo publicar objeto (asistente 3 pasos, multipart API, i18n, tests).
- 2026-05-22: Code review — 9 parches aplicados (errores servidor UI, validación whitespace, Enter/publish, goBack, earliestStep, images[0]); 15 tests OK.
