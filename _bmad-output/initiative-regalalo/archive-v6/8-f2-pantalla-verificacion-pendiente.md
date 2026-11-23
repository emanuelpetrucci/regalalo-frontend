# Story 8-f2: Pantalla `/verificacion-pendiente`

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed — comprehensive developer guide created. Épica 8-f DLT-email-verification — pantalla pública post-registro y redirección 403 EMAIL_NOT_VERIFIED. -->

## Story

Como usuario recién registrado o redirigido por email no verificado,
quiero ver una pantalla que me informe que debo verificar mi email y me permita reenviar el enlace,
para completar el proceso de verificación.

## Acceptance Criteria

1. **Given** la ruta `/verificacion-pendiente` (pública — no requiere `emailVerified`)
   **When** cargo la pantalla
   **Then** se muestra mensaje informativo que indica la necesidad de verificar el email antes de continuar

2. **Given** el botón "Reenviar email de verificación"
   **When** el usuario lo pulsa
   **Then** se llama `AuthService.authResendVerificationPost` con el JWT del `localStorage`
   **And** ante respuesta 200, el botón se deshabilita durante 30 segundos con cuenta regresiva visible

3. **Given** respuesta 429 con header `Retry-After`
   **When** el servidor responde al reenvío
   **Then** el cooldown usa el valor del header `Retry-After` en lugar de los 30 s por defecto

4. **Given** email ya verificado (409)
   **When** el usuario pulsa reenviar
   **Then** mensaje informativo que indica que el email ya está verificado, con enlace a `/login`

5. **Given** JWT ausente o inválido (401)
   **When** el usuario pulsa reenviar
   **Then** el interceptor limpia el token y redirige a `/login` (sin lógica adicional en el componente)

6. **Given** la pantalla
   **When** un lector de pantalla la recorre
   **Then** cumple WCAG AA (labels, focus, contraste)
   **And** todas las cadenas visibles usan claves i18n (`auth.verificationPending.*`)

## Tasks / Subtasks

### A. Ruta y estructura de ficheros (AC: 1)

- [x] Crear carpeta `src/app/features/auth/verification-pending/`
- [x] Crear `verification-pending.component.ts` con selector `app-verification-pending`
- [x] Crear `verification-pending.component.html` (template externo)
- [x] Crear `verification-pending.component.scss` (estilos, tokens de `colors_and_type.css`)
- [x] Añadir ruta `verificacion-pendiente` en `src/app/features/auth/auth.routes.ts` (sin `canActivate`)

### B. Lógica del componente — reenvío y cooldown (AC: 2, 3, 4, 5)

- [x] Implementar estado `cooldownSeconds = signal(0)` y `alreadyVerified = signal(false)`
- [x] Implementar `computed isInCooldown` → `cooldownSeconds() > 0`
- [x] Implementar método `onResend()` asíncrono:
  - Llama `authApi.authResendVerificationPost()`
  - Ante 200: arranca cooldown 30 s
  - Ante 429 (`HttpErrorResponse`): lee `err.headers.get('Retry-After')`, arranca cooldown con ese valor (fallback 30)
  - Ante 409: activa `alreadyVerified.set(true)` (el 401 lo gestiona el interceptor)
- [x] Implementar `startCooldown(seconds: number)`: setInterval de 1 s decrementando `cooldownSeconds`, limpiar en `destroyRef.onDestroy` y cuando llegue a 0
- [x] Guardar referencia del interval para limpiarlo (evitar memory leak)
- [x] Proteger con `isPlatformBrowser(platformId)` antes de usar `setInterval`
- [x] Proteger con `if (this.destroyed) return` tras cada `await`

### C. Internacionalización — claves i18n (AC: 6)

