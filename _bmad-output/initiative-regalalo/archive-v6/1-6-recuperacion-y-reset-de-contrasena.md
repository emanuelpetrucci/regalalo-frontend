# Story 1.6: Recuperación y reset de contraseña

Status: done

<!-- Validation opcional: validate-create-story antes de dev-story -->

## Story

Como usuario,
quiero recuperar mi contraseña por email y establecer una nueva con el enlace,
para recuperar el acceso si la olvidé.

**Diseño de referencia:** [`docs/project/Login.html`](../../docs/project/Login.html) — modos `forgot`, `forgot-sent`, `reset`, `reset-invalid`, `reset-done` (mismo `AuthLayoutComponent` split-grid ya portado)

**Épica:** 1 · **Depende de:** 1.2 (done), 1.5 (done). **Cierra** el bloque de autenticación de la épica 1.

## Acceptance Criteria

1. **Solicitud de recuperación (`/forgot-password`)**
   - **Given** la ruta `/forgot-password`
   - **When** el usuario ingresa un email válido y envía
   - **Then** se llama `AuthService.authForgotPasswordPost({ body: { email } })`
   - **And** ante respuesta `200` (éxito o email inexistente — el backend siempre responde igual) se muestra la vista de confirmación genérica (`forgot-sent`), **sin** revelar si el email existe
   - **And** ante `400` de validación se muestran errores de campo inline
   - **And** no se ejecuta reCAPTCHA (el contrato OpenAPI solo exige `email`)

2. **Confirmación post-envío**
   - **Given** envío exitoso de forgot-password
   - **When** se muestra la vista `forgot-sent`
   - **Then** el copy coincide con `Login.html` (icono mail, título, textos de bandeja/spam, botón secundario «Volver al inicio» → `/login`)
   - **And** incluye nota reCAPTCHA estática (solo texto/enlaces, como en login — **no** llamar `RecaptchaService`)

3. **Reset con token válido (`/reset-password?token=...`)**
   - **Given** la ruta `/reset-password` con query `token` no vacío
   - **When** el usuario ingresa nueva contraseña y confirmación coincidente (mín. 8 caracteres)
   - **Then** se llama `AuthService.authResetPasswordPost({ body: { token, newPassword } })` con el token de la URL
   - **And** ante `200` se muestra vista `reset-done` con confirmación y botón/enlace a `/login`
   - **And** **no** se inicia sesión automáticamente (sin `SessionService.setToken`)

4. **Token inválido o expirado (`400`)**
   - **Given** token ausente, vacío, o POST devuelve `400` (backend: `BadRequestException` en reset use case)
   - **When** el usuario intenta reset o carga la página sin token
   - **Then** se muestra vista `reset-invalid` (icono candado, mensaje, botón «Solicitar nuevo enlace» → `/forgot-password`)
   - **And** no se envía petición si el token falta en la URL

5. **Validación de formularios**
   - **Given** campos inválidos (email vacío/mal formado; contraseña &lt; 8; confirmación vacía o distinta)
   - **When** el usuario intenta enviar
   - **Then** errores inline con claves `auth.forgot.validation.*` / `auth.reset.validation.*`
   - **And** no se envía la petición
   - **And** doble submit bloqueado (`inFlight` + `submitting`), patrón login/register

6. **Navegación y enlaces**
   - **Given** formularios forgot/reset
   - **When** el usuario pulsa «Volver al inicio»
   - **Then** navega a `/login` (`routerLink` o `Router.navigate`)
   - **And** el enlace «¿Olvidaste tu contraseña?» en login ya apunta a `/forgot-password` (no modificar salvo rotura)

7. **Accesibilidad**
   - **Given** las pantallas forgot/reset/sent/invalid/done
   - **When** se recorren con lector de pantalla
   - **Then** WCAG AA: labels en `FieldInput`, `aria-invalid`/`aria-describedby`, `aria-live="assertive"` en errores API, contraste de tokens del design system

