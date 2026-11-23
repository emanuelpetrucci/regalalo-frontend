---
baseline_commit: ad21fea
---

# Story 12-f2: ReportService y ReportModalComponent

Status: review

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed. Épica 12-f Sistema de Reportes — historia central; crea ReportService y ReportModalComponent standalone de 3 pasos. -->

## Story

Como usuario autenticado con email verificado,
quiero acceder a un modal de reporte de 3 pasos que me permita categorizar el problema y enviarlo,
para señalar contenido inadecuado o comportamientos problemáticos a la comunidad.

**FR:** FR-REP-F1, FR-REP-F2 · **Épica:** 12-f (Sistema de Reportes)
**Referencia:** `docs/PRD-REP-FE-01.md` · `docs/DESIGN-REP-01.md` · `docs/architecture.md` v1.7

## Acceptance Criteria

1. **Given** `ReportService` en `src/app/core/services/report.service.ts`
   **When** se llama `submit(context, reason, description, recaptchaToken)`
   **Then** invoca `ReportsService.reportsPost({ body: { ... } })` (cliente generado) con el payload correcto
   **And** retorna `Observable<CreateReportResponse>` (AC-REP-FE-16)

2. **Given** `ReportModalComponent` standalone con `context = input.required<ReportContext>()`, `closed = output<void>()` y `submitted = output<void>()`
   **When** se abre con contexto válido (`entityId` no vacío)
   **Then** el Paso 1 muestra lista de 8 motivos seleccionables; título `"Reportar objeto"` o `"Reportar usuario"` según `context().entityType`; subtítulo con `context().entityDisplayName` (AC-REP-FE-14, AC-REP-FE-18)

3. **Given** el Paso 1 sin motivo seleccionado
   **When** el usuario ve el modal
   **Then** el botón "Siguiente" está deshabilitado (AC-REP-FE-06)

4. **Given** el usuario selecciona un motivo y avanza al Paso 2
   **When** pulsa "Atrás"
   **Then** regresa al Paso 1 manteniendo la opción seleccionada (AC-REP-FE-15)

5. **Given** el Paso 2 con textarea
   **When** el usuario escribe más de 500 caracteres
   **Then** el input se trunca a 500; el contador muestra `500 / 500` (AC-REP-FE-07)

6. **Given** el usuario pulsa "Enviar reporte"
   **When** se ejecuta el submit
   **Then** (1) se obtiene token reCAPTCHA V3 con acción `'report'` vía `recaptchaService.execute('report')` (AC-REP-FE-13); (2) se llama `reportService.submit`; (3) la UI transiciona a estado `submitting`: botón deshabilitado, textarea readonly, botones Atrás y ✕ deshabilitados (AC-REP-FE-08)

7. **Given** respuesta exitosa de la API
   **When** el submit tiene éxito
   **Then** el modal pasa al Paso 3 con icono de confirmación, título "Reporte enviado" y cuerpo según PRD-REP-FE-01 §3.6 (AC-REP-FE-09)

8. **Given** el Paso 3 y el usuario pulsa "Cerrar"
   **When** se cierra el modal
   **Then** se emite el output `submitted` (AC-REP-FE-10)

9. **Given** la API responde con error
   **When** llega `HttpErrorResponse`
   **Then** el handler lee `error.error?.code` (no solo el status HTTP) y muestra el mensaje correspondiente inline en la zona de error del Paso 2; la UI regresa a `STEP_2_DESCRIPTION`; textarea conserva contenido; botón se reactiva (AC-REP-FE-11, AC-REP-FE-12, AC-REP-FE-19)

10. **Given** la API responde `403` (`EMAIL_NOT_VERIFIED`)
    **When** llega el error
    **Then** el `authErrorInterceptor` gestiona globalmente la redirección a `/verificacion-pendiente`; el componente NO muestra error inline (AC-REP-FE-20)

