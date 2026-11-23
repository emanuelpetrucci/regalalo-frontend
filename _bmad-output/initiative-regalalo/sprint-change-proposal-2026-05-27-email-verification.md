# Sprint Change Proposal — DLT-email-verification (2026-05-27)

**Estado:** Aprobado  
**Fecha:** 2026-05-27  
**Trigger:** Backend completa epic de verificación de email (EVT-014, TPL-009, `RegisterUser`, `ResendVerification`)

---

## 1. Resumen del problema

El backend ha implementado verificación de email en el registro de usuario. El frontend actual (architecture v1.4) no contempla:

- El campo `emailVerified: boolean` en el modelo `User`.
- Los nuevos endpoints `GET /auth/verify-email?token=<token>` y `POST /auth/resend-verification`.
- Las pantallas `/verificacion-pendiente` y `/verificar-email`.
- El manejo de 403 con código `EMAIL_NOT_VERIFIED` en el interceptor HTTP (sin limpiar token).
- La verificación de `emailVerified` en `AuthGuard`.
- La redirección post-registro (201) a `/verificacion-pendiente` (actualmente dirige al feed o `returnUrl`).

---

## 2. Análisis de impacto

### Épicas

| Épica | Impacto |
|---|---|
| Epic 1 (Autenticación) | Retrofits en historias `done`: 1.2 (interceptor + AuthGuard) y 1.3 (redirect post-201) |
| Épicas 2–7-f | Sin cambios |
| **Epic 8-f** (nueva) | Nueva épica de verificación de email: 5 historias |

### Artefactos

| Artefacto | Cambio |
|---|---|
| `docs/architecture.md` | v1.4 → v1.5 (tarea de historia 8-f1) |
| `_bmad-output/planning-artifacts/epics.md` | FR-F33–37, NFR-F4 actualizado, Epic 8-f + 5 historias |
| `_bmad-output/implementation-artifacts/sprint-status.yaml` | Entrada epic-8-f y 5 historias en `backlog` |

### UX / Design

Los nuevos screens (`/verificacion-pendiente`, `/verificar-email`) no tienen prototipo HTML dedicado. Se implementan siguiendo los patrones del módulo auth (`docs/project/Login.html`).

---

## 3. Enfoque recomendado — Ajuste directo (Opción 1)

Misma estructura que DLT-003 (epic 6) y DLT-004 (epic 7-f): nueva épica con historias secuenciadas sin modificar scope del MVP ni rollback de trabajo previo.

**Esfuerzo:** Medio · **Riesgo:** Bajo · **Impacto timeline:** Bajo

---

## 4. Propuestas de cambio

### A. epics.md — Nuevos requisitos funcionales (FR-F33–F37)

```
FR-F33: Post-registro (201), el frontend redirige a /verificacion-pendiente; no al feed ni a returnUrl.
FR-F34: /verificacion-pendiente informa al usuario de verificación pendiente y ofrece reenvío del email
         con cooldown de 30 s (Retry-After o default 30 s tras 200).
FR-F35: /verificar-email extrae el token del query param; 200 → /login con confirmación;
         400 → error con enlace a /verificacion-pendiente.
FR-F36: Ante 403 con código EMAIL_NOT_VERIFIED, el interceptor HTTP no limpia el token
         y redirige a /verificacion-pendiente.
FR-F37: AuthGuard verifica emailVerified del usuario en estado; si false, redirige a /verificacion-pendiente.
```

### B. epics.md — NFR-F4 actualizado

Añadir al final del NFR-F4:
```
Ante 403 con código EMAIL_NOT_VERIFIED, el interceptor NO limpia el token y redirige a /verificacion-pendiente.
```

### C. epics.md — Epic 8-f: Verificación de email

**5 historias:**

| Historia | Descripción | Tipo |
|---|---|---|
| 8-f1 | Regenerar cliente OpenAPI y architecture v1.5 | Base técnica |
| 8-f2 | Pantalla `/verificacion-pendiente` | Nueva pantalla |
| 8-f3 | Pantalla `/verificar-email` (procesamiento del token) | Nueva pantalla |
| 8-f4 | Retrofit interceptor 403 + AuthGuard `emailVerified` (retrofit 1.2) | Retrofit |
| 8-f5 | Retrofit registro → redirect a `/verificacion-pendiente` (retrofit 1.3) | Retrofit |

### D. sprint-status.yaml

Añadir `epic-8-f: backlog` con 5 stories en `backlog`.

---

## 5. Handoff

**Clasificación:** Moderado

**Agente destinatario:** Developer agent (`bmad-dev-story`)

**Secuencia de implementación:**
1. `8-f1` — base técnica (bloqueante para el resto)
2. `8-f2` y `8-f3` — pueden desarrollarse en paralelo
3. `8-f4` y `8-f5` — independientes entre sí; pequeños

**Criterios de éxito:**
- Flujo completo funcional: registro → `/verificacion-pendiente` → email → `/verificar-email` → `/login`
- Rutas protegidas bloqueadas cuando `emailVerified === false`
- Sin regresiones en historias 1.2, 1.3 ni en el resto de la aplicación