- [x] Añadir bloque `auth.verificationPending` en `public/i18n/es.json`:
  ```json
  "verificationPending": {
    "title": "Verifica tu correo electrónico",
    "lead": "Te hemos enviado un enlace de verificación. Revisa tu bandeja de entrada (y la carpeta de spam).",
    "resend_btn": "Reenviar email de verificación",
    "resend_btn_cooldown": "Reenviar email ({{ seconds }}s)",
    "already_verified_title": "Tu email ya está verificado",
    "already_verified_lead": "Ya puedes iniciar sesión con tu cuenta.",
    "already_verified_cta": "Ir a iniciar sesión",
    "error": {
      "connection": "Error de conexión. Inténtalo de nuevo.",
      "generic": "No pudimos enviar el correo. Inténtalo más tarde."
    }
  }
  ```
- [x] Añadir bloque equivalente en `public/i18n/ca.json`
- [x] Añadir bloque equivalente en `public/i18n/en.json`

### D. Template y estilos (AC: 1, 6)

- [x] Template HTML siguiendo patrones visuales de `docs/project/Login.html` (auth-layout, card, heading, párrafo, botón primario)
- [x] Estado condicional `@if (alreadyVerified())` → mostrar mensaje + `<a routerLink="/login">`
- [x] Estado principal → mostrar lead + botón resend con cuenta regresiva si `isInCooldown()`
- [x] Atributo `aria-live="polite"` en zona de mensajes de estado
- [x] Contraste de colores exclusivamente desde `colors_and_type.css`

### E. Tests unitarios (AC: 2, 3, 4, 5)

- [x] Crear `verification-pending.component.spec.ts`
- [x] Test: renderiza título y botón de reenvío por defecto
- [x] Test: llamar `onResend()` invoca `authResendVerificationPost`; tras 200 el botón muestra cooldown
- [x] Test: ante error 429 con Retry-After=60, `cooldownSeconds` arranca en 60
- [x] Test: ante error 429 sin Retry-After, `cooldownSeconds` arranca en 30
- [x] Test: ante error 409, `alreadyVerified()` es `true` y aparece enlace a `/login`
- [x] Test: `ng build` sin errores TS (483 tests + build OK)

### Review Findings

- [x] [Review][Patch] Robustecer parseo de `Retry-After` (soporte segundos + fecha HTTP) [`src/app/features/auth/verification-pending/verification-pending.component.ts`] — aplicado
- [x] [Review][Patch] Evitar crear `setInterval` cuando el cooldown normalizado sea `<= 0` [`src/app/features/auth/verification-pending/verification-pending.component.ts`] — aplicado
- [x] [Review][Patch] Eliminar `aria-disabled` redundante en `<app-btn>` (sin propagación al botón interno) [`src/app/features/auth/verification-pending/verification-pending.component.html`] — aplicado

## Dev Notes

### Ubicación y estructura del nuevo componente

```
src/app/features/auth/
├── verification-pending/
│   ├── verification-pending.component.ts    ← NUEVO
│   ├── verification-pending.component.html  ← NUEVO
│   ├── verification-pending.component.scss  ← NUEVO
│   └── verification-pending.component.spec.ts ← NUEVO
└── auth.routes.ts  ← MODIFICAR: añadir ruta verificacion-pendiente
```

**La ruta se añade SÓLO en `auth.routes.ts`.** `app.routes.ts` ya incluye `AUTH_ROUTES` bajo `AuthLayoutComponent` sin `canActivate` — ningún cambio necesario en `app.routes.ts`.

### Ruta a añadir en `auth.routes.ts`

```typescript
{
  path: 'verificacion-pendiente',
  loadComponent: () =>
    import('./verification-pending/verification-pending.component').then(
      (m) => m.VerificationPendingComponent,
    ),
},
```

**Sin `canActivate`.** La ruta es pública; usuarios con email no verificado deben acceder.

### API: `AuthService.authResendVerificationPost`

Método generado en `src/app/core/api/generated/services/auth.service.ts`:

```typescript
authResendVerificationPost(params?: AuthResendVerificationPost$Params, context?: HttpContext): Promise<MessageResponse>
```

