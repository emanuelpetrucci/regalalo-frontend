# Delta — technical-design-frontend.md
**Versión base:** 1.2  
**Versión resultante:** 1.3  
**Estado:** Pendiente de aprobación  
**Fecha:** Mayo 2026  
**Motivo:** Incorporación de verificación de email en el registro de usuario

---

## Sección 5 — Modelos TypeScript del Dominio

### Cambio

Añadir campo `emailVerified` a la interfaz `User`.

```typescript
export interface User {
  id: string;
  email: string;
  postalCode: string;
  reputationScore: number;
  totalReceived: number;
  totalDonated: number;
  consecutiveNoShows: number;
  emailVerified: boolean;        // nuevo
  createdAt: string;
}
```

---

## Sección 4 — Contratos de API

### Cambio 1 — POST /auth/register (respuesta)

La respuesta incluye el campo `emailVerified` en el objeto `user`. En el momento del registro, el valor será siempre `false`.

```json
{
  "token": "string (JWT)",
  "user": {
    "id": "uuid",
    "email": "string",
    "postalCode": "string",
    "reputationScore": 0,
    "totalReceived": 0,
    "totalDonated": 0,
    "emailVerified": false
  }
}
```

---

### Cambio 2 — Nuevo endpoint: GET /auth/verify-email

```
GET /auth/verify-email?token=<token_raw>
```

**Autenticación:** no requerida. El token de verificación actúa como credencial.

**Respuesta esperada (200):**
```json
{
  "message": "string"
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 400 | Token inválido o expirado |

**Nota de implementación:** el frontend recibe el token como query param desde el enlace del email. Tras una respuesta 200, redirigir a `/login` con mensaje de confirmación. Ante un error 400, mostrar pantalla de error con opción de solicitar nuevo enlace (redirigir a `/verificacion-pendiente`).

---

### Cambio 3 — Nuevo endpoint: POST /auth/resend-verification

```
POST /auth/resend-verification
Authorization: Bearer <token>
```

**Payload de entrada:** vacío.

**Respuesta esperada (200):**
```json
{
  "message": "string"
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 401 | JWT inválido o expirado |
| 409 | El email ya está verificado |
| 429 | Cooldown activo — header `Retry-After` con segundos restantes |

---

## Sección 2 — Estructura de Carpetas

### Cambio

Añadir pantalla de verificación pendiente dentro del módulo `auth`.

```
src/
├── app/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   ├── verify-email/          # nuevo — procesa el token del enlace
│   │   │   └── verification-pending/  # nuevo — pantalla post-registro y redirección por 403
```

---

## Sección 6 — Reglas de Presentación

### Cambio

Añadir las siguientes reglas:

**Flujo post-registro:**
Tras un registro exitoso (HTTP 201), el JWT se almacena en `localStorage` y el usuario es redirigido a `/verificacion-pendiente`. No se redirige al home ni a ninguna ruta protegida.

**Pantalla `/verificacion-pendiente`:**
- Informa al usuario de que debe verificar su email antes de continuar.
- Muestra el botón "Reenviar email de verificación".
- Tras pulsar el botón, este se deshabilita durante 30 segundos con cuenta regresiva visible. El tiempo restante se obtiene del header `Retry-After` de la respuesta 429, o se inicializa a 30 segundos tras una respuesta 200.
- No expone lógica adicional ni opciones de navegación a rutas protegidas.

**Procesamiento del enlace de verificación (`/verificar-email`):**
- Al cargar la pantalla, el componente extrae el token del query param y llama a `GET /auth/verify-email?token=<token>`.
- Respuesta 200: redirigir a `/login` con mensaje de confirmación visible ("Tu email ha sido verificado. Ya puedes iniciar sesión.").
- Respuesta 400: mostrar mensaje de error ("El enlace no es válido o ha expirado.") con enlace a `/verificacion-pendiente` para solicitar un nuevo enlace.

**Interceptor JWT — respuesta 403 con código `EMAIL_NOT_VERIFIED`:**
Ante un 403 con código `EMAIL_NOT_VERIFIED` en el cuerpo de la respuesta, el interceptor no limpia el token de `localStorage` (el JWT sigue siendo válido). En su lugar, redirige a `/verificacion-pendiente`. Esta redirección es diferente a la que aplica ante un 401, que sí limpia el token y redirige a `/login?returnUrl=<ruta>`.

**AuthGuard:**
El `AuthGuard` verifica, además de la presencia y expiración del token por timestamp local, el campo `emailVerified` del usuario almacenado en el estado de la aplicación. Si `emailVerified === false`, redirige a `/verificacion-pendiente` sin intentar la navegación a la ruta protegida.

**Nota:** el campo `emailVerified` no se expone en el perfil público (`GET /users/:id`).