11. **Given** el modal abierto
    **When** el usuario navega con teclado
    **Then** el foco queda confinado al modal (focus trap Tab/Shift+Tab); ESC cierra el modal y emite `closed`; `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apuntando al id del título del paso activo (AC-REP-FE-17)

## Tasks / Subtasks

### A. ReportService (AC: 1)

- [x] Crear `src/app/core/services/report.service.ts`:
  - [x] Exportar `interface ReportContext { entityType: 'item' | 'user'; entityId: string; entityDisplayName: string; }`
  - [x] Exportar `type ReportReason = CreateReportRequest['reason']` (extraer del tipo generado, no definir manualmente)
  - [x] Inyectar `ReportsService` (generado) con `inject(ReportsService)` — NO usar constructor injection
  - [x] Implementar `submit(context, reason, description, recaptchaToken): Observable<CreateReportResponse>` usando `from(this.reportsApi.reportsPost({ body: { ... } }))` (ver Dev Notes §CRÍTICO-1)
  - [x] Mapear `description: description ?? undefined` (convertir `null` a `undefined` para el modelo generado)

### B. ReportModalComponent — scaffolding (AC: 2, 11)

- [x] Crear carpeta `src/app/shared/components/report-modal/`
- [x] Crear `report-modal.component.ts` con:
  - [x] `ChangeDetectionStrategy.OnPush`
  - [x] `context = input.required<ReportContext>()`; `closed = output<void>()`; `submitted = output<void>()`
  - [x] Inyecciones: `reportService`, `recaptchaService`; `ElementRef` para focus trap
  - [x] Estado interno: `step = signal<'STEP_1_REASON' | 'STEP_2_DESCRIPTION' | 'SUBMITTING' | 'STEP_3_CONFIRMATION'>('STEP_1_REASON')`
  - [x] `selectedReason = signal<ReportReason | null>(null)`
  - [x] `description = signal('')`
  - [x] `errorKey = signal<string | null>(null)`
  - [x] `charCount = computed(() => this.description().length)`
  - [x] `isSubmitting = computed(() => this.step() === 'SUBMITTING')`
  - [x] Host bindings: `'(document:keydown.escape)': 'onEscape($event)'`

- [x] Crear `report-modal.component.html` con estructura de 3 pasos (ver Dev Notes §Estructura-HTML)
- [x] Crear `report-modal.component.scss` (ver Dev Notes §Estilos)

### C. Lógica de navegación y submit (AC: 3, 4, 6, 7, 8, 9, 10)

- [x] Implementar `onSelectReason(reason: ReportReason)`: actualiza `selectedReason`, limpia `errorKey`
- [x] Implementar `onNext()`: si `selectedReason() !== null` → `step.set('STEP_2_DESCRIPTION')`
- [x] Implementar `onBack()`: `step.set('STEP_1_REASON')` (mantiene `selectedReason`)
- [x] Implementar `onDescriptionInput(event: Event)`: lee `event.target.value` y aplica `slice(0, 500)`
- [x] Implementar `onSubmit()` con `from(recaptchaService.execute('report')).pipe(switchMap(...))`
- [x] Implementar `handleError(err: HttpErrorResponse)`: tabla de 7 códigos
- [x] Implementar `onClose()`: `this.closed.emit()` (desde pasos 1 y 2)
- [x] Implementar `onCloseFinal()`: `this.submitted.emit()` (desde paso 3)
- [x] Implementar `onEscape(event: Event)`: if `isSubmitting()` → nada; else → `event.preventDefault(); this.closed.emit()`
- [x] Implementar focus trap Tab/Shift+Tab igual que `item-cancel-dialog` (ver Dev Notes §Focus-Trap)
- [x] Implementar lock/unlock body scroll con `afterNextRender()` y `destroyRef.onDestroy()`

### D. i18n — añadir claves a los 3 archivos JSON (AC: 2, 3, 6, 7, 8)

- [x] Añadir bloque `"reports"` en `public/i18n/es.json` (ver Dev Notes §i18n-Keys)
- [x] Añadir bloque `"reports"` en `public/i18n/ca.json` (traducción al catalán)
- [x] Añadir bloque `"reports"` en `public/i18n/en.json` (traducción al inglés)

### E. Verificación final

- [x] `npm run build` sin errores nuevos (warnings de presupuesto CSS preexistentes son aceptables)
- [x] Confirmar que NO se modificaron `ItemCardComponent`, `ItemDetailComponent` ni `UserProfilePublicComponent` (scope de 12-f3)
- [x] Confirmar que `ReportModalComponent` es standalone y exportable desde `shared/components/`
- [x] File List y Completion Notes completados

## Dev Notes

### ⚠️ CRÍTICO-1: Ambos servicios devuelven Promise, NO Observable

**Esto es lo más importante de esta historia. Los tipos en el PRD son incorrectos respecto a la implementación real.**

| Servicio | Tipo real del retorno | Lo que debes hacer |
|---|---|---|
| `ReportsService.reportsPost()` | `Promise<CreateReportResponse>` | Envolver con `from()` |
| `RecaptchaService.execute()` | `Promise<string>` | Envolver con `from()` |

**`ReportService.submit()` correcto:**
```typescript
import { from, Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { ReportsService } from '../api/generated/services/reports.service';
import type { CreateReportRequest, CreateReportResponse } from '../api/generated/models';

export interface ReportContext {
  entityType: 'item' | 'user';
  entityId: string;
  entityDisplayName: string;
}

export type ReportReason = CreateReportRequest['reason'];

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly reportsApi = inject(ReportsService);

  submit(
    context: ReportContext,
    reason: ReportReason,
    description: string | null,
    recaptchaToken: string
  ): Observable<CreateReportResponse> {
    return from(
      this.reportsApi.reportsPost({
        body: {
          reportedEntityType: context.entityType,
          reportedEntityId: context.entityId,
          reason,
          description: description ?? undefined,
          recaptchaToken,
        },
      })
    );
  }
}
```

**Submit en `ReportModalComponent` correcto:**
```typescript
// Ambos usan from() para convertir Promise → Observable
from(this.recaptchaService.execute('report')).pipe(
  switchMap(token =>
    this.reportService.submit(
      this.context(), this.selectedReason()!, this.description() || null, token
    )
  )
).subscribe({
  next: () => this.step.set('STEP_3_CONFIRMATION'),
  error: (err: HttpErrorResponse) => this.handleError(err)
});
```

### ⚠️ CRÍTICO-2: SessionService — no hay `currentUser`, el signal es `user`

El PRD y la arquitectura dicen `sessionService.currentUser`, pero **la propiedad real es `sessionService.user` (Signal)**.

```typescript
// ❌ INCORRECTO — no existe
sessionService.currentUser?.emailVerified