- **Sin body** (params vacío o undefined).
- **Requiere JWT en header** — el interceptor JWT (`jwt.interceptor.ts`) lo añade automáticamente si hay token en `localStorage`.
- **Respuestas:**
  - `200` → `{ message: string }` — reenvío OK; iniciar cooldown 30 s
  - `401` → `HttpErrorResponse` — interceptor `authErrorInterceptor` lo captura, limpia token, redirige a `/login`. **El componente NO necesita manejar el 401.**
  - `409` → `HttpErrorResponse` — email ya verificado; mostrar mensaje + enlace `/login`
  - `429` → `HttpErrorResponse` — cooldown activo; leer `err.headers.get('Retry-After')`

### Patrón de manejo de errores (crítico: 429 llega como error, no como respuesta)

```typescript
async onResend(): Promise<void> {
  if (this.inFlight || this.isInCooldown()) return;
  this.inFlight = true;
  this.bannerError.set(null);
  this.submitting.set(true);
  try {
    await this.authApi.authResendVerificationPost();
    if (this.destroyed) return;
    this.startCooldown(30);
  } catch (err) {
    if (this.destroyed) return;
    if (err instanceof HttpErrorResponse) {
      if (err.status === 429) {
        const raw = err.headers.get('Retry-After');
        const seconds = raw ? parseInt(raw, 10) : NaN;
        this.startCooldown(isNaN(seconds) ? 30 : seconds);
        return;
      }
      if (err.status === 409) {
        this.alreadyVerified.set(true);
        return;
      }
      // 401 ya fue manejado por el interceptor; throwError llega aquí
      if (err.status === 0) {
        this.bannerError.set(this.transloco.translate('auth.verificationPending.error.connection'));
        return;
      }
    }
    this.bannerError.set(this.transloco.translate('auth.verificationPending.error.generic'));
  } finally {
    this.inFlight = false;
    this.submitting.set(false);
  }
}
```

### Implementación del cooldown con setInterval (SSR-safe)

```typescript
private intervalRef: ReturnType<typeof setInterval> | null = null;

private startCooldown(seconds: number): void {
  if (!isPlatformBrowser(this.platformId)) return;
  this.clearInterval();
  this.cooldownSeconds.set(seconds);
  this.intervalRef = setInterval(() => {
    const next = this.cooldownSeconds() - 1;
    if (next <= 0) {
      this.cooldownSeconds.set(0);
      this.clearInterval();
    } else {
      this.cooldownSeconds.set(next);
    }
  }, 1000);
}

private clearInterval(): void {
  if (this.intervalRef !== null) {
    clearInterval(this.intervalRef);
    this.intervalRef = null;
  }
}
```

Limpiar en el constructor con `destroyRef.onDestroy(() => { this.destroyed = true; this.clearInterval(); })`.

### Diseño: patrones visuales de `Login.html` (sin prototipo dedicado)

No existe prototipo HTML dedicado para `/verificacion-pendiente`. Usar los patrones del módulo auth:
- Contenedor centrado sobre `auth-layout` (ya existe como `AuthLayoutComponent`)
- Card con `card--auth` (o clase equivalente del handoff)
- Heading `h1` o `h2` con la clase de título de `Login.html`
- Párrafo descriptivo con la clase de texto secundario del handoff
- Botón primario full-width (`<app-btn variant="primary" [fullWidth]="true">`) para reenvío
- Enlace `<a routerLink="/login">` en estado `alreadyVerified`
- **NO** inventar colores, espaciados ni componentes nuevos — solo clases existentes del módulo auth

### Estado `alreadyVerified` (AC: 4)

```html
@if (alreadyVerified()) {
  <!-- Mensaje: email ya verificado + enlace a /login -->
} @else {
  <!-- Mensaje normal + botón resend -->
}
```

El botón de reenvío debe mostrar la cuenta regresiva cuando `isInCooldown()`:

```html
<app-btn
  [disabled]="isInCooldown() || submitting()"
  (click)="onResend()"
  variant="primary"
  [fullWidth]="true"
  type="button"
>
  @if (isInCooldown()) {
    {{ 'auth.verificationPending.resend_btn_cooldown' | transloco : { seconds: cooldownSeconds() } }}
  } @else {
    {{ 'auth.verificationPending.resend_btn' | transloco }}
  }
</app-btn>
```

