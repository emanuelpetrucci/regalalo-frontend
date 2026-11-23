# Story 10-f.2: Retrofits UI canal de contacto — solicitud y sesión de entrega (3.1 + 4.1)

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed - comprehensive developer guide created. Épica 10-f DLT-candidato-contacto — retrofit 3.1 (RequestContactBottomSheetComponent) y retrofit 4.1 (receiverContactChannel en entrega-detalle donante). Dependencia 10-f1 completada (review). -->

## Story

Como receptor autenticado,
quiero proporcionar mi canal de contacto al solicitar un objeto,
para que el donante pueda coordinarse conmigo si me selecciona.

Como donante,
quiero ver el canal de contacto del receptor en el detalle de sesión de entrega,
para poder contactarle y coordinar la recogida.

**FR:** FR-F42, FR-F43 (amplía FR-F11 y FR-F15) · **Épica:** 10-f (DLT-candidato-contacto)
**Referencia:** `docs/delta-frontend-DLT-candidato-contacto.md` · `sprint-change-proposal-2026-06-01-DLT-candidato-contacto.md`
**Dependencia:** Story 10-f1 completada (review) — cliente OpenAPI regenerado, `RequestItemRequest` y `DeliverySession.receiverContactChannel` disponibles en `src/app/core/api/generated/`.

## Acceptance Criteria

### Retrofit 3.1: bottom sheet de solicitud

1. **Given** detalle de objeto ajeno, `active`, `requestsPaused === false`
   **When** pulso el CTA de solicitar
   **Then** se abre `RequestContactBottomSheetComponent` — NO se llama directamente al servicio
   **And** el bottom sheet sigue el diseño de `RequestSheet` en `docs/project/ItemDetail.jsx` (pixel-perfect)

2. **Given** el bottom sheet abierto con campo `contactChannel` vacío
   **When** el usuario no ha escrito nada
   **Then** el botón "Enviar solicitud" está deshabilitado (`disabled`)
   **When** el campo tiene valor (`trim()` no vacío)
   **Then** el botón se habilita

3. **Given** el usuario pulsa "Enviar solicitud" con campo válido
   **When** se llama `ItemsService.itemsIdRequestsPost({ id, body: { contactChannel } })`
   **Then** ante 201: cerrar sheet → estado "Ya solicitado" en detalle (mismo comportamiento post-solicitud de Story 3.1)

4. **Given** el backend responde 400 (`contactChannel` ausente o vacío)
   **When** el error llega al componente
   **Then** se muestra el error **inline** bajo el campo con clave i18n `items.request.contact_channel.error.required`
   **And** el sheet permanece abierto (no se cierra)

5. **Given** el backend responde 409
   **When** el error llega
   **Then** cerrar sheet → error estándar en pantalla (comportamiento previo Story 3.1 — `mapRequestItemError`)

6. **Given** el usuario pulsa "Cancelar" o el backdrop
   **When** no se ha enviado la solicitud
   **Then** el sheet se cierra sin cambiar el estado del botón de solicitar

### Retrofit 4.1: receiverContactChannel en panel donante

7. **Given** el backend devuelve `receiverContactChannel` con valor no nulo en `GET /delivery-sessions/:id`
   **When** soy donante (`role === 'donor'`) y veo el panel de detalle de sesión
   **Then** se renderiza el canal del receptor bajo el bloque de `sharedContactChannel`
   **And** sigue el diseño `CoordinationBlock` de `docs/project/Entregas.html`

8. **Given** `receiverContactChannel` es `null`
   **When** veo el panel de detalle
   **Then** el bloque del receptor NO se renderiza — sin lógica adicional de visibilidad (SEC-002c)

9. **Given** soy receptor (`role === 'receiver'`)
   **When** veo el panel de detalle
   **Then** `receiverContactChannel` NO es visible — la regla aplica solo para el donante

### i18n

