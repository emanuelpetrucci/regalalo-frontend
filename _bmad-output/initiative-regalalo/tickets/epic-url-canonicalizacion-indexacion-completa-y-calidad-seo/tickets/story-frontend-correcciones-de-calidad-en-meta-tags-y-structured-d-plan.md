---
title: 'Frontend — Correcciones de calidad en meta tags y structured data'
type: 'feature'
ticket: 'f3'
created: '2026-10-27'
status: done
baseline_revision: 'e5a1f6104b1e0a38f3af418ca099d2b6ed26b58e'
route: 'full'
route_source: 'auto'
risk: 'low'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - src/app/core/seo/item-seo.service.ts
  - src/app/core/seo/landing-seo.service.ts
  - docs/architecture.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `ItemSeoService` deja incompletos los meta tags sociales (dimensiones y alt de imagen, `twitter:site`) y el JSON-LD Product (sin `@id`, sin `offers.seller`, solo la primera imagen). La descripción SEO se corta a 160 caracteres sin respetar límites de palabra.

**Approach:** Extender `ItemSeoService` con utilidades de truncado y tipo MIME de imagen, alinear OG/Twitter con el patrón de `LandingSeoService`, y enriquecer el schema Product según Epic 14 / architecture § Cambio 6. Alcance acotado a detalle de ítem (no Explorar/Landing/Reputation en este ticket).

## Boundaries & Constraints

**Always:** Mantener `apply`/`clear` públicos; URLs vía `itemPublicUrl`; `og:type` = `product` en detalle; robots `index, follow` vs `noindex, follow` según status.

**Never:** Tocar `../backend`; modificar otros servicios SEO; cambiar el plan o status de 14-f1.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| OG con imagen | `item.images[0]` definido | `og:image:width` 1200, `height` 630, `alt`=title, `type` según extensión; `twitter:image:alt`, `twitter:site` | Sin imagen: quitar tags de imagen OG/Twitter |
| Product JSON-LD | item activo con imágenes | `@id`=canonical; `offers.seller` Organization Regálalo; `image`=array completo | Sin imágenes: omitir propiedad `image` |
| Descripción larga | description > 160 chars | Truncar en último espacio antes de 160 + `…` | ≤160: sin ellipsis |
| Robots | completed/cancelled | `noindex, follow` | active: `index, follow` |

</frozen-after-approval>

## Code Map

- `src/app/core/seo/item-seo.service.ts` — servicio objetivo; `setOpenGraph`, `setStructuredData`, `apply`, `clear`
- `src/app/core/seo/seo-meta.util.ts` — nuevo: `truncateSeoDescription`, `inferOgImageMimeType`, constantes OG/Twitter
- `src/app/core/seo/item-seo.service.spec.ts` — ampliar aserciones JSON-LD y meta tags
- `src/app/core/seo/landing-seo.service.ts` — referencia dimensiones 1200×630 (no modificar)

## Tasks & Acceptance

**Execution:**
- [x] `src/app/core/seo/seo-meta.util.ts` — utilidades truncado y MIME — reutilizable y testeable
- [x] `src/app/core/seo/item-seo.service.ts` — OG extendido, Product @id/seller/images, truncado — cumple AC
- [x] `src/app/core/seo/item-seo.service.spec.ts` — tests matrix — regresión

**Acceptance Criteria:**
- Given ítem con imagen, when `apply`, then existen `og:image:width`, `og:image:height`, `og:image:alt`, `twitter:image:alt`, `twitter:site` y `og:type`=`product`
- Given Product JSON-LD, when serializado, then `@id` es la URL canonical, `offers.seller` es Organization Regálalo, `image` lista todas las URLs
- Given descripción >160 caracteres, when `apply`, then meta description termina en `…` sin cortar palabra
- Given ítem completed, when `apply`, then robots es `noindex, follow`

## Implementation Notes

- Añadido `seo-meta.util.ts` con truncado en límite de palabra, MIME de imagen y `@regalalo_org`.
- `ItemSeoService`: OG image dimensions/alt/type, `twitter:site`, Product `@id`, `offers.seller`, `image[]` completo; `clear()` elimina nuevos tags.

## Plan Change Log

## Review Triage Log

- Quick review (2026-10-27): sin hallazgos; AC del ticket (ItemSeoService) cubiertos por tests.

## Code Review

### 2026-10-29

**Code review complete.** 0 decision-needed, 0 patch, 0 defer, 0 rejected.

✅ Clean review — all lenses passed (quick).

Findings: ninguno. `ItemSeoService`, `seo-meta.util.ts` y specs alineados con intent del plan y architecture § Cambio 6; AC verificados por inspección del diff acotado a `src/app/core/seo/`.

**Rejected:** (ninguno)

## Verification

**Commands:**
- `npm test -- --run src/app/core/seo/item-seo.service.spec.ts` — expected: all pass
- `npm run build` — expected: success
