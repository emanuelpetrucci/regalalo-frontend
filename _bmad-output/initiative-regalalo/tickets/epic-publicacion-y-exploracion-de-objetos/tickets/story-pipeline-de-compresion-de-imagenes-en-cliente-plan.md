---
ticket: 1
status: done
type: feature
migrated_from: v6
---

# Story 2.1: Pipeline de compresión de imágenes en cliente

Status: done

## Story

Como donante,
quiero que mis fotos se compriman automáticamente antes de subirlas,
para cumplir los límites del backend sin intervención manual.

## Acceptance Criteria

1. **Given** un `ImageCompressionService` en `src/app/core/services/`  
   **When** se procesan hasta 5 archivos de imagen válidos  
   **Then** cada imagen se redimensiona a máximo 1200px por lado, se convierte a WebP al 80% de calidad, y el resultado no supera 2 MB

2. **Given** el usuario selecciona más de 5 imágenes  
   **When** intenta añadirlas  
   **Then** la UI rechaza los archivos sobrantes y muestra el límite máximo (las primeras 5 se aceptan si son válidas)

3. **Given** un archivo que tras compresión WebP sigue superando 2 MB  
   **When** se procesa  
   **Then** se muestra error al usuario indicando que esa imagen es demasiado grande

4. **Given** formatos no soportados (cualquier `file.type` fuera de `image/jpeg`, `image/png`, `image/webp`)  
   **When** el usuario los selecciona  
   **Then** se rechazan inmediatamente con mensaje claro, sin llegar a comprimir

5. **Given** imágenes válidas que se comprimen correctamente  
   **When** la compresión finaliza  
   **Then** el componente `ImagePickerComponent` muestra las previsualizaciones y emite un `output<Blob[]>` con los blobs comprimidos

## Tasks / Subtasks

- [x] Crear `ImageCompressionService` (AC: 1, 3, 4)
  - [x] Método `compress(files: FileList | File[]): Promise<CompressionResult[]>`
  - [x] Validación de formato antes de comprimir (`file.type` ∈ `image/jpeg` | `image/png` | `image/webp`)
  - [x] Pipeline Canvas: `createImageBitmap` → escalar a ≤1200px → `canvas.toBlob('image/webp', 0.80)`
  - [x] Validación de tamaño post-compresión: `blob.size > 2 * 1024 * 1024` → error
  - [x] Spec con pruebas de cada AC (usar `File` mocks y spy de Canvas)

- [x] Crear `ImagePickerComponent` en `src/app/shared/components/image-picker/` (AC: 2, 5)
  - [x] Input nativo oculto `<input type="file" accept="image/jpeg,image/png,image/webp" multiple>`
  - [x] Grid 3 columnas × 5 slots (aspect-ratio 4/3), diseño desde `Mis objetos.html` Step2
  - [x] Estado de carga por slot durante la compresión
  - [x] Mostrar previsualización con `URL.createObjectURL(blob)` + liberar con `revokeObjectURL` al destruir
  - [x] Botón "×" por slot para eliminar imagen individual
  - [x] `output<Blob[]>('imagesChange')` — emite el array actualizado en cada cambio
  - [x] Mostrar errores inline (formato inválido, demasiado grande) y hint de formatos/límite
  - [x] Spec: interacción de selección, error de formato, error de tamaño, límite 5

- [x] Añadir claves i18n a `public/i18n/{es,ca,en}.json` (AC: 2, 3, 4)

### Review Findings

**Code review 2026-05-22** — 0 decision-needed, 13 patch, 6 defer, 9 dismissed.

#### Patch (aplicados 2026-05-22)

