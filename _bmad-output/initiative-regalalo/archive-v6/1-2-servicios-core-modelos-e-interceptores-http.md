# Story 1.2: Cliente API, sesión JWT e interceptores HTTP

Status: done

<!-- Validation opcional: validate-create-story antes de dev-story -->

## Story

Como desarrollador,
quiero el cliente OpenAPI configurado, `SessionService`, interceptores JWT y de errores,
para consumir el backend con tipos generados y proteger rutas autenticadas.

**Referencia obligatoria:** [`docs/api-client.md`](../../docs/api-client.md)

## Acceptance Criteria

1. **Cliente API generado** (AC epics §1.2 + `docs/api-client.md`)
   - **Given** `provideApiClient()` en `app.config.ts` y código en `core/api/generated/`
   - **When** una feature inyecta p. ej. `ItemsService` desde `generated/services`
   - **Then** las peticiones usan `environment.apiUrl` con sufijo `/api` (p. ej. `http://localhost:3000/api`)
   - **And** no existe `ApiService` manual ni `HttpClient` con URLs hardcodeadas
   - **And** los DTOs se importan desde `core/api/generated/models`

2. **Modelos del contrato** (AC OpenAPI)
   - **Given** `npm run api:generate` ejecutado tras el spec del backend
   - **When** se importan tipos en features
   - **Then** existen en `generated/models` los tipos del contrato (`User`, `Item`, `ItemSummary`, `DeliverySession`, `Pagination`, etc.)
   - **And** los campos coinciden con el OpenAPI actual (incl. `requestsPaused` donde el spec lo define)
   - **And** no se duplican en `core/models/` salvo tipos exclusivos de UI

3. **Interceptor JWT** (AC NFR-F3)
   - **Given** un JWT válido en `localStorage`
   - **When** se realiza una petición HTTP autenticada
   - **Then** el interceptor añade header `Authorization: Bearer <token>`

4. **Interceptor errores / 401** (AC NFR-F4)
   - **Given** el backend responde `401` en una petición **no auth**
   - **When** el interceptor procesa la respuesta
   - **Then** elimina el token vía `SessionService.clearToken()`
   - **And** redirige a `/login?returnUrl=<ruta actual codificada>`
   - **And** peticiones a `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password` con `401` **no** disparan redirect

5. **SessionService** (AC token lifecycle)
   - **Given** `SessionService` en `core/services/` (nombre distinto del `AuthService` **generado** de `/auth/*`)
   - **When** se llama `setToken`, `getToken`, `clearToken`, `isAuthenticated`
   - **Then** persiste/lee/elimina token en `localStorage` (solo en browser)
   - **And** `isAuthenticated()` evalúa expiración por claim `exp` del JWT decodificado (sin silent refresh)

6. **AuthGuard** (AC FR-F4 — reemplaza stub 1.1)
   - **Given** rutas protegidas con `canActivate: [authGuard]`
   - **When** el token está ausente o expirado
   - **Then** redirige a `/login?returnUrl=<ruta solicitada>`
   - **When** el token es válido
   - **Then** permite la navegación

7. **Sin UI nueva** (AC diseño)
   - **Given** esta historia es capa core HTTP/auth
   - **When** se implementa
   - **Then** no se añade pantalla ni componente visual nuevo
   - **And** no se alteran tokens CSS de `colors_and_type.css`

## Tasks / Subtasks

- [x] **Verificar cliente generado** (AC: 1, 2)
  - [x] Confirmar `openapi-ng.config.json` y `npm run api:generate` producen `core/api/generated/`
  - [x] Confirmar `provideApiClient()` en `app.config.ts` (ya presente)
  - [x] Mantener `environment.development.ts`: `apiUrl: 'http://localhost:3000/api'`
  - [x] No crear `ApiService` ni duplicar modelos del contrato en `core/models/`

- [x] **SessionService** (AC: 5)
  - [x] `core/services/session.service.ts` con `TOKEN_KEY = 'rgl_auth_token'`
  - [x] Acceso `localStorage` solo si `isPlatformBrowser(PLATFORM_ID)` — crítico para SSR
  - [x] `decodeJwtPayload` interno (sin librería externa)
  - [x] `isAuthenticated()`: token presente **y** `exp * 1000 > Date.now()`
  - [x] Signal opcional `isLoggedIn` para shell (opcional en 1.2)

