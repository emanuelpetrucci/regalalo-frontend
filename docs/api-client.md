# Cliente API (OpenAPI + ng-openapi-gen)

El frontend consume el backend REST mediante un **cliente TypeScript generado** a partir del contrato OpenAPI del repo `backend`. No se escriben URLs ni DTOs a mano salvo capas de dominio propias del UI.

## Fuente de verdad

| Artefacto | Ubicación | Responsable |
|---|---|---|
| Especificación OpenAPI | `../backend/openapi/openapi.json` | Backend (`npm run openapi:generate`) |
| Configuración del generador | [`openapi-ng.config.json`](../openapi-ng.config.json) | Frontend |
| Código generado | [`src/app/core/api/generated/`](../src/app/core/api/generated/) | **No editar** — regenerar con `npm run api:generate` |
| URL base en runtime | [`src/environments/`](../src/environments/) → `apiUrl` | Frontend |

Todas las rutas del spec son relativas al servidor `/api`. Con `apiUrl: 'http://localhost:3000/api'`, una operación con path `/auth/login` llama a `http://localhost:3000/api/auth/login`.

## Regenerar el cliente

Tras cualquier cambio de rutas, bodies o respuestas en el backend:

```bash
# 1. Actualizar el contrato en el backend
cd ../backend
npm run openapi:generate

# 2. Regenerar servicios y modelos Angular
cd ../regalalo
npm run api:generate
```

El código en `src/app/core/api/generated/` se reemplaza por completo (`removeStaleFiles: true` en la config).

**Commit:** se versiona el código generado para que CI y otros desarrolladores no dependan de tener el backend instalado solo para compilar el frontend.

## Configuración en la app

[`provideApiClient()`](../src/app/core/api/api.providers.ts) registra:

- `provideHttpClient(withFetch())`
- `provideApiConfiguration(environment.apiUrl)`

Ya está incluido en [`app.config.ts`](../src/app/app.config.ts). No hace falta registrar servicios generados uno a uno: usan `providedIn: 'root'`.

### Entornos

| Archivo | `apiUrl` típico |
|---|---|
| `environment.development.ts` | `http://localhost:3000/api` |
| `environment.ts` (producción) | URL del API desplegado + sufijo `/api` |

Ajustar `recaptchaSiteKey` y demás claves en los mismos ficheros cuando corresponda.

## Servicios generados

Importar desde [`src/app/core/api/generated/services`](../src/app/core/api/generated/services.ts) o desde cada servicio concreto:

| Servicio | Dominio | Ejemplos de métodos |
|---|---|---|
| `AuthService` | Registro, login, contraseña, verificación email | `authRegisterPost`, `authLoginPost`, `authForgotPasswordPost`, `authResetPasswordPost`, `authVerifyEmailGet`, `authResendVerificationPost` |
| `ItemsService` | Objetos y solicitudes | `itemsGet`, `itemsPost`, `itemsIdGet`, `itemsIdPausePatch`, `itemsIdRequestsPost`, … |
| `UsersService` | Perfil y listados del usuario | `usersMeGet`, `usersMePatch`, `usersMeItemsGet`, `usersMeRequestsGet`, `usersIdGet`, … |
| `DeliveryService` | Sesiones de entrega | `deliverySessionsIdGet`, `deliverySessionsIdConfirmPost`, `deliverySessionsIdCancelPost` |
| `ReportsService` | Reportes | `reportsPost` |
| `HealthService` | Health check | `healthGet` |

Cada método expone:

- `nombre$Response()` — `HttpResponse` completa (cabeceras).
- `nombre()` — solo el body tipado.

Los parámetros van en objetos `*Params` (p. ej. `AuthLoginPost$Params` con `{ body: LoginRequest }`).

## Modelos

Los tipos de request/response están en [`src/app/core/api/generated/models/`](../src/app/core/api/generated/models/) y reexportados en [`models.ts`](../src/app/core/api/generated/models.ts).

Ejemplos: `AuthResponse`, `LoginRequest`, `RegisterRequest`, `GetItemResponse`, `PublishItemMultipart`, `ItemSummary`, `MyItem`, `PrivateProfile`, `PublicProfile`, `UpdateProfileRequest`, `UpdateProfileResponse`, `DeliverySession`, `RequestItemRequest`.

