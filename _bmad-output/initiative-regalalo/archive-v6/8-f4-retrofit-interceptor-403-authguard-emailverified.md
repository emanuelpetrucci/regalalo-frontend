# Story 8-f4: Retrofit interceptor 403 + `AuthGuard` `emailVerified` (retrofit 1.2)



Status: done



<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed — comprehensive developer guide created. Épica 8-f DLT-email-verification — capa core auth. Retrofit de Story 1.2. -->



## Story



Como desarrollador,

quiero que el interceptor HTTP gestione el código `EMAIL_NOT_VERIFIED` y que `AuthGuard` verifique `emailVerified`,

para impedir el acceso a rutas protegidas a usuarios con email no verificado.



**FR:** FR-F36, FR-F37 · **Épica:** 8-f · **Retrofit de:** Story 1.2 (`1-2-servicios-core-modelos-e-interceptores-http.md`)



## Acceptance Criteria



1. **Interceptor — 403 `EMAIL_NOT_VERIFIED`**

   - **Given** una petición autenticada devuelve `403` con body `{ "code": "EMAIL_NOT_VERIFIED", "message": "..." }`

   - **When** `authErrorInterceptor` procesa la respuesta

   - **Then** **no** llama a `SessionService.clearToken()` (el JWT permanece en `localStorage`)

   - **And** actualiza `SessionUser.emailVerified` a `false` en sesión si había usuario cargado

   - **And** redirige a `/verificacion-pendiente` (salvo que la URL actual ya sea esa ruta)



2. **Interceptor — otros 403**

   - **Given** una petición devuelve `403` con un código distinto de `EMAIL_NOT_VERIFIED` (u otro body)

   - **When** el interceptor lo procesa

   - **Then** mantiene el comportamiento previo: re-lanza el error sin redirigir a `/verificacion-pendiente`



3. **Interceptor — regresión 401**

   - **Given** el comportamiento existente ante `401` en rutas no públicas auth

   - **When** se implementa el case 403

   - **Then** sigue aplicando `clearToken()` + redirect a `/login?returnUrl=…` sin cambios



4. **`AuthGuard` — email no verificado**

   - **Given** `authGuard` en rutas protegidas (`onboarding`, `AppShell` children)

   - **When** el JWT es válido pero `!session.getUser()?.emailVerified` (campo `false` o `undefined`)

   - **Then** devuelve `UrlTree` a `/verificacion-pendiente` sin cargar la ruta solicitada



5. **`AuthGuard` — email verificado**

   - **Given** JWT válido y `session.getUser()?.emailVerified === true`

   - **When** se activa el guard

   - **Then** devuelve `true` (comportamiento previo sin cambio)



6. **`AuthGuard` — regresión token inválido**

   - **Given** token ausente o expirado

   - **When** se activa el guard

   - **Then** redirige a `/login?returnUrl=<ruta>` (sin cambio respecto a 1.2)



7. **Login — hidratar `emailVerified` (requerido para guard funcional)**

   - **Given** login exitoso (`authLoginPost` → `201`)

   - **When** se persiste la sesión

   - **Then** llama `UsersService.usersMeGet()` tras `setToken`

   - **And** `setUser` incluye `emailVerified` desde `PrivateProfile`

   - **And** si `!profile.emailVerified`, navega a `/verificacion-pendiente` (no a `returnUrl` ni `/explorar`)

   - **And** ante error en `usersMeGet`, trata como no verificado → `/verificacion-pendiente` (regla §6 architecture.md v1.5)



8. **Retrofit nota historia 1.2**

   - **Given** historia 1.2 completada

   - **When** se cierra 8-f4

   - **Then** se añade nota de retrofit al final de `1-2-servicios-core-modelos-e-interceptores-http.md` documentando 403 `EMAIL_NOT_VERIFIED` y check `emailVerified` en guard



9. **Sin UI nueva**

   - **Given** esta historia es capa core

   - **When** se implementa

   - **Then** no se añaden pantallas ni claves i18n nuevas (salvo tests)



## Tasks / Subtasks



### A. Extender `SessionUser` (AC: 4, 5, 7)



- [x] En `src/app/core/services/session.service.ts`, añadir a `SessionUser`:

  ```typescript

  /** Ausente en sesiones legacy; el guard trata `undefined` como no verificado. */

  emailVerified?: boolean;

  ```

