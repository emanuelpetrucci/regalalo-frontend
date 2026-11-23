---
baseline_commit: 83a48dcf3a011efca8bfbe6aab72a6ee4326ac0d
---

# Story 12.f3: Integración en puntos de entrada (ItemCard, ItemDetail, UserProfile)

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed. Épica 12-f Sistema de Reportes — historia de integración; conecta ReportModalComponent ya implementado en 12-f2 con los 3 puntos de entrada de la app. -->

## Story

Como usuario autenticado con email verificado,
quiero poder iniciar un reporte desde la tarjeta de objeto, el detalle del objeto y el perfil público de otro usuario,
para que el trigger esté disponible en los contextos relevantes de la app.

**FR:** FR-REP-F3 · **Épica:** 12-f (Sistema de Reportes)
**Referencia:** `docs/PRD-REP-FE-01.md` §5 · `docs/DESIGN-REP-01.md` §4

## Acceptance Criteria

1. **Given** `ItemFeedCardComponent` con menú contextual (⋮) nuevo
   **When** `session.isLoggedIn() && session.user()?.emailVerified === true`
   **Then** el botón ⋮ es visible en la esquina inferior derecha de la imagen; al pulsarlo aparece dropdown con opción "Reportar objeto" separada por divisor; al hacer clic abre `ReportModalComponent` con `{ entityType: 'item', entityId: item().id, entityDisplayName: item().title }` (AC-REP-FE-01, AC-REP-FE-02, AC-REP-FE-03)

2. **Given** `ItemFeedCardComponent` cuando la condición anterior no se cumple (no autenticado o emailVerified ≠ true)
   **When** se renderiza la tarjeta
   **Then** el botón ⋮ NO aparece; ningún trigger de reporte es visible

3. **Given** `ItemDetailPanelComponent` con el usuario cumpliendo la condición `canReport`
   **When** `!isDonor() && session.isLoggedIn() && session.user()?.emailVerified === true`
   **Then** aparece enlace discreto "Reportar este objeto" en zona inferior del detalle, fuera del área de acciones principales; al hacer clic abre `ReportModalComponent` con `{ entityType: 'item', entityId: item()!.id, entityDisplayName: item()!.title }` (AC-REP-FE-05)

4. **Given** `ItemDetailPanelComponent` con el usuario siendo donante o sin emailVerified
   **When** se renderiza el detalle
   **Then** el enlace "Reportar este objeto" NO aparece

5. **Given** `PerfilPublicoComponent` con usuario autenticado con emailVerified viendo el perfil de otro usuario
   **When** `session.isLoggedIn() && session.user()?.emailVerified === true && session.user()?.id !== userId()`
   **Then** aparece enlace "Reportar este usuario" al final del bloque de información pública; al hacer clic abre `ReportModalComponent` con `{ entityType: 'user', entityId: profile().id, entityDisplayName: displayName() }` (AC-REP-FE-04, AC-REP-FE-05)

6. **Given** `PerfilPublicoComponent` cuando el usuario ve su propio perfil, no está autenticado, o emailVerified ≠ true
   **When** se renderiza el perfil
   **Then** el enlace de reporte NO aparece

7. **Given** `ReportModalComponent` emite `submitted` en cualquiera de los tres contextos
   **When** el modal se cierra tras envío exitoso
   **Then** `reportModalOpen` se pone a `false`; el foco vuelve al elemento trigger que abrió el modal; no hay cambio de navegación

8. **Given** `ReportModalComponent` emite `closed` (cancelación sin envío)
   **When** el usuario descarta el modal
   **Then** `reportModalOpen` se pone a `false`; el foco vuelve al elemento trigger que abrió el modal

9. **Given** el menú contextual del card está abierto
   **When** el usuario hace clic fuera del dropdown
   **Then** el dropdown se cierra; no se abre el modal

## Tasks / Subtasks

### A. ItemFeedCardComponent — menú contextual + trigger (AC: 1, 2, 7, 8, 9)

