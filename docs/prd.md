# 📘 PRD MVP — "Regálalo" (v3.0)

> Versión 3.0 — MVP acotado. Derivado de v2.4.
> Cambios respecto a v2.4: eliminación del flujo de necesidades, simplificación del arbitraje de sesiones a confirmación única por donante, eliminación del sistema de reportes y ocultación automática, eliminación de la interfaz de administración. Correcciones técnicas C3–C8 incorporadas.

---

## 🧭 1. Visión del producto

Sistema comunitario de redistribución de objetos donde el acceso a recursos gratuitos se regula mediante comportamiento, reputación y equilibrio dinámico del ecosistema.

No es un marketplace ni una red social.
Es un sistema de asignación meritocrática con control algorítmico.

---

## ⚙️ 2. Principios del sistema

- Acceso abierto, impacto desigual
- El comportamiento condiciona oportunidades
- No existen bloqueos directos
- El sistema actúa sobre consecuencias, no intenciones
- Prioridad absoluta: experiencia del donante
- Regulación mediante degradación progresiva
- Sistema diseñado para ser utilizado **y jugado**

---

## 🔍 3. Transparencia del sistema

### Transparencia parcial

El sistema:
- No revela el algoritmo exacto de ranking
- Sí expone señales interpretables al usuario:
  - reputación visible
  - historial básico
  - indicadores de fiabilidad

👉 Objetivo: equilibrar comprensión del sistema sin permitir explotación directa.

---

## 🎯 4. Alcance del MVP

Sistema funcional centrado en el flujo donante–objeto–receptor. Incluye:

- Autenticación y verificación de email
- Descubrimiento público (SEO): indexación de catálogo y detalle de objetos sin registro
- Publicación y gestión de objetos
- Sistema de ranking de candidatos
- Sistema de reputación
- Detección de usuarios pasivos y acaparadores
- Sesión de entrega simplificada
- Notificaciones por email
- Perfil de usuario

No incluye en esta versión: flujo de necesidades, arbitraje complejo, sistema de reportes, interfaz de administración.

---

## 👥 5. Actores

### Visitante
- Explora el catálogo de objetos de forma pública e indexable.
- Visualiza detalles de objetos con identidad del donante anonimizada.
- No puede realizar solicitudes, reportes ni publicar sin registrarse.
- Objetivo: ser guiado al registro mediante CTAs de valor (Gating).

### Donante
- Publica objetos
- Selecciona receptor mediante ranking
- Confirma entrega
- Experimenta el sistema

### Receptor
- Solicita objetos
- Compite en ranking dinámico

### Sistema
- Ordena
- Prioriza
- Ajusta probabilidades

---

## 🧩 6. Entidades

### Usuario

| Campo | Descripción |
|---|---|
| email | Identificador único |
| first_name / last_name | Identidad visible; obligatorios en registro (2–50 caracteres) |
| avatar_url | URL pública opcional; si null, UI muestra iniciales del nombre |
| phone | Teléfono opcional (texto libre) |
| preferred_language | Idioma preferido (`es` en MVP) |
| email_verified | Estado de verificación de email (solo perfil privado) |
| código postal | Base para geolocalización |
| reputation_score | Score operativo — fuente de verdad |
| consecutive_no_shows | Contador de no-shows consecutivos — se resetea al completar entrega |
| cycles_at_limit | Ciclos consecutivos en los que el usuario agotó su límite mensual |
| total_received | Total de objetos recibidos históricamente |
| total_donated | Total de objetos donados históricamente |

> El campo `request_count_30d` no existe. El límite de solicitudes se verifica mediante ventana deslizante de 30 días sobre `item_requests`.

### Objeto

- título, descripción, estado, condición
- **categoría** (`category`) y **rango de peso** (`weightRange`) obligatorios en publicación — catálogo de valores en `docs/prd-analytics.md` §4 y `docs/architecture.md` v1.4 (DLT-004)
- Hasta **5 imágenes adjuntas** — comprimidas en cliente (máx. 1200px, WebP, calidad 80%, tope 2MB por imagen)
- Ubicación geográfica propia (puede diferir de la del donante)
- Estados: Active / Reserved / Completed / Cancelled
- Las imágenes de objetos en estado `completed` o `cancelled` se purgan automáticamente a los **30 días** del cambio de estado
- Los objetos sin selección de receptor tras **7 días** se degradan en visibilidad mediante el campo `degraded_at`. Un job de `pg_cron` lo establece y el ranking los ordena al final de los resultados