8. **i18n**
   - **Given** cualquier cadena visible
   - **Then** claves Transloco en `es`, `ca`, `en` — **prohibido** hardcodear copy (salvo marca)

## Tasks / Subtasks

- [x] **i18n — claves forgot y reset** (AC: 1–8)
  - [x] **UPDATE** `public/i18n/es.json`, `ca.json`, `en.json` — secciones `auth.forgot.*`, `auth.reset.*`, `auth.common.back_to_login` (ver tabla Dev Notes)

- [x] **Utilidades de error** (AC: 1, 4)
  - [x] **NEW** `forgot-password-error.util.ts` + spec — mapeo HTTP → `bannerKey` (400 validación, 0/conexión, genérico)
  - [x] **NEW** `reset-password-error.util.ts` + spec — `400` → invalid token; resto como login

- [x] **ForgotPasswordComponent** (AC: 1, 2, 5–8)
  - [x] **UPDATE** `forgot-password.component.ts` — reemplazar stub; vistas `form` | `sent` vía `signal`
  - [x] **NEW** `forgot-password.component.html`, `.scss` — alinear con `Login.html` modo `forgot` / `forgot-sent`
  - [x] **NEW** `forgot-password.component.spec.ts`

- [x] **ResetPasswordComponent** (AC: 3–8)
  - [x] **UPDATE** `reset-password.component.ts` — leer `token` de `ActivatedRoute`; vistas `invalid` | `form` | `done`
  - [x] **NEW** `reset-password.component.html`, `.scss` — modos `reset`, `reset-invalid`, `reset-done`
  - [x] **NEW** `reset-password.component.spec.ts`

- [x] **Verificación**
  - [x] `ng build` sin errores
  - [x] `ng test` — todos los tests pasan (102)

### Review Findings

- [x] [Review][Patch] `aria-live` region renderizada condicionalmente — los lectores de pantalla no anuncian errores de API [forgot-password.component.html:27, reset-password.component.html:76]
- [x] [Review][Patch] Contraseña compuesta solo de espacios (≥ 8) pasa todos los validadores y llega a la API [reset-password.component.ts:74-81]
- [x] [Review][Patch] HTTP 429 (rate limiting) no manejado en los mappers de error — cae al error genérico [forgot-password-error.util.ts, reset-password-error.util.ts]
- [x] [Review][Patch] `EMAIL_PATTERN` demasiado permisivo — acepta `a@b..c`, `a.@b.c`, etc. [forgot-password.component.ts:19]
- [x] [Review][Patch] Botones de acción usan `Router.navigate` en lugar de `routerLink` — no accesibles como enlace (teclado, Ctrl+clic) [forgot-password.component.html:87, reset-password.component.html:26,50]
- [x] [Review][Patch] Clase SCSS `.reset__cta` sin usar (código muerto) [reset-password.component.scss:85]
- [x] [Review][Patch] Swallow silencioso cuando `mapResetPasswordError` devuelve `{ invalidToken: false, bannerKey: undefined }` [reset-password.component.ts:150-155]
- [x] [Review][Defer] `FieldInputComponent` aria-label toggle contraseña hardcodeado en español — componente compartido preexistente, diferido
- [x] [Review][Defer] Token leído de `snapshot` (no reactivo a cambios de query param) — explícitamente "no MVP" en dev notes, diferido
- [x] [Review][Defer] `fieldError()` no memoizado como `computed()` — patrón consistente con login, impacto acotado por OnPush, diferido
- [x] [Review][Defer] `inFlight` como boolean plano (no signal) — patrón intencional de dos niveles heredado de login, diferido
- [x] [Review][Defer] `@switch @default` maneja `'form'` implícitamente — union type TypeScript previene valores inesperados, diferido
- [x] [Review][Defer] Flag `destroyed` manual duplica `DestroyRef` — patrón intencional heredado de login, diferido
- [x] [Review][Defer] HTTP 401 cae al mapper genérico — caso límite, el interceptor whitelist estas rutas, diferido
- [x] [Review][Defer] Fallthrough de error en `confirmPassword` (mantenibilidad latente) — sin bug actual, solo si se añaden nuevos validadores, diferido
- [x] [Review][Defer] Directiva estructural `*transloco` mezclada con control flow nativo — patrón de proyecto, diferido
- [x] [Review][Defer] `EMAIL_PATTERN` no exportada — los tests cubren el comportamiento indirectamente, diferido
- [x] [Review][Defer] Múltiples `<h1>` por página (depende del shell) — patrón consistente con componente login, diferido
- [x] [Review][Defer] Forgot-password 400 → banner en lugar de error inline en campo — patrón consistente con login del proyecto, diferido

