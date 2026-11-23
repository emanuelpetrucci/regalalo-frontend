# Story 8-f5: Retrofit registro → redirect a `/verificacion-pendiente` (retrofit 1.3)

Status: review

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed — comprehensive developer guide created. Épica 8-f DLT-email-verification — cierra el flujo post-registro. Retrofit de Story 1.3. -->

## Story

Como visitante que completa el registro,
quiero ser redirigido a la pantalla de verificación pendiente tras el registro,
para ser guiado a verificar mi email antes de acceder a la aplicación.

**FR:** FR-F33 · **Épica:** 8-f · **Retrofit de:** Story 1.3 (`1-3-registro-de-usuario.md`)

## Acceptance Criteria

1. **Registro exitoso — hidratar sesión y redirigir**

   - **Given** formulario de registro completado con datos válidos
   - **When** `POST /auth/register` devuelve `201`
   - **Then** el JWT se almacena en `localStorage` vía `SessionService.setToken(res.token)`
   - **And** se llama `UsersService.usersMeGet()` inmediatamente después de `setToken`
   - **And** `SessionService.setUser` recibe el resultado de `sessionUserFromPrivateProfile(profile)` — **no** `res.user` (`AuthUser` no incluye `emailVerified`)
   - **And** `session.getUser()?.emailVerified` queda persistido (`false` para usuario recién registrado)
   - **And** la navegación va a `/verificacion-pendiente` — **no** a `/onboarding`, `/explorar` ni `returnUrl`

2. **Error en `GET /users/me` post-registro**

   - **Given** registro exitoso (`201`) y JWT almacenado
   - **When** `usersMeGet()` falla (cualquier error HTTP o red)
   - **Then** se navega a `/verificacion-pendiente` (regla §6 architecture.md v1.5: tratar como no verificado)
   - **And** el JWT **permanece** en `localStorage` (no llamar `clearToken`)
   - **And** no se deja la sesión con `setUser(res.user)` parcial sin `emailVerified`

3. **Componente destruido durante awaits**

   - **Given** el usuario abandona la pantalla mientras `authRegisterPost` o `usersMeGet` están en vuelo
   - **When** `destroyRef.onDestroy` ha marcado `destroyed = true`
   - **Then** no se ejecuta navegación ni `setUser` tras el `await` (patrón `if (this.destroyed) return`)

4. **Sin cambios en errores de registro**

   - **Given** el flujo de error existente (409, 422, 400, reCAPTCHA)
   - **When** `authRegisterPost` falla
   - **Then** se mantiene el comportamiento actual de `mapRegisterError` y banners — sin redirect

5. **Retrofit nota historia 1.3**

   - **Given** historia 1.3 completada
   - **When** se cierra 8-f5
   - **Then** se añade nota de retrofit al final de `1-3-registro-de-usuario.md` documentando redirect post-201 a `/verificacion-pendiente` y hidratación vía `usersMeGet`

6. **Sin UI nueva**

   - **Given** esta historia es retrofit de flujo
   - **When** se implementa
   - **Then** no se añaden pantallas ni claves i18n nuevas (salvo tests)

## Tasks / Subtasks

### A. Retrofit `register.component.ts` (AC: 1, 2, 3)

- [x] Inyectar `UsersService` (generado) — mismo patrón que `login.component.ts`
- [x] Importar `PrivateProfile` y `sessionUserFromPrivateProfile` desde `core/utils/session-user.util.ts` (creado en 8-f4)
- [x] Tras `setToken(res.token)`, reemplazar bloque actual:

  ```typescript
  // ELIMINAR:
  this.session.setUser(res.user);
  const returnUrl = sanitizeReturnUrl(...);
  const safeReturnUrl = returnUrl?.startsWith('/onboarding') ? null : returnUrl;
  if (!isOnboardingDone()) {
    await this.router.navigate(['/onboarding'], { queryParams: ... });
    return;
  }
  await this.router.navigateByUrl(safeReturnUrl ?? '/explorar');

  // REEMPLAZAR POR (espejo de login.component.ts líneas 124-141):
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
  await this.router.navigate(['/verificacion-pendiente']);
  ```

