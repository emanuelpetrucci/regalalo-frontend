# Story 8-f3: Pantalla `/verificar-email` (procesamiento del token)

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed — comprehensive developer guide created. Épica 8-f DLT-email-verification — procesamiento automático del token del email y confirmación en login. -->

## Story

Como usuario que pulsa el enlace del email de verificación,
quiero que el token sea procesado automáticamente y ser redirigido al resultado correcto,
para completar la verificación sin pasos manuales.

## Acceptance Criteria

1. **Given** la ruta `/verificar-email?token=<token>` (pública — no requiere auth)
   **When** el componente inicializa
   **Then** extrae el parámetro `token` del query string y llama `AuthService.authVerifyEmailGet({ token })`
   **And** muestra un indicador de carga mientras se resuelve la petición

2. **Given** respuesta 200 de la verificación
   **When** se procesa el resultado
   **Then** redirige a `/login?emailVerified=1`
   **And** la pantalla de login muestra mensaje de confirmación visible (clave `auth.login.email_verified_success`)

3. **Given** respuesta 400 (token inválido o expirado)
   **When** se procesa el error
   **Then** muestra mensaje de error (`auth.verifyEmail.error.invalid`)
   **And** ofrece enlace a `/verificacion-pendiente` para solicitar un nuevo enlace