10. **Given** las claves i18n del §6.1 (bottom sheet) y §6.2 (coordinación entrega) del delta
    **When** se añaden en `public/i18n/es.json`
    **Then** no existe conflicto con claves existentes bajo `items.request.*` ni `delivery.detail.*`
    **And** se añaden traducciones equivalentes en `ca.json` y `en.json`

## Tasks / Subtasks

### A. Crear `RequestContactBottomSheetComponent` (AC: 1, 2, 3, 4, 5, 6)

- [x] Crear archivos en `src/app/features/items/components/request-contact-bottom-sheet/`:
  - `request-contact-bottom-sheet.component.ts`
  - `request-contact-bottom-sheet.component.html`
  - `request-contact-bottom-sheet.component.scss`
  - `request-contact-bottom-sheet.component.spec.ts`

- [x] Leer **obligatoriamente** antes de implementar:
  - `docs/project/ItemDetail.jsx` — diseño pixel-perfect del RequestSheet
  - `docs/project/colors_and_type.css` — tokens de diseño (paleta, tipografía, espaciados)
  - `src/app/shared/components/item-request-dialog/item-request-dialog.component.ts` — patrón de scroll lock + focus trap a replicar

- [x] Implementar el componente:
  - Inputs: `open = input(true)`, `submitting = input(false)`, `fieldErrorKey = input<string | null>(null)`
  - Outputs: `confirmed = output<string>()` (emite el contactChannel), `dismissed = output<void>()`
  - Signal interno: `contactChannelValue = signal('')`
  - Computed: `isValid = computed(() => this.contactChannelValue().trim().length > 0)`
  - Scroll lock en `afterNextRender` (patrón idéntico a `ItemRequestDialogComponent`)
  - `host: { '(document:keydown.escape)': 'onEscape($event)' }` — no decorators `@HostListener`
  - Tab cycling focus trap (copiar `getFocusableElements()` y `onPanelKeydown()`)
  - Backdrop click → `dismissed()` (solo si `!submitting()`)
  - Botón submit: `[disabled]="!isValid() || submitting()"`, llama `onSubmit()`
  - `onSubmit()`: emite `confirmed(contactChannelValue().trim())` si válido

- [x] Angular 20+: NO poner `standalone: true` en el decorador (es el default)
- [x] Usar `[value]` / `(input)` binding para el campo de texto — NO usar `ngModel`
- [x] Usar CSS classes propias del componente (no `ngClass`/`ngStyle`)

### B. Modificar `ItemDetailPanelComponent` para usar el nuevo sheet (AC: 1–6)

- [x] En `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts`:
  - Añadir señales: `contactSheetOpen = signal(false)`, `contactSheetFieldErrorKey = signal<string | null>(null)`
  - Modificar `onInterestedClick()`: abrir `contactSheetOpen` en lugar de `requestDialogOpen`
  - Añadir `closeContactSheet()`:
    - Guard: `if (this.requesting()) return;`
    - `contactSheetOpen.set(false)`, `contactSheetFieldErrorKey.set(null)`, `restoreRequestFocus()`
  - Añadir `onContactSheetSubmit(contactChannel: string): Promise<void>`:
    - Ver pseudocódigo exacto en Dev Notes — manejo diferenciado de 400 vs 409
  - Importar `RequestContactBottomSheetComponent`
  - Verificar si `ItemRequestDialogComponent` ya no es necesario (ver Dev Notes) y eliminar si corresponde

- [x] En `src/app/shared/components/item-detail-panel/item-detail-panel.component.html`:
  - Reemplazar bloque `@if (requestDialogOpen())` con:
    ```html
    @if (contactSheetOpen()) {
      <app-request-contact-bottom-sheet
        [open]="true"
        [submitting]="requesting()"
        [fieldErrorKey]="contactSheetFieldErrorKey()"
        (confirmed)="onContactSheetSubmit($event)"
        (dismissed)="closeContactSheet()"
      />
    }
    ```
  - Eliminar `<app-item-request-dialog ...>` del template (ya no se usa)
  - Actualizar el método `onDocumentEscape()` si referenciaba `requestDialogOpen`

