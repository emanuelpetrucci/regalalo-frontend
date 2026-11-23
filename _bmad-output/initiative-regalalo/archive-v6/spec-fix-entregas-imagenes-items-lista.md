---
title: 'fix: imágenes de ítems en filas del listado de entregas'
type: 'bugfix'
created: '2026-05-28'
status: 'done'
route: 'one-shot'
---

# fix: imágenes de ítems en filas del listado de entregas

## Intent

**Problem:** En la página `/entregas`, las filas del listado siempre mostraban un icono SVG placeholder en lugar de la miniatura real del ítem, porque `MyDeliverySession` (endpoint `GET /users/me/delivery-sessions`) no incluía ningún campo de imagen.

**Approach:** Añadir `itemImageUrl: string | null` a `MyDeliverySession` en backend (schema OpenAPI, DTO, use case, repositorio Postgres) y actualizar el template `entregas.component.html` para mostrar `<img [ngSrc]>` cuando la URL existe, manteniendo el SVG fallback cuando es null.

## Suggested Review Order

1. [SQL subquery + ORDER BY](../../backend/src/infrastructure/database/supabase/user.repository.ts) — `findMyDeliverySessions` línea ~326: correlated subquery con `ORDER BY created_at ASC, id ASC LIMIT 1`
2. [Use case — resolución URL](../../backend/src/application/use-cases/user/get-my-delivery-sessions.use-case.ts) — mapeo `itemImagePath → itemImageUrl` vía `resolveStoragePublicUrl`
3. [OpenAPI schema](../../backend/src/openapi/schemas/user.schemas.ts) — `itemImageUrl: z.string().url().nullable()` en `myDeliverySessionSchema`
4. [Template list rows](src/app/features/delivery/entregas/entregas.component.html) — bloques `activeSessions` / `historySessions`: `@if (session.itemImageUrl)` → `<img [ngSrc] width="52" height="52" alt="">` dentro de `aria-hidden`
5. [SCSS thumb](src/app/features/delivery/entregas/entregas.component.scss) — `overflow: hidden` + `img { object-fit: cover }`
6. [Spec mocks](src/app/features/delivery/entregas/entregas.component.spec.ts) — `itemImageUrl: null` en `mockListSession`

## Spec Change Log

- 2026-05-28: Implementación directa (one-shot). Review adversarial aplicó 5 patches: ORDER BY determinista (`id ASC`), comentario de índice, `alt=""` en img dentro de aria-hidden, width/height 48→52 para coincidir con CSS, eliminación de `&--placeholder` no-op. Deferred: NgOptimizedImage loader, error handling en resolveStoragePublicUrl, duplicación de bloques thumb.