- [x] [Review][Patch] Envolver `createImageBitmap`/canvas en try/finally y cerrar `bitmap` siempre [`image-compression.service.ts:18-41`]
- [x] [Review][Patch] Guard si `getContext('2d')` devuelve null [`image-compression.service.ts:31`]
- [x] [Review][Patch] Aislar fallos por archivo en `compress()` (no abortar todo el lote) [`image-compression.service.ts:44-46`]
- [x] [Review][Patch] Rechazar archivos de 0 bytes antes de decodificar [`image-compression.service.ts:18`]
- [x] [Review][Patch] Aceptar `FileList | File[]` en la firma pública de `compress()` [`image-compression.service.ts:44`]
- [x] [Review][Patch] Candado si `loading` activo al iniciar otra selección [`image-picker.component.ts:79`]
- [x] [Review][Patch] En fallo de `compress` o `removeSlot`, limpiar flags `loading` del slot afectado [`image-picker.component.ts:63-133`]
- [x] [Review][Patch] No vaciar todos los errores en `removeSlot` (solo los del slot o batch actual) [`image-picker.component.ts:75`]
- [x] [Review][Patch] Evitar `createObjectURL`/mutaciones tras `ngOnDestroy` [`image-picker.component.ts:40-133`]
- [x] [Review][Patch] Clase `.picker__slot--error` con borde `--border-error` / `#B33A2A` en slot fallido [`image-picker.component.scss`]
- [x] [Review][Patch] Hint i18n alinear con prototipo: «Máx. 2 MB por imagen» [`public/i18n/es.json`]
- [x] [Review][Patch] `aria-disabled` / `tabindex="-1"` en slots vacíos cuando los 5 están llenos [`image-picker.component.html:44-51`]
- [x] [Review][Patch] `aria-live="assertive"` en bloque de errores [`image-picker.component.html:62`]
- [x] [Review][Patch] Assert en spec de `toBlob('image/webp', 0.8)` [`image-compression.service.spec.ts`]

#### Deferred

- [x] [Review][Defer] Orientación EXIF en fotos móvil — no está en AC; requiere `imageOrientation: 'from-image'` o librería
- [x] [Review][Defer] Validación por magic bytes además de `file.type` — endurecimiento anti-spoofing
- [x] [Review][Defer] Límite de tamaño de entrada antes de `createImageBitmap` — optimización anti-freeze
- [x] [Review][Defer] Compresión secuencial o límite de concurrencia en móvil — optimización memoria
- [x] [Review][Defer] Input `maxImages` cableado a slots dinámicos — extensión futura (spec: «diseñado para extensión»)
- [x] [Review][Defer] Emitir `originalName` junto a blobs para multipart 2-2 — historia siguiente

## Dev Notes

### `ImageCompressionService` — implementación

**Ubicación:** `src/app/core/services/image-compression.service.ts`  
**Patrón de referencia:** `RecaptchaService` (servicio singleton en `core/services/`)

```typescript
// Tipos de retorno
export type CompressionStatus = 'ok' | 'format_invalid' | 'too_large';

export interface CompressionResult {
  status: CompressionStatus;
  blob?: Blob;        // definido solo cuando status === 'ok'
  originalName: string;
}
```

**Algoritmo de compresión:**
```typescript
private async compressOne(file: File): Promise<CompressionResult> {
  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
  if (!ACCEPTED.includes(file.type)) {
    return { status: 'format_invalid', originalName: file.name };
  }

  const bitmap = await createImageBitmap(file);
  const MAX = 1200;
  const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close(); // liberar memoria

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', 0.80)
  );

  if (!blob || blob.size > 2 * 1024 * 1024) {
    return { status: 'too_large', originalName: file.name };
  }
  return { status: 'ok', blob, originalName: file.name };
}
```

**Método público:**
```typescript
async compress(files: File[]): Promise<CompressionResult[]> {
  return Promise.all(files.map((f) => this.compressOne(f)));
}
```

**⚠️ SSR:** `createImageBitmap` y `document.createElement('canvas')` solo existen en el browser. El servicio solo se invoca desde un componente (el picker) que a su vez solo se renderiza en cliente. No es necesario guard adicional, pero incluirlo en los dev notes previene futuros errores de SSR.

**`providedIn: 'root'`** — singleton global.

---

### `ImagePickerComponent` — implementación

