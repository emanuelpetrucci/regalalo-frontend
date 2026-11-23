# delta-frontend-DLT-candidato-contacto.md

**Versión del documento:** 1.0  
**Fecha:** Mayo 2026  
**Scope:** Frontend — Angular / Vercel  
**Versión del diseño técnico frontend resultante:** 1.6  
**Estado:** Product-approved · Pendiente validación técnica (agente de desarrollo)  
**Delta técnico de referencia (backend):** `delta-candidato-contacto.md`  
**Brief de diseño de referencia (UI):** `design-brief-candidato-contacto.md`

> **Regeneración de cliente OpenAPI obligatoria.** Los contratos de `POST /items/:id/requests` y `GET /delivery-sessions/:id` han cambiado. Tras actualizar el spec en backend, ejecutar:
> ```bash
> cd ../backend && npm run openapi:generate
> cd ../no-lo-vendo && npm run api:generate
> ```
> El código generado en `src/app/core/api/generated/` es la fuente de verdad para los tipos y servicios. No crear tipos manuales para los campos nuevos.

---

## 1. Resumen de cambios

| # | Cambio | Componente afectado |
|---|---|---|
| C-01 | Nuevo bottom sheet de captura de `contactChannel` antes de enviar solicitud | `features/items/` — detalle de objeto |
| C-02 | Nuevo campo `receiverContactChannel` visible para el donante en sesión de entrega | `features/delivery/` — detalle de sesión |
| C-03 | Nueva regla de presentación SEC-002c | Reglas de presentación globales |
| C-04 | Nuevas claves i18n | `assets/i18n/es.json` |

---

## 2. Contratos de API actualizados

### 2.1 `POST /items/:id/requests` — payload modificado

**Antes:** sin body.

**Después:**
```typescript
// Tipo generado por ng-openapi-gen tras regeneración
interface RequestItemBody {
  contactChannel: string; // requerido, no vacío
}
```

**Nuevo error a manejar:**

| Código HTTP | Motivo | Comportamiento en UI |
|---|---|---|
| 400 (`contactChannel` ausente o vacío) | Validación backend | Mostrar error inline bajo el campo: clave i18n `items.request.contact_channel.error.required` |

Los errores 409 y 401 ya existen y no cambian.

---

### 2.2 `GET /delivery-sessions/:id` — nuevo campo en respuesta

```typescript
// Tipo generado por ng-openapi-gen tras regeneración
interface DeliverySessionDetail {
  // ... campos existentes sin cambio ...
  contactChannel:          string | null; // existente — canal del donante → visible para receptor
  sharedContactChannel:    string | null; // existente — eco canal donante → visible para donante
  receiverContactChannel:  string | null; // NUEVO — canal del receptor → visible para donante
}
```

El campo `receiverContactChannel` llega desde el backend ya filtrado según la regla SEC-002c. El frontend no implementa lógica de visibilidad propia (ver C-03).

---

## 3. Cambio C-01 — Bottom sheet de captura de canal de contacto

### Componente afectado

`src/app/features/items/` — componente de detalle de objeto (el que renderiza `GET /items/:id` y expone el CTA de solicitar).

### Comportamiento actual

El CTA "Solicitar" llama directamente a `ItemsService.requestItem(itemId)` sin body.

### Comportamiento nuevo

**Flujo:**

```
Usuario pulsa CTA "Solicitar"
  └─ Se abre RequestContactBottomSheetComponent
       ├─ Usuario escribe contactChannel
       ├─ CTA "Enviar solicitud" se activa cuando el campo tiene valor
       └─ Usuario pulsa "Enviar solicitud"
            └─ ItemsService.requestItem(itemId, { contactChannel })
                 ├─ 201 → cerrar sheet → estado "Ya solicitado" en detalle
                 ├─ 400 → error inline en el campo
                 └─ 409 → cerrar sheet → error estándar en pantalla
```

### Nuevo componente: `RequestContactBottomSheetComponent`

**Ubicación sugerida:**
```
src/app/features/items/components/request-contact-bottom-sheet/
  ├── request-contact-bottom-sheet.component.ts
  ├── request-contact-bottom-sheet.component.html
  └── request-contact-bottom-sheet.component.scss
```

