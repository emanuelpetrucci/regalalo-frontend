---
ticket: 5
status: done
type: feature
migrated_from: v6
---

# Story 1.5: Login y cierre de sesión

Status: done

<!-- Validation opcional: validate-create-story antes de dev-story -->

## Story

Como usuario registrado,
quiero iniciar sesión con mi correo y contraseña, y poder cerrar sesión cuando quiera,
para acceder de forma segura a la plataforma y salir limpiamente.

**Diseño de referencia:** [`docs/project/Login.html`](../../docs/project/Login.html) (sección Login — mismo layout split-grid ya portado en `AuthLayoutComponent`)

**Épica:** 1 · **Depende de:** 1.2 (done), 1.4 (done). **Bloquea:** 1.6 (reset-password usa misma infra).

## Acceptance Criteria

1. **Login exitoso**
   - **Given** la ruta `/login`
   - **When** el usuario ingresa email y contraseña válidos + reCAPTCHA V3
   - **Then** se llama `AuthService.authLoginPost({ body: { email, password, recaptchaToken } })`
   - **And** ante respuesta `200` se llama `SessionService.setToken(res.token)` y `SessionService.setUser(res.user)` y se redirige a `returnUrl` (sanitizado) o `/explorar`

2. **Credenciales inválidas (401)**
   - **Given** credenciales incorrectas (`401`)
   - **When** el usuario envía el formulario
   - **Then** se muestra mensaje genérico de credenciales incorrectas (clave `auth.login.error.401`) **sin** redirect ni borrado de token

3. **reCAPTCHA insuficiente (422)**
   - **Given** score de reCAPTCHA insuficiente (`422`)
   - **When** el usuario envía el formulario
   - **Then** se muestra mensaje de reintento de verificación (clave `auth.login.error.422`)

4. **Sesión expirada (banner informativo)**
   - **Given** el usuario llega a `/login?returnUrl=<ruta>` redirigido por el interceptor
   - **When** carga el componente y `returnUrl` está presente en query params
   - **Then** se muestra un banner informativo de sesión expirada (clave `auth.login.session_expired`) encima del formulario (variante `warning` del `AlertBoxComponent`)

5. **Cierre de sesión**
   - **Given** un usuario autenticado en cualquier ruta protegida
   - **When** pulsa "Cerrar sesión" en el `AppShellComponent`
   - **Then** se llama `SessionService.clearToken()` y se navega a `/login` (sin `returnUrl`)

6. **returnUrl al hacer login**
   - **Given** la ruta `/login?returnUrl=/items/abc`
   - **When** el login es exitoso
   - **Then** se navega a `/items/abc` (URL validada con `sanitizeReturnUrl`)
   - **And** si `returnUrl` no es segura (protocolo externo, `//`) se ignora y va a `/explorar`

7. **Validación de formulario**
   - **Given** campos inválidos (email vacío, formato incorrecto, password vacío)
   - **When** el usuario intenta enviar
   - **Then** los controles muestran errores de validación (claves `auth.login.validation.*`) y **no** se envía la petición
   - **And** el envío previene doble submit (`inFlight` flag)

8. **Accesibilidad**
   - **Given** la pantalla de login
   - **When** se recorre con lector de pantalla
   - **Then** cumple WCAG AA: labels asociados, `aria-invalid`, `aria-describedby`, contraste de tokens, `aria-live="assertive"` en contenedor de error

## Tasks / Subtasks

- [x] **i18n — añadir claves de login** (AC: 1–8)
  - [x] **UPDATE** `public/i18n/es.json` — sección `auth.login.*` + `nav.logout` (ver tabla de claves en Dev Notes)
  - [x] **UPDATE** `public/i18n/ca.json` — mismas claves traducidas
  - [x] **UPDATE** `public/i18n/en.json` — mismas claves traducidas

- [x] **Utilidad de errores de login** (AC: 2, 3)
  - [x] **NEW** `src/app/features/auth/login/login-error.util.ts` — `mapLoginError(err)` → `{ bannerKey: string }` (sin `showLoginLink` ni `fields`, ver patrón en Dev Notes)
  - [x] **NEW** `src/app/features/auth/login/login-error.util.spec.ts` — tests unitarios