### C. Modificar `EntregaDetalleComponent` — template (AC: 7, 8, 9)

- [x] Leer **obligatoriamente** antes de implementar:
  - `docs/project/Entregas.html` — diseño visual del CoordinationBlock (receptor channel)
  - `src/app/features/delivery/entrega-detalle/entrega-detalle.component.html` líneas 243-255 — bloque existente a preservar

- [x] En `src/app/features/delivery/entrega-detalle/entrega-detalle.component.html`:
  - Localizar el bloque de `sharedContactChannel` (líneas 243-255):
    ```html
    @if (isDonor() && session.sharedContactChannel) {
      <div class="entrega-detalle__channel entrega-detalle__channel--shared">
        ...
      </div>
    }
    ```
  - Añadir **inmediatamente después** (mismo nivel de indentación):
    ```html
    @if (isDonor() && session.receiverContactChannel) {
      <div class="entrega-detalle__channel entrega-detalle__channel--receiver-contact">
        <p class="entrega-detalle__channel-label">
          {{ t('delivery.detail.receiver_contact_channel_label') }}
        </p>
        <p class="entrega-detalle__channel-value">
          {{ session.receiverContactChannel }}
        </p>
      </div>
    }
    ```
  - El guard `isDonor()` es necesario y correcto (AC 9 lo requiere)
  - El `@if` sobre `session.receiverContactChannel` cumple SEC-002c (si backend envía null, no se renderiza)

- [x] No modificar `entrega-detalle.component.ts` — solo es cambio de template

### D. Actualizar i18n (AC: 10)

- [x] En `public/i18n/es.json`:
  - Bajo `items.request`, añadir los siguientes campos (sin sobreescribir los existentes):
    ```json
    "contact_sheet": {
      "title": "¿Cómo puede contactarte el donante?",
      "subtitle": "Si te seleccionan, el donante usará este dato para coordinarse contigo.",
      "cta_submit": "Enviar solicitud",
      "cta_cancel": "Cancelar"
    },
    "contact_channel": {
      "label": "Tu canal de contacto",
      "placeholder": "Ej: WhatsApp +34 600 000 000, Telegram @usuario...",
      "hint": "Puedes escribir lo que prefieras: número, usuario, app, etc.",
      "error": {
        "required": "Introduce tu canal de contacto para continuar"
      }
    }
    ```
  - Bajo `delivery.detail`, añadir:
    ```json
    "receiver_contact_channel_label": "Cómo contactar al receptor"
    ```
    (**Nota:** ver Dev Notes sobre namespace — usar `delivery.detail.*` no `delivery.session.*`)

- [x] Añadir traducciones equivalentes en `public/i18n/ca.json` y `public/i18n/en.json`
  - ca: adaptar al catalán
  - en: traducir al inglés

### E. Verificación final (AC: todos)

- [x] `npm run build` — exit 0, sin errores TypeScript
- [x] Verificar que no quedan referencias a `requestDialogOpen` ni `ItemRequestDialogComponent` en el template (si fueron eliminados)
- [x] Verificar que ningún string visible está hardcodeado en el template del nuevo componente
- [x] Confirmar que `entrega-detalle.component.html` usa `isDonor()` como guard para `receiverContactChannel`
- [x] Completar Dev Agent Record: File List y Completion Notes

## Dev Notes

### Contexto de la historia — estado actual del código a modificar

**Flujo de solicitud actual (Story 3.1, a reemplazar en 10-f2):**

```
ItemDetailPanelComponent.onInterestedClick()
  → requestDialogOpen.set(true)
  → <app-item-request-dialog> (diálogo de confirmación, sin contactChannel)
      → (confirmed) → onRequestConfirm()
          → itemsIdRequestsPost({ id })  // sin body — funciona en compilación (body?: RequestItemRequest)
```