**Template — estructura**

```html
<!-- Título -->
<h2>{{ 'items.request.contact_sheet.title' | translate }}</h2>

<!-- Subtítulo -->
<p>{{ 'items.request.contact_sheet.subtitle' | translate }}</p>

<!-- Campo de texto -->
<label for="contactChannel">
  {{ 'items.request.contact_channel.label' | translate }}
</label>
<input
  id="contactChannel"
  type="text"
  [(ngModel)]="contactChannel"
  [placeholder]="'items.request.contact_channel.placeholder' | translate"
  autocomplete="off"
/>
<span class="hint">
  {{ 'items.request.contact_channel.hint' | translate }}
</span>
<span *ngIf="showError" class="error">
  {{ 'items.request.contact_channel.error.required' | translate }}
</span>

<!-- Acciones -->
<button
  (click)="onSubmit()"
  [disabled]="!contactChannel?.trim()"
  class="btn-primary">
  {{ 'items.request.contact_sheet.cta_submit' | translate }}
</button>
<button (click)="onCancel()" class="btn-secondary">
  {{ 'items.request.contact_sheet.cta_cancel' | translate }}
</button>
```

**Lógica del componente**

```typescript
@Component({ ... })
export class RequestContactBottomSheetComponent {
  contactChannel = '';
  showError = false;
  isLoading = false;

  // Input: itemId recibido desde el componente padre
  @Input() itemId!: string;
  // Output: resultado para que el padre actualice el estado
  @Output() submitted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onSubmit(): void {
    if (!this.contactChannel.trim()) {
      this.showError = true;
      return;
    }
    this.isLoading = true;
    this.itemsService.requestItem(this.itemId, {
      contactChannel: this.contactChannel.trim()
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.submitted.emit();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 400) {
          this.showError = true;
        } else {
          this.cancelled.emit(); // cierra el sheet; el padre maneja el error 409
        }
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
```

### Modificación en el componente de detalle de objeto

- Sustituir la llamada directa a `ItemsService.requestItem()` por la apertura de `RequestContactBottomSheetComponent`.
- Escuchar el evento `submitted` para actualizar el estado del botón al estado "Ya solicitado".
- Escuchar el evento `cancelled` para restaurar el estado del botón sin cambios.
- El bottom sheet sigue el patrón de apertura ya establecido en el proyecto para otros sheets o modales. No introducir nueva librería de overlays.

---

## 4. Cambio C-02 — Campo `receiverContactChannel` en sesión de entrega

### Componente afectado

`src/app/features/delivery/` — componente de detalle de sesión de entrega (el que renderiza `GET /delivery-sessions/:id`).

### Comportamiento actual

El donante ve un bloque con `sharedContactChannel` (eco de su propio canal).

### Comportamiento nuevo

Se añade `receiverContactChannel` en el mismo bloque, bajo `sharedContactChannel`. Ambos campos conforman la sección de coordinación.

### Modificación en template

Localizar el bloque donde se renderiza `sharedContactChannel` y añadir el nuevo campo inmediatamente después:

```html
<!-- Sección coordinación — donante (role === 'donor') -->
<section *ngIf="session.role === 'donor'" class="coordination-block">
  <h3>{{ 'delivery.session.coordination.title' | translate }}</h3>

  <!-- Campo existente — canal propio del donante (echo) -->
  <div *ngIf="session.sharedContactChannel" class="contact-field">
    <span class="contact-label">
      {{ 'delivery.session.contact.donor_channel_label' | translate }}
    </span>
    <span class="contact-value">{{ session.sharedContactChannel }}</span>
  </div>

  <!-- Campo nuevo — canal del receptor -->
  <div *ngIf="session.receiverContactChannel" class="contact-field">
    <span class="contact-label">
      {{ 'delivery.session.contact.receiver_channel_label' | translate }}
    </span>
    <span class="contact-value">{{ session.receiverContactChannel }}</span>
  </div>
</section>
```

**Regla de renderizado:**
- `*ngIf="session.receiverContactChannel"` — si el backend devuelve `null`, el bloque no se renderiza. El frontend no evalúa ninguna condición adicional (SEC-002c la gestiona el backend).
- La misma regla ya existente para `sharedContactChannel` y `contactChannel` se aplica sin excepción a `receiverContactChannel`.