## Dev Notes

### ⚠️ Contexto de archivos existentes — CRÍTICO

| Archivo | Estado actual | Acción |
|---------|--------------|--------|
| `forgot-password.component.ts` | **Stub** — solo `<h1>Recuperar acceso</h1>` | **REEMPLAZAR** implementación completa |
| `reset-password.component.ts` | **Stub** — solo `<h1>Nueva contraseña</h1>` | **REEMPLAZAR** implementación completa |
| `login.component.ts` | **Completo** (historia 1.5) | **NO tocar** salvo enlace roto a `/forgot-password` |
| `register.component.ts` | **Completo** | Referencia de patrón únicamente |
| `auth.routes.ts` | Rutas `/forgot-password`, `/reset-password` ya declaradas | **NO tocar** |
| `auth-error.interceptor.ts` | Whitelist incluye `/auth/forgot-password`, `/auth/reset-password` | **NO tocar** |
| `AuthLayoutComponent` | Split-grid portado | **NO tocar** layout |

### Contrato API (backend ya implementado)

| Endpoint | Método generado | Body | Respuesta éxito | Errores relevantes |
|----------|-----------------|------|-----------------|-------------------|
| `/auth/forgot-password` | `authForgotPasswordPost` | `{ email }` | `200` + `MessageResponse` | `400` validación email |
| `/auth/reset-password` | `authResetPasswordPost` | `{ token, newPassword }` | `200` + `MessageResponse` | `400` token inválido/expirado/usado |

**Comportamiento backend (no reimplementar en frontend):**
- `ForgotPasswordUseCase`: siempre `200` con mensaje genérico; solo envía email si el usuario existe; enlace: `{CORS_ORIGIN}/reset-password?token={rawToken}`.
- `ResetPasswordUseCase`: token inválido/expirado/usado → `BadRequestException` → **HTTP 400** (sin body específico útil — mapear a UI `reset-invalid`).

**⛔ No traducir** `message` del body API — solo claves i18n frontend.

**⛔ No usar** `RecaptchaService.execute()` en forgot/reset (no está en OpenAPI).

### Patrón de implementación — copiar de LoginComponent (1.5)

Misma estructura que `login.component.ts` / `register.component.ts`:

- `FormBuilder` + `nonNullable` group, `Validators.required`, `EMAIL_PATTERN` (forgot), `Validators.minLength(8)` (reset)
- `DestroyRef` + `destroyed` flag + `inFlight` anti doble submit
- `TranslocoService` para `fieldError()` y banners
- `AuthService` inyectado — **no** `HttpClient` directo
- `LanguageSelectorComponent` en esquina superior (como login)
- `FieldInputComponent`, `BtnComponent`, `AlertBoxComponent`
- Specs: `TranslocoTestingModule`, mock `AuthService`, `provideRouter`, **no** mockear servicios innecesarios

**Confirmación de contraseña (reset):** validar en submit o con validador de grupo:

```typescript
// Opción A — en onSubmit antes de API:
if (newPassword !== confirmPassword) {
  // mostrar auth.reset.validation.password_mismatch
  return;
}
```

