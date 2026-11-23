---
ticket: spec-fix-csp-recaptcha-google-analytics
status: done
type: bugfix
migrated_from: v6
---


## Intent

**Problem:** La directiva `connect-src` del CSP no incluía los endpoints de fetch de reCAPTCHA v3 (`www.google.com/recaptcha/`, `recaptcha.google.com`) ni el endpoint regional de GA4 (`region1.google-analytics.com`), produciendo errores "Refused to connect because it violates the document's Content Security Policy" en producción.

**Approach:** Añadir los tres orígenes faltantes a `connect-src` en `server.ts` y extender `frame-src` para incluir `recaptcha.google.com` (necesario cuando reCAPTCHA carga su iframe desde el dominio alternativo).

## Suggested Review Order

- [`src/server.ts:57-67`](../../src/server.ts) — bloque `cspHeader`: verificar las dos directivas modificadas (`connect-src` y `frame-src`)

## Spec Change Log

## Design Notes

reCAPTCHA v3 hace llamadas fetch a `/recaptcha/api2/clr` y `/recaptcha/api2/userverify` bajo dos dominios distintos (`www.google.com` y `recaptcha.google.com`). Ambos ya estaban en `script-src`; sólo faltaba `connect-src`. GA4 enruta hacia `region1.google-analytics.com` en la región EU — distinto del `www.google-analytics.com` ya permitido.