**Flujo de solicitud nuevo (10-f2):**
```
ItemDetailPanelComponent.onInterestedClick()
  → contactSheetOpen.set(true)
  → <app-request-contact-bottom-sheet> (captura contactChannel)
      → (confirmed(contactChannel)) → onContactSheetSubmit(contactChannel)
          → itemsIdRequestsPost({ id, body: { contactChannel } })
```

### Código a eliminar / reemplazar en `item-detail-panel.component.ts`

Eliminar o sustituir:
- `requestDialogOpen = signal(false)` → reemplazar por `contactSheetOpen = signal(false)`
- `closeRequestDialog()` → reemplazar por `closeContactSheet()`
- `onRequestConfirm()` → reemplazar por `onContactSheetSubmit(contactChannel: string)`
- `import { ItemRequestDialogComponent }` → reemplazar por `import { RequestContactBottomSheetComponent }`

**Antes de eliminar `ItemRequestDialogComponent`**, verificar que no se usa en otros archivos:

```bash
grep -r "ItemRequestDialogComponent\|app-item-request-dialog" src/ --include="*.ts" --include="*.html"
```

Si solo aparece en `item-detail-panel`, eliminar; si aparece en más lugares, mantener y solo quitar del panel.

### Pseudocódigo de `onContactSheetSubmit` (diferenciación crítica de errores)

```typescript
async onContactSheetSubmit(contactChannel: string): Promise<void> {
  const current = this.item();
  if (!current || this.requesting()) return;

  this.requesting.set(true);
  this.contactSheetFieldErrorKey.set(null);  // limpiar error previo

  try {
    await this.itemsApi.itemsIdRequestsPost({ id: current.id, body: { contactChannel } });
    this.requestDone.set(true);
    this.remainingSlots.update((n) => (n !== null ? Math.max(0, n - 1) : n));
    this.contactSheetOpen.set(false);
    this.restoreRequestFocus();
  } catch (err) {
    if (err instanceof HttpErrorResponse && err.status === 401) return;

    if (err instanceof HttpErrorResponse && err.status === 400) {
      // 400 en este contexto = contactChannel vacío/ausente (validación backend)
      // Sheet permanece abierto — error inline bajo el campo
      this.contactSheetFieldErrorKey.set('items.request.contact_channel.error.required');
      return;  // NO cerrar el sheet
    }

    // 409 y genérico → usar mapRequestItemError → cerrar sheet → banner
    const mapped = mapRequestItemError(err);
    if (mapped.markDone) this.requestDone.set(true);
    if (mapped.bannerKey) this.requestErrorKey.set(mapped.bannerKey);
    this.contactSheetOpen.set(false);
    this.restoreRequestFocus();
  } finally {
    this.requesting.set(false);
  }
}
```

**CRÍTICO:** 400 en `onContactSheetSubmit` = error de campo (inline, sheet abierto).
400 en `mapRequestItemError` original = "own_item" (banner). Son contextos distintos.
NO modificar `mapRequestItemError` — interceptar 400 antes de llegar al mapper.

### Actualización de `onDocumentEscape` en `item-detail-panel.component.ts`

El método actual referencia `requestDialogOpen`:
```typescript
onDocumentEscape(event: Event): void {
  // ...
  if (this.requestDialogOpen() || this.cancelDialogOpen() || this.requesting()) {
    return;
  }
  // ...
}
```

Actualizar para usar `contactSheetOpen`:
```typescript
if (this.contactSheetOpen() || this.cancelDialogOpen() || this.requesting()) {
  return;
}
```

### Scaffold del `RequestContactBottomSheetComponent`