### ForgotPasswordComponent — scaffold

```typescript
type ForgotView = 'form' | 'sent';

readonly view = signal<ForgotView>('form');
readonly submitting = signal(false);
readonly bannerError = signal<string | null>(null);

readonly form = this.fb.nonNullable.group({
  email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
});

async onSubmit(): Promise<void> {
  // inFlight guard, markAllAsTouched, invalid → return
  // authForgotPasswordPost({ body: { email } })
  // 200 → view.set('sent') SIEMPRE (no inspeccionar si email existe)
  // catch → mapForgotPasswordError + banner
}
```

**Vista `sent`:** sin formulario; contenido centrado; `routerLink="/login"` en botón secundario (`btn--secondary` o `BtnComponent` variant).

### ResetPasswordComponent — scaffold

```typescript
type ResetView = 'invalid' | 'form' | 'done';

readonly token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';
readonly view = signal<ResetView>(this.token ? 'form' : 'invalid');

readonly form = this.fb.nonNullable.group({
  newPassword: ['', [Validators.required, Validators.minLength(8)]],
  confirmPassword: ['', [Validators.required]],
});

async onSubmit(): Promise<void> {
  if (this.view() !== 'form' || !this.token) return;
  // validar match newPassword === confirmPassword
  // authResetPasswordPost({ body: { token: this.token, newPassword } })
  // 200 → view.set('done')
  // 400 → view.set('invalid') o banner + CTA forgot
}
```

**Token en URL:** el email del backend usa query `token` (hex 64 chars). Leer una vez en constructor; si el usuario cambia query sin recargar, no es requisito MVP.

### `mapForgotPasswordError` / `mapResetPasswordError`

```typescript
// forgot-password-error.util.ts
export function mapForgotPasswordError(err: unknown): { bannerKey: string } {
  if (!(err instanceof HttpErrorResponse)) {
    return { bannerKey: 'auth.forgot.error.connection' };
  }
  if (err.status === 0) return { bannerKey: 'auth.forgot.error.connection' };
  if (err.status === 400) return { bannerKey: 'auth.forgot.error.validation' };
  return { bannerKey: 'auth.forgot.error.generic' };
}

// reset-password-error.util.ts
export function mapResetPasswordError(err: unknown): { invalidToken: boolean; bannerKey?: string } {
  if (!(err instanceof HttpErrorResponse)) {
    return { invalidToken: false, bannerKey: 'auth.reset.error.connection' };
  }
  if (err.status === 0) return { invalidToken: false, bannerKey: 'auth.reset.error.connection' };
  if (err.status === 400) return { invalidToken: true };
  return { invalidToken: false, bannerKey: 'auth.reset.error.generic' };
}
```

En catch de reset: si `invalidToken` → `view.set('invalid')`; si no, banner con `bannerKey`.

### Claves i18n (añadir en `auth` junto a `login` / `register`)

**`auth.common`** (compartido):

```json
"common": {
  "back_to_login": "Volver al inicio"
}
```

**`auth.forgot`** (es — traducir ca/en):

| Clave | Texto ES (referencia Login.html) |
|-------|----------------------------------|
| `title` | Recuperar acceso |
| `subtitle` | Introduce tu correo y te enviaremos un enlace para recuperar el acceso. |
| `field.email` | Correo electrónico |
| `field.email_placeholder` | tu@email.es |
| `submit` | Enviar enlace |
| `submitting` | Enviando… |
| `sent.title` | Revisa tu bandeja de entrada |
| `sent.lead` | Si ese correo está registrado, recibirás el enlace en breve. |
| `sent.spam_hint` | Comprueba también la carpeta de spam. |
| `recaptcha` | Protegido por reCAPTCHA (reutilizar estructura login: privacy/terms) |
| `validation.email_required` | Introduce tu correo electrónico |
| `validation.email_format` | El formato del correo no es válido |
| `error.validation` | Revisa el correo e inténtalo de nuevo. |
| `error.connection` | Error de conexión. Inténtalo de nuevo. |
| `error.generic` | No pudimos enviar el enlace. Inténtalo más tarde. |