### Sesión de entrega
- Activada tras selección de receptor
- Canal de contacto externo — introducido por el donante en el momento de confirmar la selección
- El canal de contacto se revela al receptor únicamente cuando la sesión está en estado `active`
- Si el donante cancela la sesión, el canal no queda en ningún historial visible para el receptor
- Deadline estricto: 7 días — no extensible
- **Confirmación por parte del donante** — el donante confirma la entrega para cerrar la sesión
- Al expirar sin confirmación, la sesión se cierra sin penalización y el objeto vuelve a estado activo
- El campo `contact_channel` se purga (sobrescrito con `NULL`) a los **7 días** de que la sesión alcance estado `completed`, `cancelled` o `expired`

---

## 📏 7. Reglas del sistema

- Máximo 3 solicitudes de objetos cada 30 días — verificado mediante **ventana deslizante** de 720 horas
- Email obligatorio
- Radio geográfico: 50 km
- Sin chat interno
- Cierre automático de sesiones al vencer el deadline (7 días)
- Un usuario no puede solicitar su propio objeto
- **Acceso público de lectura:** el feed de "Explorar" y las páginas de detalle de objeto son accesibles sin autenticación y optimizadas para SEO.
- **Privacidad de identidad:** la información personal del donante (nombre completo y avatar real) es anónima para visitantes no registrados. Solo se muestra el score de reputación.
- **Gating de interacción:** cualquier intento de acción (Solicitar, Reportar, Ver Perfil Completo) redirige al usuario al flujo de login o registro.
- **Gestión de obsolescencia SEO:** los objetos en estado `completed` o `cancelled` se marcan con `noindex` para evitar que Google mantenga en el índice objetos ya entregados.

---

## 🔁 8. Flujo de objeto

1. Publicación (con hasta 5 imágenes)
2. Solicitudes de receptores
3. Ranking automático de candidatos
4. Selección por el donante (≤ 48h recomendado) — el donante introduce su canal de contacto en este paso
5. Sesión de entrega (≤ 7 días estrictos)
6. Confirmación por el donante

### Degradación por inactividad

Los objetos sin selección de receptor tras **7 días** no se cancelan. El campo `degraded_at` se establece mediante `pg_cron` y los objetos aparecen al final de los resultados de búsqueda hasta que el donante realice una selección.

---

## 📊 9. Sistema de ranking

### Orden de criterios

1. Reputación (reputation_score efectivo)
2. Cercanía geográfica
3. Antigüedad de la solicitud

### Propiedades

- Calculado en tiempo real al visualizar solicitudes
- No determinista: perturbación aleatoria de **±2 puntos** sobre el score efectivo en cada cálculo
- Sensible al comportamiento histórico
- Excluye usuarios pasivos del ranking

---

## 🧠 10. Sistema de reputación

### Eventos y deltas

| Evento | Delta |
|---|---|
| Entrega completada | +10 |
| No-show | -20 × consecutive_no_shows |

### Reglas

- **Sin valor mínimo** — el score puede ser negativo sin límite
- **Penalización acumulativa:** cada no-show consecutivo multiplica la penalización base de -20 por el número de no-shows consecutivos. El contador se resetea a 0 al completar una entrega exitosa
- **Recuperación exclusivamente por actividad positiva** — no existe recuperación pasiva por tiempo transcurrido
- El `reputation_score` es un campo calculado que se actualiza en cada evento. No se recalcula desde el historial

### Ejemplo de acumulación

```
No-show #1 → -20  (consecutive_no_shows = 1)
No-show #2 → -40  (consecutive_no_shows = 2)
Entrega    → +10  (consecutive_no_shows = 0)
No-show #1 → -20  (consecutive_no_shows = 1)
```

---

## 📈 11. Sistema de comportamiento

### Usuario pasivo

Un usuario es considerado pasivo si cumple las tres condiciones simultáneamente:

```
total_donated = 0
AND total_received > 0
AND sin actividad en los últimos 60 días
```

Un usuario nuevo sin actividad **no** es considerado pasivo. Solo lo es quien ha recibido objetos y nunca ha donado.

**Efecto:** exclusión del ranking. No afecta el `reputation_score`.

### Usuario acaparador

Un usuario es considerado acaparador si cumple ambas condiciones simultáneamente:

```
cycles_at_limit >= 3
AND total_received > 5 × total_donated
```

**Definición de ciclo:** un ciclo es un período de 30 días en el que el usuario ha agotado su límite de 3 solicitudes. `cycles_at_limit` se incrementa mediante `pg_cron` una única vez por cada ventana de 30 días en la que se detecte agotamiento del límite. El sistema garantiza que el contador no se incremente más de una vez por ciclo independientemente de la frecuencia de ejecución del job.

**Efecto:** penalización de -15 puntos sobre el score efectivo en el ranking. No afecta el `reputation_score` oficial ni bloquea al usuario.