- [x] **Inyectar `SessionService`** en `item-feed-card.component.ts` con `inject(SessionService)` (actualmente no existe)
- [x] Añadir signals/computed:
  - [x] `readonly canReport = computed(() => this.session.isLoggedIn() && this.session.user()?.emailVerified === true)`
  - [x] `readonly menuOpen = signal(false)`
  - [x] `readonly reportModalOpen = signal(false)`
  - [x] `private reportTriggerEl = signal<HTMLElement | null>(null)`
- [x] Añadir `ElementRef` (para restore focus) — `private readonly el = inject(ElementRef<HTMLElement>)`
- [x] Implementar métodos:
  - [x] `toggleMenu(event: Event): void` — `event.stopPropagation(); this.menuOpen.update(v => !v)`
  - [x] `closeMenu(): void` — `this.menuOpen.set(false)`
  - [x] `openReportModal(event: Event): void` — captura trigger element, cierra menu, abre modal
  - [x] `onReportClosed(): void` — `this.reportModalOpen.set(false)` + restore focus
  - [x] `onReportSubmitted(): void` — `this.reportModalOpen.set(false)` + restore focus
- [x] Añadir `host` binding: `'(keydown.escape)': 'closeMenu()'` (cierra menú con ESC sin conflicto con modal)
- [x] Actualizar template `item-feed-card.component.html` — ver Dev Notes §Estructura-Card
- [x] Actualizar SCSS `item-feed-card.component.scss` — ver Dev Notes §Estilos-Card
- [x] Añadir `ReportModalComponent` a los `imports` del componente

### B. ItemDetailPanelComponent — trigger en zona inferior (AC: 3, 4, 7, 8)

- [x] Añadir computed en `item-detail-panel.component.ts`:
  - [x] `readonly canReport = computed(() => !this.isDonor() && this.session.isLoggedIn() && this.session.user()?.emailVerified === true)`
- [x] Añadir signals:
  - [x] `readonly reportModalOpen = signal(false)`
  - [x] `private reportTriggerEl: HTMLElement | null = null`
- [x] Implementar métodos:
  - [x] `openReportModal(event: Event): void`
  - [x] `onReportClosed(): void`
  - [x] `onReportSubmitted(): void`
- [x] **Actualizar `onDocumentEscape`** — añadir guard: `if (this.reportModalOpen()) return;` al principio del método (evitar que el panel maneje ESC cuando el modal ya lo gestiona)
- [x] Actualizar template `item-detail-panel.component.html` — añadir trigger y modal (ver Dev Notes §Estructura-Detail)
- [x] Añadir `ReportModalComponent` a los `imports` del componente

### C. PerfilPublicoComponent — trigger al final del perfil (AC: 5, 6, 7, 8)

- [x] Añadir computed en `perfil-publico.component.ts`:
  - [x] `readonly canReport = computed(() => { const u = this.session.user(); return this.session.isLoggedIn() && u?.emailVerified === true && u?.id !== this.userId(); })`
- [x] Añadir signals:
  - [x] `readonly reportModalOpen = signal(false)`
  - [x] `private reportTriggerEl: HTMLElement | null = null`
- [x] Implementar métodos:
  - [x] `openReportModal(event: Event): void`
  - [x] `onReportClosed(): void`
  - [x] `onReportSubmitted(): void`
- [x] Actualizar template `perfil-publico.component.html` — añadir trigger y modal al final de `.perfil-publico__card` (ver Dev Notes §Estructura-Perfil)
- [x] Añadir `ReportModalComponent` a los `imports` del componente

### D. i18n — añadir claves trigger (AC: 1, 3, 5)

- [x] Añadir bloque `"trigger"` dentro del objeto `"reports"` en `public/i18n/es.json`
- [x] Añadir bloque `"trigger"` dentro del objeto `"reports"` en `public/i18n/ca.json`
- [x] Añadir bloque `"trigger"` dentro del objeto `"reports"` en `public/i18n/en.json`

### E. Verificación final