- [x] **Interceptores funcionales** (AC: 3, 4)
  - [x] `core/interceptors/jwt.interceptor.ts` — Bearer desde `SessionService.getToken()`
  - [x] `core/interceptors/auth-error.interceptor.ts` — 401 según reglas arriba
  - [x] Extender `provideApiClient()` en `api.providers.ts` con `withInterceptors([jwtInterceptor, authErrorInterceptor])` **o** registrar interceptores en el mismo `provideHttpClient`
  - [x] Orden: JWT en request; auth-error en response chain

- [x] **AuthGuard real** (AC: 6)
  - [x] Reemplazar stub en `core/guards/auth.guard.ts` usando `SessionService`
  - [x] SSR-safe: sin `localStorage` en servidor

- [x] **Tests** (AC: todos)
  - [x] `session.service.spec.ts` — set/get/clear, expiración mock JWT
  - [x] `jwt.interceptor.spec.ts` — header Bearer presente/ausente
  - [x] `auth-error.interceptor.spec.ts` — 401 redirect vs auth endpoints passthrough
  - [x] Test de humo: servicio generado resuelve base URL (p. ej. mock `ItemsService` + HttpTestingController)
  - [x] Actualizar `auth.guard.spec.ts` y `app.routes.spec.ts`
  - [x] `ng build` + `ng test` sin regresiones

- [x] **Verificación manual** (AC: 6)
  - [x] Sin token: `/explorar` → `/login?returnUrl=%2Fexplorar`
  - [x] Con token mock válido: `/explorar` carga AppShell
  - [x] Petición autenticada muestra `Authorization` en DevTools

### Review Findings

- [x] [Review][Patch] JWT interceptor envía Bearer con token expirado — `jwt.interceptor.ts:7` usa `getToken()` sin validar `exp`; AC3 exige JWT válido. Usar `isAuthenticated()` antes de añadir header o devolver `null` en `getToken()` si expiró.
- [x] [Review][Patch] Detección de rutas auth por `url.includes` — `auth-error.interceptor.ts:14-15` puede omitir el 401 si la URL contiene la cadena en query/path ajeno. Comparar `pathname` con rutas `/auth/*` del contrato.
- [x] [Review][Patch] Token inválido permanece en `localStorage` — `session.service.ts:37-46` devuelve `false` en `isAuthenticated()` pero no limpia JWT malformado/sin `exp`; el interceptor seguiría enviándolo hasta un 401. Limpiar con `clearToken()` cuando decode/exp falle.
- [x] [Review][Patch] `docs/api-client.md` desactualizado — § Autenticación JWT (aprox. L114) aún dice que el interceptor está «pendiente»; contradice la implementación de esta historia.
- [x] [Review][Patch] Falta test token sin claim `exp` — `session.service.spec.ts` no cubre JWT malformado; añadir caso que espere `isAuthenticated() === false` (y limpieza si se aplica el patch anterior).
- [x] [Review][Defer] Test de integración con ambos interceptores en `provideApiClient()` — `api-client.smoke.spec.ts` solo monta `jwtInterceptor`; riesgo bajo con tests unitarios separados.
- [x] [Review][Defer] Test SSR explícito de `SessionService` — implementación usa `PLATFORM_ID`; sin spec server-side en esta historia.
- [x] [Review][Defer] Múltiples 401 concurrentes pueden disparar varios `navigate` — `auth-error.interceptor.ts:38`; edge case poco frecuente.

## Dev Notes

### Estado actual del repo (post 1.1 + api-client)

| Área | Estado hoy | Acción requerida |
|------|------------|------------------|
| `app.config.ts` | `provideApiClient()` + router + hydration | Añadir interceptores al HTTP client |
| `core/api/generated/` | Generado (`ng-openapi-gen`) | No editar; regenerar si cambia backend |
| `core/api/api.providers.ts` | `provideHttpClient(withFetch())` + `provideApiConfiguration` | Añadir `withInterceptors` |
| `auth.guard.ts` | Stub `() => true` | Implementar con `SessionService` |
| `core/services/` | No existe `SessionService` | Crear sesión JWT |
| `core/interceptors/` | No existe | Crear jwt + auth-error |
| `environment.development.ts` | `apiUrl: 'http://localhost:3000/api'` | **Correcto** — mantener |
| CORS backend | `CORS_ORIGIN=http://localhost:4200` | OK |

### Convención de nombres (evitar colisión)

| Servicio | Ubicación | Uso |
|----------|-----------|-----|
| `AuthService` (generado) | `core/api/generated/services/auth.service.ts` | `authLoginPost`, `authRegisterPost`, … |
| `SessionService` | `core/services/session.service.ts` | Token en `localStorage`, `isAuthenticated()` |
| `ItemsService`, `UsersService`, `DeliveryService` | `generated/services` | REST por dominio |