- [x] **Componente LoginComponent** (AC: 1–4, 6–8)
  - [x] **UPDATE** `src/app/features/auth/login/login.component.ts` — implementación completa (ver scaffold en Dev Notes)
  - [x] **NEW** `src/app/features/auth/login/login.component.html` — template (2 campos, link forgot, footer registro, reCAPTCHA note)
  - [x] **NEW** `src/app/features/auth/login/login.component.scss` — estilos alineados con `Login.html` y `colors_and_type.css`
  - [x] **NEW** `src/app/features/auth/login/login.component.spec.ts` — tests (ver patrones en Dev Notes)

- [x] **Logout en AppShell** (AC: 5)
  - [x] **UPDATE** `src/app/layout/app-shell/app-shell.component.ts` — añadir botón/link logout; inyectar `SessionService` y `Router`; `nav.logout` i18n

- [x] **Verificación**
  - [x] `ng build` sin errores
  - [x] `ng test` — todos los tests pasan (incluyendo los nuevos y los existentes)

### Review Findings

- [x] [Review][Patch] Logout en AppShell sin test de comportamiento — `app-shell.component.spec.ts` solo añade la clave i18n; no verifica que `logout()` llame `clearToken()` ni navegue a `/login` sin `returnUrl` (AC 5).
- [x] [Review][Patch] 401 no verifica ausencia de sesión — `login.component.spec.ts` comprueba el mensaje pero no que `getToken()`/`getUser()` sigan vacíos tras fallo (AC 2: sin borrado de token porque nunca se guardó).
- [x] [Review][Patch] returnUrl malicioso sin test de integración — `sanitizeReturnUrl` está cubierto en util spec, pero falta caso en login spec: `?returnUrl=https://evil.com` debe navegar a `/explorar` (AC 6).
- [x] [Review][Patch] `mapLoginError` trata `HttpErrorResponse` con `status === 0` como genérico — debería usar `auth.login.error.connection` (red caída / offline); hoy solo los errores no-HTTP van a connection.

- [x] [Review][Defer] `SessionUser` desacoplado de `AuthUser`/`LoginUser` generados — reduce acoplamiento compile-time; riesgo de drift si cambia OpenAPI; funciona estructuralmente hoy.
- [x] [Review][Defer] Verificación visual pixel-perfect vs `Login.html` — no automatizable; requiere QA manual según project-context.
- [x] [Review][Defer] `FieldInputComponent` aria de toggle contraseña hardcodeado en español — pre-existente, fuera del diff de esta historia.

## Dev Notes

### ⚠️ Contexto de archivos existentes — CRÍTICO

| Archivo | Estado actual | Acción |
|---------|--------------|--------|
| `src/app/features/auth/login/login.component.ts` | **Stub** — solo `<h1>Iniciar sesión</h1>` | **REEMPLAZAR** con implementación completa |
| `src/app/features/auth/forgot-password/forgot-password.component.ts` | **Stub** — solo h1 | NO tocar en esta historia |
| `src/app/features/auth/reset-password/reset-password.component.ts` | **Stub** — solo h1 | NO tocar en esta historia |
| `src/app/layout/app-shell/app-shell.component.ts` | Login del navbar funcional, falta logout | Añadir logout button — NO cambiar nada más |
| `src/app/features/auth/auth.routes.ts` | Rutas ya declaradas (login, register, forgot, reset) | NO tocar |
| `src/app/app.config.ts` | reCAPTCHA + Transloco ya configurados | NO tocar |

### Patrón de implementación — RegisterComponent como referencia exacta

`LoginComponent` sigue el mismo patrón que `RegisterComponent` (`src/app/features/auth/register/register.component.ts`). **Diferencias clave:**

| Aspecto | Register | Login |
|---------|----------|-------|
| Campos | email + password + postalCode | email + password (sin postalCode) |
| API | `authRegisterPost` → `AuthResponse` | `authLoginPost` → `LoginResponse` |
| Modelo user | `AuthUser` (tiene postalCode) | `LoginUser` (`{ id, email, reputationScore }` — sin postalCode) |
| Post-login redirect | Onboarding check + `/explorar` | Directo a `returnUrl` ó `/explorar` (sin onboarding) |
| Error 401 | No aplica (registro) | Mensaje genérico de credenciales incorrectas |
| Error 409 | Email duplicado | No aplica (login) |
| Session expired banner | No | Sí — cuando `returnUrl` presente en query params |

### Scaffold de `login.component.ts`