- [x] Actualizar `session.service.spec.ts` si hace falta cubrir persistencia de `emailVerified` en `localStorage`



### B. Utilidad de mapeo perfil → sesión (AC: 7 — reutilizable en 8-f5)



- [x] Crear `src/app/core/utils/session-user.util.ts` con:

  ```typescript

  import type { PrivateProfile } from '../api/generated/models/private-profile';

  import type { SessionUser } from '../services/session.service';



  export function sessionUserFromPrivateProfile(profile: PrivateProfile): SessionUser {

    return {

      id: profile.id,

      email: profile.email,

      reputationScore: profile.reputationScore,

      firstName: profile.firstName,

      lastName: profile.lastName,

      postalCode: profile.postalCode,

      totalDonated: profile.totalDonated,

      totalReceived: profile.totalReceived,

      emailVerified: profile.emailVerified,

    };

  }

  ```

- [x] Añadir `session-user.util.spec.ts` con un caso mínimo (`emailVerified: false` / `true`)



### C. Interceptor `auth-error.interceptor.ts` (AC: 1, 2, 3)



- [x] Importar `EmailNotVerifiedError` desde `core/api/generated/models`

- [x] Añadir type guard local (no exportar si no hace falta):

  ```typescript

  function isEmailNotVerified403(error: HttpErrorResponse): boolean {

    if (error.status !== 403) return false;

    const body = error.error;

    return (

      typeof body === 'object' &&

      body !== null &&

      'code' in body &&

      (body as EmailNotVerifiedError).code === 'EMAIL_NOT_VERIFIED'

    );

  }

  ```

- [x] En `catchError`, **antes** del branch `401`:

  - Si `isEmailNotVerified403(error)`:

    - Obtener usuario actual; si existe → `setUser({ ...user, emailVerified: false })`

    - Si `!router.url.startsWith('/verificacion-pendiente')` → `void router.navigate(['/verificacion-pendiente'])`

    - `return throwError(() => error)` (el componente que llamó puede seguir manejando el error si quiere)

  - Si `error.status === 403` pero no es EMAIL_NOT_VERIFIED → `return throwError(() => error)` sin redirect

- [x] **No** tocar la lógica 401 existente (`clearToken`, `RELOGIN_RETURN_KEY`, rutas públicas auth)



### D. `auth.guard.ts` (AC: 4, 5, 6)



- [x] Tras `session.isAuthenticated()` === true, leer `session.getUser()`

- [x] Si `!user?.emailVerified` → `return router.createUrlTree(['/verificacion-pendiente'])`

- [x] Si `user.emailVerified === true` → `return true`

- [x] Mantener redirect a login cuando `!isAuthenticated()`



**Orden de comprobación obligatorio:**



```typescript

if (!session.isAuthenticated()) {

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });

}

const user = session.getUser();

if (!user?.emailVerified) {

  return router.createUrlTree(['/verificacion-pendiente']);

}

return true;

```



### E. Retrofit login — hidratar sesión (AC: 7)



- [x] En `login.component.ts`:

  - Inyectar `UsersService` (generado)

  - Tras `setToken(res.token)`:

    ```typescript

    let profile: PrivateProfile;

    try {

      profile = await this.usersApi.usersMeGet();

    } catch {

      if (this.destroyed) return;

      await this.router.navigate(['/verificacion-pendiente']);

      return;

    }

    if (this.destroyed) return;

    this.session.setUser(sessionUserFromPrivateProfile(profile));

    if (!profile.emailVerified) {

      await this.router.navigate(['/verificacion-pendiente']);

      return;

    }

    const returnUrl = sanitizeReturnUrl(...);

    await this.router.navigateByUrl(returnUrl ?? '/explorar');

    ```

  - **Eliminar** `setUser(res.user)` directo (AuthUser no trae `emailVerified`)

- [x] Actualizar `login.component.spec.ts`:

  - Mock `UsersService.usersMeGet`

  - Caso verificado → navega a `/explorar` o `returnUrl`

  - Caso `emailVerified: false` → navega a `/verificacion-pendiente`

  - Caso `usersMeGet` falla → `/verificacion-pendiente`