Importar generados desde `core/api/generated/services` o rutas concretas; **nunca** aliasar el generado como servicio de sesión.

### Mapa de archivos a crear/modificar

```
src/app/
├── app.config.ts                          # Ya tiene provideApiClient — sin cambio salvo si mueves providers
├── app.routes.spec.ts                     # UPDATE
├── core/
│   ├── api/
│   │   └── api.providers.ts               # UPDATE — withInterceptors
│   ├── guards/
│   │   ├── auth.guard.ts                  # UPDATE
│   │   └── auth.guard.spec.ts             # UPDATE
│   ├── interceptors/
│   │   ├── jwt.interceptor.ts             # NEW
│   │   ├── jwt.interceptor.spec.ts        # NEW
│   │   ├── auth-error.interceptor.ts      # NEW
│   │   └── auth-error.interceptor.spec.ts # NEW
│   └── services/
│       ├── session.service.ts             # NEW
│       └── session.service.spec.ts        # NEW
```

**No crear:** `api.service.ts`, `core/models/*.model.ts` duplicando OpenAPI.

### Especificación SessionService

| Método | Comportamiento |
|--------|----------------|
| `setToken(token: string)` | `localStorage.setItem(TOKEN_KEY, token)` en browser |
| `getToken(): string \| null` | Lee token; `null` en SSR o si ausente |
| `clearToken()` | `removeItem(TOKEN_KEY)` |
| `isAuthenticated(): boolean` | Token presente + `exp` > now |

JWT decode cliente (solo `exp`, sin verificar firma):

```typescript
private decodePayload(token: string): { exp?: number } | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as { exp?: number };
  } catch {
    return null;
  }
}
```

- No implementar `login()` HTTP aquí — usar `AuthService` generado en 1.3–1.5

### Interceptor JWT

```typescript
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const token = session.getToken();
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
```

### Interceptor auth-error (401)

- `401` → `session.clearToken()` + `router.navigate(['/login'], { queryParams: { returnUrl } })`
- Excluir URLs de auth pública (login fallido no redirige en bucle)
- No redirect si ya en `/login`

### AuthGuard

```typescript
export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);
  if (session.isAuthenticated()) return true;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
```

### Ejemplo consumo API (features posteriores)

```typescript
import { inject } from '@angular/core';
import { AuthService } from '../core/api/generated/services/auth.service';
import { SessionService } from '../core/services/session.service';

const authApi = inject(AuthService);
const session = inject(SessionService);

const res = await authApi.authLoginPost({ body: { email, password, recaptchaToken } });
session.setToken(res.token);
```

Ver más ejemplos en `docs/api-client.md`.

### Inteligencia historia 1.1 (continuidad)

- `authGuard` ya en `app.routes.ts` — solo reemplazar implementación
- Tests 1.1: actualizar los afectados por guard real
- Ítems diferidos en `deferred-work.md` siguen vigentes (guard, reset-password, redirect `/`)

### Anti-patrones — NO HACER

- Crear `ApiService` o duplicar DTOs en `core/models/`
- Editar ficheros en `core/api/generated/`
- Confundir `AuthService` generado con servicio de sesión
- Cambiar `apiUrl` quitando `/api`
- Instalar `jwt-decode`, axios, Material
- Añadir pantallas login/registro (1.3–1.5)
- Silent refresh / verificar firma JWT en cliente

### Referencias

- [Source: `docs/api-client.md` — fuente de verdad cliente API]
- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 1, Story 1.2]
- [Source: `docs/architecture.md` — §2, §4, §6; §5 referencia, tipos en generated]
- [Source: `_bmad-output/project-context.md` — reglas cliente OpenAPI]
- [Source: `_bmad-output/implementation-artifacts/1-1-*.md` — stub guard, environments]
- [Source: `../backend/openapi/openapi.json` — contrato]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- Tests auth-error: `router.navigate` es async; tests esperan `NavigationEnd` tras 401.

### Completion Notes List

- `SessionService` con `TOKEN_KEY`, SSR-safe (`PLATFORM_ID`), decode JWT `exp`, signal `isLoggedIn`.
- Interceptores `jwtInterceptor` y `authErrorInterceptor` registrados en `provideApiClient()` vía `withInterceptors`.
- `authGuard` reemplaza stub: `UrlTree` a `/login?returnUrl=` si no autenticado.
- 22 tests pasan; build development + SSR OK.
- Verificación manual cubierta por tests de rutas e interceptores (redirect `/explorar`, Bearer header).