```typescript
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  computed,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../../core/api/generated/services/auth.service';
import {
  RecaptchaConfigError,
  RecaptchaService,
} from '../../../core/services/recaptcha.service';
import { SessionService } from '../../../core/services/session.service';
import { sanitizeReturnUrl } from '../../../core/utils/return-url.util';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box.component';
import { BtnComponent } from '../../../shared/components/btn/btn.component';
import { FieldInputComponent } from '../../../shared/components/field-input/field-input.component';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector.component';
import { mapLoginError } from './login-error.util';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslocoModule,
    FieldInputComponent,
    AlertBoxComponent,
    BtnComponent,
    LanguageSelectorComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthService);
  private readonly session = inject(SessionService);
  private readonly recaptcha = inject(RecaptchaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly transloco = inject(TranslocoService);

  readonly submitting = signal(false);
  readonly bannerError = signal<string | null>(null);
  readonly sessionExpired = computed(() =>
    !!this.route.snapshot.queryParamMap.get('returnUrl')
  );

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    password: ['', [Validators.required]],
  });

  private destroyed = false;
  private inFlight = false;

  constructor() {
    this.destroyRef.onDestroy(() => { this.destroyed = true; });
    (['email', 'password'] as const).forEach((key) => {
      this.form.get(key)?.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.bannerError.set(null));
    });
  }

  fieldError(controlName: 'email' | 'password'): string | undefined {
    const control = this.form.get(controlName);
    if (!control || (!control.touched && !control.dirty) || control.valid) return undefined;
    if (controlName === 'email') {
      return this.transloco.translate(
        control.hasError('required')
          ? 'auth.login.validation.email_required'
          : 'auth.login.validation.email_format',
      );
    }
    return this.transloco.translate('auth.login.validation.password_required');
  }

  async onSubmit(): Promise<void> {
    if (this.inFlight) return;
    this.inFlight = true;
    this.bannerError.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.inFlight = false;
      return;
    }

    this.submitting.set(true);
    try {
      const { email, password } = this.form.getRawValue();
      const recaptchaToken = await this.recaptcha.execute('login');
      const res = await this.authApi.authLoginPost({
        body: { email, password, recaptchaToken },
      });

      if (this.destroyed) return;

      this.session.setToken(res.token);
      this.session.setUser(res.user);

      const returnUrl = sanitizeReturnUrl(
        this.route.snapshot.queryParamMap.get('returnUrl'),
      );
      await this.router.navigateByUrl(returnUrl ?? '/explorar');
    } catch (err) {
      if (this.destroyed) return;
      if (err instanceof RecaptchaConfigError) {
        this.bannerError.set(
          this.transloco.translate('auth.login.error.recaptcha_unavailable'),
        );
        return;
      }
      const mapped = mapLoginError(err);
      this.bannerError.set(this.transloco.translate(mapped.bannerKey));
    } finally {
      this.inFlight = false;
      this.submitting.set(false);
    }
  }
}
```

### `login-error.util.ts` — patrón

```typescript
import { HttpErrorResponse } from '@angular/common/http';

export interface LoginErrorView {
  bannerKey: string;
}

export function mapLoginError(err: unknown): LoginErrorView {
  if (!(err instanceof HttpErrorResponse)) {
    return { bannerKey: 'auth.login.error.connection' };
  }
  if (err.status === 401) return { bannerKey: 'auth.login.error.401' };
  if (err.status === 422) return { bannerKey: 'auth.login.error.422' };
  return { bannerKey: 'auth.login.error.generic' };
}
```

### Claves i18n a añadir en los tres JSON (`es`, `ca`, `en`)

Añadir dentro del objeto `"auth"` existente (al mismo nivel que `"register"`):

```json
"login": {
  "title": "Iniciar sesión",
  "subtitle": "Accede a tu cuenta para publicar y solicitar objetos.",
  "field": {
    "email": "Correo electrónico",
    "email_placeholder": "tu@email.es",
    "password": "Contraseña",
    "password_placeholder": "••••••••"
  },
  "submit": "Iniciar sesión",
  "submitting": "Iniciando sesión…",
  "forgot_link": "¿Olvidaste tu contraseña?",
  "footer": "¿No tienes cuenta?",
  "register_link": "Crear cuenta",
  "session_expired": "Tu sesión ha expirado. Inicia sesión de nuevo.",
  "validation": {
    "email_required": "Introduce tu correo electrónico",
    "email_format": "El formato del correo no es válido",
    "password_required": "Introduce tu contraseña"
  },
  "error": {
    "401": "Correo o contraseña incorrectos.",
    "422": "No pudimos verificar que eres humano. Inténtalo de nuevo.",
    "connection": "Error de conexión. Inténtalo de nuevo.",
    "generic": "No pudimos iniciar sesión. Inténtalo más tarde.",
    "recaptcha_unavailable": "La verificación de seguridad no está disponible. Recarga la página."
  }
}
```