4. **Given** ausencia de `token` en el query param (vacío, ausente o solo espacios)
   **When** el componente inicializa
   **Then** **no** llama a la API
   **And** trata el caso como token inválido (misma vista de error que AC #3)

5. **Given** error de red (`status === 0`)
   **When** falla la petición de verificación
   **Then** muestra mensaje de conexión (`auth.verifyEmail.error.connection`)
   **And** ofrece enlace a `/verificacion-pendiente`

6. **Given** la pantalla
   **When** un lector de pantalla la recorre
   **Then** cumple WCAG AA (estados con `role="status"` / `aria-live`, focus en CTA)
   **And** todas las cadenas visibles usan claves i18n (`auth.verifyEmail.*` y `auth.login.email_verified_success`)

## Tasks / Subtasks

### A. Ruta y estructura de ficheros (AC: 1)

- [x] Crear carpeta `src/app/features/auth/verify-email/`
- [x] Crear `verify-email.component.ts` con selector `app-verify-email`
- [x] Crear `verify-email.component.html` (template externo)
- [x] Crear `verify-email.component.scss` (tokens de `colors_and_type.css`; reutilizar patrones de `reset-password` / `verification-pending`)
- [x] Añadir ruta `verificar-email` en `src/app/features/auth/auth.routes.ts` (sin `canActivate`)

### B. Lógica del componente — auto-verificación (AC: 1, 2, 3, 4, 5)

- [x] Definir `type VerifyEmailView = 'loading' | 'error'`
- [x] Leer token en constructor: `this.route.snapshot.queryParamMap.get('token')?.trim() ?? ''`
- [x] Si `!token` → `view.set('error')` inmediatamente (sin llamada API)
- [x] Si hay token → `view` permanece `'loading'` y disparar verificación en `ngOnInit` o constructor (patrón fire-and-forget con `destroyRef`)
- [x] Implementar `verifyToken()`:
  - `await this.authApi.authVerifyEmailGet({ token: this.token })`
  - Ante 200: `await this.router.navigate(['/login'], { queryParams: { emailVerified: '1' } })`
  - Ante 400 (`HttpErrorResponse`): `view.set('error')`
  - Ante `status === 0`: `bannerError` con clave connection + `view.set('error')` o mantener loading con error visible
  - Otros errores: `bannerError` generic + `view.set('error')`
- [x] Proteger con `if (this.destroyed) return` tras cada `await`
- [x] Flag `inFlight` para evitar doble ejecución si el componente se re-inicializa

### C. Retrofit mínimo en Login — mensaje post-verificación (AC: 2)

- [x] En `login.component.ts`: `readonly emailVerifiedSuccess = computed(() => this.route.snapshot.queryParamMap.get('emailVerified') === '1')`
- [x] En `login.component.html`: bloque `@if (emailVerifiedSuccess())` **antes** del formulario, con `app-alert-box variant="success"` (ver tarea D)
- [x] Añadir clave `auth.login.email_verified_success` en `es.json`, `ca.json`, `en.json`
- [x] Actualizar `login.component.spec.ts` con test: query param `emailVerified=1` muestra el banner de éxito

### D. Variante `success` en AlertBox (AC: 2, 6)

- [x] Extender `AlertBoxComponent`: input `variant` acepta `'error' | 'warning' | 'success'`
- [x] Añadir estilos `.alert-box--success` en `alert-box.component.scss` usando tokens existentes (ver `reset__icon-circle--success` / variables `--color-*` del design system)
- [x] **No** inventar colores fuera de `colors_and_type.css`

### E. Internacionalización — claves i18n (AC: 3, 4, 5, 6)

- [x] Añadir bloque `auth.verifyEmail` en `public/i18n/es.json`:
  ```json
  "verifyEmail": {
    "loading_title": "Verificando tu correo…",
    "loading_lead": "Espera un momento mientras confirmamos tu enlace.",
    "error": {
      "invalid_title": "Enlace no válido",
      "invalid": "El enlace no es válido o ha expirado.",
      "connection": "Error de conexión. Inténtalo de nuevo.",
      "generic": "No pudimos verificar tu correo. Inténtalo más tarde."
    },
    "cta_resend": "Solicitar nuevo enlace"
  }
  ```
- [x] Añadir en login (mismo bloque `auth.login`):
  ```json
  "email_verified_success": "Tu email ha sido verificado. Ya puedes iniciar sesión."
  ```
- [x] Traducir equivalentes en `ca.json` y `en.json`

### F. Template y estilos verify-email (AC: 1, 3, 6)

- [x] Vista `loading`: icono/spinner + título + lead (`auth.verifyEmail.loading_*`); `aria-busy="true"` en contenedor
- [x] Vista `error`: icono error (patrón `reset__icon-circle--error`), título, mensaje (`bannerError()` o clave invalid por defecto), CTA `<a routerLink="/verificacion-pendiente">`
- [x] Patrones visuales de `docs/project/Login.html` — card centrada bajo `AuthLayoutComponent`
- [x] Zona de mensajes: `aria-live="polite"` en errores

### G. Tests unitarios (AC: 1–6)

- [x] Crear `verify-email.component.spec.ts` con `TranslocoTestingModule.forRoot({ langs: { es: esJson } })`
- [x] Test: sin `token` en query → no llama `authVerifyEmailGet`, vista error
- [x] Test: con token válido → llama API; tras 200 navega a `/login` con `emailVerified=1`
- [x] Test: API devuelve 400 → vista error + enlace a `/verificacion-pendiente`
- [x] Test: `status === 0` → mensaje connection
- [x] Test login: `emailVerified=1` muestra banner success
- [x] `ng test` y `ng build` sin errores TS

## Dev Notes

### Ubicación y estructura del nuevo componente

```
src/app/features/auth/
├── verify-email/
│   ├── verify-email.component.ts    ← NUEVO
│   ├── verify-email.component.html  ← NUEVO
│   ├── verify-email.component.scss  ← NUEVO
│   └── verify-email.component.spec.ts ← NUEVO
├── login/
│   ├── login.component.ts           ← MODIFICAR: emailVerifiedSuccess
│   ├── login.component.html         ← MODIFICAR: banner éxito
│   └── login.component.spec.ts      ← MODIFICAR: test banner
└── auth.routes.ts                   ← MODIFICAR: ruta verificar-email
```

**La ruta se añade SÓLO en `auth.routes.ts`.** `app.routes.ts` ya incluye `AUTH_ROUTES` bajo `AuthLayoutComponent` sin `canActivate`.

### Ruta a añadir en `auth.routes.ts`

```typescript
{
  path: 'verificar-email',
  loadComponent: () =>
    import('./verify-email/verify-email.component').then(
      (m) => m.VerifyEmailComponent,
    ),
},
```

**Sin `canActivate`.** Ruta pública; el enlace del email no incluye JWT.

### API: `AuthService.authVerifyEmailGet`

Método generado en `src/app/core/api/generated/services/auth.service.ts`:

```typescript
authVerifyEmailGet(params: AuthVerifyEmailGet$Params, context?: HttpContext): Promise<MessageResponse>
```

Parámetros (`auth-verify-email-get.ts`):

```typescript
export interface AuthVerifyEmailGet$Params {
  token: string;  // requerido — se envía como query ?token=
}
```

- **Sin autenticación** — no requiere JWT; el interceptor JWT no añade header si no hay token (comportamiento existente).
- **Respuestas:**
  - `200` → `{ message: string }` — verificación OK → redirect `/login?emailVerified=1`
  - `400` → token inválido o expirado → vista error
  - `0` → error de red → mensaje connection

### Implementación de referencia — flujo principal

```typescript
type VerifyEmailView = 'loading' | 'error';

export class VerifyEmailComponent implements OnInit {
  private readonly authApi = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly transloco = inject(TranslocoService);

  readonly token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';
  readonly view = signal<VerifyEmailView>(this.token ? 'loading' : 'error');
  readonly bannerError = signal<string | null>(null);

  private destroyed = false;
  private inFlight = false;

  constructor() {
    this.destroyRef.onDestroy(() => { this.destroyed = true; });
  }

  ngOnInit(): void {
    if (!this.token) {
      this.bannerError.set(this.transloco.translate('auth.verifyEmail.error.invalid'));
      return;
    }
    void this.verifyToken();
  }

  private async verifyToken(): Promise<void> {
    if (this.inFlight) return;
    this.inFlight = true;
    try {
      await this.authApi.authVerifyEmailGet({ token: this.token });
      if (this.destroyed) return;
      await this.router.navigate(['/login'], { queryParams: { emailVerified: '1' } });
    } catch (err) {
      if (this.destroyed) return;
      if (err instanceof HttpErrorResponse) {
        if (err.status === 400) {
          this.bannerError.set(this.transloco.translate('auth.verifyEmail.error.invalid'));
          this.view.set('error');
          return;
        }
        if (err.status === 0) {
          this.bannerError.set(this.transloco.translate('auth.verifyEmail.error.connection'));
          this.view.set('error');
          return;
        }
      }
      this.bannerError.set(this.transloco.translate('auth.verifyEmail.error.generic'));
      this.view.set('error');
    } finally {
      this.inFlight = false;
    }
  }
}
```

**Crítico:** comprobar `!token` **antes** de llamar a la API (deferred de code-review 8-f1).

### Redirect a login con confirmación (AC: 2)

Usar **query param** `emailVerified=1` (consistente con el patrón existente `returnUrl` en login):

```typescript
await this.router.navigate(['/login'], { queryParams: { emailVerified: '1' } });
```

En login:

```typescript
readonly emailVerifiedSuccess = computed(
  () => this.route.snapshot.queryParamMap.get('emailVerified') === '1',
);
```

Template (orden: éxito verificación → sesión expirada → error formulario):

```html
@if (emailVerifiedSuccess()) {
  <div class="login__alert" aria-live="polite">
    <app-alert-box variant="success">{{ t('auth.login.email_verified_success') }}</app-alert-box>
  </div>
}
@if (sessionExpired()) { ... }
```

**No usar** el `message` del body API en la UI — el copy es fijo vía i18n (coherente con el resto del módulo auth).

### Vista error — enlace a reenvío (AC: 3, 4)

```html
@case ('error') {
  <div class="ve__centered" role="alert">
    <!-- icono error, título auth.verifyEmail.error.invalid_title -->
    <p>{{ bannerError() ?? t('auth.verifyEmail.error.invalid') }}</p>
    <app-btn variant="secondary" [fullWidth]="true" routerLink="/verificacion-pendiente">
      {{ t('auth.verifyEmail.cta_resend') }}
    </app-btn>
  </div>
}
```

`/verificacion-pendiente` ya existe (historia **8-f2**). El reenvío requiere JWT — el usuario debe haberse registrado antes; si llega sin sesión, el botón de reenvío en esa pantalla fallará con 401 (interceptor → login), comportamiento aceptado.

### Diseño: patrones visuales de `Login.html` (sin prototipo dedicado)

Igual que 8-f2: no hay HTML dedicado. Reutilizar:
- Layout centrado bajo `AuthLayoutComponent`
- Estados `loading` / `error` análogos a `reset-password` (`reset__centered`, icon circles)
- Clases BEM prefijo `ve__` (verify-email) o reutilizar clases `reset__*` si el SCSS es idéntico (preferible copiar estructura de `verification-pending` / `reset-password` para mantener consistencia)

### Accesibilidad WCAG AA (AC: 6)

- Estado loading: `aria-busy="true"` en el contenedor principal; texto visible (no spinner solo)
- Estado error: `role="alert"` en el bloque de error
- Login success: `aria-live="polite"` (no interrumpe lectura agresiva)
- CTA a `/verificacion-pendiente`: `<a>` o `routerLink` en botón con foco visible
- Contraste: solo tokens de `colors_and_type.css`

### Patrón de test — verify-email

```typescript
import { TranslocoTestingModule } from '@jsverse/transloco';
import esJson from '../../../../../public/i18n/es.json';

const authSpy = jasmine.createSpyObj('AuthService', ['authVerifyEmailGet']);
const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

TestBed.configureTestingModule({
  imports: [
    VerifyEmailComponent,
    TranslocoTestingModule.forRoot({ langs: { es: esJson }, translocoConfig: { defaultLang: 'es' } }),
  ],
  providers: [
    { provide: AuthService, useValue: authSpy },
    { provide: Router, useValue: routerSpy },
    provideRouter([]),
    {
      provide: ActivatedRoute,
      useValue: { snapshot: { queryParamMap: convertToParamMap({ token: 'abc' }) } },
    },
  ],
});
```

Spy de navegación: `expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { emailVerified: '1' } })`.

### Inteligencia de historia anterior (8-f2)

| Aprendizaje 8-f2 | Aplicación en 8-f3 |
|---|---|
| `HttpErrorResponse` en canal `catch` para errores API | Igual para 400 y 0 |
| `destroyed` + `destroyRef.onDestroy` tras awaits | Obligatorio en `verifyToken()` |
| `TranslocoTestingModule` con `esJson` importado | Tests sin loader real |
| Patrones SCSS `__centered`, `__icon-circle` | Reutilizar en verify-email |
| No manejar 401 en componente público | verify-email no usa JWT |
| Review: parseo robusto Retry-After | N/A en 8-f3 |
| Review: chequear token antes de API | **AC #4 explícito** |

### Qué NO hacer en 8-f3

- ❌ Modificar `AuthGuard` o interceptores (historia **8-f4**)
- ❌ Modificar `register.component.ts` redirect (historia **8-f5**)
- ❌ Modificar `session.service.ts` / `SessionUser.emailVerified` (historia **8-f4**)
- ❌ Modificar `verification-pending` salvo si se detecta bug — fuera de alcance
- ❌ Editar `src/app/core/api/generated/`
- ❌ Mostrar pantalla de éxito intermedia en verify-email — el éxito se comunica en **login** (AC #2)
- ❌ Usar `Router.navigate` con `state` si el equipo ya estandarizó query params (`returnUrl`, `emailVerified`)

### Dependencias completadas

- ✅ `8-f1`: `authVerifyEmailGet` disponible en `AuthService`
- ✅ `8-f2`: `/verificacion-pendiente` implementada (destino del CTA error)
- ✅ `AuthLayoutComponent`, `BtnComponent`, `AlertBoxComponent`, Transloco es/ca/en

### Architecture compliance

| Regla | Detalle |
|---|---|
| Carpeta nueva | `src/app/features/auth/verify-email/` — `architecture.md` v1.5 §2 |
| Ruta pública | `auth.routes.ts`, sin `canActivate` |
| API | `AuthService.authVerifyEmailGet({ token })` — no HttpClient directo |
| i18n | `auth.verifyEmail.*`, `auth.login.email_verified_success` |
| OnPush | `ChangeDetectionStrategy.OnPush` |
| signals | `signal()` + `computed()` en login |
| Redirect éxito | `/login?emailVerified=1` — §6 architecture.md |
| Error | Enlace `/verificacion-pendiente` — §6 architecture.md |
| WCAG | `aria-live`, `role`, contraste tokens |

### Git intelligence (commits recientes)

- `8b33fc9` — verification-pending: patrones de componente auth, cooldown, i18n `auth.verificationPending.*`
- `6db2d5a` — email verification API: `authVerifyEmailGet`, `authResendVerificationPost` generados

Reutilizar estructura de ficheros y estilo de tests de `verification-pending.component.spec.ts`.

### Referencias

- [Source: docs/architecture.md §2, §4 GET /auth/verify-email, §6] — contrato y reglas DLT-email-verification
- [Source: docs/api-client.md] — `authVerifyEmailGet`
- [Source: docs/delta-frontend-email-verification.md] — procesamiento enlace y redirect login
- [Source: _bmad-output/planning-artifacts/epics.md#Story-8-f3] — AC originales
- [Source: _bmad-output/implementation-artifacts/8-f2-pantalla-verificacion-pendiente.md] — patrones auth previos
- [Source: src/app/core/api/generated/fn/auth/auth-verify-email-get.ts] — query param `token`
- [Source: src/app/features/auth/reset-password/reset-password.component.ts] — patrón token query + views
- [Source: src/app/features/auth/verification-pending/] — patrones visuales auth recientes
- [Source: src/app/features/auth/login/login.component.ts] — añadir `emailVerifiedSuccess`
- [Source: src/app/shared/components/alert-box/] — extender variant success
- [Source: docs/project/Login.html] — patrones visuales módulo auth

## Dev Agent Record

### Agent Model Used

Composer (dev-story 2026-05-27)

### Debug Log References

### Completion Notes List

- Pantalla pública `/verificar-email` procesa `?token=` vía `authVerifyEmailGet`; sin token no llama API.
- Éxito redirige a `/login?emailVerified=1` con banner `AlertBox` variant `success`.
- Errores 400/0/genérico muestran vista error con CTA a `/verificacion-pendiente`.
- i18n `auth.verifyEmail.*` y `auth.login.email_verified_success` en es/ca/en.
- Tests: 6 verify-email + 1 login; `ng test` 492 passed; `ng build` OK.

### File List

- src/app/features/auth/verify-email/verify-email.component.ts (nuevo)
- src/app/features/auth/verify-email/verify-email.component.html (nuevo)
- src/app/features/auth/verify-email/verify-email.component.scss (nuevo)
- src/app/features/auth/verify-email/verify-email.component.spec.ts (nuevo)
- src/app/features/auth/auth.routes.ts
- src/app/features/auth/login/login.component.ts
- src/app/features/auth/login/login.component.html
- src/app/features/auth/login/login.component.spec.ts
- src/app/shared/components/alert-box/alert-box.component.ts
- src/app/shared/components/alert-box/alert-box.component.scss
- public/i18n/es.json
- public/i18n/ca.json
- public/i18n/en.json

### Review Findings

- [x] [Review][Patch] **Verificación en SSR puede consumir el token dos veces** [`verify-email.component.ts:44-49`] — Guard `isPlatformBrowser` antes de `verifyToken`.
- [x] [Review][Patch] **AC #6: sin gestión de foco en el CTA de error** [`verify-email.component.html:45-47`] — `effect` + `afterNextRender` enfoca el botón del CTA en vista `error`.
- [x] [Review][Patch] **Fallo de `router.navigate` deja la UI en loading** [`verify-email.component.ts:58`] — Si `navigate` devuelve `false`, `showError('generic', ...)`.
- [x] [Review][Patch] **Título de error fijo para errores de conexión/genéricos** [`verify-email.component.html:41`] — `errorKind` + claves `connection_title` / `generic_title` en i18n.
- [x] [Review][Patch] **Falta test de error HTTP genérico (5xx)** [`verify-email.component.spec.ts`] — Tests 500, navigate rechazado y SSR sin llamada API.
- [x] [Review][Defer] **`emailVerifiedSuccess` basado en `route.snapshot`** [`login.component.ts:56-58`] — Mismo patrón que `sessionExpired`; no reacciona a cambios de query sin re-navegación; aceptable para redirect único desde verify-email.
- [x] [Review][Defer] **`routerLink` en `app-btn` (botón anidado)** [`verify-email.component.html:45`] — Patrón ya usado en reset-password y verification-pending; mejora de `BtnComponent` fuera de alcance 8-f3.
- [x] [Review][Defer] **Icono de AlertBox success sigue siendo triángulo de aviso** [`alert-box.component.ts:14-30`] — Plantilla compartida preexistente; variant `success` solo añade estilos.

### Change Log

- 2026-05-27: Historia 8-f3 implementada — verify-email, login banner éxito, AlertBox success, i18n.
- 2026-05-27: code-review 8-f3 — 5 patch, 3 defer; AC cumplidos salvo foco CTA y riesgo SSR.
- 2026-05-27: code-review patches aplicados — SSR guard, foco CTA, navigate fallido, títulos error, tests ampliados.