`RegisterRequest` incluye `firstName`, `lastName` y `phone?` (DLT-003). `PrivateProfile` y `PublicProfile` exponen identidad y avatar (`firstName`, `lastName`, `avatarUrl`; perfil privado además `phone`, `preferredLanguage`, `emailVerified`). `UpdateProfileRequest` / `UpdateProfileResponse` modelan `PATCH /users/me`.

**DLT-004 (ítems):** `PublishItemMultipart` exige `category` (union de 9 valores: `furniture`, `electronics`, `clothing`, `books`, `toys`, `kitchen`, `sports`, `tools`, `other`) y `weightRange` (union: `lt1`, `1to5`, `5to20`, `gt20`) junto a `title`, `description`, `condition` y `postalCode`. Los modelos de respuesta `GetItemResponse`, `ItemSummary` y `MyItem` incluirán `category` y `weightRange` cuando el backend exponga esos campos en GET (historia backend **7.7**); hasta entonces el cliente generado refleja solo lo definido en OpenAPI.

Usar estos tipos en componentes y servicios de feature; evitar duplicar interfaces que ya existen en el contrato.

**DLT-email-verification (v1.5):** `AuthService` incluye ahora `authVerifyEmailGet({ token: string })` para `GET /auth/verify-email` (sin auth) y `authResendVerificationPost()` para `POST /auth/resend-verification` (requiere Bearer JWT). Ambos devuelven `MessageResponse`. El modelo `EmailNotVerifiedError { code: 'EMAIL_NOT_VERIFIED'; message: string }` está disponible para distinguir el 403 de verificación email en el interceptor HTTP (historia **8-f4**).

> **Nota sobre `AuthUser.emailVerified`:** el campo `emailVerified` está **intencionalmente ausente** del schema `AuthUser` (respuesta de `POST /auth/register`) — AC#5 del backend (story 8.2). No se regenerará el cliente para incluir este campo. Para obtener el estado de verificación, llamar a `GET /users/me` tras almacenar el JWT y leer `PrivateProfile.emailVerified` (disponible desde v1.3).

> **Nota sobre `SessionUser`:** la interfaz `SessionUser` en `core/services/session.service.ts` debe extenderse con `emailVerified?: boolean` para que `AuthGuard` pueda leerlo. El valor se obtiene de `PrivateProfile.emailVerified` via `GET /users/me` post-registro — **no** del payload de registro. Esta extensión se realiza en la historia **8-f4**.

**DLT-candidato-contacto (v1.6):** `RequestItemRequest` es un nuevo modelo con `contactChannel: string` (requerido). `ItemsService.itemsIdRequestsPost` ahora requiere body `{ contactChannel: string }` — la llamada sin body ya no es válida semánticamente (historia **10-f2** implementa el bottom sheet de captura). `DeliverySession` gana el campo `receiverContactChannel: string | null` — canal de contacto del receptor, visible únicamente para el donante cuando el backend lo devuelve no nulo (regla SEC-002c).

**PRD-REP-FE-01 (v1.7):** `ReportsService` es el nuevo servicio para `POST /reports`. Método principal: `reportsPost({ body: CreateReportRequest })` → `Promise<CreateReportResponse>`. Modelos generados: `CreateReportRequest` (5 campos: `reportedEntityType`, `reportedEntityId`, `reason`, `description?`, `recaptchaToken`), `CreateReportResponse` (`id`, `message`). El campo `reason` usa el tipo `ReportReason` inline en `CreateReportRequest` — **usar siempre el tipo generado**, no definir el enum a mano (los valores exactos del spec difieren del PRD en `fraude_o_enganio` vs `fraude_o_engaño`). Este endpoint requiere JWT Bearer + `emailVerified === true` (verificado server-side). El 403 `EMAIL_NOT_VERIFIED` es gestionado globalmente por `authErrorInterceptor` → redirige a `/verificacion-pendiente`; el `ReportModalComponent` no maneja ese error inline.

## Ejemplo: login

```typescript
import { inject } from '@angular/core';
import { AuthService } from '../core/api/generated/services/auth.service';

const authApi = inject(AuthService);

const response = await authApi.authLoginPost({
  body: {
    email: 'user@example.com',
    password: '********',
    recaptchaToken: token,
  },
});

// response: LoginResponse { token, user }
```