Añadir también en `"nav"` (ya existe): `"logout": "Cerrar sesión"`

### Logout en AppShell — cambio mínimo

Añadir en `app-shell.component.ts`:
- Inyectar `SessionService` y `Router`
- Método `logout()`: `this.session.clearToken(); void this.router.navigate(['/login']);`
- Botón en el bloque `navbar__actions` junto al avatar: `<button type="button" class="btn btn--ghost navbar__logout" (click)="logout()">{{ t('nav.logout') }}</button>`

**NO cambiar** navLinks, initials, ni ninguna otra parte del AppShell.

### Reglas críticas del interceptor (ya implementado — no tocar)

`src/app/core/interceptors/auth-error.interceptor.ts` ya filtra `/auth/login` como ruta pública: un 401 en el endpoint de login **no** limpia el token ni redirige — el error llega al componente correctamente. No duplicar esa lógica.

### SessionService — métodos disponibles

```typescript
// src/app/core/services/session.service.ts
setToken(token: string): void      // escribe en localStorage + signal
setUser(user: unknown): void       // JSON.stringify + localStorage + signal
clearToken(): void                 // borra token + user de localStorage y signals
isAuthenticated(): boolean        // verifica existencia y expiración del claim exp
```

`SessionService.clearToken()` ya borra **ambos** (token y user) — no llamar a `clearUser()` por separado.

`LoginUser` (`core/api/generated/models/login-user.ts`):
```typescript
export interface LoginUser { id: string; email: string; reputationScore: number; }
```

### `login.component.html` — estructura esperada

```html
<div class="login" *transloco="let t">
  <!-- Selector de idioma -->
  <div class="login__lang">
    <app-language-selector />
  </div>

  <h1 class="text-h1 login__title">{{ t('auth.login.title') }}</h1>
  <p class="login__subtitle">{{ t('auth.login.subtitle') }}</p>

  <!-- Banner sesión expirada (warning, solo si returnUrl presente) -->
  @if (sessionExpired()) {
    <div aria-live="polite">
      <app-alert-box variant="warning">{{ t('auth.login.session_expired') }}</app-alert-box>
    </div>
  }

  <!-- Banner de error -->
  @if (bannerError()) {
    <div aria-live="assertive">
      <app-alert-box variant="error">{{ bannerError() }}</app-alert-box>
    </div>
  }

  <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="login__form">
    <app-field-input
      formControlName="email"
      type="email"
      [label]="t('auth.login.field.email')"
      [placeholder]="t('auth.login.field.email_placeholder')"
      autocomplete="email"
      [error]="fieldError('email')"
    />
    <app-field-input
      formControlName="password"
      type="password"
      [label]="t('auth.login.field.password')"
      [placeholder]="t('auth.login.field.password_placeholder')"
      autocomplete="current-password"
      [error]="fieldError('password')"
    />
    <a routerLink="/forgot-password" class="login__forgot">
      {{ t('auth.login.forgot_link') }}
    </a>
    <app-btn type="submit" [disabled]="submitting()">
      {{ submitting() ? t('auth.login.submitting') : t('auth.login.submit') }}
    </app-btn>
  </form>

  <!-- reCAPTCHA note -->
  <p class="login__recaptcha">
    {{ t('auth.login.recaptcha') }}
    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">{{ t('auth.login.recaptcha_privacy') }}</a> ·
    <a href="https://policies.google.com/terms" target="_blank" rel="noopener">{{ t('auth.login.recaptcha_terms') }}</a>
  </p>

  <p class="login__footer">
    {{ t('auth.login.footer') }}
    <a routerLink="/register" class="link">{{ t('auth.login.register_link') }}</a>
  </p>
</div>
```

### Patrón de tests — `login.component.spec.ts`

Seguir exactamente el patrón de `register.component.spec.ts`:
- `TranslocoTestingModule.forRoot({ langs: { es: esJson }, translocoConfig: { defaultLang: 'es', availableLangs: ['es'] } })`
- Mock de `AuthService` con `{ authLoginPost: vi.fn() }`
- Mock de `RecaptchaService` con `{ execute: vi.fn().mockResolvedValue('recaptcha-token') }`
- No mockear `SessionService` — usar la instancia real (como en register spec)
- Incluir `provideRouter` con rutas: `login`, `register`, `explorar`, `forgot-password`