- [x] `npm run build` sin errores nuevos
- [x] Confirmar que `ReportModalComponent` se importa correctamente en los 3 componentes
- [x] Confirmar que el menú contextual del card NO propaga clicks a la tarjeta (no navega ni abre modal de detalle)
- [x] Confirmar que ESC en `ItemDetailPanel` cierra correctamente el modal de reporte (no la ventana subyacente)
- [x] File List y Completion Notes completados

## Dev Notes

### ⚠️ CRÍTICO-1: `ItemSummary` NO tiene `donorId` — self-report check imposible en el card

La épica y el PRD mencionan `item.donorId` en la condición `canReport` del card, **pero ese campo NO existe en `ItemSummary`**:

```typescript
// src/app/core/api/generated/models/item-summary.ts — campos reales:
export interface ItemSummary {
  category: ...; condition: ...; createdAt: ...; degradedAt: ...; 
  distanceMeters: ...; id: ...; images: ...; title: ...;
  // ❌ NO existe donorId
}
```

**Solución:** para `ItemFeedCardComponent`, la condición `canReport` solo verifica autenticación + emailVerified. El servidor rechaza self-reports con `SELF_REPORT_FORBIDDEN`, y el `handleError()` de `ReportModalComponent` ya maneja ese código emitiendo `closed` silenciosamente.

Para `ItemDetailPanelComponent` se puede reusar `isDonor()` (que compara `item()?.donor.id` con `session.user()?.id` usando `GetItemResponse.donor.id`).

### ⚠️ CRÍTICO-2: `SessionService` — API real vs. PRD

El PRD dice `sessionService.currentUser` y `sessionService.isAuthenticated()` pero la implementación real es:

| PRD / Épica | Implementación real en `session.service.ts` |
|---|---|
| `currentUser` (property) | `user` (Signal readonly: `session.user()`) |
| `isAuthenticated()` (method) | `isLoggedIn` (computed Signal: `session.isLoggedIn()`) |

**En `computed()`:** usar `session.isLoggedIn()` (Signal reactivo), NO `session.isAuthenticated()` (método con side-effects de clearToken). Patrón correcto:
```typescript
readonly canReport = computed(() =>
  this.session.isLoggedIn() && this.session.user()?.emailVerified === true
);
```

### ⚠️ CRÍTICO-3: El dropdown del card debe estar FUERA del `overflow: hidden`

`.feed-card` tiene `overflow: hidden` para respetar el `border-radius`. El dropdown del menú contextual debe estar **fuera** del elemento `.feed-card` (button/anchor) o será recortado.

**Solución probada (overlay twin):**

1. Añadir al `host` del componente: `'[style.position]': '"relative"'`, `'[style.display]': '"block"'`
2. Renderizar el overlay context menu como **sibling** del `.feed-card` en el template (DESPUÉS del button/anchor)
3. El overlay usa `position: absolute; top: 0; left: 0; right: 0; aspect-ratio: 4 / 3; pointer-events: none;` — esto lo alinea con el área de imagen
4. Dentro del overlay: botón ⋮ con `position: absolute; bottom: 8px; right: 8px; pointer-events: all;`
5. El dropdown usa `position: absolute; right: 0; top: calc(100% + 4px);` relativo al contenedor del botón — aparece DEBAJO del área de imagen, en el body del card; esto es `z-index: 500`