```typescript
@Component({
  selector: 'app-request-contact-bottom-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // NO standalone: true (Angular 20+ default)
  imports: [TranslocoModule, BtnComponent],
  templateUrl: './request-contact-bottom-sheet.component.html',
  styleUrl: './request-contact-bottom-sheet.component.scss',
  host: {
    '(document:keydown.escape)': 'onEscape($event)',
  },
})
export class RequestContactBottomSheetComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private bodyOverflowBeforeLock: string | null = null;

  readonly open = input(true);
  readonly submitting = input(false);
  readonly fieldErrorKey = input<string | null>(null);

  readonly confirmed = output<string>();
  readonly dismissed = output<void>();

  readonly contactChannelValue = signal('');
  readonly isValid = computed(() => this.contactChannelValue().trim().length > 0);

  constructor() {
    afterNextRender(() => {
      if (this.open()) {
        this.lockBodyScroll();
        this.focusPanel();
      }
    });
    this.destroyRef.onDestroy(() => this.unlockBodyScroll());
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.contactChannelValue.set(value);
  }

  onSubmit(): void {
    if (!this.isValid() || this.submitting()) return;
    this.confirmed.emit(this.contactChannelValue().trim());
  }

  onDismiss(): void {
    if (this.submitting()) return;
    this.dismissed.emit();
  }

  onBackdropClick(): void {
    if (this.submitting()) return;
    this.dismissed.emit();
  }

  onPanelClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onEscape(event: Event): void {
    if (!this.open() || this.submitting()) return;
    event.preventDefault();
    this.dismissed.emit();
  }

  // ... (lockBodyScroll, unlockBodyScroll, focusPanel, focus trap — idénticos a ItemRequestDialogComponent)
}
```

**Estructura HTML base (adaptar al diseño del prototipo):**
```html
@if (open()) {
  <div
    class="contact-sheet__backdrop rlg-fade-in"
    role="presentation"
    (click)="onBackdropClick()"
  >
    <div
      class="contact-sheet__panel rlg-modal-in"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="'contact-sheet-title'"
      tabindex="-1"
      (click)="onPanelClick($event)"
      (keydown)="onPanelKeydown($event)"
      *transloco="let t"
    >
      <h2 id="contact-sheet-title">{{ t('items.request.contact_sheet.title') }}</h2>
      <p>{{ t('items.request.contact_sheet.subtitle') }}</p>

      <label for="contact-channel-input">
        {{ t('items.request.contact_channel.label') }}
      </label>
      <input
        id="contact-channel-input"
        type="text"
        [value]="contactChannelValue()"
        (input)="onInputChange($event)"
        [attr.placeholder]="t('items.request.contact_channel.placeholder')"
        [attr.aria-describedby]="fieldErrorKey() ? 'contact-channel-error' : 'contact-channel-hint'"
        [attr.aria-invalid]="!!fieldErrorKey()"
        autocomplete="off"
      />
      <span id="contact-channel-hint">{{ t('items.request.contact_channel.hint') }}</span>
      @if (fieldErrorKey(); as errKey) {
        <span id="contact-channel-error" role="alert" class="contact-sheet__field-error">
          {{ t(errKey) }}
        </span>
      }

      <div class="contact-sheet__footer">
        <app-btn variant="ghost" [disabled]="submitting()" (click)="onDismiss()">
          {{ t('items.request.contact_sheet.cta_cancel') }}
        </app-btn>
        <app-btn variant="primary" [disabled]="!isValid() || submitting()" (click)="onSubmit()">
          {{ t('items.request.contact_sheet.cta_submit') }}
        </app-btn>
      </div>
    </div>
  </div>
}
```

**Nota WCAG AA obligatoria:**
- `aria-invalid="true"` en el input cuando hay error
- `aria-describedby` apunta al hint normalmente, al error cuando existe
- El `<span role="alert">` del error se anuncia automáticamente a lectores de pantalla

### Estado actual de `entrega-detalle.component.html` — bloque a extender

Bloque existente de coordinación (líneas 243-255) — **NO modificar, solo añadir después**:
```html
@if (isDonor() && session.sharedContactChannel) {
  <div class="entrega-detalle__channel entrega-detalle__channel--shared">
    <p class="entrega-detalle__channel-label">
      {{ t('delivery.detail.channel_shared_label') }}
    </p>
    <p class="entrega-detalle__channel-value">
      {{ session.sharedContactChannel }}
    </p>
    <p class="entrega-detalle__channel-hint">
      {{ t('delivery.detail.channel_shared_hint') }}
    </p>
  </div>
}
```