**Casos de test mínimos:**
1. No envía cuando el formulario es inválido
2. Login exitoso → guarda token/user en SessionService + navega a `/explorar`
3. Login exitoso con `returnUrl` → navega a la returnUrl
4. 401 → muestra `'Correo o contraseña incorrectos.'`
5. 422 → muestra mensaje de reCAPTCHA
6. RecaptchaConfigError → muestra mensaje de seguridad + no llama API
7. doble submit → API llamada solo una vez
8. `sessionExpired()` es `true` cuando hay `returnUrl` en query params

**`LoginResponse` mock:**
```typescript
const mockResponse: LoginResponse = {
  token: 'jwt.test',
  user: { id: 'u1', email: 'test@example.com', reputationScore: 0 },
};
```
Importar desde `core/api/generated/models/login-response`.

### Diseño visual — Login.html (obligatorio)

El `AuthLayoutComponent` ya porta el split-grid (`brand-col` + `form-panel`). El `LoginComponent` solo renderiza el contenido del panel de formulario — **no** reimplementar el layout.

Elementos visuales del prototipo aplicables al form panel:
- Heading `text-h1` (ya token CSS del design system)
- Campos con show/hide password — `FieldInputComponent` ya lo tiene (`type="password"`)
- Enlace "¿Olvidaste tu contraseña?" debajo del campo de contraseña
- Botón primario full-width
- Footer con enlace a registro
- Nota reCAPTCHA en texto pequeño

**Tokens CSS** a usar (de `colors_and_type.css`): solo los ya importados en `src/styles.scss`. No introducir colores nuevos.

### Notas de la historia anterior (1.4)

- `LocaleService` y `LanguageSelectorComponent` están listos — importar en `LoginComponent` igual que en `RegisterComponent`
- `*transloco="let t"` en el elemento raíz del template
- `TranslocoTestingModule` en el spec — imprescindible o los tests fallan
- `document.documentElement.lang` no escribir directamente — `LocaleService.setLocale()` lo gestiona
- `withHttpTransferCache` ya está en `app.config.ts` — no modificar

### Regla de no-onboarding

En registro, después de guardar sesión, hay verificación de onboarding. En **login no existe esa lógica**:

```typescript
// ✅ CORRECTO para login:
await this.router.navigateByUrl(returnUrl ?? '/explorar');

// ❌ INCORRECTO para login (no copiar la lógica de onboarding de register):
if (!isOnboardingDone()) { ... }
```

El usuario ya completó onboarding en sesiones anteriores. Solo login directo.

### Qué NO hacer

- No prerender `/login` — ya es `RenderMode.Client` por `path: '**'` en `app.routes.server.ts`
- No modificar `auth.routes.ts` — las rutas ya existen
- No implementar forgot-password ni reset-password (historia 1.6)
- No crear `login-response.ts` manual — el modelo generado ya existe en `core/api/generated/models/login-response.ts`
- No usar `HttpClient` directamente — solo `AuthService.authLoginPost` del cliente generado
- No hardcodear strings visibles en template — todos deben ser claves Transloco
- No implementar logout fuera del AppShell en esta historia

### Estructura de archivos resultante

```
src/app/features/auth/login/
├── login.component.ts          # UPDATE (reemplazar stub)
├── login.component.html        # NEW
├── login.component.scss        # NEW
├── login.component.spec.ts     # NEW
├── login-error.util.ts         # NEW
└── login-error.util.spec.ts    # NEW

src/app/layout/app-shell/
└── app-shell.component.ts      # UPDATE (logout button)

public/i18n/
├── es.json                     # UPDATE (auth.login.* + nav.logout)
├── ca.json                     # UPDATE
└── en.json                     # UPDATE
```

### References