---

## 5. Cambio C-03 — Nueva regla de presentación (SEC-002c)

Añadir a la sección de **Reglas de Presentación** del diseño técnico frontend (`technical-design-frontend.md` §5):

> **receiverContactChannel (SEC-002c):** el frontend no implementa lógica de visibilidad propia sobre este campo. Si el backend devuelve `receiverContactChannel` con valor no nulo, se renderiza en el bloque de coordinación de la sesión de entrega, visible únicamente para el donante (`role === 'donor'`). Si devuelve `null`, el bloque no se muestra. La decisión de cuándo exponer el campo reside exclusivamente en el backend.

---

## 6. Cambio C-04 — Claves i18n nuevas

Todas las claves se añaden en `src/assets/i18n/es.json`.

### 6.1 Bottom sheet — solicitud de objeto

```json
{
  "items": {
    "request": {
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
    }
  }
}
```

### 6.2 Sesión de entrega — bloque coordinación (donante)

```json
{
  "delivery": {
    "session": {
      "coordination": {
        "title": "Coordinación"
      },
      "contact": {
        "donor_channel_label": "Tu canal compartido",
        "receiver_channel_label": "Cómo contactar al receptor"
      }
    }
  }
}
```

> **Nota de fusión:** verificar que las claves existentes bajo `delivery.session` no entren en conflicto con las nuevas. La clave `coordination.title` puede ser nueva o existente según la implementación actual del bloque. Adaptar si ya existe una clave equivalente.

---

## 7. Validación cliente

| Campo | Regla | Mensaje de error |
|---|---|---|
| `contactChannel` (bottom sheet) | Requerido · no vacío tras `trim()` | `items.request.contact_channel.error.required` |

No se implementa validación de formato (texto libre por diseño). La validación mínima es que el campo no esté en blanco.

El CTA primario del bottom sheet permanece desactivado (`disabled`) mientras `contactChannel.trim()` sea falsy. No se muestra el mensaje de error hasta que el usuario intente enviar con el campo vacío.

---

## 8. Tipos de modelos actualizados (post-regeneración)

Tras ejecutar `npm run api:generate`, verificar que los siguientes tipos estén actualizados en `src/app/core/api/generated/`:

| Tipo | Campo nuevo |
|---|---|
| `RequestItemBody` (o equivalente) | `contactChannel: string` |
| `DeliverySessionDetail` (o equivalente) | `receiverContactChannel: string \| null` |

No crear interfaces manuales que dupliquen estos tipos. Si el spec OpenAPI aún no está actualizado por el agente de backend, crear los tipos provisionales en `src/app/core/models/` con una nota `// TODO: eliminar tras regeneración`.

---

## 9. Documentos a actualizar

| Documento | Cambio |
|---|---|
| `technical-design-frontend.md` | Bump versión a 1.6 · Añadir entrada en historial de versiones · Añadir regla SEC-002c en §5 · Actualizar contrato `POST /items/:id/requests` (payload) · Actualizar contrato `GET /delivery-sessions/:id` (campo nuevo) |

---

## 10. Checklist de validación — agente de desarrollo

- [ ] `RequestContactBottomSheetComponent` creado y abierto desde el componente de detalle de objeto al pulsar el CTA de solicitar.
- [ ] `ItemsService.requestItem()` actualizado para aceptar y enviar `{ contactChannel }` en el body.
- [ ] Error 400 del endpoint de solicitud manejado con error inline en el campo (no como toast genérico).
- [ ] Campo `receiverContactChannel` renderizado en la sesión de entrega (vista donante) con `*ngIf` sobre el valor — sin lógica de visibilidad adicional en cliente.
- [ ] Las cuatro claves i18n del §6 añadidas en `es.json` sin conflicto con claves existentes.
- [ ] Cliente OpenAPI regenerado o tipos provisionales en `core/models/` debidamente marcados como `TODO`.
- [ ] `technical-design-frontend.md` actualizado a versión 1.6 con los cambios del §9.
- [ ] El campo no se pre-rellena con el `phone` del perfil del usuario.