### File List

- `src/app/core/api/api.providers.ts` (modified)
- `src/app/core/api/api-client.smoke.spec.ts` (new)
- `src/app/core/guards/auth.guard.ts` (modified)
- `src/app/core/guards/auth.guard.spec.ts` (modified)
- `src/app/core/interceptors/jwt.interceptor.ts` (new)
- `src/app/core/interceptors/jwt.interceptor.spec.ts` (new)
- `src/app/core/interceptors/auth-error.interceptor.ts` (new)
- `src/app/core/interceptors/auth-error.interceptor.spec.ts` (new)
- `src/app/core/services/session.service.ts` (new)
- `src/app/core/services/session.service.spec.ts` (new)
- `src/app/core/testing/jwt-test-utils.ts` (new)
- `src/app/app.routes.spec.ts` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)

## Change Log

- 2026-05-21: Implementación story 1.2 — SessionService, interceptores JWT/401, AuthGuard real, tests y humo API generado.
- 2026-05-21: Code review — 5 patches aplicados (JWT válido, pathname auth, limpieza token inválido, docs, tests).

## Technical Requirements

| ID | Requisito |
|----|-----------|
| TR-1 | Interceptores `HttpInterceptorFn` + `withInterceptors()` en el mismo `provideHttpClient` que `provideApiClient` |
| TR-2 | Cliente generado versionado; regenerar con `npm run api:generate` tras cambios backend |
| TR-3 | `SessionService` `providedIn: 'root'`, DI con `inject()` |
| TR-4 | Tipos de contrato solo desde `generated/models` |
| TR-5 | Token key `rgl_auth_token`; JWT 7 días, sin refresh |
| TR-6 | SSR-safe: `PLATFORM_ID` + `isPlatformBrowser` antes de `localStorage` |
| TR-7 | `apiUrl` **con** sufijo `/api` |
| TR-8 | 401 en endpoints auth públicos no redirige |

## Architecture Compliance

- Carpetas: `core/api/`, `core/services/`, `core/interceptors/`, `core/guards/` según §2
- NFR-F3/F4: interceptores JWT y 401
- NFR-F8: contratos vía OpenAPI — no inventar campos
- SEC-002: no tocar `contactChannel` en esta historia
- Sin UI

## Library & Framework Requirements

| Paquete | Versión | Notas |
|---------|---------|-------|
| @angular/common | ^21.2.0 | `HttpClient`, interceptores |
| ng-openapi-gen | (dev) | `npm run api:generate` |
| rxjs | ~7.8.0 | `catchError` en interceptor |

**Prohibido:** `ApiService` manual, jwt-decode, axios, Material.

## File Structure Requirements

| Archivo | Cambio |
|---------|--------|
| `src/app/core/api/api.providers.ts` | `withInterceptors([jwt, authError])` |
| `src/app/core/guards/auth.guard.ts` | Reemplazar stub |
| `src/app/core/services/session.service.ts` | NEW |
| `src/environments/*.ts` | Mantener `apiUrl` con `/api` |

## Testing Requirements

- `ng test` — SessionService, interceptores, authGuard
- Mock JWT con `exp` futuro/pasado
- HttpTestingController para interceptores y humo de servicio generado
- Rutas públicas `/login`, `/register` sin token
- `ng build` + SSR sin errores

## Previous Story Intelligence

De **1-1** (done/review): rutas lazy, stub guard, `provideApiClient` ya cableado en scaffold reciente.

## Project Context Reference

- `_bmad-output/project-context.md` — cliente OpenAPI + `SessionService`
- `docs/api-client.md` — regeneración, servicios, ejemplos

## Story Completion Status

- **Status:** done
- **Siguiente:** `1-3-registro-de-usuario` usará `AuthService` generado + `SessionService` + reCAPTCHA

## Retrofit 8-f4 (2026-05-27)

- **Interceptor:** `authErrorInterceptor` maneja `403` con body `{ code: 'EMAIL_NOT_VERIFIED' }` — conserva JWT, actualiza `SessionUser.emailVerified` a `false` y redirige a `/verificacion-pendiente`.
- **AuthGuard:** tras autenticación válida, comprueba `!user?.emailVerified` (falsy incluye `undefined` en sesiones legacy) y redirige a `/verificacion-pendiente`.
- **Login:** hidrata sesión vía `usersMeGet` + `sessionUserFromPrivateProfile` (no `AuthUser` del login).
- Detalle completo: `_bmad-output/implementation-artifacts/8-f4-retrofit-interceptor-403-authguard-emailverified.md`