// ✅ CORRECTO — en un computed() o template
sessionService.user()?.emailVerified === true
sessionService.user()?.id
```

Este detalle es relevante para 12-f3, no para el modal en sí (el modal recibe el contexto ya construido). Pero si el dev crea un getter `canReport` dentro del modal, debe usar `sessionService.user()`.

### ⚠️ CRÍTICO-3: `ReportReason` no se exporta como tipo nombrado del cliente generado

El generado `create-report-request.ts` define `reason` como union literal inline, sin exportar `ReportReason`:
```typescript
// Lo que existe en generated/models/create-report-request.ts:
export interface CreateReportRequest {
  reason: 'contenido_inadecuado' | 'fraude_o_enganio' | 'spam' | ...;
}
// ⚠️ 'fraude_o_enganio' SIN ñ — valor exacto del spec (diferente del PRD)
```

**Definir el alias en `report.service.ts`:**
```typescript
export type ReportReason = CreateReportRequest['reason'];
```
Importar este tipo en el componente, no duplicar la union literal.

### Gestión de errores — tabla completa

```typescript
handleError(err: HttpErrorResponse): void {
  this.step.set('STEP_2_DESCRIPTION'); // volver al paso 2
  const code = (err.error as { code?: string })?.code;
  
  if (code === 'REPORT_ALREADY_PENDING')     { this.errorKey.set('reports.error.already_pending'); return; }
  if (code === 'SELF_REPORT_FORBIDDEN')      {
    console.error('SELF_REPORT_FORBIDDEN: el trigger no debería haberse mostrado');
    this.closed.emit(); // cerrar silenciosamente
    return;
  }
  if (code === 'ENTITY_NOT_REPORTABLE')      { this.errorKey.set('reports.error.not_reportable'); return; }
  if (code === 'RECAPTCHA_FAILED')           { this.errorKey.set('reports.error.recaptcha_failed'); return; }
  if (code === 'RATE_LIMIT_ENTITY_EXCEEDED') { this.errorKey.set('reports.error.rate_limit_entity'); return; }
  if (code === 'RATE_LIMIT_TOTAL_EXCEEDED')  { this.errorKey.set('reports.error.rate_limit_total'); return; }
  if (code === 'VALIDATION_ERROR')           { this.errorKey.set('reports.error.generic'); return; }
  // fallback: 5xx o red
  this.errorKey.set('reports.error.generic');
}
```

**El 403 NO llega aquí** — el `authErrorInterceptor` lo intercepta globalmente antes. El handler no necesita caso especial para 403.

### Estructura HTML — patrón a seguir

Basado en `item-cancel-dialog` (el patrón más cercano al centrado puro del proyecto):

```html
<!-- Backdrop + panel, igual que item-cancel-dialog -->
<div class="report-modal__backdrop"
     role="presentation"
     (click)="onBackdropClick()">
  <div class="report-modal__panel"
       role="dialog"
       aria-modal="true"
       [attr.aria-labelledby]="currentTitleId()"
       tabindex="-1"
       (click)="$event.stopPropagation()"
       (keydown)="onPanelKeydown($event)"
       *transloco="let t">

    <!-- Header común: título + botón ✕ -->
    <div class="report-modal__header">
      @switch (step()) {
        @case ('STEP_1_REASON') {
          <h2 [id]="'report-modal-title-step1'" class="report-modal__title">
            {{ context().entityType === 'item' ? t('reports.modal.title_item') : t('reports.modal.title_user') }}
          </h2>
          <p class="report-modal__subtitle">{{ context().entityDisplayName }}</p>
        }
        @case ('STEP_2_DESCRIPTION') {
          <h2 [id]="'report-modal-title-step2'" class="report-modal__title">
            {{ t('reports.modal.step2.title') }}
          </h2>
        }
        @case ('STEP_3_CONFIRMATION') {
          <!-- Paso 3 sin título en header -->
        }
      }
      @if (step() !== 'STEP_3_CONFIRMATION') {
        <button class="report-modal__close"
                [disabled]="isSubmitting()"
                (click)="onClose()"
                [attr.aria-label]="t('reports.modal.btn.close')">✕</button>
      }
    </div>

    <!-- Paso 1: selección de motivo -->
    @if (step() === 'STEP_1_REASON') { ... }

    <!-- Paso 2: descripción + submit -->
    @if (step() === 'STEP_2_DESCRIPTION' || step() === 'SUBMITTING') { ... }

    <!-- Paso 3: confirmación -->
    @if (step() === 'STEP_3_CONFIRMATION') { ... }

  </div>