```css
/* En item-feed-card.component.scss, añadir: */
:host {
  display: block;
  position: relative;
}

.feed-card__ctx-overlay {
  position: absolute;
  top: 0; left: 0; right: 0;
  aspect-ratio: 4 / 3; /* coincide con feed-card__media */
  pointer-events: none;
  z-index: 5;
}

.feed-card__ctx-container {
  position: absolute;
  bottom: 8px; right: 8px;
  pointer-events: all;
}

.feed-card__ctx-btn {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(20, 23, 26, 0.5);
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  opacity: 0.5; transition: opacity 150ms;
  &:hover, &:focus-visible { opacity: 1; }
}

.feed-card__menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 499; /* por debajo del dropdown (500) pero encima del resto */
  background: transparent;
}

.feed-card__ctx-dropdown {
  position: absolute;
  right: 0; top: calc(100% + 4px);
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 10px;
  box-shadow: var(--shadow-2);
  z-index: 500;
  min-width: 170px;
  padding: 4px;
  overflow: hidden;
}

.feed-card__ctx-item {
  display: flex; align-items: center; gap: 8px;
  width: 100%; padding: 9px 12px;
  border: none; background: transparent; cursor: pointer;
  font-family: var(--font-body); font-size: 13px; font-weight: 400;
  color: var(--fg-secondary); border-radius: 6px;
  text-align: left; transition: background 100ms;
  white-space: nowrap;
  &:hover { background: var(--bg-subtle); }
}
```

### Estructura HTML — ItemFeedCard

```html
<!-- item-feed-card.component.html — estructura completa -->
<ng-container *transloco="let t">

  @if (openInModal()) {
    <button class="feed-card" [class.feed-card--degraded]="isDegraded()" (click)="onCardClick()">
      <ng-container *ngTemplateOutlet="cardBody; context: { t }" />
    </button>
  } @else {
    <a class="feed-card" [class.feed-card--degraded]="isDegraded()" [routerLink]="detailLink()">
      <ng-container *ngTemplateOutlet="cardBody; context: { t }" />
    </a>
  }

  <!-- Menú contextual — fuera del overflow:hidden del .feed-card -->
  @if (canReport()) {
    @if (menuOpen()) {
      <div class="feed-card__menu-backdrop" (click)="closeMenu()"></div>
    }
    <div class="feed-card__ctx-overlay" aria-hidden="true">
      <div class="feed-card__ctx-container">
        <button
          class="feed-card__ctx-btn"
          type="button"
          [attr.aria-label]="t('reports.trigger.menu_aria')"
          (click)="toggleMenu($event)"
        >
          <!-- ⋮ icono tres puntos verticales -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
          </svg>
        </button>
        @if (menuOpen()) {
          <div class="feed-card__ctx-dropdown" role="menu">
            <button
              class="feed-card__ctx-item"
              type="button"
              role="menuitem"
              (click)="openReportModal($event)"
            >
              <!-- flag icon -->
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
              {{ t('reports.trigger.report_item') }}
            </button>
          </div>
        }
      </div>
    </div>
  }

  @if (reportModalOpen()) {
    <app-report-modal
      [context]="{ entityType: 'item', entityId: item().id, entityDisplayName: item().title }"
      (closed)="onReportClosed()"
      (submitted)="onReportSubmitted()"
    />
  }

</ng-container>

<ng-template #cardBody let-t="t">
  <!-- contenido exactamente igual al actual — no modificar -->
</ng-template>
```

**⚠️ ATENCIÓN:** la `*transloco` debe moverse al `<ng-container>` raíz para que esté disponible también en el overlay. Actualmente está en el `<button>` y `<a>` (duplicada). Consolidarla en el wrapper.

### Estructura HTML — ItemDetailPanel

Añadir el trigger y el modal al template existente. El trigger va **fuera del `@if (cancelDialogOpen())` block**, en la zona inferior del detalle, TANTO en la vista page como en la modal:

⚠️ **UBICACIÓN EXACTA (per `Detalle de item.html` líneas 361-379):** el trigger va directamente después del bloque de controles (donor/receiver), con `marginTop: 20px`. El icono flag es obligatorio. El hover cambia a `--color-error-500`.

**Bloque de trigger reutilizable (mismo en page y en modal):**
```html
@if (canReport()) {
  <div class="item-detail-panel__report-trigger">
    <button
      type="button"
      class="item-detail-panel__report-link"
      (click)="openReportModal($event)"
      *transloco="let t"
    >
      <!-- flag icon — per prototipo Detalle de item.html -->
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="1.75"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
        <line x1="4" y1="22" x2="4" y2="15"/>
      </svg>
      {{ t('reports.trigger.report_item_full') }}
    </button>
  </div>
}
```