**`auth.reset`** (es):

| Clave | Texto ES |
|-------|----------|
| `title` | Nueva contraseña |
| `subtitle` | Elige una contraseña segura. Debe tener al menos 8 caracteres. |
| `field.new_password` | Nueva contraseña |
| `field.confirm_password` | Confirmar contraseña |
| `field.password_placeholder` | •••••••• |
| `submit` | Guardar contraseña |
| `submitting` | Guardando… |
| `done.title` | Contraseña guardada |
| `done.subtitle` | Tu contraseña ha sido actualizada correctamente. Ya puedes acceder con tus nuevas credenciales. |
| `done.login_cta` | Iniciar sesión |
| `invalid.title` | Enlace no válido |
| `invalid.subtitle` | Este enlace ha expirado o ya fue utilizado. Puedes solicitar uno nuevo desde el inicio de sesión. |
| `invalid.request_new` | Solicitar nuevo enlace |
| `validation.new_password_required` | Introduce tu nueva contraseña |
| `validation.new_password_min` | La contraseña debe tener al menos 8 caracteres |
| `validation.confirm_required` | Confirma tu contraseña |
| `validation.password_mismatch` | Las contraseñas no coinciden |
| `error.connection` | Error de conexión. Inténtalo de nuevo. |
| `error.generic` | No pudimos guardar la contraseña. Inténtalo más tarde. |

### Diseño visual — Login.html (obligatorio)

Portar **solo el panel de formulario** (el `AuthLayoutComponent` ya tiene brand-col).

| Modo prototipo | Componente Angular | Elementos |
|----------------|-------------------|-----------|
| `forgot` | Forgot `form` | Back link, título, email, submit full-width, nota reCAPTCHA |
| `forgot-sent` | Forgot `sent` | Icono mail (SVG inline o CSS), textos centrados, btn secondary → login |
| `reset` | Reset `form` | Back link, 2× password, submit |
| `reset-invalid` | Reset `invalid` | Icono lock, textos centrados, btn → `/forgot-password` |
| `reset-done` | Reset `done` | Icono check, textos centrados, btn primary → `/login` |

**Estilos:** copiar estructura BEM de `login.component.scss` (`__lang`, `__title`, `__subtitle`, `__form`, `__back`, `__centered`, `__icon-circle`). Tokens solo de `colors_and_type.css`.

**Back link:** enlace con flecha + `auth.common.back_to_login` → `routerLink="/login"` (prototipo `BackBtn`).

### Patrón de tests mínimos

**`forgot-password.component.spec.ts`:**
1. No envía si formulario inválido
2. `200` → cambia a vista `sent` (mock resolve)
3. Muestra error de validación email touched
4. `400` / error red → banner traducido
5. doble submit → API una vez

**`reset-password.component.spec.ts`:**
1. Sin `token` en URL → vista `invalid` sin llamar API
2. Envío exitoso → vista `done` + `authResetPasswordPost` con token y password
3. `400` → vista `invalid`
4. Contraseñas no coinciden → no llama API
5. `minLength` — password corta no envía
6. doble submit → API una vez

**Util specs:** casos 400/0/500 como en `login-error.util.spec.ts`.

### Inteligencia historia 1.5 (aplicar sí o sí)

- `mapLoginError` ya mapea `status === 0` → connection — **replicar** en forgot/reset utils.
- Tests 401 sin sesión: forgot/reset **no usan** `SessionService`.
- `TranslocoTestingModule` obligatorio en specs de componentes auth.
- `auth-error.interceptor` no redirige en 401 de rutas `/auth/*` — reset 400 no dispara logout.
- Review 1.5: no modificar `app.config.ts` salvo necesidad extrema.