### F. Tests interceptor (AC: 1, 2, 3)



- [x] En `auth-error.interceptor.spec.ts`:

  - Test: `403` + `{ code: 'EMAIL_NOT_VERIFIED' }` → token **no** borrado, navega a `/verificacion-pendiente`

  - Test: `403` + otro body → token intacto, **sin** navegación a verificacion-pendiente

  - Test: regresión `401` sigue limpiando token (test existente debe pasar)



### G. Tests guard (AC: 4, 5, 6)



- [x] En `auth.guard.spec.ts`:

  - Token válido + `setUser({ ..., emailVerified: true })` → `true`

  - Token válido + `emailVerified: false` → `UrlTree` → `verificacion-pendiente`

  - Token válido + usuario sin campo `emailVerified` → `UrlTree` → `verificacion-pendiente`

  - Regresión: sin token → login + `returnUrl`



### H. Nota retrofit 1.2 (AC: 8)



- [x] Al final de `1-2-servicios-core-modelos-e-interceptores-http.md`, añadir sección breve:

  - **Retrofit 8-f4 (2026-05-27):** interceptor maneja `403 EMAIL_NOT_VERIFIED`; `AuthGuard` comprueba `emailVerified`; ver `8-f4-retrofit-interceptor-403-authguard-emailverified.md`



### Review Findings

- [x] [Review][Patch] Falta test AC#1 «sin redirect si ya en `/verificacion-pendiente`» [`auth-error.interceptor.spec.ts`] — añadido test `does not redirect on 403 EMAIL_NOT_VERIFIED when already on verificacion-pendiente`

- [x] [Review][Defer] `usersMeGet` con `401` tras login: el interceptor borra el token y el `catch` del login navega a `/verificacion-pendiente` — el reenvío de verificación podría fallar hasta re-login [`login.component.ts:127-132`] — deferred, colisión improbable post-login fresco; AC#7 prioriza «cualquier error → pendiente»

- [x] [Review][Defer] Registro sigue sin hidratar `emailVerified` y redirige a `/onboarding` — comportamiento intermedio documentado en Dev Notes hasta **8-f5** [`register.component.ts`]



## Dev Notes



### Estado actual del código (leído 2026-05-27)



| Fichero | Comportamiento hoy | Cambio 8-f4 |

|---|---|---|

| `auth.guard.ts` | Solo `isAuthenticated()` | + check `!emailVerified` |

| `auth-error.interceptor.ts` | Solo maneja `401` | + branch `403 EMAIL_NOT_VERIFIED` |

| `session.service.ts` → `SessionUser` | Sin `emailVerified` | + `emailVerified?: boolean` |

| `login.component.ts` | `setUser(res.user)` AuthUser | `usersMeGet` + `sessionUserFromPrivateProfile` |

| `register.component.ts` | `setUser(res.user)` → onboarding/explorar | **No tocar** (8-f5) |



### Rutas y efecto cruzado con 8-f5 (importante)



```

app.routes.ts

├── /onboarding          → canActivate: [authGuard]     ← bloqueado si !emailVerified

├── AuthLayoutComponent  → AUTH_ROUTES (públicas)

│   ├── /verificacion-pendiente   ← sin guard ✓

│   └── /verificar-email          ← sin guard ✓

└── AppShellComponent    → canActivate: [authGuard]     ← feed, perfil, entregas…

```



**Tras implementar 8-f4 (antes de 8-f5):** un usuario recién registrado que aún navega a `/onboarding` (flujo actual de `register.component.ts`) será redirigido por el guard a `/verificacion-pendiente`. Eso es **aceptable** e incluso deseable como comportamiento intermedio hasta que 8-f5 cambie el redirect post-registro.



### API y tipos generados



```typescript

// src/app/core/api/generated/models/email-not-verified-error.ts

export interface EmailNotVerifiedError {

  code: 'EMAIL_NOT_VERIFIED';

  message: string;

}

```



- Usar este tipo en el type guard del interceptor — **no** comparar strings sueltas sin validar forma del body.