`DeliverySession.receiverContactChannel` ya está disponible en el modelo generado (post 10-f1). No se necesitan cambios en el TS del componente.

### Discrepancia de namespace i18n — IMPORTANTE

El delta doc (`delta-frontend-DLT-candidato-contacto.md §6.2`) propone claves bajo `delivery.session.coordination.*` y `delivery.session.contact.*`. **Pero el proyecto usa `delivery.detail.*` en todo el archivo `es.json` y en el template `entrega-detalle.component.html`.**

Usar la convención real del proyecto: `delivery.detail.*`

Nueva clave recomendada: `delivery.detail.receiver_contact_channel_label`

Claves existentes (NO duplicar):
- `delivery.detail.channel_shared_label` — "Canal facilitado al receptor" (visible para DONANTE)
- `delivery.detail.channel_receiver_label` — "Canal de contacto del donante" (visible para RECEPTOR)
- `delivery.detail.channel_shared_hint` — hint del canal compartido

### Tipos de API disponibles (post 10-f1)

```typescript
// src/app/core/api/generated/models/request-item-request.ts
export interface RequestItemRequest {
  contactChannel: string;
}

// src/app/core/api/generated/models/delivery-session.ts
export interface DeliverySession {
  // ... campos existentes ...
  contactChannel?: string | null;
  sharedContactChannel?: string | null;
  receiverContactChannel?: string | null;  // NUEVO post 10-f1
  role?: 'donor' | 'receiver';
  // ...
}
```

Llamada actualizada (`body` es `?` en firma TS aunque es requerido en runtime):
```typescript
await this.itemsApi.itemsIdRequestsPost({ id: current.id, body: { contactChannel } });
```

### Architecture compliance

| Regla | Fuente |
|---|---|
| `RequestItemRequest` canónico | `generated/models/request-item-request.ts` |
| `DeliverySession.receiverContactChannel` disponible | `generated/models/delivery-session.ts` |
| No editar `generated/` | `docs/api-client.md` regla #1 |
| Diseño pixel-perfect RequestSheet | `docs/project/ItemDetail.jsx` — lectura obligatoria |
| Diseño CoordinationBlock | `docs/project/Entregas.html` — lectura obligatoria |
| Tokens de diseño | `docs/project/colors_and_type.css` únicamente |
| Sin strings hardcodeados | `project-context.md` |
| Angular 20+: sin `standalone: true` | `CLAUDE.md` |
| Sin `ngModel` — usar signals / `[value]` | `CLAUDE.md` (reactive / signals) |
| `input()` / `output()`, OnPush | `CLAUDE.md` |
| Sin `@HostListener` / `@HostBinding` | `CLAUDE.md` — usar `host: {}` |
| Sin `ngClass` / `ngStyle` | `CLAUDE.md` — usar `class` / `style` bindings |
| WCAG AA: focus, contraste, ARIA | `CLAUDE.md` |
| Transloco: `*transloco="let t"` | `project-context.md` — sin strings hardcodeados |
| SEC-002c | `docs/architecture.md §6` — no implementar lógica de visibilidad propia |

### Testing requirements

El `request-contact-bottom-sheet.component.spec.ts` debe cubrir:
- Botón submit deshabilitado cuando `contactChannelValue` está vacío
- Botón submit habilitado cuando `contactChannelValue` tiene valor
- `confirmed` emite el `contactChannel` trimmed al enviar
- `dismissed` emite al hacer click en Cancelar
- `dismissed` emite al click en backdrop
- `dismissed` emite al pulsar Escape (cuando `submitting = false`)
- Escape NO emite cuando `submitting = true`
- Error inline se muestra cuando `fieldErrorKey` tiene valor
- Error inline NO se muestra cuando `fieldErrorKey` es null

Usar `TranslocoTestingModule.forRoot({ langs: { es: esJson } })` — sin loader real.