**En vista page** — al final del `item-detail-panel__section` de acciones, después del bloque `@if (isDonor()) { } @else { }`. Añadir el bloque anterior.

**En vista modal** — al final de `item-detail-panel__drawer-info`, después del bloque de CTA (`.item-detail-panel__cta`). Añadir el mismo bloque.

**Modal al final del bloque `@else if (item(); as detail)`**, antes del `@if (cancelDialogOpen())`:
```html
@if (reportModalOpen()) {
  <app-report-modal
    [context]="{ entityType: 'item', entityId: item()!.id, entityDisplayName: item()!.title }"
    (closed)="onReportClosed()"
    (submitted)="onReportSubmitted()"
  />
}
```

**SCSS (añadir al final de `item-detail-panel.component.scss`):**
```css
.item-detail-panel__report-trigger {
  margin-top: 20px;
}

.item-detail-panel__report-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 12.5px;
  color: var(--fg-muted);
  padding: 4px 0;
  transition: color 150ms;
  /* ⚠️ hover en error color — per prototipo Detalle de item.html */
  &:hover { color: var(--color-error-500); }
}
```

### Estructura HTML — PerfilPublico

⚠️ **UBICACIÓN EXACTA (per `Perfil público - Carlos Ruiz.html`):** el trigger va **DENTRO de `.perfil-publico__card`**, justo después del bloque de stats (`perfil-publico__stats`), NO después de `perfil-publico__privacy-note`. En el prototipo, el botón está dentro del `ProfileHeader` (que corresponde a `.perfil-publico__card`).

```html
<!-- DENTRO de <div class="perfil-publico__card">, al final antes del cierre -->
<div class="perfil-publico__stats" ...>...</div>

@if (canReport()) {
  <div class="perfil-publico__report-trigger">
    <button
      type="button"
      class="perfil-publico__report-link"
      (click)="openReportModal($event)"
      *transloco="let t"
    >
      <!-- flag icon — mismo SVG que en ItemDetail y card -->
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="1.75"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
        <line x1="4" y1="22" x2="4" y2="15"/>
      </svg>
      {{ t('reports.trigger.report_user') }}
    </button>
  </div>
}
<!-- cierre de perfil-publico__card -->
</div>

<!-- El modal va FUERA del card, en el nivel del @else if -->
@if (reportModalOpen()) {
  <app-report-modal
    [context]="{ entityType: 'user', entityId: profile()!.id, entityDisplayName: displayName() }"
    (closed)="onReportClosed()"
    (submitted)="onReportSubmitted()"
  />
}
```

**SCSS (añadir al final de `perfil-publico.component.scss`):**
```css
.perfil-publico__report-trigger {
  margin-top: 16px;
}

.perfil-publico__report-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 12.5px;
  color: var(--fg-muted);
  padding: 4px 0;
  transition: color 150ms;
  /* ⚠️ hover en error color — per prototipo Perfil público - Carlos Ruiz.html */
  &:hover { color: var(--color-error-500); }
}
```

### Patrón restore-focus (común a los 3 componentes)

```typescript
openReportModal(event: Event): void {
  this.reportTriggerEl = (event.currentTarget ?? event.target) as HTMLElement ?? null;
  this.reportModalOpen.set(true);
  // si menuOpen existe (solo en ItemFeedCard)
  // this.menuOpen.set(false);
}

onReportClosed(): void {
  this.reportModalOpen.set(false);
  this.reportTriggerEl?.focus();
  this.reportTriggerEl = null;
}

onReportSubmitted(): void {
  this.reportModalOpen.set(false);
  this.reportTriggerEl?.focus();
  this.reportTriggerEl = null;
}
```

### Guard ESC en ItemDetailPanel

```typescript
onDocumentEscape(event: Event): void {
  // ⚠️ NUEVO: si el modal de reporte está abierto, ReportModalComponent gestiona ESC
  if (this.reportModalOpen()) return;
  
  if (this.presentation() !== 'modal' || !(event instanceof KeyboardEvent)) { return; }
  // ... resto del método sin cambios
}
```