- `AuthUser` (login/register response) **no** incluye `emailVerified` por diseño (AC#5 backend story 8.2).

- `PrivateProfile.emailVerified: boolean` es la fuente de verdad vía `GET /users/me`.



### Implementación interceptor — pseudocódigo completo



```typescript

return next(req).pipe(

  catchError((error: unknown) => {

    if (!(error instanceof HttpErrorResponse)) {

      return throwError(() => error);

    }



    if (isEmailNotVerified403(error)) {

      const user = session.getUser();

      if (user) {

        session.setUser({ ...user, emailVerified: false });

      }

      if (!router.url.startsWith('/verificacion-pendiente')) {

        void router.navigate(['/verificacion-pendiente']);

      }

      return throwError(() => error);

    }



    if (error.status !== 401) {

      return throwError(() => error);

    }



    // … lógica 401 existente sin cambios …

  }),

);

```



**Crítico:** el branch 403 debe ir **antes** del `status !== 401` early return actual, o el 403 caería en `throwError` sin manejo.



### `AuthGuard` — usar check falsy, no strict `=== false`



Architecture v1.5 §6 y code-review 8-f1: `!user?.emailVerified` cubre `false` **y** `undefined` (sesiones legacy en `localStorage` sin el campo).



### Login — por qué está en alcance de 8-f4



Sin hidratar `emailVerified` tras login, un usuario **ya verificado** quedaría con `emailVerified` `undefined` en sesión y el guard lo mandaría incorrectamente a `/verificacion-pendiente`. La historia **8-f5** solo cubre el flujo de **registro**; el login debe actualizarse aquí para que FR-F37 sea verificable end-to-end.



### Interacción con pantallas 8-f2 / 8-f3 (completadas)



| Escenario | Comportamiento esperado tras 8-f4 |

|---|---|

| Usuario en `/verificacion-pendiente` con JWT, pulsa reenviar | Sigue funcionando (8-f2); 401 en reenviar → interceptor login |

| API protegida devuelve 403 EMAIL_NOT_VERIFIED | Interceptor → `/verificacion-pendiente`, token conservado |

| Usuario verifica email (8-f3) → login | Login debe cargar `emailVerified: true` vía `usersMeGet` → acceso a feed |

| Usuario intenta `/explorar` sin verificar | Guard → `/verificacion-pendiente` |



### Qué NO hacer en 8-f4



- ❌ Modificar `register.component.ts` redirect (historia **8-f5**)

- ❌ Modificar `verification-pending` o `verify-email` (8-f2, 8-f3 done)

- ❌ Editar `src/app/core/api/generated/`

- ❌ Añadir pantallas o i18n

- ❌ Cambiar `jwt.interceptor.ts`

- ❌ Redirigir a `/verificacion-pendiente` en 403 genéricos (solo `EMAIL_NOT_VERIFIED`)



### Inteligencia historia anterior (8-f3)



| Aprendizaje 8-f3 | Aplicación en 8-f4 |

|---|---|

| `destroyed` + `destroyRef` tras awaits en auth | Replicar en login al añadir `usersMeGet` |

| `EmailNotVerifiedError` generado en 8-f1 | Usar en interceptor |

| `!emailVerified` falsy en guard (8-f1 review) | No usar `=== false` strict |

| Login usa `route.snapshot` para query params | Sin cambio en 8-f4 |

| SSR guard en verify-email | N/A en interceptor/guard (ya browser-only en session) |



### Architecture compliance



| Regla | Detalle |

|---|---|

| Interceptor | `core/interceptors/auth-error.interceptor.ts` — §6 architecture.md v1.5 |

| Guard | `core/guards/auth.guard.ts` |

| Sesión | `SessionUser.emailVerified` — §5 architecture.md |

| Fuente `emailVerified` | `PrivateProfile` vía `usersMeGet` — no `AuthUser` |

| Rutas públicas verificación | `/verificacion-pendiente`, `/verificar-email` sin `authGuard` |

| Tests | Patrón `createMockJwt`, `localStorage.clear()` en beforeEach |



### Git intelligence (commits recientes)



- `251d440` — verify-email + login banner `emailVerified=1`; patrones auth async

- `8b33fc9` — verification-pending; destino del redirect interceptor/guard

- `6db2d5a` — `EmailNotVerifiedError` en cliente generado



### Referencias



- [Source: _bmad-output/planning-artifacts/epics.md#Story-8-f4] — AC originales FR-F36, FR-F37

- [Source: docs/architecture.md §5 SessionUser, §6 DLT-email-verification] — reglas interceptor y guard

- [Source: docs/api-client.md] — `EmailNotVerifiedError`, `usersMeGet`

- [Source: docs/delta-frontend-email-verification.md] — interceptor 403 y AuthGuard

- [Source: _bmad-output/implementation-artifacts/8-f3-pantalla-verificar-email-token.md] — login post-verificación

- [Source: _bmad-output/implementation-artifacts/8-f2-pantalla-verificacion-pendiente.md] — destino redirect

- [Source: _bmad-output/implementation-artifacts/8-f1-regenerar-cliente-openapi-y-architecture-v1-5.md] — diseño AuthUser sin emailVerified

- [Source: _bmad-output/implementation-artifacts/1-2-servicios-core-modelos-e-interceptores-http.md] — retrofit target

- [Source: _bmad-output/implementation-artifacts/deferred-work.md] — ítems 8-f4 explícitos

- [Source: src/app/core/guards/auth.guard.ts] — estado actual

- [Source: src/app/core/interceptors/auth-error.interceptor.ts] — estado actual

- [Source: src/app/core/services/session.service.ts] — SessionUser

- [Source: src/app/features/auth/login/login.component.ts] — hidratar perfil



## Dev Agent Record



### Agent Model Used



Claude Sonnet 4.6 (dev-story 2026-05-27)



### Debug Log References



- `ng test --watch=false` 505/505 pasan (58 archivos); +14 tests nuevos/actualizados en interceptor, guard, login, session util, app.routes.

- `ng build` exit 0; warnings SCSS preexistentes sin cambios.



### Completion Notes List



- **AC #1–3:** `authErrorInterceptor` con type guard `isEmailNotVerified403` antes del branch 401; conserva JWT, actualiza `emailVerified: false`, redirige a `/verificacion-pendiente`; otros 403 sin redirect; regresión 401 intacta. ✅

- **AC #4–6:** `authGuard` comprueba `!user?.emailVerified` (falsy incluye legacy `undefined`); token inválido → login con `returnUrl`. ✅

- **AC #7:** Login hidrata sesión vía `usersMeGet` + `sessionUserFromPrivateProfile`; fallo o `!emailVerified` → `/verificacion-pendiente`. ✅

- **AC #8:** Nota retrofit añadida en `1-2-servicios-core-modelos-e-interceptores-http.md`. ✅

- **AC #9:** Sin UI ni i18n nuevos. ✅



### File List



- `src/app/core/services/session.service.ts` — `SessionUser.emailVerified`

- `src/app/core/services/session.service.spec.ts` — persistencia `emailVerified`

- `src/app/core/utils/session-user.util.ts` — nuevo

- `src/app/core/utils/session-user.util.spec.ts` — nuevo

- `src/app/core/interceptors/auth-error.interceptor.ts` — branch 403

- `src/app/core/interceptors/auth-error.interceptor.spec.ts` — tests 403 (+ regresión AC#1 sin redirect en ruta actual)

- `src/app/core/guards/auth.guard.ts` — check `emailVerified`

- `src/app/core/guards/auth.guard.spec.ts` — tests guard

- `src/app/features/auth/login/login.component.ts` — `usersMeGet` hidratación

- `src/app/features/auth/login/login.component.spec.ts` — mocks y casos verificación

- `src/app/app.routes.spec.ts` — sesión verificada en rutas protegidas + test redirect pendiente

- `_bmad-output/implementation-artifacts/1-2-servicios-core-modelos-e-interceptores-http.md` — nota retrofit

- `_bmad-output/implementation-artifacts/8-f4-retrofit-interceptor-403-authguard-emailverified.md` — story (este archivo)

- `_bmad-output/implementation-artifacts/sprint-status.yaml` — 8-f4 → review



### Change Log



- 2026-05-27: dev-story 8-f4 — interceptor 403 EMAIL_NOT_VERIFIED, AuthGuard emailVerified, login usersMeGet, util sessionUserFromPrivateProfile, 505 tests OK, build OK, nota retrofit 1.2.
- 2026-05-27: code-review patch — test interceptor sin redirect si ya en `/verificacion-pendiente` (506 tests OK).