### Accesibilidad WCAG AA (AC: 6)

- El botón deshabilitado durante cooldown debe tener `aria-disabled="true"` y el texto de cuenta regresiva debe ser legible por lectores de pantalla (no usar solo CSS para comunicar el estado).
- Zona de mensajes de éxito/error: `aria-live="polite"` para no interrumpir la lectura actual.
- Enlace a `/login` en estado `alreadyVerified` debe ser un `<a>` real (no botón) para semántica correcta.
- Contraste: usar solo tokens de `colors_and_type.css` — no cambiar nunca colores.

### Patrón de test — usar `TranslocoTestingModule`

```typescript
import { TranslocoTestingModule } from '@jsverse/transloco';
import esJson from '../../../../../public/i18n/es.json';

TestBed.configureTestingModule({
  imports: [
    VerificationPendingComponent,
    TranslocoTestingModule.forRoot({ langs: { es: esJson }, translocoConfig: { defaultLang: 'es' } }),
  ],
  providers: [
    { provide: AuthService, useValue: authServiceSpy },
    { provide: Router, useValue: routerSpy },
    provideRouter([]),
  ],
});
```

**No usar el loader real de Transloco en tests.** La constante `esJson` importada como módulo TS provee las traducciones sin red.

### Señales del `SessionUser` (informativo — no implementar en 8-f2)

`SessionUser` en `session.service.ts` **aún no tiene `emailVerified`**. Eso es tarea de **8-f4**. La pantalla `/verificacion-pendiente` no necesita leer `emailVerified` del estado — es una pantalla informativa sin condición de acceso.

### Qué NO hacer en 8-f2

- ❌ Modificar `AuthGuard` (historia **8-f4**)
- ❌ Modificar el interceptor `authErrorInterceptor` para 403 (historia **8-f4**)
- ❌ Modificar `session.service.ts` / `SessionUser` (historia **8-f4**)
- ❌ Modificar `register.component.ts` para redirect (historia **8-f5**)
- ❌ Crear componente `verify-email/` (historia **8-f3**)
- ❌ Añadir lógica para redirigir a `/login` si `emailVerified === true` — no hay guard aquí
- ❌ Inventar colores, fuentes o espaciados no presentes en `colors_and_type.css`

### Dependencias completadas antes de esta historia

- ✅ `8-f1`: cliente OpenAPI regenerado con `authResendVerificationPost` disponible en `AuthService`
- ✅ `AuthLayoutComponent` existe en `src/app/layout/auth-layout/`
- ✅ `BtnComponent` (`app-btn`) en `src/app/shared/components/btn/`
- ✅ `AlertBoxComponent` (`app-alert-box`) en `src/app/shared/components/alert-box/`
- ✅ Transloco configurado con `es`, `ca`, `en`

### Architecture compliance

| Regla | Detalle |
|---|---|
| Carpeta nueva | `src/app/features/auth/verification-pending/` — documentado en `architecture.md` v1.5 §2 |
| Ruta pública | En `auth.routes.ts` bajo `AuthLayoutComponent`; sin `canActivate` |
| API service | `AuthService` de `core/api/generated/services/` — no HttpClient directo |
| i18n | Claves `auth.verificationPending.*` en los 3 idiomas |
| OnPush | `ChangeDetectionStrategy.OnPush` obligatorio |
| signals | Estado con `signal()` y `computed()` |
| SSR | `isPlatformBrowser` para `setInterval` |
| WCAG | `aria-live`, contraste, focus management |
| Tests | `TranslocoTestingModule.forRoot(...)` — sin loader real |

### Referencias