### i18n Keys — añadir dentro del objeto `"reports"` existente

```json
"trigger": {
  "report_item": "Reportar objeto",
  "report_item_full": "Reportar este objeto",
  "report_user": "Reportar este usuario",
  "menu_aria": "Opciones del objeto"
}
```

**Catalán (`ca.json`):**
```json
"trigger": {
  "report_item": "Denunciar objecte",
  "report_item_full": "Denunciar aquest objecte",
  "report_user": "Denunciar aquest usuari",
  "menu_aria": "Opcions de l'objecte"
}
```

**Inglés (`en.json`):**
```json
"trigger": {
  "report_item": "Report item",
  "report_item_full": "Report this item",
  "report_user": "Report this user",
  "menu_aria": "Item options"
}
```

**⚠️ IMPORTANTE:** añadir dentro del objeto `"reports"` existente (que ya contiene `"modal"` y `"error"`), NO como clave raíz separada.

### Architecture compliance

| Regla | Fuente |
|---|---|
| `ReportModalComponent` ya existe en `shared/components/report-modal/` | Implementado en 12-f2 |
| `SessionService.user()` (signal reactivo), no `currentUser` | `session.service.ts` línea 36 |
| `session.isLoggedIn` (computed Signal), no `isAuthenticated()` en computed | `session.service.ts` línea 29 |
| `isDonor()` en `ItemDetailPanel` — reusar, no reinventar | `item-detail-panel.component.ts` línea 179 |
| No `ngClass` / `ngStyle` | CLAUDE.md |
| `input()` / `output()` functions (no decorators) | CLAUDE.md |
| `ChangeDetectionStrategy.OnPush` | CLAUDE.md (ya está en los 3 componentes) |
| No `standalone: true` explícito en decorator | CLAUDE.md (Angular v20+) |
| Tokens design system de `colors_and_type.css` | project-context.md |
| i18n obligatorio para toda cadena visible | project-context.md §i18n |
| Overflow y z-index del dropdown — ver §CRÍTICO-3 | Análisis del prototipo `Explorar v3.html` |

### Archivos a modificar

| Fichero | Tipo | Cambios |
|---|---|---|
| `src/app/shared/components/item-feed-card/item-feed-card.component.ts` | Modificar | SessionService, canReport, menuOpen, reportModalOpen, métodos toggle/open/close |
| `src/app/shared/components/item-feed-card/item-feed-card.component.html` | Modificar | Overlay ctx-menu, modal condicional, mover *transloco al wrapper raíz |
| `src/app/shared/components/item-feed-card/item-feed-card.component.scss` | Modificar | Estilos overlay, botón ⋮, dropdown, backdrop |
| `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts` | Modificar | canReport, reportModalOpen, guard ESC, métodos open/close |
| `src/app/shared/components/item-detail-panel/item-detail-panel.component.html` | Modificar | Trigger "Reportar este objeto" en page y modal view, app-report-modal |
| `src/app/shared/components/item-detail-panel/item-detail-panel.component.scss` | Modificar | Estilos report-trigger y report-link |
| `src/app/features/profile/perfil-publico/perfil-publico.component.ts` | Modificar | canReport, reportModalOpen, métodos open/close |
| `src/app/features/profile/perfil-publico/perfil-publico.component.html` | Modificar | Trigger "Reportar este usuario" y app-report-modal |
| `src/app/features/profile/perfil-publico/perfil-publico.component.scss` | Modificar | Estilos report-trigger y report-link |
| `public/i18n/es.json` | Modificar | Añadir bloque `reports.trigger` dentro del objeto reports existente |
| `public/i18n/ca.json` | Modificar | Añadir bloque `reports.trigger` en catalán |
| `public/i18n/en.json` | Modificar | Añadir bloque `reports.trigger` en inglés |

### Archivos a NO tocar