### Usuarios adaptativos
- Comportamiento optimizado esperado
- No penalizado si cumple las reglas del sistema

---

## 🔄 12. Flujo de entrega

### Solución implementada

- Confirmación por el donante para completar la sesión
- Cierre automático al vencer deadline de 7 días sin penalización
- Al expirar una sesión, el objeto vuelve a estado activo automáticamente
- El donante recibe notificación por email cuando su objeto vuelve a estar disponible
- El receptor seleccionado recibe notificación por email si el donante cancela el objeto
- El campo `contact_channel` se purga a los 7 días de cierre de sesión

### Notificaciones por email definidas

| Evento | Destinatario | Contenido |
|---|---|---|
| Sesión expirada sin confirmación | Donante | El objeto ha vuelto a estado activo |
| Donante cancela objeto | Receptor seleccionado | La entrega ha sido cancelada por el donante |

### Declaración de no-show

El donante puede marcar explícitamente "el receptor no se presentó" en el momento de cerrar o cancelar la sesión. Este acto registra un evento de no-show y aplica la penalización correspondiente al receptor. Si el donante no realiza ninguna declaración y el deadline expira, la sesión se cierra sin penalización para ninguna de las partes.

---

## 🌐 13. Geocodificación

El código postal introducido en el registro se geocodifica para obtener las coordenadas geográficas del usuario. El proveedor debe seleccionarse antes de iniciar la Fase 3 de implementación. Criterios de selección: cobertura geográfica del mercado objetivo, coste por llamada y disponibilidad de fallback.

---

## ⚖️ 14. Equilibrio del ecosistema

- No obligatorio donar
- Pero recibir sin aportar reduce oportunidades progresivamente

El sistema regula acceso, no comportamiento.

---

## ⚠️ 15. Riesgos asumidos

- Multi-cuenta
- Uso oportunista
- Complejidad del sistema
- Curva de aprendizaje
- Dependencia del equilibrio dinámico
- Acoso o fraude fuera de la plataforma (fuera del alcance del sistema por diseño)
- Escalabilidad del ranking dinámico a gran volumen (mitigación diferida con umbral documentado)

---

## 🗺️ 16. Roadmap de implementación

| Fase | Nombre | Estado |
|---|---|---|
| 1 | Infraestructura base | 🔲 Pendiente |
| 2 | Modelo de datos | 🔲 Pendiente |
| 3 | Autenticación | 🔲 Pendiente |
| 4 | Flujo de objetos | 🔲 Pendiente |
| 5 | Ranking y reputación | 🔲 Pendiente |
| 6 | Sesión de entrega simplificada | 🔲 Pendiente |
| 7 | Perfil y reputación visible | 🔲 Pendiente |
| 8 | Calidad y lanzamiento | 🔲 Pendiente |

---

## 📦 17. Estado

Sistema MVP:

- Completo y coherente en su núcleo diferencial
- No bloqueante
- Basado en comportamiento
- Optimizado para equilibrio emergente
- Listo para iniciar implementación una vez resueltas las decisiones previas pendientes (proveedor de geocodificación, comportamiento de `expires_at` en `items`)

---

## 🍪 18. Gestión de consentimiento de cookies (MVP)

Se incorpora al MVP un gestor de consentimiento de cookies con enfoque de cumplimiento España/UE.

### Requisitos funcionales (cookies)

- **FR-F38:** El usuario puede gestionar consentimiento de cookies no esenciales desde primera capa: `Aceptar todo`, `Rechazar no esenciales` y `Configurar`.
- **FR-F39:** El usuario puede reabrir y modificar sus preferencias en cualquier momento desde un acceso persistente en el footer legal.
- **FR-F40:** El frontend bloquea scripts/cookies no esenciales (`analytics`, `marketing`) hasta consentimiento explícito por categoría.
- **FR-F41:** El sistema registra consentimiento con `policyVersion`, categorías y timestamp para trazabilidad y re-consentimiento cuando cambie la política. Además, la política publicada en frontend debe reflejar de forma explícita y verificable el versionado vigente y la estructura completa de información legal definida en `docs/project/Política de privacidad.html` y `docs/project/Política de cookies.html`.

### Requisitos no funcionales (cookies)

- **NFR-F14:** La solución de consentimiento de cookies debe ser **open source**.
- **NFR-F15:** El flujo de consentimiento debe cumplir WCAG AA y pasar checks AXE en sus estados principales.
- **NFR-F16:** La implementación debe respetar estrictamente la maquetación de `docs/project/Política de privacidad.html` y `docs/project/Política de cookies.html`, reutilizando el footer ya definido en esas páginas como acceso persistente de configuración.