**Ubicación:** `src/app/shared/components/image-picker/`  
**Archivos:** `image-picker.component.ts`, `.html`, `.scss`, `.spec.ts`

**Interfaz del componente:**
```typescript
// Inputs
readonly maxImages = input(5);   // no es necesario exponer en esta historia, pero diseñado para extensión

// Outputs
readonly imagesChange = output<Blob[]>();

// Estado interno
readonly slots = signal<Array<Blob | null>>([null, null, null, null, null]); // 5 slots fijos
readonly loading = signal<boolean[]>([false, false, false, false, false]);
readonly errors = signal<string[]>([]);  // errores de última selección
```

**Flujo al seleccionar archivos:**
1. `<input>` dispara evento `change`
2. Filtrar: si `slots` ya tiene 5 blobs, ignorar extras (mostrar aviso max)
3. Calcular cuántos slots vacíos quedan
4. Para cada `File` (hasta los slots vacíos disponibles): llamar a `ImageCompressionService.compressOne()`
5. Por resultado `'ok'` → actualizar slot con blob + generar URL para previsualización
6. Por resultado `'format_invalid'` o `'too_large'` → añadir a errors signal
7. Emitir `imagesChange` con los blobs no-nulos actuales

**Previsualización:**
```typescript
// En el componente
private readonly previews = signal<string[]>([]);  // URLs para <img>

// Al destruir
ngOnDestroy(): void {
  this.previews().forEach(URL.revokeObjectURL);
}
```

**Diseño (Mis objetos.html Step2):**
```
Grid 3 columnas, gap 10px
Cada slot: aspect-ratio 4/3, border-radius 10px
  — vacío:  border 2px dashed #D5D9DE, bg #E8EAEC, icono +
  — lleno:  border 2px dashed #3A7358, bg #D6EDE1, previsualización + label ("Principal" / "Foto N") + botón ×
  — error:  border 2px dashed #B33A2A (se usa en el slot si hay error)
Hint inferior: "Formatos: JPG, PNG, WEBP · Máx. 2 MB · Se comprimen automáticamente"
```

**⚠️ No usar `NgOptimizedImage`** para las previsualizaciones generadas con `createObjectURL` — son base64/blob dinámicos, no imágenes estáticas.

---

### Integración con `PublishItemMultipart`

El campo de la API es `images?: Array<Blob>` (ver `src/app/core/api/generated/models/publish-item-multipart.ts`).  
La historia 2-2 usará directamente los blobs emitidos por `ImagePickerComponent` en el `FormData`.  
Esta historia **no** llama a `itemsPost` — solo provee el pipeline y la UI del picker.

---

### Claves i18n a añadir

En las tres lenguas (`es`, `ca`, `en`) bajo la clave `items.image_picker.*`:

| Clave | ES | CA | EN |
|-------|----|----|-----|
| `add` | "Añadir" | "Afegir" | "Add" |
| `main` | "Principal" | "Principal" | "Main" |
| `photo_n` | "Foto {{n}}" | "Foto {{n}}" | "Photo {{n}}" |
| `remove` | "Eliminar foto" | "Elimina la foto" | "Remove photo" |
| `processing` | "Procesando…" | "Processant…" | "Processing…" |
| `format_invalid` | "Formato no compatible. Usa JPG, PNG o WebP." | "Format no compatible. Usa JPG, PNG o WebP." | "Unsupported format. Use JPG, PNG or WebP." |
| `too_large` | "La imagen supera el límite de 2 MB después de comprimir." | "La imatge supera el límit de 2 MB després de comprimir." | "Image exceeds 2 MB limit after compression." |
| `max_reached` | "Máximo 5 fotos por objeto." | "Màxim 5 fotos per objecte." | "Maximum 5 photos per item." |
| `hint` | "Formatos: JPG, PNG, WEBP · Máx. 2 MB · Se comprimen automáticamente" | "Formats: JPG, PNG, WEBP · Màx. 2 MB · Es comprimen automàticament" | "Formats: JPG, PNG, WEBP · Max. 2 MB · Auto-compressed" |