## Ejemplo: actualizar perfil (PATCH /users/me)

```typescript
import { inject } from '@angular/core';
import { UsersService } from '../core/api/generated/services/users.service';

const usersApi = inject(UsersService);

const profile = await usersApi.usersMePatch({
  body: {
    firstName: 'Ana',
    lastName: 'García',
    preferredLanguage: 'es',
  },
});

// profile: UpdateProfileResponse
```

> Si el body incluye `postalCode`, el backend invalida el JWT actual. La UI debe mostrar aviso inline antes de guardar; el interceptor redirige a login con `returnUrl=/profile` (ver `docs/architecture.md` §6).

## Ejemplo: listado con query

```typescript
import { inject } from '@angular/core';
import { ItemsService } from '../core/api/generated/services/items.service';

const itemsApi = inject(ItemsService);

const list = await itemsApi.itemsGet({
  page: 1,
  limit: 20,
});
```

## Autenticación JWT

El contrato marca operaciones protegidas con `bearerAuth`. El cliente añade el token mediante interceptores registrados en [`provideApiClient()`](../src/app/core/api/api.providers.ts):

| Pieza | Ubicación | Comportamiento |
|---|---|---|
| `SessionService` | `core/services/session.service.ts` | Token en `localStorage` (`rgl_auth_token`), `isAuthenticated()` por claim `exp` |
| `jwtInterceptor` | `core/interceptors/jwt.interceptor.ts` | Header `Authorization: Bearer <token>` solo si el JWT es válido y no expirado |
| `authErrorInterceptor` | `core/interceptors/auth-error.interceptor.ts` | Ante `401` en rutas no públicas: `clearToken()` + redirect a `/login?returnUrl=…` |

Tras login/registro (historias 1.3+), persistir el token con `SessionService.setToken(res.token)`; las features no deben tocar `localStorage` directamente.

Los endpoints públicos `/auth/login`, `/auth/register`, `/auth/forgot-password` y `/auth/reset-password` con `401` no disparan redirect (credenciales incorrectas en formulario).

Más detalle de seguridad: `docs/architecture.md` § seguridad.

## Multipart: publicar objeto

`ItemsService.itemsPost` espera `PublishItemMultipart` en `body`. En runtime usar `FormData` con los campos del spec: `title`, `description`, `condition`, `category`, `weightRange`, `postalCode`, `images[]`. Los valores de `category` y `weightRange` deben ser enums internos (no etiquetas visibles); ver unions en `publish-item-multipart.ts`. Comprobar la firma generada en `items-post.ts` al implementar el upload; el pipeline de compresión WebP del cliente va **antes** de armar el `FormData` (ver `docs/architecture.md` §3).

> **Dependencia backend 7.7:** tras merge de GET con `category`/`weightRange` en OpenAPI, repetir `npm run openapi:generate` (backend) → `npm run api:generate` (frontend) antes de implementar detalle o mis objetos (historias **7-f4**, **7-f5**).

## Errores HTTP

El backend responde con cuerpos tipados como `Error` o `ValidationError` (`{ message, errors? }`). Los servicios generados propagan fallos como rechazos de `HttpClient`; capturarlos en features o en un interceptor de errores para mostrar mensajes al usuario.

## Explorar la API (desarrollo)

Con el backend en local (`npm run dev` en `backend`):

| URL | Uso |
|---|---|
| http://localhost:3000/api/docs | Swagger UI |
| http://localhost:3000/api/openapi.json | Spec JSON en vivo |

Útil para contrastar comportamiento real vs. tipos generados.

## Reglas para agentes y desarrolladores

1. **No modificar** ficheros bajo `src/app/core/api/generated/`.
2. Tras cambiar la API en backend, ejecutar **ambos** scripts de generación antes de abrir PR.
3. Preferir servicios generados frente a `HttpClient` directo con URLs hardcodeadas.
4. Si falta un endpoint en el cliente, corregir el contrato en backend, no improvisar tipos en el frontend.

Más detalle del contrato y Swagger: [`backend/README.md`](../../backend/README.md) y [`backend/docs/architecture.md`](../../backend/docs/architecture.md) §13.