### Qué NO hacer

- No añadir reCAPTCHA ejecutable en forgot/reset
- No auto-login tras reset exitoso
- No unificar forgot+reset en un solo componente (rutas ya separadas)
- No editar `generated/`
- No prerender estas rutas (ya `Client` vía catch-all SSR)
- No implementar envío real de email (backend)
- No duplicar `sanitizeReturnUrl` (no aplica aquí)

### Estructura de archivos resultante

```
src/app/features/auth/forgot-password/
├── forgot-password.component.ts       # UPDATE
├── forgot-password.component.html     # NEW
├── forgot-password.component.scss     # NEW
├── forgot-password.component.spec.ts  # NEW
├── forgot-password-error.util.ts      # NEW
└── forgot-password-error.util.spec.ts # NEW

src/app/features/auth/reset-password/
├── reset-password.component.ts        # UPDATE
├── reset-password.component.html      # NEW
├── reset-password.component.scss      # NEW
├── reset-password.component.spec.ts   # NEW
├── reset-password-error.util.ts       # NEW
└── reset-password-error.util.spec.ts  # NEW

public/i18n/{es,ca,en}.json            # UPDATE
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.6, FR-F3, FR-F5]
- [Source: _bmad-output/project-context.md — diseño, API, i18n]
- [Source: docs/project/Login.html — modos forgot/reset]
- [Source: ../backend/openapi/openapi.json — ForgotPasswordRequest, ResetPasswordRequest]
- [Source: ../backend/src/application/use-cases/user/forgot-password.use-case.ts]
- [Source: ../backend/src/application/use-cases/user/reset-password.use-case.ts]
- [Source: src/app/features/auth/login/login.component.ts — patrón 1.5]
- [Source: src/app/features/auth/login/login-error.util.ts — patrón errores]
- [Source: src/app/features/auth/register/register.component.ts — validación password min 8]
- [Source: src/app/core/interceptors/auth-error.interceptor.ts]
- [Source: _bmad-output/implementation-artifacts/1-5-login-y-cierre-de-sesion.md — learnings review]

## Dev Agent Record

### Agent Model Used

Composer (dev-story)

### Debug Log References

### Completion Notes List

- `/forgot-password`: formulario reactivo + `authForgotPasswordPost`; éxito siempre muestra vista `sent` (sin filtrar por existencia de email).
- `/reset-password`: token desde query; vistas `invalid` | `form` | `done`; `authResetPasswordPost` sin auto-login.
- i18n `auth.forgot`, `auth.reset`, `auth.common` en es/ca/en.
- Utilidades de error alineadas con login (status 0, 400, genérico).
- 12 tests nuevos; suite total 102 passing; build OK.

### File List

- public/i18n/es.json
- public/i18n/ca.json
- public/i18n/en.json
- src/app/features/auth/forgot-password/forgot-password.component.ts
- src/app/features/auth/forgot-password/forgot-password.component.html
- src/app/features/auth/forgot-password/forgot-password.component.scss
- src/app/features/auth/forgot-password/forgot-password.component.spec.ts
- src/app/features/auth/forgot-password/forgot-password-error.util.ts
- src/app/features/auth/forgot-password/forgot-password-error.util.spec.ts
- src/app/features/auth/reset-password/reset-password.component.ts
- src/app/features/auth/reset-password/reset-password.component.html
- src/app/features/auth/reset-password/reset-password.component.scss
- src/app/features/auth/reset-password/reset-password.component.spec.ts
- src/app/features/auth/reset-password/reset-password-error.util.ts
- src/app/features/auth/reset-password/reset-password-error.util.spec.ts

## Change Log

- 2026-05-21: Story 1.6 creada (ready-for-dev). Contexto exhaustivo para forgot-password y reset-password siguiendo Login.html y patrones 1.5.
- 2026-05-21: Implementación completa forgot/reset password, i18n, tests (dev-story).