- [Source: _bmad-output/initiative-regalalo/archive-v6/epics.md — Story 1.5]
- [Source: _bmad-output/project-context.md — Stack, i18n rules, API client rules]
- [Source: src/app/features/auth/register/register.component.ts — implementation pattern]
- [Source: src/app/features/auth/register/register.component.spec.ts — test pattern]
- [Source: src/app/features/auth/register/register-error.util.ts — error util pattern]
- [Source: src/app/core/services/session.service.ts — setToken, setUser, clearToken]
- [Source: src/app/core/api/generated/services/auth.service.ts — authLoginPost]
- [Source: src/app/core/api/generated/models/login-response.ts — LoginResponse]
- [Source: src/app/core/api/generated/models/login-user.ts — LoginUser]
- [Source: src/app/core/interceptors/auth-error.interceptor.ts — auth paths whitelist]
- [Source: src/app/core/utils/return-url.util.ts — sanitizeReturnUrl]
- [Source: src/app/core/services/recaptcha.service.ts — RecaptchaService.execute]
- [Source: src/app/layout/auth-layout/auth-layout.component.ts — layout ya portado]
- [Source: src/app/layout/app-shell/app-shell.component.ts — logout target]
- [Source: src/app/shared/components/field-input/field-input.component.ts — FieldInputComponent]
- [Source: src/app/shared/components/alert-box/alert-box.component.ts — AlertBoxComponent]
- [Source: docs/project/Login.html — diseño de referencia (obligatorio)]
- [Source: _bmad-output/initiative-regalalo/archive-v6/1-4-internacionalizacion-es-ca-en.md — i18n learnings]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- `SessionService.setUser(user: AuthUser)` no aceptaba `LoginUser` (subconjunto). Solución: extraer `SessionUser` como interfaz con campos opcionales en `session.service.ts` — `AuthUser` la satisface estructuralmente, `LoginUser` también.
- `withHttpTransferCache` en `app.config.ts` importado de `@angular/platform-browser` (no existe en Angular 21 — HTTP transfer cache está activo por defecto). Se eliminó la importación incorrecta; `provideClientHydration(withEventReplay())` es suficiente.

### Completion Notes List

- `LoginComponent` implementado con reactive form (email + password), reCAPTCHA V3 (`login` action), `AuthService.authLoginPost`, guardado de sesión (`SessionService.setToken` + `setUser`) y redirect a `returnUrl` o `/explorar`.
- Banner de sesión expirada (variante `warning`) mostrado cuando `returnUrl` presente en query params (detectado por `computed()`).
- `mapLoginError` mapea 401 → credenciales incorrectas, 422 → reCAPTCHA, non-HTTP → conexión, resto → genérico. Sin `showLoginLink` ni `fields` (login más simple que register).
- `SessionService` refactorizado para usar `SessionUser` (interfaz propia con campos opcionales) en lugar de `AuthUser` generado. Compatibilidad bidireccional: `AuthUser` satisface `SessionUser` estructuralmente.
- Logout en `AppShellComponent`: `SessionService.clearToken()` + `router.navigate(['/login'])` sin returnUrl.
- Bug pre-existente corregido: `withHttpTransferCache` importado incorrectamente de `@angular/platform-browser`. Eliminado; HTTP transfer cache está habilitado por defecto en Angular 21 `provideClientHydration`.
- 79 tests pasan (16 archivos de test). Build de producción exitoso (3 rutas prerenderizadas).

### File List

- `public/i18n/es.json` (actualizado — `auth.login.*`, `nav.logout`)
- `public/i18n/ca.json` (actualizado — `auth.login.*`, `nav.logout`)
- `public/i18n/en.json` (actualizado — `auth.login.*`, `nav.logout`)
- `src/app/features/auth/login/login-error.util.ts` (nuevo)
- `src/app/features/auth/login/login-error.util.spec.ts` (nuevo)
- `src/app/features/auth/login/login.component.ts` (actualizado — implementación completa)
- `src/app/features/auth/login/login.component.html` (nuevo)
- `src/app/features/auth/login/login.component.scss` (nuevo)
- `src/app/features/auth/login/login.component.spec.ts` (nuevo)
- `src/app/layout/app-shell/app-shell.component.ts` (actualizado — logout)
- `src/app/layout/app-shell/app-shell.component.spec.ts` (actualizado — `nav.logout` en esJson)
- `src/app/core/services/session.service.ts` (actualizado — `SessionUser` en lugar de `AuthUser`)
- `src/app/app.config.ts` (corregido — eliminado `withHttpTransferCache` incorrecto)

## Change Log

- 2026-05-21: Historia 1.5 implementada. Login con reCAPTCHA V3, manejo de 401/422, banner de sesión expirada y logout en AppShell. Refactor de `SessionService` a `SessionUser`. Corrección de bug en `app.config.ts`. 79 tests pasan.
