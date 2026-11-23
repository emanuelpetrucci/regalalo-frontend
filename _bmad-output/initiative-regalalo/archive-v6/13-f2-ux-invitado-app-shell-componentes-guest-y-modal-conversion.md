---
baseline_commit: a13d8ca
---

# Historia 13-f2: UX de Invitado — App Shell, componentes guest y modal de conversión

Status: done

## Story

Como visitante no autenticado,
quiero navegar el catálogo con una interfaz adaptada a mi estado de invitado,
para entender el valor del sistema antes de registrarme y ser guiado al registro cuando quiero actuar.

**FR:** FR-F46, FR-F47, FR-F48, FR-F52, FR-F53  
**Épica:** 13-f (Descubrimiento Público y Conversión SEO)  
**Dependencia:** Historia 13-f1 (completada) — rutas públicas sin AuthGuard, tipos nullable correctos en cliente OpenAPI, RenderMode.Server para explorar e items/:id.

---

## Acceptance Criteria

### AC 1: Navbar visitante en AppShell

**Given** la ausencia de token válido en `SessionService`  
**When** el `AppShellComponent` se inicializa  
**Then** la navbar renderiza la variante visitante: enlace "Iniciar sesión" (color `fgMid`, → `/login`) + botón primario "Registrarse" (primary-500, → `/registro`)  
**And** el avatar de usuario, el botón "Publicar" y el menú hamburger NO se renderizan — no están en el DOM

---

### AC 2: Bottom nav visitante en móvil (≤ 760 px)

