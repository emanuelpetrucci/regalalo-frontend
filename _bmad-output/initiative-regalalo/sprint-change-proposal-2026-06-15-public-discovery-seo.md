# Sprint Change Proposal — Acceso Público, Indexación SEO y Retención

**Fecha:** 2026-06-15  
**Estado:** Aprobado  
**Aprobado por:** Emanuel  
**Fecha de aprobación:** 2026-06-15  
**Solicitado por:** Emanuel  
**Tipo de cambio:** Estratégico / Técnico (Acceso Público y SEO)

---

## 1. Resumen del Issue

### Problema
El sistema actual es un "walled garden" (jardín vallado) que requiere autenticación obligatoria para cualquier visualización del catálogo o detalle de objetos. Esto genera dos problemas críticos:
1.  **Indexación Nula**: Google no puede rastrear ni indexar los objetos disponibles, perdiendo tráfico orgánico de búsqueda.
2.  **Baja Retención**: Los nuevos usuarios abandonan la plataforma al encontrarse con una barrera de registro inmediata sin haber visto el valor (objetos disponibles) del sistema.

### Meta
Transformar el modelo de acceso a **"Público para Ver, Privado para Actuar"**, permitiendo el descubrimiento abierto mientras se protege la privacidad de los usuarios y se incentiva el registro mediante acciones bloqueadas (Gating).

---

## 2. Análisis de Impacto

### Impacto en Épicas
| Épica | Impacto |
|---|---|
| **Épica 2: Objetos** | **Modificación**: Se eliminan las restricciones de `AuthGuard` para las rutas de Explorar y Detalle. Se requiere retrofit de lógica de carga de datos para manejar estados sin JWT. |
| **Épica 3: Solicitudes** | **Modificación**: El botón "Interesado" ahora actúa como disparador de conversión (Conversion Gating) para invitados. |
| **Nueva Épica 13** | **Añadida**: "Descubrimiento Público y Conversión SEO". Agrupa todas las tareas de infraestructura SEO y UX de invitado. |

### Impacto en Artefactos
*   **PRD**: Se añade el actor "Visitante" y se definen sus permisos de solo lectura y reglas de anonimización.
*   **Arquitectura**: Reorganización de la tabla de rutas y actualización de la lógica del `AuthGuard`. Nueva sección dedicada a la estrategia SEO (Metadatos, SSR, noindex).
*   **Diseño UX**: Adaptación del App Shell para mostrar estados "Desconectado" y creación del Modal de Conversión.

---

## 3. Enfoque Recomendado: Híbrido (Direct Adjustment + MVP Review)

Se propone una transición inmediata a un modelo de descubrimiento público manteniendo las protecciones de privacidad para los donantes.

### Justificación
- **Velocidad**: Refactorizar rutas y guards es menos costoso que mantener un sistema de invitación o vistas previas limitadas.
- **SEO**: Es la única forma de garantizar que el catálogo sea una fuente de tráfico constante.
- **Conversion Rate**: Mostrar el "producto" antes de pedir los datos es una práctica estándar para mejorar la retención inicial.

---

## 4. Propuestas de Cambio Detalladas

### 4.1 Modificaciones en el PRD (`docs/prd.md`)
- **Sección 5 (Actores)**: Añadir actor **Visitante**. Definición: "Usuario no registrado que explora el catálogo. Permisos: Solo lectura anonimizada".
- **Sección 7 (Reglas)**:
    - "Privacidad de identidad: El nombre y avatar del donante son anónimos para visitantes".
    - "Gating: Acciones de interacción redirigen al registro".
    - "SEO: Objetos completados/cancelados marcados con `noindex` para evitar que Google mantenga en el índice objetos ya entregados".

### 4.2 Modificaciones en Arquitectura (`docs/architecture.md`)
- **Rutas**: `/explorar` e `/items/:id` marcadas como públicas.
- **AuthGuard**: Aplicado selectivamente a rutas de acción (publicar, solicitar, perfil privado).
- **SEO Técnico**: Definición de inyección dinámica de Metatags y manejo de `410 Gone` para objetos purgados.

### 4.3 Nueva Épica 13 — Historias de Usuario
- **13-f1: SEO Técnico Crítico**: Rutas públicas, metadatos dinámicos, `noindex` inteligente. **Importante**: El endpoint `GET /items` debe permitir acceso sin token y, ante la ausencia de coordenadas del usuario, devolver un **Feed Global** (sin restricción de 50km) para asegurar la indexación total por parte de bots de Google.
- **13-f2: UX de Invitado y Conversión**: App Shell "Guest mode", anonimización de `ItemDonorRow`, y Modal de Conversión.

---

## 5. Handoff de Implementación

**Clasificación**: Moderate (Requiere reorganización de rutas y nuevas historias).

| Paso | Responsable | Acción |
|---|---|---|
| 1 | Developer Agent | Aplicar cambios redactados en PRD y Arquitectura. |
| 2 | Product Owner | Crear historias de la Épica 13 en el backlog. |
| 3 | Developer Agent | Implementar 13-f1 (Infraestructura SEO) como prioridad inmediata. |

---

## 6. Firma y Aprobación
- [x] **Aprobar**: Proceder con la actualización de documentos y creación de historias.
- [ ] **Revisar**: Indicar ajustes necesarios.