### Historial de implementación — 10-f1 (done, review)

- `npm run api:generate` completado: 46 modelos, 6 servicios
- `request-item-request.ts` generado: `RequestItemRequest { contactChannel: string }`
- `delivery-session.ts` tiene `receiverContactChannel: string | null`
- `items-id-requests-post.ts`: `body?: RequestItemRequest` (ng-openapi-gen genera `?` aunque el spec lo requiera — build pasa en 10-f1)
- `npm run build` fue **exit 0** en 10-f1 — ningún error TS aunque `item-detail-panel.ts` no pasa body
- Post 10-f2: `item-detail-panel.ts` SIEMPRE pasará `body: { contactChannel }` — no hay regresión de firma

### Patrones de components análogos en el proyecto

| Componente | Patrón relevante para 10-f2 |
|---|---|
| `src/app/shared/components/item-request-dialog/` | Scroll lock + focus trap + Escape — copiar exacto |
| `src/app/shared/components/item-select-receiver-dialog/` | Emite `confirmed(value: string)` al padre, padre llama API — mismo patrón aquí |
| `src/app/shared/components/delivery-session-cancel-dialog/` | `[submitting]` y `[errorKey]` como inputs — mismo patrón de estado |

### Archivos a leer antes de implementar (obligatorio para agente dev)

1. `docs/project/ItemDetail.jsx` — diseño RequestSheet (pixel-perfect)
2. `docs/project/Entregas.html` — diseño CoordinationBlock
3. `docs/project/colors_and_type.css` — tokens CSS
4. `src/app/shared/components/item-request-dialog/item-request-dialog.component.ts` — patrón de scroll lock + focus trap
5. `src/app/shared/components/item-request-dialog/item-request-dialog.component.html` — estructura HTML del modal
6. `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts` — señales y métodos actuales
7. `src/app/shared/components/item-detail-panel/item-detail-panel.component.html` — template actual con `requestDialogOpen`
8. `src/app/features/delivery/entrega-detalle/entrega-detalle.component.html` — líneas 243-255

### Referencias

