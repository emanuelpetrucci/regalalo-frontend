# Delta — email-flow-mapping.md
**Versión base:** 1.1  
**Versión resultante:** 1.2  
**Estado:** Pendiente de aprobación  
**Fecha:** Mayo 2026  
**Motivo:** Incorporación de verificación de email en el registro de usuario

---

## Sección 1 — Tabla de Mapeo de Emails

### Cambio

Añadir evento EVT-014 a la tabla de mapeo. Este evento cubre tanto el envío inicial en el registro como los reenvíos posteriores, ya que la plantilla y los datos son idénticos en ambos casos.

| ID_Evento | Trigger | Capa / Origen | Destinatario | Template_Ref | Condicionales |
|---|---|---|---|---|---|
| EVT-014 | Registro completado o reenvío solicitado por el usuario | Use Case: `RegisterUser` / Use Case: `ResendVerification` | Usuario registrado pendiente de verificación | `TPL-009` | Registro: reCAPTCHA score ≥ 0.5, email único, código postal geocodificable. Reenvío: JWT válido, `email_verified = FALSE`, cooldown de 30 segundos superado. |

---

## Sección 2 — Tabla de Definición de Datos por Evento

### Cambio

Añadir fila para EVT-014:

| ID_Evento | Template_Ref | Variables_Requeridas | Prioridad |
|---|---|---|---|
| EVT-014 | `TPL-009` | `recipientEmail`, `verificationLink`, `expiresInHours` | Alta |

**Valores fijos:**
- `expiresInHours`: `24`
- `verificationLink`: URL completa con el token en texto plano — formato `https://<dominio>/verificar-email?token=<token_raw>`

---

## Sección 3 — Diagrama de Flujo por Capa

### Cambio

Añadir los dos nuevos use cases al bloque `APPLICATION / USE CASES`:

```
┌─────────────────────────────────────────────────────────┐
│                 APPLICATION / USE CASES                 │
│                                                         │
│  RegisterUser          → IMailService.send(TPL-001)     │
│                        → IMailService.send(TPL-009)     │  ← nuevo
│  ResendVerification    → IMailService.send(TPL-009)     │  ← nuevo
│  RequestPasswordReset  → IMailService.send(TPL-002)     │
│  SelectReceiver        → IMailService.send(TPL-003)     │
│  CancelItem            → IMailService.send(TPL-005)     │
│  RequestItem           → IMailService.send(TPL-006)     │
│  ResetPassword         → IMailService.send(TPL-008)     │
└─────────────────────────────────────────────────────────┘
```

**Nota:** `RegisterUser` ahora dispara dos emails secuenciales: TPL-001 (bienvenida/confirmación de registro) y TPL-009 (verificación de email). Ambos se envían en el mismo flujo de ejecución del use case, tras la inserción del usuario en base de datos.

---

## Sección 5 — Notas de Diseño

### Cambio

Añadir nota para EVT-014:

**EVT-014 — Token de verificación y reenvíos:**
El token de verificación se genera con `crypto.randomBytes(32)` y se almacena en base de datos únicamente como hash SHA-256. El token en texto plano solo existe en el enlace del email. Cada reenvío genera un nuevo token e invalida el anterior, ya que `verification_token_hash` se sobrescribe. El cooldown de 30 segundos entre reenvíos se controla mediante el campo `verification_resend_at` en la tabla `users`. El Use Case `ResendVerification` comprueba este campo antes de emitir un nuevo token.