- [x] Eliminar imports ya innecesarios: `isOnboardingDone`, `sanitizeReturnUrl`, `ActivatedRoute` (si solo se usaba para `returnUrl`)
- [x] Mantener `destroyed` + `destroyRef` + `if (this.destroyed) return` tras **cada** `await` en el flujo de éxito

### B. Tests `register.component.spec.ts` (AC: 1, 2, 3, 4)

- [x] Añadir mock `UsersService.usersMeGet` en providers (como `login.component.spec.ts`)
- [x] Añadir ruta `verificacion-pendiente` en `provideRouter`
- [x] **Actualizar** test «navigates to onboarding» → debe navegar a `/verificacion-pendiente` y verificar:
  - `usersMeGet` llamado una vez
  - `session.getUser()?.emailVerified === false`
  - `setUser` no usa `AuthUser` directo (perfil mapeado)
- [x] **Eliminar** test «navigates to explorar when onboarding already done» — ya no aplica
- [x] **Nuevo** test: `usersMeGet` falla → navega a `/verificacion-pendiente`, token conservado, `setUser` no llamado con AuthUser
- [x] **Nuevo** test: `emailVerified: true` en perfil (edge backend) → igualmente navega a `/verificacion-pendiente` (FR-F33: siempre tras registro)
- [x] Regresión: errores 409/422/400/reCAPTCHA siguen sin navegar

### C. Nota retrofit 1.3 (AC: 5)

- [x] Al final de `1-3-registro-de-usuario.md`, añadir sección breve:

  - **Retrofit 8-f5 (2026-05-27):** post-201 → `usersMeGet` + redirect `/verificacion-pendiente`; ver `8-f5-retrofit-registro-redirect-verificacion-pendiente.md`

## Dev Notes

### Estado actual del código (leído 2026-05-27)

| Fichero | Comportamiento hoy | Cambio 8-f5 |
|---|---|---|
| `register.component.ts` | `setUser(res.user)` → `/onboarding` o `/explorar` | `usersMeGet` + `sessionUserFromPrivateProfile` → `/verificacion-pendiente` |
| `register.component.spec.ts` | Tests esperan onboarding/explorar | Actualizar mocks y expectativas |
| `login.component.ts` | Patrón referencia post-8-f4 | **Copiar patrón**, destino siempre `/verificacion-pendiente` |
| `session-user.util.ts` | Utilidad lista (8-f4) | Reutilizar sin modificar |
| `verification-pending/*` | Pantalla done (8-f2) | Destino del redirect — no modificar |
| `auth.guard.ts` | Bloquea rutas si `!emailVerified` (8-f4) | Sin cambios; coherente con nuevo flujo |

### Flujo end-to-end tras 8-f5

```
Registro (201)
  → setToken
  → usersMeGet → setUser(emailVerified: false)
  → /verificacion-pendiente
  → usuario verifica email (8-f3)
  → /login?emailVerified=1
  → login hidrata perfil (8-f4) → /explorar o returnUrl
```

**Onboarding:** la ruta `/onboarding` sigue existiendo pero **ya no se dispara desde registro**. El producto prioriza verificación de email antes que onboarding. No reintroducir lógica `isOnboardingDone()` en esta historia.

### Por qué no usar `res.user` (AuthUser)

```typescript
// AuthResponse.user (AuthUser) — SIN emailVerified por diseño AC#5 backend
// PrivateProfile (GET /users/me) — CON emailVerified: boolean
```

Architecture §6 y deferred-work.md: `setUser` post-registro **debe** usar `sessionUserFromPrivateProfile`. Si se usa `AuthUser`, el guard (8-f4) trataría `emailVerified: undefined` como no verificado — funcional pero incorrecto para reenvío y coherencia de sesión.

### Implementación — pseudocódigo completo del bloque post-201

```typescript
const res = await this.authApi.authRegisterPost({ body });

if (this.destroyed) return;

this.session.setToken(res.token);

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
await this.router.navigate(['/verificacion-pendiente']);
```

**Nota:** incluso si `profile.emailVerified === true` (caso anómalo post-registro), FR-F33 exige redirect a `/verificacion-pendiente` siempre tras registro. No bifurcar a `/explorar`.

### Caso `usersMeGet` falla sin `setUser`

