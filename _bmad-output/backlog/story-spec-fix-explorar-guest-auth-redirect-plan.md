---
ticket: spec-fix-explorar-guest-auth-redirect
status: done
type: bugfix
migrated_from: v6
---


## Intent

**Problem:** Un invitado sin sesión que visita `/explorar` es redirigido a `/login`. La ruta es pública (sin `authGuard`) pero el endpoint `GET /items` devuelve 401 para usuarios no autenticados, y `authErrorInterceptor` captura ese 401 y navega a `/login` antes de que el componente pueda manejarlo silenciosamente.

**Approach:** En `authErrorInterceptor`, antes de `session.clearToken()` y de navegar a `/login`, comprobar si existe un token activo. Si no hay token (usuario invitado genuino), re-lanzar el error directamente para que el componente lo trate sin redirección.

## Suggested Review Order

1. [`../../src/app/core/interceptors/auth-error.interceptor.ts`](../../src/app/core/interceptors/auth-error.interceptor.ts) — cambio principal: guard `!session.getToken()` antes del redirect