</div>
```

`currentTitleId()` computed:
```typescript
readonly currentTitleId = computed(() => {
  if (this.step() === 'STEP_1_REASON') return 'report-modal-title-step1';
  if (this.step() === 'STEP_2_DESCRIPTION' || this.step() === 'SUBMITTING') return 'report-modal-title-step2';
  return 'report-modal-title-step1'; // fallback paso 3
});
```

### Focus Trap — copiar patrón de item-cancel-dialog

```typescript
private static readonly FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

onPanelKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;
  const panel = this.elementRef.nativeElement.querySelector('.report-modal__panel');
  const focusable = Array.from(panel?.querySelectorAll(ReportModalComponent.FOCUSABLE_SELECTOR) ?? [])
    .filter((el): el is HTMLElement => el instanceof HTMLElement);
  if (!focusable.length) return;
  const first = focusable[0], last = focusable[focusable.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && active === first) { event.preventDefault(); last.focus(); return; }
  if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); return; }
}
```

### Estilos — tokens del design system

- Copiar estructura de `item-cancel-dialog.component.scss` como base
- `z-index: 500` (igual que dialogs centrados del proyecto)
- Backdrop: `rgba(20, 23, 26, 0.45)`
- Panel: `max-width: 520px`, `border-radius: var(--radius-lg)` o equivalente del sistema, `padding: 28px 26px`
- Fondo error zone: color de error suave del sistema con borde izquierdo 3px en color error
- Modal responsive: `≤ 768px` → `width: calc(100% - 32px)`, centrado o bottom sheet si el sistema lo permite
- Leer `docs/project/colors_and_type.css` para tokens exactos antes de escribir SCSS
- **Prohibido:** colores hardcodeados, introducir valores fuera del design system

### i18n Keys — añadir a los 3 archivos JSON

Añadir en la raíz del JSON de cada idioma (no anidar bajo otro dominio existente):

```json
"reports": {
  "modal": {
    "title_item": "Reportar objeto",
    "title_user": "Reportar usuario",
    "step1": {
      "instruction": "¿Qué tipo de problema quieres reportar?"
    },
    "step2": {
      "title": "Añade contexto (opcional)",
      "reason_label": "Motivo seleccionado",
      "reason_change": "Cambiar",
      "textarea_label": "Descripción adicional",
      "textarea_optional": "opcional",
      "textarea_placeholder": "Añade cualquier detalle que pueda ayudar en la revisión.",
      "privacy_note": "Tu identidad no será revelada al usuario reportado."
    },
    "step3": {
      "title": "Reporte enviado",
      "body": "Hemos recibido tu reporte. Lo revisaremos lo antes posible y te confirmaremos por email cuando hayamos tomado una decisión."
    },
    "btn": {
      "next": "Siguiente",
      "back": "Atrás",
      "cancel": "Cancelar",
      "submit": "Enviar reporte",
      "submitting": "Enviando...",
      "close": "Cerrar"
    },
    "reasons": {
      "contenido_inadecuado": "Contenido inadecuado u ofensivo",
      "contenido_inadecuado_sub": "Imágenes o texto que no son apropiados",
      "fraude_o_enganio": "Fraude o engaño",
      "fraude_o_enganio_sub": "El objeto no existe, está en mal estado real, etc.",
      "spam": "Spam o publicidad",
      "spam_sub": "Publicación con fines comerciales",
      "objeto_ilegal": "Objeto ilegal",
      "objeto_ilegal_sub": "Producto prohibido o de venta ilegal",
      "objeto_peligroso": "Objeto peligroso",
      "objeto_peligroso_sub": "Puede causar daños físicos",
      "información_falsa": "Información falsa o engañosa",
      "información_falsa_sub": "Datos incorrectos sobre el objeto o el usuario",
      "comportamiento_abusivo": "Comportamiento abusivo",
      "comportamiento_abusivo_sub": "Mensajes, acoso u hostigamiento",
      "otro": "Otro motivo"
    }
  },
  "error": {
    "already_pending": "Ya tienes un reporte pendiente de revisión sobre este contenido.",
    "not_reportable": "Este contenido no puede ser reportado en este momento.",
    "recaptcha_failed": "No hemos podido verificar tu solicitud. Inténtalo de nuevo.",
    "rate_limit_entity": "Has enviado demasiados reportes sobre este contenido recientemente. Inténtalo más tarde.",
    "rate_limit_total": "Has alcanzado el límite de reportes permitidos. Inténtalo de nuevo en unos días.",
    "generic": "Ha ocurrido un error inesperado. Inténtalo de nuevo en unos instantes."
  }
}
```

**IMPORTANTE:** La clave enum de i18n usa `fraude_o_enganio` (SIN ñ) porque es el valor exacto del modelo generado. El display label en `reasons.fraude_o_enganio` sí puede mostrar "Fraude o engaño" con ñ.

**Catalán y Inglés:** proporcionar traducciones completas equivalentes a las del español.

### Archivos a crear

| Fichero | Tipo | Notas |
|---|---|---|
| `src/app/core/services/report.service.ts` | Nuevo | Exporta `ReportContext`, `ReportReason`, `ReportService` |
| `src/app/shared/components/report-modal/report-modal.component.ts` | Nuevo | Componente standalone, OnPush, signals |
| `src/app/shared/components/report-modal/report-modal.component.html` | Nuevo | Template con 3 pasos |
| `src/app/shared/components/report-modal/report-modal.component.scss` | Nuevo | Estilos basados en design system |
| `public/i18n/es.json` | Modificar | Añadir bloque `reports` |
| `public/i18n/ca.json` | Modificar | Añadir bloque `reports` |
| `public/i18n/en.json` | Modificar | Añadir bloque `reports` |

### Archivos a NO tocar en esta historia

- ❌ `ItemCardComponent` — scope de **12-f3**
- ❌ `ItemDetailComponent` — scope de **12-f3**
- ❌ `UserProfilePublicComponent` — scope de **12-f3**
- ❌ Cualquier fichero en `core/api/generated/` — regenerado, no editar manualmente
- ❌ `docs/architecture.md` — ya actualizado en 12-f1

### Imports necesarios en ReportModalComponent

```typescript
import {
  afterNextRender, ChangeDetectionStrategy, Component, computed,
  DestroyRef, ElementRef, inject, input, output, signal
} from '@angular/core';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslocoModule } from '@jsverse/transloco';
import { RecaptchaService } from '../../core/services/recaptcha.service';
import { ReportService, ReportContext, ReportReason } from '../../core/services/report.service';
```

> **Sin `@angular/cdk`** — el proyecto no tiene CDK como dependencia. Implementar focus trap manualmente (patrón ya establecido en `item-cancel-dialog`).

### Patrón item-cancel-dialog — qué reusar

Referencia directa: `src/app/shared/components/item-cancel-dialog/`

| Patrón | Reusar exactamente |
|---|---|
| Lock/unlock body scroll | Copiar `lockBodyScroll()` / `unlockBodyScroll()` con `destroyRef.onDestroy()` |
| Focus trap Tab/Shift+Tab | Copiar `onPanelKeydown()` con `FOCUSABLE_SELECTOR` |
| Backdrop click | `(click)="onBackdropClick()"` en el div backdrop |
| ESC key | `host: { '(document:keydown.escape)': 'onEscape($event)' }` |
| ARIA structure | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| `afterNextRender` para focus | `afterNextRender(() => { if (this.open()) { this.lockBodyScroll(); this.focusPanel(); } })` |

### Inteligencia de historia anterior (12-f1)

- Build exit 0 tras 12-f1 — no hay errores TS acumulados
- `ReportsService` ya generado en `src/app/core/api/generated/services/reports.service.ts` ✅
- `CreateReportRequest` ya generado ✅ — `body` del parámetro en `reportsPost()` es opcional en el tipo `ReportsPost$Params`, pero de facto debe enviarse siempre
- 7 servicios Admin generados junto con ReportsService — no documentarlos ni usarlos aquí
- Warning CSS presupuesto preexistente en varios componentes — no relacionado con esta historia

### Architecture compliance

| Regla | Fuente |
|---|---|
| `ReportService` en `core/services/` | `docs/architecture.md` v1.7 §6 |
| `ReportModalComponent` en `shared/components/report-modal/` | `docs/architecture.md` v1.7 §6 |
| `SessionService` para auth, NO `AuthService` | PRD-REP-FE-01 §5 y §11 |
| `sessionService.user()` (signal), no `currentUser` | Implementación real de `SessionService` |
| Cliente generado para la llamada API | `docs/api-client.md` |
| Tokens design system | `docs/project/colors_and_type.css` + `DESIGN-REP-01.md` |
| i18n obligatorio para toda cadena visible | `project-context.md` §i18n |
| No `ngClass` / `ngStyle` | CLAUDE.md |
| `input()` / `output()` functions (no decorators) | CLAUDE.md |
| `ChangeDetectionStrategy.OnPush` | CLAUDE.md |
| No `standalone: true` explícito en decorator | CLAUDE.md (default en Angular v20+) |

### Testing requirements

- `ReportService` spec: test unitario con `reportsApi` mockeado — verificar cuerpo del request (AC-REP-FE-16)
- `ReportModalComponent` spec: tests de los ACs principales (AC-REP-FE-06, AC-REP-FE-07, AC-REP-FE-08, AC-REP-FE-09, AC-REP-FE-10, AC-REP-FE-11, AC-REP-FE-12, AC-REP-FE-13, AC-REP-FE-15, AC-REP-FE-19)
- Para mock reCAPTCHA en tests: `RecaptchaService.execute()` devuelve Promise → mockear con `jest.fn().mockResolvedValue('mock-token')`
- Para mock API: mockear `ReportService.submit()` devolviendo `of({id: 'uuid', message: 'ok'})`
- Usar `TranslocoTestingModule.forRoot({ langs: { es: esJson, ca: caJson, en: enJson } })` — no loader real

### Referencias obligatorias

- [Source: docs/PRD-REP-FE-01.md] — especificación completa (§3 modal, §4 ReportService, §6 reCAPTCHA, §7 errores, §9 AC)
- [Source: docs/DESIGN-REP-01.md] — brief visual (§5 modal 3 pasos, §6 errores, §7 responsive, §8 accesibilidad)
- [Source: docs/architecture.md v1.7] — §6 reglas de presentación canReport, ubicación de componentes
- [Source: src/app/core/services/session.service.ts] — API real: `isAuthenticated()`, `user` signal (NO currentUser)
- [Source: src/app/core/services/recaptcha.service.ts] — `execute()` devuelve `Promise<string>`
- [Source: src/app/core/api/generated/services/reports.service.ts] — `reportsPost()` devuelve `Promise<CreateReportResponse>`
- [Source: src/app/core/api/generated/models/create-report-request.ts] — `reason` union literal sin tipo nombrado separado
- [Source: src/app/shared/components/item-cancel-dialog/] — patrón modal centrado con focus trap (reusar)
- [Source: docs/project/colors_and_type.css] — tokens visuales obligatorios
- [Source: public/i18n/es.json] — estructura de claves i18n existente

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- **TS2307 import path**: `../../core/services/recaptcha.service` → `../../../core/services/recaptcha.service` (componente está 3 niveles abajo, no 2)
- **Vitest done callback**: `it('test', (done) => { done() })` falla en Vitest — reescribir con `async/await` + `firstValueFrom()`
- **TS2445 protected**: métodos marcados `protected` no son accesibles desde los specs — eliminar el modificador de todos los event handlers y signals
- **TS2345 onEscape host binding**: `'(document:keydown.escape)': 'onEscape($event)'` pasa `Event` al método tipado como `KeyboardEvent`; el parámetro no se usa → eliminar firma y actualizar host binding a `'onEscape()'`

### Completion Notes List

- Todos los ACs implementados y verificados con tests (4 en report.service.spec.ts, 17 en report-modal.component.spec.ts)
- Build de producción limpio (exit 0); los 15 fallos en la suite completa son pre-existentes en `login`, `register` y `perfil` — sin relación con esta historia
- `REASON_OPTIONS` tiene 8 motivos incluyendo 7 con sublabel y `otro` sin sublabel; valor `fraude_o_enganio` (sin ñ) alineado con el modelo generado
- `handleError` gestiona 6 códigos de error específicos + fallback genérico; el 403 es interceptado globalmente antes de llegar al handler
- Responsive: ≤768px → bottom sheet (align-items: flex-end, border-radius solo en top)
- `SELF_REPORT_FORBIDDEN` cierra el modal silenciosamente con log de error (el trigger no debería haberse mostrado)

### File List

- `src/app/core/services/report.service.ts` (nuevo)
- `src/app/core/services/report.service.spec.ts` (nuevo)
- `src/app/shared/components/report-modal/report-modal.component.ts` (nuevo)
- `src/app/shared/components/report-modal/report-modal.component.html` (nuevo)
- `src/app/shared/components/report-modal/report-modal.component.scss` (nuevo)
- `src/app/shared/components/report-modal/report-modal.component.spec.ts` (nuevo)
- `public/i18n/es.json` (modificado — bloque `reports` añadido)
- `public/i18n/ca.json` (modificado — bloque `reports` añadido)
- `public/i18n/en.json` (modificado — bloque `reports` añadido)

### Review Findings

#### 🔴 Accesibilidad / AC-11 (bloqueantes)

- [x] [Review][Patch] Foco inicial en el panel (.tabindex=-1) en lugar del primer elemento interactivo del paso activo — viola AC-11 y DESIGN-REP-01 §8 [`report-modal.component.ts:86`]
- [x] [Review][Patch] Sin navegación ArrowDown/ArrowUp en el listbox de motivos — viola AC-11, WCAG 2.1.1 y DESIGN-REP-01 §8 [`report-modal.component.html:66-84`]
- [x] [Review][Patch] Botón de cierre (✕) oculto en el Paso 3 — DESIGN-REP-01 §5.3 y prototipo indican que debe permanecer visible [`report-modal.component.html:48`]

#### 🟠 Ciclo de vida / correctitud

- [x] [Review][Patch] Suscripción en onSubmit() sin takeUntilDestroyed — memory leak y signal writes post-destroy [`report-modal.component.ts:121`]
- [x] [Review][Patch] onSubmit() no tiene guard contra doble-submit programático (solo el template lo deshabilita) [`report-modal.component.ts:114`]
- [x] [Review][Patch] Error de reCAPTCHA no es HttpErrorResponse — handleError() falla silenciosamente si execute() rechaza con Error nativo [`report-modal.component.ts:134`]

#### 🟡 Fidelidad al diseño — iconos

- [x] [Review][Patch] Botón de cierre: debe ser circular (border-radius:50%), 30×30px, fondo --bg-subtle, con IXCircle SVG en lugar de texto ✕ [`report-modal.component.scss:57-80`, `.html:49-57`]
- [x] [Review][Patch] Icono de confirmación (Paso 3): texto ✓ en lugar de ICheckCircle SVG; debe usar colores success (--color-success-50 / --color-success-500) no primary [`report-modal.component.html:187`, `.scss:297-308`]
- [x] [Review][Patch] Icono de error: texto ⚠ en lugar de IAlertTriangle SVG [`report-modal.component.html:153`]
- [x] [Review][Patch] Botón "Atrás" (Paso 2): falta IChevronLeft SVG antes del texto [`report-modal.component.html:160-167`]

#### 🟡 Fidelidad al diseño — estilos

- [x] [Review][Patch] Motivos (no seleccionados): fondo --bg-surface (blanco) en lugar de --bg-page (#F4F5F6) [`report-modal.component.scss:130`]
- [x] [Review][Patch] Footers de Paso 1 y Paso 2 sin border-top separator (1px solid --border-default) [`report-modal.component.scss:328-334`]
- [x] [Review][Patch] "Cancelar" (Paso 1) y "Atrás" (Paso 2): usan estilo ghost con borde; el diseño los define como botones de texto sin borde [`report-modal.component.scss:369-377`]
- [x] [Review][Patch] Etiqueta "Motivo seleccionado": falta text-transform:uppercase y letter-spacing:0.07em [`report-modal.component.scss:176-181`]
- [x] [Review][Patch] Contador de caracteres: debe posicionarse absoluto dentro del div del textarea (bottom:8px, right:10px), no como elemento de bloque debajo [`report-modal.component.scss:256-266`]
- [x] [Review][Patch] Contador de caracteres — color de advertencia: usa --color-error-500 (rojo) en lugar de --color-warning-700 (ámbar) [`report-modal.component.scss:262`]
- [x] [Review][Patch] Contador de caracteres — fuente: usa --font-body en lugar de --font-mono (JetBrains Mono) [`report-modal.component.scss:258`]
- [x] [Review][Patch] Botón "Cambiar": usa var(--fg-link) con fallback a primary-600; debe ser --color-primary-500 directamente [`report-modal.component.scss:197`]

#### 🟡 Calidad de código

- [x] [Review][Patch] Múltiples directivas *transloco="let t" anidadas bajo el panel que ya las declara — suscripciones redundantes [`report-modal.component.html:63, 87, 108, 159, 186, 192`]
- [x] [Review][Patch] onEscape() duplica la guarda de onClose() — debe delegar a this.onClose() [`report-modal.component.ts:208`]
- [x] [Review][Patch] onEscape(): parámetro tipado como Event en lugar de KeyboardEvent [`report-modal.component.ts:208`]
- [x] [Review][Patch] aria-labelledby en el Paso 3 apunta a <span sr-only> en lugar del <h2> visible en el body [`report-modal.component.html:42-44`, `report-modal.component.ts:75`]

#### ✅ Diferidos (pre-existentes o decisiones de diseño)

- [x] [Review][Defer] handleError() es público — intencional según Dev Agent Record (specs necesitan acceso) [`report-modal.component.ts:138`] — deferred, pre-existing
- [x] [Review][Defer] description signal no se limpia al retroceder al Paso 1 — decisión de UX (preservar el trabajo del usuario) [`report-modal.component.ts:104`] — deferred, pre-existing
- [x] [Review][Defer] Race condition en lockBodyScroll ante apertura/cierre rápido — patrón idéntico al pre-existente en item-cancel-dialog [`report-modal.component.ts:221`] — deferred, pre-existing

### Review Findings v2 (2026-06-13)

#### 🩹 Patch (11 — aplicados)

- [x] [Review][Patch] Transiciones de paso sin re-focus [report-modal.component.ts:99-108] — resuelto con `setTimeout(() => this.focusFirstInteractive())` en `onNext()`, `onBack()`, `handleError()`
- [x] [Review][Patch] Error de reCAPTCHA no-HttpErrorResponse cae a genérico [report-modal.component.ts:141] — handleError ahora detecta `!(err instanceof HttpErrorResponse)` y muestra mensaje específico de reCAPTCHA
- [x] [Review][Patch] console.error en SELF_REPORT_FORBIDDEN [report-modal.component.ts:152] — cambiado a `console.warn`
- [x] [Review][Patch] SELF_REPORT_FORBIDDEN flicker [report-modal.component.ts:142-154] — emit `closed` antes de cualquier `step.set()`, eliminando el render fugaz
- [x] [Review][Patch] Focus trap permite Tab fuera del panel [report-modal.component.ts:192-211] — añadida detección de `!panel?.contains(active)` para redirigir al primer foco
- [x] [Review][Patch] Scroll: panel completo vs solo body [report-modal.component.scss:15-18] — panel `overflow: hidden`, body `overflow-y: auto`
- [x] [Review][Patch] Header title font-size 20px vs 18px prototipo [report-modal.component.scss:45] — cambiado a 18px
- [x] [Review][Patch] Panel max-width 520px vs 500px prototipo [report-modal.component.scss:14] — cambiado a 500px
- [x] [Review][Patch] "Cambiar" oculto vs deshabilitado [report-modal.component.html:114] — ahora usa `[disabled]="isSubmitting()"` con estilo opacity
- [x] [Review][Patch] Botones CTA padding-x 20px vs 24px prototipo [report-modal.component.scss:367] — cambiado a `24px`
- [x] [Review][Patch] Botón "Cerrar" paso 3 padding-x 20px vs 32px prototipo — añadido override en `--ghost` dentro de `footer--centered`

#### ⏭️ Defer (4)

- [x] [Review][Defer] Scroll lock no soporta modales anidados [`report-modal.component.ts:237`] — deferred, pre-existing (mismo patrón que item-cancel-dialog)
- [x] [Review][Defer] handleError público [`report-modal.component.ts:141`] — deferred, intencional para testing
- [x] [Review][Defer] Componente destruido con HTTP en vuelo [`report-modal.component.ts:123`] — deferred, comportamiento normal con takeUntilDestroyed
- [x] [Review][Defer] Elementos DOM reCAPTCHA no se limpian al destroy — deferred, pre-existing en RecaptchaService

#### 👻 Dismissed (10)

- RxJS pipeline roto — false positive (código real `from().pipe().subscribe()` es correcto)
- Botón X en paso 3 emite `closed` vs `submitted` — coincide con prototipo
- Sin `aria-describedby` — mejora opcional no requerida por ACs
- `text-overflow` en reason-sublabel — especulativo
- Re-render en transiciones @if/@switch — comportamiento esperado
- `onReasonItemKeydown` con lista vacía — manejado con guard
- Animaciones de step — no especificadas en ACs
- Subtitle 13px vs 12.5px — 1px, aceptable
- Spinner 700ms vs 720ms — 20ms, negligible
- Hover color tokens — correcto (usa tokens del DS)
