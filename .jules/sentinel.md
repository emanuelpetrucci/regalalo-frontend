## 2026-06-03 - JWT Token Leakage and SSR Hardening
**Vulnerability:** JWT tokens were attached to ALL outgoing HTTP requests, including external domains and static assets. Missing security headers in SSR.
**Learning:** Default Angular interceptors can easily leak sensitive data if they don't validate the destination URL against the application's API base. SSR environments often lack standard browser-provided protections.
**Prevention:** Always check `req.url` against `ApiConfiguration.rootUrl` in interceptors before adding credentials. Implement security middleware in SSR to set standard headers like `X-Frame-Options`.