- [Source: docs/delta-frontend-DLT-candidato-contacto.md] — spec completo C-01 (bottom sheet), C-02 (receiverContactChannel), C-04 (i18n)
- [Source: docs/architecture.md §6] — regla SEC-002c completa
- [Source: docs/api-client.md] — reglas de uso del cliente generado
- [Source: _bmad-output/planning-artifacts/epics.md#Story-10-f2] — AC originales
- [Source: _bmad-output/implementation-artifacts/10-f1-regenerar-cliente-openapi-y-architecture-v1-6.md] — contexto de historia fundacional
- [Source: sprint-change-proposal-2026-06-01-DLT-candidato-contacto.md] — Correct Course aprobado

### Review Findings (2026-06-01)

- [x] [Review][Dismiss] Alinear patrón de canal con `item-select-receiver-dialog` — Descartado: la spec 10-f2 y `ItemDetail.jsx` exigen texto libre, no pills.

- [x] [Review][Dismiss] Falta selector de tipo de canal (pills) — Descartado (misma razón).

- [x] [Review][Dismiss] No se usa `buildContactChannel()` al confirmar — Descartado (misma razón).

- [x] [Review][Dismiss] Formulario reactivo y validación táctil ausentes — Descartado: validación mínima por spec (trim + disabled CTA).

- [x] [Review][Dismiss] Tests no cubren tipo de canal ni formato prefijado — Descartado (misma razón).

- [x] [Review][Defer] Enter para enviar — `ItemDetail.jsx` RequestSheet soporta Enter; el bottom sheet no. Coherencia menor con prototipo.

### Review Findings (pass 2 — 2026-06-01)

> **Nota:** Los ítems `[Patch]` de pass 1 sobre pills/`buildContactChannel` se **descartan** frente a la spec: AC 1–2 y `docs/delta-frontend-DLT-candidato-contacto.md` §7 exigen **texto libre** en el bottom sheet (como `ItemDetail.jsx` RequestSheet), no el patrón de `item-select-receiver-dialog` (flujo donante al seleccionar).

- [x] [Review][Patch] Bloque `receiverContactChannel` sin estilos CoordinationBlock — `entrega-detalle.component.html:257-265` usa `entrega-detalle__channel--receiver-contact` pero no hay reglas en `entrega-detalle.component.scss` (solo existen `--shared` y `--receiver`). El prototipo `Entregas.html` CoordinationBlock aplica fondo success, flex e icono de canal. **Viola AC 7.**

- [x] [Review][Patch] Falta icono de canal en bloque donante receptor — `entrega-detalle.component.html:257-265` no incluye `entrega-detalle__channel-icon` (presente en el bloque receptor `channel--receiver` y en el prototipo). **Viola AC 7.**

- [x] [Review][Patch] Sin tests de `receiverContactChannel` en entrega-detalle — `entrega-detalle.component.spec.ts` solo añadió mock/i18n; faltan casos AC 7 (donante + valor), AC 8 (`null` oculto), AC 9 (rol receptor no ve el bloque).

- [x] [Review][Patch] `ItemRequestDialogComponent` sigue en el repo sin usos — sustituido por el bottom sheet; la story indica eliminarlo si no se usa. Archivos bajo `src/app/shared/components/item-request-dialog/` son código muerto.

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Pre-existing test failures (7 tests in 4 files) confirmed NOT introduced by this story via git stash isolation.
  Affected files: `detalle.component.spec.ts` (2), `mis-objetos.component.spec.ts` (1), `publicar.component.spec.ts` (4).
- `ItemRequestDialogComponent` confirmed unused outside its own directory — safely replaced without side effects.
- 400 error differentiation: intercepted BEFORE `mapRequestItemError` to avoid wrong "own_item" banner in new flow.

### Completion Notes List

- Created `RequestContactBottomSheetComponent` with scroll lock, focus trap, Escape key handler, WCAG AA ARIA attributes (`aria-invalid`, `aria-describedby`, `role="alert"` on error), and `[value]`/`(input)` binding (no `ngModel`).
- `ItemDetailPanelComponent` updated: `requestDialogOpen` → `contactSheetOpen`, `onRequestConfirm` → `onContactSheetSubmit(contactChannel)`, `closeRequestDialog` → `closeContactSheet`. 400 response sets inline field error and keeps sheet open; 409/generic closes sheet and shows banner via `mapRequestItemError`.
- `EntregaDetalleComponent` template: added `receiverContactChannel` block after `sharedContactChannel`, guarded by `isDonor() && session.receiverContactChannel` (SEC-002c compliant — no additional visibility logic).
- i18n: added `items.request.contact_sheet.*`, `items.request.contact_channel.*`, and `delivery.detail.receiver_contact_channel_label` in `es.json`, `ca.json`, `en.json`.
- All tests passing: 582 pass, 7 pre-existing failures unrelated to this story. Build exit 0.

### File List

- `src/app/features/items/components/request-contact-bottom-sheet/request-contact-bottom-sheet.component.ts` (created)
- `src/app/features/items/components/request-contact-bottom-sheet/request-contact-bottom-sheet.component.html` (created)
- `src/app/features/items/components/request-contact-bottom-sheet/request-contact-bottom-sheet.component.scss` (created)
- `src/app/features/items/components/request-contact-bottom-sheet/request-contact-bottom-sheet.component.spec.ts` (created)
- `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts` (modified)
- `src/app/shared/components/item-detail-panel/item-detail-panel.component.html` (modified)
- `src/app/features/delivery/entrega-detalle/entrega-detalle.component.html` (modified)
- `src/app/features/items/detalle/detalle.component.spec.ts` (modified)
- `src/app/features/delivery/entrega-detalle/entrega-detalle.component.spec.ts` (modified)
- `public/i18n/es.json` (modified)
- `public/i18n/ca.json` (modified)
- `public/i18n/en.json` (modified)