Seguir la convención de claves `dominio.seccion.clave` en inglés snake_case (ver project-context.md §i18n).  
No hardcodear strings visibles en el template del componente.

---

### Notas de la historia anterior (1-6)

- **Patrón de servicio:** `providedIn: 'root'`, `inject()` en lugar de constructor injection, signals para estado reactivo
- **Specs:** usar `TranslocoTestingModule.forRoot({ langs: { es: esJson, ca: caJson, en: enJson } })` en spec del picker  
- **No editar `generated/`** bajo ningún concepto
- **SSR:** operaciones DOM/Canvas son browser-only; el picker no se prerender (lazy en ruta `/publicar`)
- **`aria-live` siempre en DOM:** si el picker muestra errores via aria-live, el contenedor debe existir antes de que el error se inyecte
- **OnPush en todo:** `ChangeDetectionStrategy.OnPush` obligatorio en el picker
- **`input()` / `output()`** en lugar de decoradores `@Input`/`@Output`

### Diseño de referencia

`docs/project/Mis objetos.html` — función `Step2` (selector de imágenes, grid 3 col)  
`docs/project/colors_and_type.css` — tokens de color y tipografía

### Project Structure Notes

```
src/app/
├── core/services/
│   └── image-compression.service.ts         ← NUEVO
│   └── image-compression.service.spec.ts    ← NUEVO
└── shared/components/image-picker/
    ├── image-picker.component.ts             ← NUEVO
    ├── image-picker.component.html           ← NUEVO
    ├── image-picker.component.scss           ← NUEVO
    └── image-picker.component.spec.ts        ← NUEVO

public/i18n/
├── es.json   ← MODIFICAR (añadir items.image_picker.*)
├── ca.json   ← MODIFICAR
└── en.json   ← MODIFICAR
```

**Ningún archivo existente necesita modificarse** en esta historia excepto los JSON de i18n.

### References

- Parámetros de compresión: [Source: docs/architecture.md §3 — Pipeline de compresión]
- Tipos API: [Source: src/app/core/api/generated/models/publish-item-multipart.ts] → `images?: Array<Blob>`
- Endpoint multipart: [Source: docs/api-client.md — "Multipart: publicar objeto"]
- Diseño UI picker: [Source: docs/project/Mis objetos.html — función Step2]
- Reglas i18n: [Source: _bmad-output/project-context.md §i18n]
- Patrón de servicio singleton: [Source: src/app/core/services/recaptcha.service.ts]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- Spec de compresión: `vi.stubGlobal('createImageBitmap')` en lugar de `spyOn` (API no presente en jsdom).
- Spec del picker: test de eliminación usa flujo `onFilesSelected` en lugar de acceder a `previews` privado.

### Completion Notes List

- `ImageCompressionService`: validación MIME, escala ≤1200px, WebP 80%, límite 2 MB, 11 tests unitarios.
- `ImagePickerComponent`: grid 5 slots, compresión async, previsualizaciones con revoke, errores `aria-live`, 13 tests.
- i18n `items.image_picker.*` en es/ca/en.
- Suite focalizada `**/image-*.spec.ts`: 24/24 OK. Suite completa: 2 tests de `landing.component.spec.ts` fallan (cambios landing en paralelo, fuera de alcance 2-1).

### File List

- src/app/core/services/image-compression.service.ts
- src/app/core/services/image-compression.service.spec.ts
- src/app/shared/components/image-picker/image-picker.component.ts
- src/app/shared/components/image-picker/image-picker.component.html
- src/app/shared/components/image-picker/image-picker.component.scss
- src/app/shared/components/image-picker/image-picker.component.spec.ts
- public/i18n/es.json
- public/i18n/ca.json
- public/i18n/en.json

## Change Log

- 2026-05-22: Pipeline de compresión en cliente, `ImagePickerComponent` reutilizable e i18n trilingüe (historia 2-1).
- 2026-05-22: Code review — 13 patches aplicados (robustez servicio, concurrencia picker, a11y, diseño error slot).