- ❌ `src/app/shared/components/report-modal/` — implementado en 12-f2, no modificar
- ❌ `src/app/core/services/report.service.ts` — implementado en 12-f2, no modificar
- ❌ `src/app/core/api/generated/` — regenerado, no editar manualmente

### Inteligencia de historia anterior (12-f2)

- **`ReportModalComponent`** ya está en `src/app/shared/components/report-modal/`; es standalone y listo para importar
- **Importar:** `ReportModalComponent` desde `'../../shared/components/report-modal/report-modal.component'` (ajustar ruta según el componente padre)
- **`ReportContext`** se importa desde `'../../../core/services/report.service'`
- La dupla `closed` + `submitted` es clave: `closed` = canceló sin enviar, `submitted` = envió con éxito
- El modal gestiona `document:keydown.escape` — el componente padre NO debe volver a manejarlo cuando el modal esté abierto
- Warn `SELF_REPORT_FORBIDDEN` ya manejado en el modal (cierra silenciosamente) → no hace falta guard adicional en los padres

### Testing requirements

- `ItemFeedCardComponent` spec: comprobar que `canReport` es `false` cuando `isLoggedIn = false` o `emailVerified !== true`; verificar que el menú contextual no propaga el click
- `ItemDetailPanelComponent` spec: verificar que `canReport` es `false` cuando `isDonor() = true`
- `PerfilPublicoComponent` spec: verificar que `canReport` es `false` cuando `user().id === userId()`
- Usar `TranslocoTestingModule.forRoot({ langs: { es: esJson } })` para i18n en tests
- Mockear `SessionService.isLoggedIn` como computed signal con `signal(true)` wrapping

### Referencias obligatorias

- [Source: docs/PRD-REP-FE-01.md §5] — condiciones canReport y contexto de cada punto de entrada
- [Source: docs/DESIGN-REP-01.md §4] — especificación visual de los 3 triggers
- [Source: docs/project/Explorar v3.html líneas 578-624] — prototipo menú contextual del card (⋮ button, dropdown, z-index 500)
- [Source: docs/project/Detalle de item.html líneas 361-379] — prototipo trigger ItemDetail: `inline-flex`, `gap:7`, `fontSize:12.5`, `padding:4px 0`, hover=`C.error`, icono flag
- [Source: docs/project/Perfil público - Carlos Ruiz.html líneas 362-380] — prototipo trigger Perfil: mismos estilos que ItemDetail; ubicado DENTRO del card (después de stats), `marginTop:16`
- [Source: docs/project/colors_and_type.css línea 65] — `--color-error-500: #B33A2A` (color hover de triggers)
- [Source: src/app/shared/components/item-feed-card/item-feed-card.component.ts] — estado actual (sin SessionService)
- [Source: src/app/shared/components/item-detail-panel/item-detail-panel.component.ts línea 179] — isDonor() computed existente
- [Source: src/app/features/profile/perfil-publico/perfil-publico.component.ts] — estado actual (session inyectado, template muestra .perfil-publico__card con stats)
- [Source: src/app/core/services/session.service.ts líneas 29, 36] — isLoggedIn (computed Signal) y user (Signal readonly)
- [Source: src/app/core/api/generated/models/item-summary.ts] — confirma ausencia de donorId
- [Source: src/app/shared/components/report-modal/report-modal.component.ts] — API del modal (context, closed, submitted)
- [Source: src/app/core/services/report.service.ts] — ReportContext interface

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `ItemSummary` has no `donorId` — `canReport` in the card only checks auth+emailVerified; server rejects self-reports silently.
- `SessionService.isLoggedIn` is a computed Signal (not a method); used `session.isLoggedIn()` in all three `canReport` computeds.
- Feed-card dropdown uses "overlay twin" sibling pattern to escape `overflow: hidden` on `.feed-card`.
- `onDocumentEscape` in `ItemDetailPanel` guards with `if (this.reportModalOpen()) return;` so `ReportModalComponent`'s own ESC handler takes precedence.
- All three components restore focus to `reportTriggerEl` on both `closed` and `submitted` events.
- Pre-existing vitest environment failures (describe-not-defined, PlatformLocation JIT) are unrelated to this story.
- Build passes with no new errors; only pre-existing budget warnings.