**Given** la ausencia de token en `SessionService` y viewport ≤ 760 px  
**When** se renderiza la bottom navigation en móvil  
**Then** tab "Publicar" muestra icono en `fgDisabled` con dot accent (#253F72, 7 px, borde bgSurface) — **no** usar atributo HTML `disabled`  
**And** tab "Entrar" (icono IUser, → `/login`) — sustituye la tab "Perfil"  
**And** clic en tab "Publicar" → abre `ConversionGateModal` con variante `publish_item`, **no navega** a ninguna ruta

---

### AC 3: Sin regresión — usuario autenticado

**Given** la presencia de token válido en `SessionService`  
**When** el `AppShellComponent` se inicializa  
**Then** la navbar muestra exactamente el mismo estado que antes de esta épica (avatar, publicar, hamburger en móvil, navLinks) — sin regresión visible

---

### AC 4: FeedGlobalBanner en feed visitante

**Given** el feed en `/explorar` para un visitante (`!SessionService.isAuthenticated()`)  
**When** la lista de items se renderiza  
**Then** el `FeedGlobalBanner` aparece por encima del grid de tarjetas (inmediatamente después de la toolbar)  
**And** contiene texto "Ves objetos de toda España." con enlace "Regístrate" en primary-500, `text-decoration-style: dotted` (→ `/registro`)  
**And** background #EDF0F5 (accentLight), borde 1px #A5B5D4 (accentLight2), borderRadius 10px  
**And** botón × de cierre en `fgMuted` con `aria-label` localizable

---

### AC 5: FeedGlobalBanner descartable con sessionStorage

**Given** el visitante pulsa × en el `FeedGlobalBanner`  
**When** el banner se descarta  
**Then** el banner no se renderiza y el espacio desaparece completamente (sin placeholder ni height)  
**And** el estado de descarte se guarda en `sessionStorage` con clave `rgl_feed_banner_dismissed`  
**And** si el usuario abre nueva pestaña / nueva sesión de navegador, el banner vuelve a aparecer

---

### AC 6: ItemCard — "Disponible en España" para ítems sin distancia

**Given** un ítem con `distanceMeters === null` en `ItemFeedCardComponent`  
**When** se renderiza la tarjeta  
**Then** en lugar del chip de distancia se muestra el texto "Disponible en España" en color `fgDisabled` (#9AA2AD)  
**And** el contador de solicitudes NO se renderiza (ya no existe en la plantilla actual — no añadir)  
**And** el menú contextual (···) NO se renderiza (ya no existe en la plantilla actual — no añadir)

---

### AC 7: ItemCard — regresión con distancia calculada

**Given** un ítem con `distanceMeters` numérico (usuario autenticado con GPS)  
**When** se renderiza la tarjeta  
**Then** el chip de distancia en km se muestra igual que antes (sin regresión) — `@if (distanceKm() !== null)` ya funciona tras 13-f1

---

### AC 8: ItemDonorRow — variante anonimizada cuando `donor.id === null`

**Given** el `ItemDonorRowComponent` recibe un `donor` con `donor.id === null`  
**When** se renderiza el componente  
**Then** se muestra un placeholder genérico: icono `IUser` 18 px en círculo bgSubtle (#E8EAEC), borde border-default — **no** se usa `UserAvatarComponent`  
**And** el nombre se muestra como `guest.donor_row.anonymous_name` ("Donante anónimo") en color `fgMid` (#606A76) — **no** se usa `donor.firstName` del API  
**And** el nombre **no** es un enlace, sin `cursor: pointer`  
**And** la fecha de antigüedad ("Miembro desde …") es visible si el backend la provee — clave `guest.donor_row.member_since`  
**And** el score de reputación es visible en su color semántico habitual

---

### AC 9: ItemDonorRow — regresión con `donor.id` real

**Given** el `ItemDonorRowComponent` con `donor.id` UUID real (usuario autenticado)  
**When** se renderiza  
**Then** comportamiento idéntico al anterior (avatar/iniciales reales, nombre real con enlace a `/users/:id`, cursor pointer) — sin regresión

---

### AC 10: ConversionGateModal — variante `request_item` al clicar "Me interesa"

**Given** un visitante (`SessionService.user() === null`) en el detalle de objeto con `status === 'active'` y `requestsPaused === false`  
**When** pulsa el botón "Me interesa" / "Solicitar"  
**Then** se abre el `ConversionGateModal` con variante `request_item`  
**And** el `RequestContactBottomSheetComponent` y el `RequestContactStepComponent` **no** se abren

---

### AC 11: ConversionGateModal — aspecto y comportamiento

**Given** el `ConversionGateModal` abierto (cualquier variante)  
**When** el modal aparece  
**Then** overlay `rgba(20,23,26,0.55)`, panel bgSurface, borderRadius 16px, boxShadow shadow3  
**And** icono IGift en círculo primaryLight (60 px, borderRadius 50%)  
**And** título en Playfair Display 22 px fontWeight 700  
**And** lista de 3 beneficios con fondo primaryLight  
**And** CTA primario: "Crear cuenta gratis" (background primary-500, ancho completo, → `/registro?returnUrl=...`)  
**And** CTA secundario: "Ya tengo cuenta — Iniciar sesión" (border border-default, ancho completo, → `/login?returnUrl=...`)  
**And** tagline: "Sin tarjeta de crédito · Sin compromisos" en fgMuted  
**And** el foco inicial se posiciona en el botón "Crear cuenta gratis"  
**And** el focus trap está activo mientras el modal está abierto  
**And** ESC y botón × cierran el modal y devuelven el foco al elemento disparador

---

### AC 12: ConversionGateModal — 3 variantes de contenido

**When** se abre con trigger `request_item`  
**Then** título: clave `guest.conversion_modal.request_item.title`; subtítulo: `guest.conversion_modal.request_item.subtitle`

**When** se abre con trigger `publish_item`  
**Then** título: clave `guest.conversion_modal.publish_item.title`; subtítulo: `guest.conversion_modal.publish_item.subtitle`

**When** se abre con trigger `view_profile`  
**Then** título: clave `guest.conversion_modal.view_profile.title`; subtítulo: `guest.conversion_modal.view_profile.subtitle`

---

### AC 13: Accesibilidad WCAG AA

**Given** todos los nuevos componentes guest  
**When** un lector de pantalla los recorre  
**Then** contraste suficiente, foco gestionado, roles ARIA correctos en modal (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`)  
**And** dot accent en tab "Publicar" tiene `aria-label` que describe el estado gateado

---

### AC 14: i18n — todas las cadenas visibles con claves Transloco

**Given** todos los strings de los nuevos componentes guest  
**When** se revisa el código  
**Then** usan claves i18n en `public/i18n/es.json` bajo los prefijos:
- `guest.banner.*` (FeedGlobalBanner)
- `guest.item_card.*` (variante visitante de ItemCard)
- `guest.donor_row.*` (DonorRow anonimizado)
- `guest.conversion_modal.*` (ConversionGateModal, todas las variantes)
- `nav.login` y `nav.register` (si no existen aún, crearlas)
**And** equivalentes en `ca.json` y `en.json`

---

## Tasks / Subtasks

### A. AppShellComponent — variante visitante (ACs: 1, 2, 3)

- [x] Leer `src/app/layout/app-shell/app-shell.component.ts` y `.scss` completos
- [x] Añadir `readonly isGuest = computed(() => this.session.user() === null)` — reactive via signal
- [x] En la template: `@if (!isGuest())` → render actual navbar actions (avatar, publicar, hamburger); `@else` → render guest navbar actions ("Iniciar sesión" link + "Registrarse" button)
- [x] En la template (solo mobile ≤760px): añadir `<nav class="bottom-nav" *transloco="let t">` con `@if (isGuest())` mostrando tabs guest (Explorar | Publicar[gated] | Entrar); el bottom-nav para usuarios autenticados es out of scope en esta historia — no se cambia comportamiento actual
- [x] En `.scss`: añadir estilos `.bottom-nav`, `.bottom-nav__tab`, `.bottom-nav__dot-accent` con @media (max-width: 760px)
- [x] Añadir `ConversionGateModalComponent` a imports del AppShell para el trigger del tab "Publicar"
- [x] Añadir claves i18n `nav.login` y `nav.register` a los 3 archivos JSON (si no existen)
- [x] Verificar WCAG AA: dot accent con aria-label; foco en "Registrarse" accesible

### B. FeedGlobalBanner — componente nuevo (ACs: 4, 5)

- [x] Crear `src/app/features/items/components/feed-global-banner/feed-global-banner.component.ts` (output: `dismissed`)
- [x] Implementar: `dismissed = signal(false)` → inicializar desde `sessionStorage.getItem('rgl_feed_banner_dismissed')`
- [x] `dismiss()`: `sessionStorage.setItem('rgl_feed_banner_dismissed', '1'); this.dismissed.set(true)`
- [x] Template inline: `@if (!dismissed())` → banner visible; espacio desaparece completamente al descartar
- [x] SCSS: `src/app/features/items/components/feed-global-banner/feed-global-banner.component.scss`
- [x] Añadir claves i18n `guest.banner.*` a los 3 idiomas

### C. ExplorarComponent — integrar FeedGlobalBanner (AC: 4)

- [x] Inyectar `SessionService` en `ExplorarComponent`
- [x] Añadir `readonly isGuest = computed(() => this.session.user() === null)`
- [x] Importar `FeedGlobalBannerComponent`
- [x] En template: `@if (isGuest()) { <app-feed-global-banner /> }` — colocar ANTES de `explorar__grid`, DESPUÉS de `explorar__cat-row`

### D. ItemFeedCardComponent — "Disponible en España" (ACs: 6, 7)

- [x] En `item-feed-card.component.html`, localizar el bloque `@if (distanceKm() !== null)` y añadir `@else` con texto "Disponible en España" + icono IPin en `fgDisabled`
- [x] Añadir clave i18n `guest.item_card.available_in_spain` a los 3 idiomas
- [x] NO añadir contador de solicitudes ni menú contextual — no existen en la plantilla actual

### E. ItemDonorRowComponent — variante anonimizada (ACs: 8, 9)

- [x] En `.ts`: añadir `readonly isAnonymous = computed(() => this.donor().id === null || this.variant() === 'anonymous')`
- [x] En `.html`: sustituir `@if (variant() === 'anonymous')` por `@if (isAnonymous())`
- [x] Actualizar bloque anonymous para reproducir diseño `DESIGN-BRIEF-EPK13.html §DonorRowAnon`:
  - Placeholder: `<div class="donor-row__anon-avatar">` con icono IUser 18px en color `fgDisabled` — **NO** usar `<app-user-avatar />`
  - Texto: `{{ t('guest.donor_row.anonymous_name') }}` en clase `donor-row__anon-name` (color fgMid)
  - Sin `routerLink`, sin `cursor: pointer`
  - Fecha: omitida — campo `memberSince` no existe en el modelo generado `ItemDonor`
  - Score: igual que variante autenticada — `scoreDisplay()` con clase `scoreTone()`
- [x] Añadir claves i18n `guest.donor_row.*` a los 3 idiomas
- [x] Actualizar `.scss` para `donor-row--anonymous` con nuevos estilos

### F. ConversionGateModal — componente nuevo (ACs: 11, 12, 13)

- [x] Crear `src/app/shared/components/conversion-gate-modal/conversion-gate-modal.component.ts`
- [x] Inputs: `trigger = input.required<'request_item' | 'publish_item' | 'view_profile'>()`; `returnUrl = input<string | null>(null)`
- [x] Output: `closed = output<void>()`
- [x] Focus trap manual implementado con `getFocusableElements()` + `trapFocus()` en `onDocumentKeydown`
- [x] Focus inicial: en `ngAfterViewInit`, foco en `registerBtn` via `viewChild`
- [x] ESC: capturado en `host: { '(document:keydown)': 'onDocumentKeydown($event)' }` → `closed.emit()`
- [x] Overlay clic: click en overlay cierra el modal
- [x] Template con overlay, panel, icono IGift, título, subtítulo, 3 beneficios, CTA primario, CTA secundario, tagline, botón ×
- [x] `role="dialog"`, `aria-modal="true"`, `aria-labelledby="conv-modal-title"` en el panel
- [x] SCSS externo: `conversion-gate-modal.component.scss`
- [x] Añadir claves i18n `guest.conversion_modal.*` a los 3 idiomas

### G. ItemDetailPanelComponent — gate de conversión para visitante (ACs: 10)

- [x] Leer `src/app/shared/components/item-detail-panel/item-detail-panel.component.html` completo
- [x] Añadir `readonly isGuest = computed(() => this.session.user() === null)`
- [x] Añadir `readonly conversionModalOpen = signal(false)`
- [x] Modificar `onInterestedClick(event?: Event)`: interceptar al inicio si `isGuest()` → abrir modal y return
- [x] Importar `ConversionGateModalComponent` en imports del componente
- [x] En template HTML: añadir `@if (conversionModalOpen()) { <app-conversion-gate-modal ... /> }`
- [x] Verificar que `canShowRequestCta` sigue devolviendo `true` para visitantes (confirmado — ya lo hace)

### H. Verificación final

- [x] Build sin errores: `npm run build`
- [x] Sin regresiones en tests (17 preexistentes no relacionados — confirmado con git stash)
- [x] Navbar visitante: "Iniciar sesión" + "Registrarse" en lugar de avatar/publicar/hamburger
- [x] Bottom-nav móvil guest: Explorar | Publicar[gated+dot] | Entrar
- [x] FeedGlobalBanner integrado en ExplorarComponent para visitantes
- [x] ItemFeedCard: "Disponible en España" cuando distanceMeters === null
- [x] ItemDonorRow: variante anonimizada con IUser icon + "Donante anónimo"
- [x] ConversionGateModal: focus trap, ESC, overlay clic, 3 variantes de contenido
- [x] ItemDetailPanel: gate en onInterestedClick para visitantes → ConversionGateModal

---

## Dev Notes

### Estructura de archivos — resumen

| Archivo | Operación | Motivo |
|---|---|---|
| `src/app/layout/app-shell/app-shell.component.ts` | UPDATE | Señal `isGuest`, guest navbar + bottom-nav móvil |
| `src/app/layout/app-shell/app-shell.component.scss` | UPDATE | Estilos bottom-nav guest |
| `src/app/features/items/components/feed-global-banner/feed-global-banner.component.ts` | CREATE | Banner descartable visitante |
| `src/app/features/items/components/feed-global-banner/feed-global-banner.component.scss` | CREATE | Estilos banner |
| `src/app/features/items/explorar/explorar.component.ts` | UPDATE | Integrar FeedGlobalBanner con isGuest |
| `src/app/features/items/explorar/explorar.component.html` | UPDATE | Añadir `<app-feed-global-banner>` |
| `src/app/shared/components/item-feed-card/item-feed-card.component.html` | UPDATE | `@else` con "Disponible en España" |
| `src/app/shared/components/item-donor-row/item-donor-row.component.ts` | UPDATE | computed `isAnonymous` |
| `src/app/shared/components/item-donor-row/item-donor-row.component.html` | UPDATE | Bloque anonimizado con IUser + i18n |
| `src/app/shared/components/item-donor-row/item-donor-row.component.scss` | UPDATE | Estilos anonimizado |
| `src/app/shared/components/conversion-gate-modal/conversion-gate-modal.component.ts` | CREATE | Modal de conversión |
| `src/app/shared/components/conversion-gate-modal/conversion-gate-modal.component.scss` | CREATE | Estilos modal |
| `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts` | UPDATE | `isGuest`, `conversionModalOpen`, gate en `onInterestedClick` |
| `src/app/shared/components/item-detail-panel/item-detail-panel.component.html` | UPDATE | Añadir `<app-conversion-gate-modal>` |
| `public/i18n/es.json` | UPDATE | Claves `guest.*`, `nav.login`, `nav.register` |
| `public/i18n/ca.json` | UPDATE | Claves equivalentes |
| `public/i18n/en.json` | UPDATE | Claves equivalentes |

---

### CRÍTICO: Estado actual de AppShell — mobile nav es hamburger dropdown

El `AppShellComponent` ACTUAL no tiene un bottom tab bar. En móvil (≤760px) muestra un **hamburger dropdown** (`.navbar__hamburger-wrap` con `display:none` en desktop, `display:flex` en móvil).

**Enfoque para esta historia:**
- Para visitantes en móvil: ocultar el hamburger (`@if (!isGuest())` alrededor del `<div class="navbar__hamburger-wrap">`), mostrar directamente "Iniciar sesión" + "Registrarse" en las acciones de la navbar, Y añadir un bottom tab bar `.bottom-nav` con 3 tabs.
- Para usuarios autenticados en móvil: **sin cambios** — el hamburger dropdown sigue igual.
- El bottom nav autenticado (Explorar | Publicar | Perfil) está fuera del scope de esta historia.

**SCSS bottom-nav guest:**
```scss
.bottom-nav {
  display: none; // Hidden on desktop
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-default);
  padding: 6px 0 max(12px, env(safe-area-inset-bottom));

  @media (max-width: 760px) {
    display: flex;
  }
}

.bottom-nav__tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

.bottom-nav__tab-icon {
  position: relative;
  color: var(--fg-muted);
  &--active { color: var(--color-primary-500); }
  &--gated { color: var(--fg-disabled); }
}

.bottom-nav__dot-accent {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #253F72; // accent
  border: 1.5px solid var(--bg-surface);
}

.bottom-nav__label {
  font-family: var(--font-body);
  font-size: 10px;
  color: var(--fg-muted);
  &--active { font-weight: var(--weight-semibold); color: var(--color-primary-500); }
  &--gated { color: var(--fg-disabled); }
}

// Add bottom padding to main content to avoid overlap with fixed bottom-nav on mobile
.app-shell__main--guest-mobile-pad {
  @media (max-width: 760px) {
    padding-bottom: 64px;
  }
}
```

**IMPORTANTE:** Añadir `[class.app-shell__main--guest-mobile-pad]="isGuest()"` al elemento `<main class="app-shell__main">` para evitar que el contenido quede tapado por el bottom nav fijo.

---

### CRÍTICO: Detección de modo invitado — reglas de enfoque

| Componente | Señal a usar | Justificación |
|---|---|---|
| `AppShellComponent` | `computed(() => this.session.user() === null)` | Reactivo via signal |
| `FeedGlobalBanner` | Input del padre (`ExplorarComponent`) o detección interna vía `SessionService` | Simpleza |
| `ExplorarComponent` | `computed(() => this.session.user() === null)` | Reactivo |
| `ItemFeedCardComponent` | `item().distanceMeters === null` — señal del API | No depende del estado de sesión; backend devuelve null para invitados |
| `ItemDonorRowComponent` | `donor().id === null` — señal del API | No depende del estado de sesión |
| `ItemDetailPanelComponent` | `computed(() => this.session.user() === null)` | Para gate del CTA |
| `ConversionGateModal` | N/A — siempre se muestra si está abierto | El padre controla cuándo abrirlo |

**NO usar `SessionService.isAuthenticated()` (método)** directamente en `computed()` — el método no es reactivo por sí solo. Usar `session.user()` como señal fuente.

---

### CRÍTICO: ConversionGateModal — focus trap sin CDK

Si Angular CDK no está instalado en el proyecto (verificar `package.json`), implementar focus trap manual:

```typescript
private trapFocus(event: KeyboardEvent): void {
  const focusable = this.elementRef.nativeElement.querySelectorAll<HTMLElement>(
    'button, [href], input, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey) {
    if (document.activeElement === first) { last.focus(); event.preventDefault(); }
  } else {
    if (document.activeElement === last) { first.focus(); event.preventDefault(); }
  }
}
```

Suscribir en `ngAfterViewInit`: `document.addEventListener('keydown', this.trapFocus)`. Desuscribir en `ngOnDestroy`.

Si CDK sí está disponible: usar `cdkTrapFocus` y `cdkFocusInitial` en la plantilla.

---

### CRÍTICO: ItemDetailPanelComponent — gate en `onInterestedClick`

El método actual en `item-detail-panel.component.ts`:
```typescript
onInterestedClick(event?: Event): void {
  this.requestTriggerEl = this.captureFocusTrigger(event);
  this.requestErrorKey.set(null);
  if (this.presentation() === 'modal') {
    this.showContactStep.set(true);
    return;
  }
  this.contactSheetOpen.set(true);
}
```

**Cambio requerido** — añadir al INICIO del método (antes de cualquier lógica):
```typescript
if (this.isGuest()) {
  this.requestTriggerEl = this.captureFocusTrigger(event);
  this.conversionModalOpen.set(true);
  return;
}
```

Esto intercepta la acción para visitantes sin tocar el flujo existente para usuarios autenticados.

---

### CRÍTICO: Verificar que `ItemDonor` tiene campo `memberSince`

Antes de implementar AC 8 (fecha "Miembro desde…"), verificar que el modelo generado `src/app/core/api/generated/models/item-donor.ts` incluye un campo de fecha de membresía. Si no existe el campo, omitir la fecha en la variante anónima.

Según la historia 13-f1 (File List), `item-donor.ts` fue regenerado con `id: string | null`. Verificar otros campos disponibles en el modelo.

---

### CRÍTICO: ItemFeedCard — estructura actual del bloque de distancia tras 13-f1

En `item-feed-card.component.html` (modificado en 13-f1):
```html
<div class="feed-card__chips">
  <app-item-category-chip [category]="itemCategory()" />
  <app-item-condition-chip [condition]="item().condition" />
  @if (distanceKm() !== null) {
    <app-item-distance-chip [km]="distanceKm()!" />
  }
</div>
```

El bloque `@if (distanceKm() !== null)` ya existe (13-f1). Añadir `@else` con el texto guest:
```html
@else {
  <span class="feed-card__available-in-spain">
    <!-- IPin icon 11px -->
    {{ t('guest.item_card.available_in_spain') }}
  </span>
}
```

Añadir estilos `.feed-card__available-in-spain`: `color: var(--fg-disabled); font-size: 11px; display: flex; align-items: center; gap: 4px;`

---

### CRÍTICO: ItemDonorRow — variante anonymous actual vs nueva

**Estado actual del bloque anonymous** (desde 13-f1, tiene `variant` input):
```html
@if (variant() === 'anonymous') {
  <div class="donor-row donor-row--anonymous">
    <app-user-avatar [userId]="donor().id ?? undefined" ... />
    <div class="donor-row__info">
      <div class="donor-row__label">{{ t('items.detail.donor_anonymous') }}</div>
    </div>
    <span class="donor-row__rep-chip" [class]="'donor-row__rep-chip--' + repTone()">
      {{ scoreDisplay() }}
    </span>
  </div>
}
```

**Cambio requerido:**
1. Cambiar la condición de `variant() === 'anonymous'` a `isAnonymous()` (nuevo computed)
2. Reemplazar `<app-user-avatar ...>` por un `<div>` con icono IUser inline SVG
3. Cambiar el texto de `items.detail.donor_anonymous` a `guest.donor_row.anonymous_name`
4. Cambiar de `span.donor-row__rep-chip` a estructura similar a la variante autenticada (con `scoreDisplay()` y `reputationLabelKey()`) — mantener el score visible
5. Añadir fecha de membresía si existe en el modelo

**Verificar** que el `ItemDetailPanelComponent` template pasa `[variant]` a `<app-item-donor-row>` — si usa `[variant]="item().donor.id ? 'default' : 'anonymous'"`, la detección interna vía `isAnonymous()` es más robusta y backward compatible.

---

### Claves i18n — valores definitivos

**es.json** (nuevas claves):
```json
"nav": {
  "login": "Iniciar sesión",
  "register": "Registrarse"
},
"guest": {
  "banner": {
    "text": "Ves objetos de toda España.",
    "register_cta": "Regístrate",
    "register_cta_suffix": "para ver solo los de tu zona.",
    "dismiss": "Cerrar banner"
  },
  "item_card": {
    "available_in_spain": "Disponible en España"
  },
  "donor_row": {
    "anonymous_name": "Donante anónimo",
    "member_since": "Miembro desde {{date}}"
  },
  "conversion_modal": {
    "close": "Cerrar",
    "tagline": "Sin tarjeta de crédito · Sin compromisos",
    "benefit_1": "Pide objetos que otros ya no usan",
    "benefit_2": "Dona lo que tienes sin usar",
    "benefit_3": "Tu historial te da prioridad en el reparto",
    "cta_register": "Crear cuenta gratis",
    "cta_login": "Ya tengo cuenta — Iniciar sesión",
    "request_item": {
      "title": "¿Te interesa este objeto?",
      "subtitle": "Para pedirlo, crea tu cuenta gratuita. Solo te toma un minuto."
    },
    "publish_item": {
      "title": "Regala lo que ya no necesitas",
      "subtitle": "Crea tu cuenta para publicar objetos y que lleguen a quien los necesita."
    },
    "view_profile": {
      "title": "Conoce a la comunidad",
      "subtitle": "Con una cuenta puedes ver los perfiles y el historial de los miembros."
    }
  }
}
```

**ca.json:**
```json
"nav": { "login": "Inicia sessió", "register": "Registra't" },
"guest": {
  "banner": {
    "text": "Veus objectes de tot Espanya.",
    "register_cta": "Registra't",
    "register_cta_suffix": "per veure només els de la teva zona.",
    "dismiss": "Tanca el bàner"
  },
  "item_card": { "available_in_spain": "Disponible a Espanya" },
  "donor_row": {
    "anonymous_name": "Donant anònim",
    "member_since": "Membre des de {{date}}"
  },
  "conversion_modal": {
    "close": "Tancar",
    "tagline": "Sense targeta de crèdit · Sense compromisos",
    "benefit_1": "Demana objectes que altri ja no usa",
    "benefit_2": "Dona el que tens sense usar",
    "benefit_3": "El teu historial et dona prioritat",
    "cta_register": "Crea el compte gratis",
    "cta_login": "Ja tinc compte — Inicia sessió",
    "request_item": { "title": "T'interessa aquest objecte?", "subtitle": "Per demanar-lo, crea el teu compte gratuït. Només et porta un minut." },
    "publish_item": { "title": "Regala el que ja no necessites", "subtitle": "Crea el teu compte per publicar objectes i que arribin a qui els necessita." },
    "view_profile": { "title": "Coneix la comunitat", "subtitle": "Amb un compte pots veure els perfils i l'historial dels membres." }
  }
}
```

**en.json:**
```json
"nav": { "login": "Sign in", "register": "Sign up" },
"guest": {
  "banner": {
    "text": "You're seeing items from all of Spain.",
    "register_cta": "Sign up",
    "register_cta_suffix": "to see items near you.",
    "dismiss": "Dismiss banner"
  },
  "item_card": { "available_in_spain": "Available in Spain" },
  "donor_row": {
    "anonymous_name": "Anonymous donor",
    "member_since": "Member since {{date}}"
  },
  "conversion_modal": {
    "close": "Close",
    "tagline": "No credit card · No commitments",
    "benefit_1": "Request items others no longer need",
    "benefit_2": "Donate what you have unused",
    "benefit_3": "Your history gives you priority",
    "cta_register": "Create free account",
    "cta_login": "Already have an account — Sign in",
    "request_item": { "title": "Interested in this item?", "subtitle": "To request it, create your free account. It only takes a minute." },
    "publish_item": { "title": "Give away what you no longer need", "subtitle": "Create your account to post items and let them reach people who need them." },
    "view_profile": { "title": "Meet the community", "subtitle": "With an account you can see profiles and the history of members." }
  }
}
```

> **Nota:** Verificar si `nav.login` o `nav.register` ya existen en los JSON antes de añadirlas. Fusionar en lugar de duplicar.

---

### Patrón de referencia para ConversionGateModal

Referencia visual: `docs/project/DESIGN-BRIEF-EPK13.html` — función `ConversionModal` (línea ~461)

Patrón de componente modal existente a seguir: `src/app/shared/components/share-dialog/share-dialog.component.ts` — observar cómo gestiona ESC, overlay, y `output<void>()` para cerrar.

Patrón de SVG icons inline: usar el mismo estilo que el resto del proyecto — SVGs inline con `viewBox="0 0 24 24"`, `stroke="currentColor"`, `aria-hidden="true"`.

**IGift SVG** (extraído de DESIGN-BRIEF-EPK13.html):
```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polyline points="20 12 20 22 4 22 4 12"/>
  <rect x="2" y="7" width="20" height="5"/>
  <line x1="12" y1="22" x2="12" y2="7"/>
  <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
  <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
</svg>
```

**IUser SVG** (para tab Entrar y donor anónimo):
```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="8" r="4"/>
  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
</svg>
```

---

### FeedGlobalBanner — evitar SSR crash con sessionStorage

`sessionStorage` solo existe en el navegador. El componente usa `RenderMode.Server` para `/explorar`, por lo que el servidor ejecutará el código del componente.

Patrón seguro (igual que `SessionService` usa `isBrowser()`):
```typescript
private readonly platformId = inject(PLATFORM_ID);

private isBrowser(): boolean {
  return isPlatformBrowser(this.platformId);
}

ngOnInit(): void {
  if (this.isBrowser()) {
    const dismissed = sessionStorage.getItem('rgl_feed_banner_dismissed');
    if (dismissed) this.dismissed.set(true);
  }
}
```

Importar `PLATFORM_ID` de `@angular/core`, `isPlatformBrowser` de `@angular/common`.

---

### ExplorarComponent — no inyectar SessionService si FeedGlobalBanner lo hace interno

**Opción 1 — Banner autónomo (recomendado):** `FeedGlobalBanner` inyecta `SessionService` internamente y decide si mostrarse. ExplorarComponent no necesita cambios de lógica, solo añadir `<app-feed-global-banner />` en el template (siempre renderizado, el banner se auto-oculta).

**Opción 2 — Banner controlado por padre:** ExplorarComponent inyecta SessionService, pasa `[visible]="isGuest()"` al banner.

Ambas opciones son válidas. La Opción 1 es más limpia para esta historia.

---

### Aprendizajes de historia anterior (13-f1)

- El `ItemSeoService.clear()` fue corregido en review para también resetear `title`, `description` y `robots`. Seguir el mismo patrón de cleanup al crear servicios/componentes con estado.
- Los archivos i18n deben tener newline al final. Añadir `\n` al final de cada JSON.
- El bloque `@if (presentation() === 'page')` en `item-detail-panel.component.html` diferencia comportamientos page vs. modal — usar el mismo patrón para el ConversionGateModal.
- Los tests de `app.routes.spec.ts` están al día. No hay tests de los nuevos componentes que requieran actualización.

---

### References

- [Diseño: docs/project/DESIGN-BRIEF-EPK13.html — NavbarGuest, BottomNavGuest, FeedGlobalBanner, ItemCardGuest, DonorRowAnon, ConversionModal]
- [UX-DR: _bmad-output/planning-artifacts/epics.md — UX-DR13 a UX-DR18]
- [Épica 13-f2: _bmad-output/planning-artifacts/epics.md §Story 13-f2]
- [Historia anterior: _bmad-output/implementation-artifacts/13-f1-seo-infraestructura-rutas-publicas-y-meta-tags.md]
- [AppShell actual: src/app/layout/app-shell/app-shell.component.ts + .scss]
- [ItemFeedCard actual: src/app/shared/components/item-feed-card/item-feed-card.component.ts + .html]
- [ItemDonorRow actual: src/app/shared/components/item-donor-row/item-donor-row.component.ts + .html]
- [ItemDetailPanel actual: src/app/shared/components/item-detail-panel/item-detail-panel.component.ts]
- [ExplorarComponent actual: src/app/features/items/explorar/explorar.component.ts + .html]
- [SessionService: src/app/core/services/session.service.ts — user() signal, isAuthenticated() method]
- [Modelo ItemDonor: src/app/core/api/generated/models/item-donor.ts — verificar campos disponibles]

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Build error TS2322/TS2347 en `conversion-gate-modal.component.ts`: `querySelector` devuelve `Element | null`, necesitaba cast `as HTMLElement | null` para `querySelectorAll<HTMLElement>` — corregido.
- `ItemDonor` model generado no incluye campo `memberSince` — fecha "Miembro desde" omitida en variante anónima per spec.
- 17 tests preexistentes fallaban antes de esta historia (verificado con `git stash`) — sin regresiones nuevas.

### Completion Notes List

- **AppShell (AC 1-3):** `isGuest = computed(() => session.user() === null)`. Navbar visitante: "Iniciar sesión" (link) + "Registrarse" (btn primary). Hamburger/avatar/publicar ocultos para guest. Bottom-nav móvil guest: Explorar | Publicar[gated+dot] | Entrar. `publishGateOpen` signal conecta tab Publicar con ConversionGateModal.
- **FeedGlobalBanner (AC 4-5):** Componente autónomo con `sessionStorage` guard (`isPlatformBrowser`). Al descartar: sessionStorage `rgl_feed_banner_dismissed`, signal `dismissed.set(true)`, elemento desaparece sin placeholder.
- **ExplorarComponent (AC 4):** `isGuest` via SessionService.user(); `<app-feed-global-banner />` condicional tras toolbar, antes del grid.
- **ItemFeedCard (AC 6-7):** `@else` en bloque `@if (distanceKm() !== null)` → span con icono IPin + clave i18n `guest.item_card.available_in_spain` en color `fgDisabled`.
- **ItemDonorRow (AC 8-9):** `isAnonymous = computed(() => donor().id === null || variant() === 'anonymous')`. Bloque anonymous usa `<div class="donor-row__anon-avatar">` con IUser SVG inline (NO UserAvatarComponent), texto `guest.donor_row.anonymous_name`, sin routerLink. Score visible igual que variante autenticada.
- **ConversionGateModal (AC 11-13):** Componente standalone con focus trap manual (document:keydown), foco inicial en `registerBtn` via `viewChild`, ESC capturado en host binding, overlay clic cierra. `role="dialog" aria-modal="true" aria-labelledby="conv-modal-title"`. 3 variantes via `trigger` input. `returnQueryParams` computed property para CTA links.
- **ItemDetailPanel (AC 10):** `onInterestedClick` intercepta visitantes → `conversionModalOpen.set(true)` antes de cualquier lógica existente. `canShowRequestCta` devuelve `true` para visitantes (confirmado — `isDonor()` es false, item active, etc.).
- **i18n:** Claves `nav.login`, `nav.register`, `guest.banner.*`, `guest.item_card.*`, `guest.donor_row.*`, `guest.conversion_modal.*` añadidas a es/ca/en.json.

### Review Findings

- [x] [Review][Patch] Color `#253f72` hardcodeado en `.bottom-nav__dot-accent` — usar variable CSS [`src/app/layout/app-shell/app-shell.component.scss:291`]
- [x] [Review][Patch] `item()!.id` non-null assertion puede lanzar runtime error si `item()` es null [`src/app/shared/components/item-detail-panel/item-detail-panel.component.html:417`]
- [x] [Review][Patch] WCAG contraste: texto informativo "Disponible en España" usa `fg-disabled` (~3:1) — usar `fg-muted` o `fg-mid` para ≥4.5:1 [`src/app/shared/components/item-feed-card/item-feed-card.component.scss:104`]
- [x] [Review][Patch] `aria-label` del botón "Publicar" en bottom-nav concatena dos traducciones con separador hardcodeado — crear clave i18n dedicada [`src/app/layout/app-shell/app-shell.component.ts`]
- [x] [Review][Patch] `isAnonymous()` y `donor().id` puede ser `undefined` (no solo `null`) — usar `== null` para cubrir ambos [`src/app/shared/components/item-donor-row/item-donor-row.component.ts:18`]
- [x] [Review][Patch] Sin scroll-lock en body cuando el modal de conversión está abierto — añadir `overflow: hidden` [`src/app/shared/components/conversion-gate-modal/`]
- [x] [Review][Patch] Padding inferior `64px` en `.app-shell__main--guest-mobile-pad` puede no cubrir altura dinámica del bottom-nav — usar valor mayor o calcular dinámicamente [`src/app/layout/app-shell/app-shell.component.scss:229`]
- [x] [Review][Patch] CSS muerto: clases `.donor-row__rep-chip*` definidas pero no referenciadas en template — eliminar [`src/app/shared/components/item-donor-row/item-donor-row.component.scss:58-86`]
- [x] [Review][Defer] Bottom-nav móvil sin keyboard ARIA (aria-current, arrow-keys) — deferred, pre-existing pattern mobile-first
- [x] [Review][Defer] Rutas `/login` y `/registro` hardcodeadas — deferred, pre-existing pattern en todo el proyecto
- [x] [Review][Defer] `isGuest` ignora token expirado — deferred, SessionService ya limpia user() en 401 vía interceptor

### File List

- `src/app/layout/app-shell/app-shell.component.ts` — UPDATED
- `src/app/layout/app-shell/app-shell.component.scss` — UPDATED
- `src/app/features/items/components/feed-global-banner/feed-global-banner.component.ts` — CREATED
- `src/app/features/items/components/feed-global-banner/feed-global-banner.component.scss` — CREATED
- `src/app/features/items/explorar/explorar.component.ts` — UPDATED
- `src/app/features/items/explorar/explorar.component.html` — UPDATED
- `src/app/shared/components/item-feed-card/item-feed-card.component.html` — UPDATED
- `src/app/shared/components/item-feed-card/item-feed-card.component.scss` — UPDATED
- `src/app/shared/components/item-donor-row/item-donor-row.component.ts` — UPDATED
- `src/app/shared/components/item-donor-row/item-donor-row.component.html` — UPDATED
- `src/app/shared/components/item-donor-row/item-donor-row.component.scss` — UPDATED
- `src/app/shared/components/conversion-gate-modal/conversion-gate-modal.component.ts` — CREATED
- `src/app/shared/components/conversion-gate-modal/conversion-gate-modal.component.html` — CREATED
- `src/app/shared/components/conversion-gate-modal/conversion-gate-modal.component.scss` — CREATED
- `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts` — UPDATED
- `src/app/shared/components/item-detail-panel/item-detail-panel.component.html` — UPDATED
- `public/i18n/es.json` — UPDATED
- `public/i18n/ca.json` — UPDATED
- `public/i18n/en.json` — UPDATED


## Change Log

- 2026-06-16: Implementación completa de historia 13-f2 — AppShell variante visitante, FeedGlobalBanner, integración ExplorarComponent, ItemFeedCard "Disponible en España", ItemDonorRow variante anonimizada, ConversionGateModal (3 variantes), gate en ItemDetailPanel, i18n es/ca/en (agent: claude-sonnet-4-6)