Si `usersMeGet` falla, **no** llamar `setUser(res.user)` como fallback — dejar sesión solo con token. La pantalla `/verificacion-pendiente` (8-f2) funciona con JWT para reenvío; el guard bloqueará rutas protegidas hasta que el usuario verifique y vuelva a login.

### Inteligencia historia anterior (8-f4)

| Aprendizaje 8-f4 | Aplicación en 8-f5 |
|---|---|
| `sessionUserFromPrivateProfile` en `core/utils/` | Importar y usar — no duplicar mapeo |
| `destroyed` tras cada `await` en auth | Replicar tras `authRegisterPost` y `usersMeGet` |
| Login como plantilla de hidratación | Copiar estructura try/catch/usersMeGet |
| Guard redirige registro→onboarding a pendiente (intermedio) | 8-f5 elimina paso intermedio innecesario |
| Tests: mock `UsersService`, perfil con `emailVerified` | Mismo patrón en register.spec |

### Qué NO hacer en 8-f5

- ❌ Modificar `verification-pending`, `verify-email`, interceptor o guard (8-f2, 8-f3, 8-f4 done)
- ❌ Editar `src/app/core/api/generated/`
- ❌ Añadir pantallas o i18n
- ❌ Redirigir a `/onboarding` o `/explorar` post-registro
- ❌ Respetar `returnUrl` del query en registro (FR-F33: ignorar)
- ❌ Duplicar `sessionUserFromPrivateProfile` inline

### Architecture compliance

| Regla | Detalle |
|---|---|
| Flujo post-registro | `docs/architecture.md` §6 DLT-email-verification |
| Fuente `emailVerified` | `PrivateProfile` vía `usersMeGet` — no `AuthUser` |
| Destino redirect | `/verificacion-pendiente` (ruta pública, sin guard) |
| Error `/users/me` | Tratar como no verificado → mismo destino |
| Cliente API | `UsersService.usersMeGet()` generado — ver `docs/api-client.md` |
| Tests | Patrón Vitest + `TranslocoTestingModule`; `localStorage.clear()` en beforeEach |

### Git intelligence (commits recientes)

- `c3cf0e2` — email verification handling (interceptor + guard) — patrón login hidratación
- `251d440` — verify-email + login banner — flujo post-verificación
- `8b33fc9` — verification-pending screen — destino del redirect
- `6db2d5a` — OpenAPI client email verification endpoints

### Referencias

- [Source: _bmad-output/planning-artifacts/epics.md#Story-8-f5] — AC originales FR-F33
- [Source: docs/architecture.md §6 DLT-email-verification] — flujo post-registro obligatorio
- [Source: docs/api-client.md] — `UsersService`, `AuthService.authRegisterPost`
- [Source: _bmad-output/implementation-artifacts/8-f4-retrofit-interceptor-403-authguard-emailverified.md] — util + patrón login
- [Source: _bmad-output/implementation-artifacts/8-f2-pantalla-verificacion-pendiente.md] — pantalla destino
- [Source: _bmad-output/implementation-artifacts/1-3-registro-de-usuario.md] — retrofit target
- [Source: _bmad-output/implementation-artifacts/deferred-work.md] — ítems 8-f5 explícitos
- [Source: src/app/features/auth/register/register.component.ts] — estado actual
- [Source: src/app/features/auth/login/login.component.ts] — plantilla hidratación (líneas 124-141)
- [Source: src/app/core/utils/session-user.util.ts] — mapeo perfil → sesión

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Debug Log References

### Completion Notes List

- Retrofit `register.component.ts`: post-201 → `usersMeGet` + `sessionUserFromPrivateProfile` → `/verificacion-pendiente`; eliminado flujo onboarding/explorar/returnUrl.
- Si `usersMeGet` falla: redirect a `/verificacion-pendiente` sin `setUser`; JWT conservado.
- Tests: 16/16 en `register.component.spec.ts` (`ng test --watch=false --include=...`).
- Nota retrofit añadida en `1-3-registro-de-usuario.md`.

### File List

- src/app/features/auth/register/register.component.ts
- src/app/features/auth/register/register.component.spec.ts
- _bmad-output/implementation-artifacts/1-3-registro-de-usuario.md

### Change Log

- 2026-05-27: Historia 8-f5 — registro redirige a verificación pendiente con hidratación vía `usersMeGet`.