- [Source: docs/architecture.md §2, §4 (F3), §6] — contratos y reglas DLT-email-verification
- [Source: docs/api-client.md] — `AuthService.authResendVerificationPost`
- [Source: _bmad-output/planning-artifacts/epics.md#Story-8-f2] — AC originales
- [Source: src/app/core/api/generated/services/auth.service.ts] — método `authResendVerificationPost`
- [Source: src/app/core/api/generated/fn/auth/auth-resend-verification-post.ts] — impl generada
- [Source: src/app/features/auth/auth.routes.ts] — añadir ruta verificacion-pendiente
- [Source: src/app/app.routes.ts] — entender AUTH_ROUTES bajo AuthLayoutComponent
- [Source: src/app/core/interceptors/auth-error.interceptor.ts] — 401 ya manejado por interceptor
- [Source: src/app/features/auth/login/login.component.ts] — patrón de componente auth
- [Source: src/app/features/auth/reset-password/reset-password.component.ts] — patrón con view states
- [Source: src/app/shared/components/btn/btn.component.ts] — inputs: variant, fullWidth, disabled, type
- [Source: public/i18n/es.json] — claves existentes bajo `auth.*`
- [Source: docs/project/Login.html] — patrones visuales del módulo auth

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (dev-story 2026-05-27)

### Debug Log References

- `ng test` 7/7 nuevos specs pasan (verification-pending): título, cooldown 200→30s, 429+Retry-After, 429 sin header→30s, 409→alreadyVerified, anti-doble-clic, decremento+clear interval.
- `ng test` suite completa 483/483 pasan — sin regresiones.
- `ng build` exit 0. Warnings de budget SCSS en mis-objetos, perfil, onboarding, landing son preexistentes; ninguno nuevo.

### Completion Notes List

- **AC #1:** Ruta `/verificacion-pendiente` añadida en `auth.routes.ts` bajo `AuthLayoutComponent` (sin `canActivate`). Pantalla muestra título, párrafo lead e icono de email. ✅
- **AC #2:** `onResend()` llama `authResendVerificationPost()`; ante 200 inicia cooldown 30 s con cuenta regresiva en el botón via `setInterval`. Botón deshabilitado durante cooldown. ✅
- **AC #3:** Ante 429, el header `Retry-After` se lee del `HttpErrorResponse.headers`; si está ausente o no parseable, fallback 30 s. ✅
- **AC #4:** Ante 409, `alreadyVerified.set(true)` cambia la vista a estado "ya verificado" con enlace a `/login`. ✅
- **AC #5:** 401 lo maneja el interceptor existente (`authErrorInterceptor`); el componente retorna silenciosamente. ✅
- **AC #6:** Todas las cadenas bajo `auth.verificationPending.*` en es/ca/en.json. Template con `aria-live="polite"` en zona de alertas. Colores solo desde tokens CSS (`--fg-primary`, `--fg-secondary`, `--color-primary-*`). ✅
- **Patrón countdown:** `setInterval` protegido con `isPlatformBrowser`; referencia en `intervalRef` limpiada en `destroyRef.onDestroy` y al llegar a 0.

### File List

- `src/app/features/auth/verification-pending/verification-pending.component.ts` — nuevo
- `src/app/features/auth/verification-pending/verification-pending.component.html` — nuevo
- `src/app/features/auth/verification-pending/verification-pending.component.scss` — nuevo
- `src/app/features/auth/verification-pending/verification-pending.component.spec.ts` — nuevo (7 tests)
- `src/app/features/auth/auth.routes.ts` — ruta `verificacion-pendiente` añadida
- `public/i18n/es.json` — bloque `auth.verificationPending` añadido
- `public/i18n/ca.json` — bloque `auth.verificationPending` añadido
- `public/i18n/en.json` — bloque `auth.verificationPending` añadido
- `_bmad-output/implementation-artifacts/8-f2-pantalla-verificacion-pendiente.md` — story (este archivo)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — status 8-f2 → review

### Change Log

- 2026-05-27: dev-story 8-f2 — componente VerificationPendingComponent, ruta pública, cooldown setInterval SSR-safe, manejo 200/429/409, i18n es/ca/en, 7 nuevos tests, 483 totales OK, build OK.
- 2026-05-27: code-review 8-f2 — aplicados patches de robustez `Retry-After`, guard de cooldown `<=0`, limpieza de atributo ARIA redundante; spec de componente actualizada y validada (9/9).