### File List

- `src/app/shared/components/item-feed-card/item-feed-card.component.ts`
- `src/app/shared/components/item-feed-card/item-feed-card.component.html`
- `src/app/shared/components/item-feed-card/item-feed-card.component.scss`
- `src/app/shared/components/item-feed-card/item-feed-card.component.spec.ts`
- `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts`
- `src/app/shared/components/item-detail-panel/item-detail-panel.component.html`
- `src/app/shared/components/item-detail-panel/item-detail-panel.component.scss`
- `src/app/shared/components/item-detail-panel/item-detail-panel.component.spec.ts`
- `src/app/features/profile/perfil-publico/perfil-publico.component.ts`
- `src/app/features/profile/perfil-publico/perfil-publico.component.html`
- `src/app/features/profile/perfil-publico/perfil-publico.component.scss`
- `src/app/features/profile/perfil-publico/perfil-publico.component.spec.ts`
- `public/i18n/es.json`
- `public/i18n/ca.json`
- `public/i18n/en.json`

### Review Findings

- [x] [Review][Patch] aria-hidden en .feed-card__ctx-overlay oculta todo el menú contextual a AT — WCAG 4.1.2 crítico [item-feed-card.component.html]
- [x] [Review][Patch] Focus restoration rota en feed card — reportTriggerEl captura el botón del dropdown (elemento eliminado del DOM) [item-feed-card.component.ts]
- [x] [Review][Patch] aria-expanded faltante en botón trigger del menú contextual — WCAG 4.1.2 [item-feed-card.component.html]
- [x] [Review][Patch] role="menu" sin nombre accesible (sin aria-label ni aria-labelledby) — WCAG 4.1.2 [item-feed-card.component.html]
- [x] [Review][Patch] Dropdown no se cierra al salir con Tab — sin handler focusout — WCAG 2.1.1 [item-feed-card.component.html/.ts]
- [x] [Review][Patch] Foco no se mueve al primer item del dropdown al activarlo con teclado — APG Menu Button, WCAG 2.1.1 [item-feed-card.component.ts]
- [x] [Review][Patch] ca.json: 4 cadenas trigger incorrectas vs spec (report_item, report_item_full, report_user, menu_aria) [public/i18n/ca.json]
- [x] [Review][Patch] en.json: 2 cadenas trigger incorrectas vs spec (report_user, menu_aria) [public/i18n/en.json]
- [x] [Review][Patch] es.json: 2 cadenas trigger incorrectas vs spec (report_user, menu_aria) [public/i18n/es.json]
- [x] [Review][Patch] perfil-publico: entityDisplayName usa fallback `|| p.id` (UUID) — viola AC-5 [perfil-publico.component.html]
- [x] [Review][Patch] Feed card dropdown sin separador/divisor antes de "Reportar objeto" — viola AC-1 [item-feed-card.component.html]
- [x] [Review][Defer] reportModalOpen no se resetea en loadItem() si itemId cambia con modal abierto [item-detail-panel.component.ts] — deferred, pre-existing
- [x] [Review][Defer] reportModalOpen no se resetea en loadProfile() si userId cambia con modal abierto [perfil-publico.component.ts] — deferred, pre-existing
- [x] [Review][Defer] Binding [context] vivo en app-report-modal del feed card — item() podría cambiar mientras el modal está abierto [item-feed-card.component.html] — deferred, pre-existing
- [x] [Review][Defer] Race condition canReport en perfil-publico — userId() puede ser undefined antes de que la ruta resuelva [perfil-publico.component.ts] — deferred, pre-existing
- [x] [Review][Defer] Non-null assertion item()!.id fuera del guard @if (item()) en item-detail-panel [item-detail-panel.component.html] — deferred, pre-existing
