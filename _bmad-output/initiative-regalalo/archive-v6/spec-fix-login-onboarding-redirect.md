---
title: 'Fix: Login no redirige al onboarding en primera sesión'
type: 'bugfix'
created: '2026-05-27'
status: 'done'
context: []
baseline_commit: '7c644ddbf0eaf62ee4336ecb0098f752c047c9a0'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Tras un login exitoso, `LoginComponent` redirige directamente a `returnUrl ?? '/explorar'` sin comprobar si el usuario ha completado el onboarding (`isOnboardingDone()`). Los usuarios nuevos nunca pasan por la pantalla de onboarding.

**Approach:** En `login.component.ts`, justo antes de la redirección final (cuando `emailVerified` es `true`), comprobar `isOnboardingDone()`. Si no está completado, redirigir a `/onboarding` pasando el `returnUrl` original como query param; si ya está completado, mantener el comportamiento actual.

## Boundaries & Constraints

**Always:**
- Usar `isOnboardingDone()` de `core/constants/onboarding.ts` (no duplicar lógica).
- Preservar el `returnUrl` saneado: pasarlo como `queryParams.returnUrl` al navegar a `/onboarding` para que el componente pueda usarlo tras finalizar.
- No añadir el check de onboarding en `authGuard` — es estado de localStorage, no de sesión.
- Mantener todos los tests existentes en verde.

**Ask First:**
- Si se detecta que el flujo de registro (post-verificación de email → login) también necesita ajuste adicional más allá del login.

**Never:**
- Tocar `authGuard`, `onboarding.component.ts` ni el registro.
- Duplicar la lógica de `isOnboardingDone()` fuera de `core/constants/onboarding.ts`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Primera sesión, sin returnUrl | `emailVerified=true`, `isOnboardingDone()=false`, sin `returnUrl` | Navega a `/onboarding` (sin query param) | N/A |
| Primera sesión, con returnUrl válida | `emailVerified=true`, `isOnboardingDone()=false`, `returnUrl='/explorar'` | Navega a `/onboarding?returnUrl=/explorar` | N/A |
| Onboarding ya completado, sin returnUrl | `emailVerified=true`, `isOnboardingDone()=true`, sin `returnUrl` | Navega a `/explorar` (comportamiento actual) | N/A |
| Onboarding ya completado, con returnUrl | `emailVerified=true`, `isOnboardingDone()=true`, `returnUrl='/items/abc'` | Navega a `/items/abc` (comportamiento actual) | N/A |
| returnUrl insegura | `isOnboardingDone()=true`, `returnUrl='https://evil.com'` | `sanitizeReturnUrl` devuelve `null` → navega a `/explorar` | N/A |

</frozen-after-approval>

## Code Map

- `src/app/features/auth/login/login.component.ts:144-147` -- lógica de redirección post-login; aquí se añade el check de onboarding
- `src/app/core/constants/onboarding.ts` -- `isOnboardingDone()` y `markOnboardingDone()`
- `src/app/features/auth/login/login.component.spec.ts` -- tests de redirección (actualizar + añadir casos)

## Tasks & Acceptance

**Execution:**
- [x] `src/app/features/auth/login/login.component.ts` -- Importar `isOnboardingDone` desde `core/constants/onboarding`; en el bloque de redirección final, si `!isOnboardingDone()` navegar a `['/onboarding']` con `queryParams: returnUrl ? { returnUrl } : {}`, si ya completado mantener `navigateByUrl(returnUrl ?? '/explorar')` -- corrige el bug principal
- [x] `src/app/features/auth/login/login.component.spec.ts` -- Añadir ruta `onboarding` al router de prueba; añadir caso "navega a /onboarding cuando onboarding no está completado"; añadir caso "navega a /onboarding?returnUrl=X cuando hay returnUrl y onboarding no completado"; actualizar los casos existentes para que mocken `isOnboardingDone()=true` -- garantiza cobertura de todos los escenarios del I/O Matrix

**Acceptance Criteria:**
- Given un usuario autenticado con email verificado que no ha completado el onboarding, when hace login, then es redirigido a `/onboarding` (no a `/explorar`)
- Given un usuario autenticado con email verificado que no ha completado el onboarding y existe un `returnUrl` válido, when hace login, then es redirigido a `/onboarding?returnUrl=<valor>`
- Given un usuario autenticado con email verificado que YA ha completado el onboarding, when hace login, then es redirigido a `returnUrl ?? '/explorar'` (comportamiento anterior sin cambios)
- Given cualquier escenario de login, when se ejecutan los tests, then todos pasan sin errores

## Spec Change Log

### Review Findings (bmad-code-review 2026-05-27)

- [x] [Review][Defer] localStorage per dispositivo — usuarios en nuevo dispositivo/navegador repiten onboarding — pre-existing, documentado en deferred-work.md
- [x] [Review][Defer] onboardingGuard ausente en AppShellComponent — bypass por navegación directa con JWT válido — pre-existing, documentado en deferred-work.md
- [x] [Review][Defer] Fragilidad registro si se añade auto-verificación futura — pre-existing, documentado en deferred-work.md
- [x] [Review][Defer] Flash en OnboardingComponent.ngOnInit con usuario done — pre-existing, documentado en deferred-work.md

## Suggested Review Order

**Lógica principal**

- Importación de `isOnboardingDone` — única fuente de verdad, sin duplicar lógica
  [`login.component.ts:27`](../../src/app/features/auth/login/login.component.ts#L27)

- Bifurcación post-login: redirige a `/onboarding` o a `returnUrl ?? '/explorar'`
  [`login.component.ts:148`](../../src/app/features/auth/login/login.component.ts#L148)

**Tests**

- Nueva ruta stub y casos nuevos: onboarding no completado sin returnUrl y con returnUrl
  [`login.component.spec.ts:107`](../../src/app/features/auth/login/login.component.spec.ts#L107)

- Tests existentes actualizados: llaman `markOnboardingDone()` para reproducir el comportamiento previo
  [`login.component.spec.ts:199`](../../src/app/features/auth/login/login.component.spec.ts#L199)

## Verification

**Commands:**
- `npx vitest run src/app/features/auth/login/login.component.spec.ts` -- expected: todos los tests en verde
