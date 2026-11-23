# GEO Audit Report — Regalalo.org/explorar

**Date:** 2026-06-16
**Target URL:** https://regalalo.org/explorar
**Root Domain:** https://regalalo.org
**Business Type:** Sharing Economy / Community Platform — free object redistribution, no money, 50km radius, Spain
**Audited By:** GEO-SEO Claude Code Skill (5 parallel subagents)

---

## Overall GEO Score: 42/100 — Fair

> Regalalo.org is technically well-built and fully open to AI crawlers, but nearly invisible to AI models when answering queries. The gap between Crawler Access (100/100) and Brand Mentions (3/100) is the defining story: the site is perfectly readable by AI bots but has almost no external evidence trail for AI models to form confident citations. Closing the brand authority gap is the highest-leverage investment available.

### Score Breakdown

| Category | Score | Weight | Weighted Score | Status |
|---|---|---|---|---|
| AI Citability & Visibility | 58/100 | 25% | 14.5 | Fair |
| Brand Authority Signals | 3/100 | 20% | 0.6 | Critical |
| Content Quality & E-E-A-T | 36/100 | 20% | 7.2 | Poor |
| Technical Foundations | 76/100 | 15% | 11.4 | Good |
| Structured Data | 33/100 | 10% | 3.3 | Poor |
| Platform Optimization | 45/100 | 10% | 4.5 | Fair |
| **TOTAL** | **42/100** | 100% | **41.5** | **Fair** |

### Platform Scores

| Platform | Score | Status |
|---|---|---|
| Google AI Overviews | 44/100 | Fair |
| ChatGPT Web Search | 50/100 | Fair |
| Perplexity AI | 55/100 | Fair |
| Google Gemini | 28/100 | Poor |
| Bing Copilot | 47/100 | Fair |

---

## Site Overview

**Title:** Regálalo — Da una segunda vida a tus objetos
**Value Proposition:** "Lo que ya no usas, alguien lo necesita"
**Model:** Free, community-based object donation. No money, no bartering. Access based on community participation (reputation system), not purchasing power. Items available within 50km radius.
**Languages:** Spanish (primary), Catalan (/ca), English (/en)
**Indexed Pages:** Only 7 (homepage ES/CA/EN, reputation page ES/CA/EN, /explorar)
**Tech Stack:** Angular with SSR/SSG via Vercel + Express, Supabase backend
**Framework:** Angular + Beasties (critical CSS inlining, formerly Critters)

---

## Category 1: AI Citability & Visibility — 58/100

### Sub-scores

| Component | Score | Weight |
|---|---|---|
| Citability | 76/100 | 35% |
| Brand Mentions | 3/100 | 30% |
| Crawler Access | 100/100 | 25% |
| llms.txt | 50/100 | 10% |

### Crawler Access — 100/100

The robots.txt is the strongest asset in this audit. GPTBot, PerplexityBot, and ClaudeBot are all explicitly named with granular path-level `Allow` rules. Private auth paths are correctly disallowed.

- All major AI crawlers explicitly allowed: GPTBot, PerplexityBot, ClaudeBot
- OAI-SearchBot, ChatGPT-User, Bingbot inherit via permissive wildcard
- Sitemap correctly referenced at `/sitemap.xml`
- Private paths (/login, /register, /users/, /perfil, /mis-objetos) correctly blocked

### Citability — 76/100

**Most citable blocks (score 70+):**

1. **Reputation gain rules** (82/100) — "+15 puntos (primera donación), +10 puntos (donaciones posteriores), +1 punto por entrega completada" — specific, numeric, self-contained, directly quotable.
2. **Penalty escalation table** (81/100) — "1ª falta: −10 / 2ª consecutiva: −20 / 3ª consecutiva: −30. Una entrega completada reinicia el contador" — strong statistical density.
3. **Three-step process with constraints** (76/100) — "Publica (hasta 5 fotos), Solicita (máximo 3/mes), Entrega" — numeric constraints make this AI-citable.
4. **Visibility demotion timeline** (75/100) — "Tras 1 mes sin donar: baja en listas. Tras 2 meses: solicitudes desaparecen de búsqueda" — specific timeframes.
5. **Data deletion policy** (68/100) — "Eliminación automática de datos tras 7 días" — distinct, verifiable, differentiating claim.

**Critical weak spot:** The `/explorar` page scores 34/100 for citability — it's an application view (item listing board) with almost no static informational text. An AI model cannot excerpt it meaningfully.

### llms.txt — 50/100

**Status:** File exists at `https://regalalo.org/llms.txt` ✅

**Issues found:**
1. `/explorar` and `/items/` listed under "Aplicación (no indexar)" — but robots.txt explicitly allows these paths. Public content is being unnecessarily hidden from AI models.
2. Non-standard section name `## Aplicación (no indexar)` — the llms.txt spec doesn't define exclusion sections; that's robots.txt's job.
3. No real `llms-full.txt` — the file at `/llms-full.txt` returns only "Regálalo".
4. Reputation system description in llms.txt is sparse; the actual citable point values are not included.

---

## Category 2: Brand Authority Signals — 3/100 (Critical)

This is the defining weakness. AI models form citation confidence from repeated exposure across authoritative external sources. Regalalo has essentially no external footprint.

| Platform | Status |
|---|---|
| Wikipedia (ES) | Absent — 404 confirmed |
| Wikipedia (EN) | Absent — 404 confirmed |
| Wikidata | No entity exists |
| Reddit | No mentions found |
| LinkedIn | Company page 404 confirmed |
| YouTube | No channel or videos found |
| Product Hunt | Not listed |
| Press / Tech Media | No coverage found |
| Industry Directories | Not listed (Capterra, G2, etc.) |

**Name collision risk:** Searches for "Regalalo" surface an unrelated 2018 Spanish gift/pastry business and cryptocurrency fraud cases. A Wikipedia article and consistent brand presence would resolve this disambiguation problem.

**The core issue:** A language model asked "¿qué plataformas hay para regalar objetos gratis en España?" has no training data to place Regalalo in the answer. The site is perfectly legible to crawlers but invisible to AI models that decide what to cite.

---

## Category 3: Content Quality & E-E-A-T — 36/100

### E-E-A-T Scores

| Dimension | Score | Key Gap |
|---|---|---|
| Experience | 6/25 | Zero testimonials, no user stories, no first-hand narratives |
| Expertise | 7/25 | Well-designed reputation system, but no named authors, no team page, no About page |
| Authoritativeness | 5/25 | No press, no statistics, no external recognition; only 7 indexed pages |
| Trustworthiness | 12/25 | HTTPS, privacy policy, two contact emails, 7-day data deletion — but no physical address, no ToS link, no third-party reviews |

### Content Metrics

| Metric | Value |
|---|---|
| Homepage word count | ~550-650 words |
| /explorar static content | ~150 words (almost entirely dynamic listings) |
| /como-funciona/reputacion | ~300-350 words (thin but specific) |
| Total indexed pages | 7 |
| Blog / guides / articles | 0 |
| User stories / testimonials | 0 |
| Platform statistics published | 0 |
| External citations / links | 0 |

### AI Content Assessment

Content reads as genuine human-crafted startup copy — concise, with occasional poetic flourishes ("Todo lo que se da, vuelve"). The risk is not AI content quality but volume: too little content for AI systems to have meaningful citation opportunities.

### Topical Authority: Minimal

No blog, no guides, no community stories, no pillar content. No content addressing the queries users ask before discovering the platform:
- "¿Cómo donar objetos usados en España?"
- "¿Mejores plataformas para dar objetos gratis?"
- "¿Es seguro Regálalo?"
- "¿Cómo reducir residuos donando?"

---

## Category 4: Technical Foundations — 76/100

### Rendering — 92/100

**Framework:** Angular with Beasties (SSG + per-route SSR via Vercel/Express)
**Result:** All public pages deliver full content in initial HTML. AI crawlers read complete content without JavaScript execution. Both the homepage and /explorar confirm ~5,800–6,500 words of prerendered content accessible to bots.

### Meta Tags — 65/100

| Page | Title | Description | Hreflang | OG Image |
|---|---|---|---|---|
| Homepage | 44 chars (short) | 143 chars (good) | ES/CA/EN/x-default | Present |
| /explorar | 37 chars (too short) | Present | Missing entirely | Missing |
| /items/{uuid} | 26 chars (very short) | Truncated mid-word bug | N/A | Present |

**Critical bug:** Item page meta descriptions truncated at 160 chars mid-word ("…Por lo d"). Same truncated string is embedded in JSON-LD Product schema `description` — a structured data quality bug.

### Crawlability — 70/100

**Critical gap:** robots.txt allows `/items/` but zero item pages appear in sitemap.xml (only 7 URLs total). Discovery of individual item pages depends on crawlers following links from `/explorar` — unreliable for a dynamic, location-filtered listing.

**Hreflang:** Correct on homepage (ES/CA/EN/x-default). Missing entirely on `/explorar`.

**www redirect:** `www.regalalo.org` → `https://regalalo.org/` via **307 Temporary** instead of 301 Permanent. Does not pass full link equity.

### Security Headers — 80/100

| Header | Homepage | Dynamic Pages |
|---|---|---|
| Content-Security-Policy | Missing | Present (comprehensive) |
| X-Frame-Options | SAMEORIGIN | DENY (stricter) |
| HSTS | 2 years | 1 year |
| X-Content-Type-Options | nosniff | nosniff |

Homepage served as Vercel-cached static asset without CSP. Dynamic pages have a well-formed CSP.

### Core Web Vitals Risk — 63/100

| Vital | Risk | Issue |
|---|---|---|
| LCP | Medium | No `fetchpriority="high"` on above-fold Supabase images; no preconnect for Supabase CDN |
| INP | Low | `type="module"` inherently deferred; Angular JSAction handles events efficiently |
| CLS | Medium-High | All item card images lack `width` and `height` attributes — layout shift risk |

### URL Structure — 62/100

- Homepage, /explorar, language paths: clean and descriptive
- Content pages: logical hierarchy with translated slugs per language
- Item pages (`/items/a14435b0-cede…`): UUID-only — no keyword value, no human-readable slug
- www redirect: 307 Temporary instead of 301 Permanent

---

## Category 5: Structured Data — 33/100

### Schema Inventory (9 blocks, all JSON-LD)

| Page | Schema Types |
|---|---|
| Homepage | WebSite+SearchAction, Organization, FAQPage (8 Q), WebPage, SoftwareApplication |
| /explorar | BreadcrumbList, CollectionPage |
| /como-funciona/reputacion | BreadcrumbList, WebPage, FAQPage (3 Q) |

### Critical Gaps

**Organization — `sameAs` is completely absent:**
The Organization schema exists but has zero `sameAs` links. This is the single largest GEO schema gap. AI models use `sameAs` to build entity graphs and verify brand identity across LinkedIn, Twitter, Wikipedia, etc.

**CollectionPage on /explorar — no ItemList:**
The discovery board is the core product page. The six visible item listings have zero structured markup. AI parsers cannot identify what the page offers.

**Article schema — missing on content pages:**
`/como-funciona/reputacion` uses `WebPage` despite `og:type: article`. No `datePublished`, `dateModified`, or `author`. The `speakable` property is absent sitewide.

**SoftwareApplication — one bug:**
`operatingSystem: "Web"` is invalid. Should be `"Web Browser"`.

**FAQPage restriction (since Aug 2023):**
FAQPage rich results only appear for government and health authority sites. Keep for semantic AI value but don't expect rich results.

---

## Category 6: Platform Optimization — 45/100

| Platform | Score | Biggest Gap |
|---|---|---|
| Google AI Overviews | 44/100 | No answer-target paragraphs; H2s use marketing labels not question format; no HowTo schema |
| ChatGPT Web Search | 50/100 | No Wikipedia article; no Wikidata entity; OAI-SearchBot not explicitly listed in robots.txt |
| Perplexity AI | 55/100 | No Reddit/community presence; sitemap lastmod appears dynamically generated; no platform statistics |
| Google Gemini | 28/100 | Zero Google ecosystem presence: no YouTube, no Wikipedia/Wikidata, no Knowledge Graph entry |
| Bing Copilot | 47/100 | No LinkedIn page; no IndexNow; Bingbot not explicitly listed in robots.txt |

---

## Prioritized Action Plan

### CRITICAL (Immediate — highest ROI)

**1. Create a Wikipedia article for Regalalo (es.wikipedia.org)**
The single highest-impact action. Impacts: ChatGPT entity recognition, Perplexity source authority, Gemini Knowledge Graph, Bing entity validation. Notability requires 2-3 external references from Spanish tech or sustainability press. Build press citations first (action #2), then submit.

**2. Pursue Spanish tech/sustainability press coverage**
Target: Xataka, El Referente, Eco Circular, Consumo Circular, TechCrunch Español. Even 2-3 published articles establish Wikipedia notability and create the citation chain AI models follow. Create a press kit page on the site.

**3. Add `sameAs` to the existing Organization schema**
15-minute code change with the highest possible GEO return. Add an array to the Organization block already in the homepage `<head>`:
```json
"sameAs": [
  "https://www.linkedin.com/company/regalalo",
  "https://twitter.com/regalalo_org",
  "https://www.crunchbase.com/organization/regalalo"
]
```

**4. Create a Wikidata entity for Regalalo**
No notability requirements (unlike Wikipedia). 30-60 minutes. Add: instance of = website, country = Spain, official website = regalalo.org. Add the Q-number to `sameAs` in Organization schema. Fastest path to Knowledge Graph signals.

**5. Write meta descriptions for all 7 pages**
30-minute copy task. Only the homepage currently has one. Broadest cross-platform effect.
Example for /explorar: "Explora objetos gratuitos cerca de ti: muebles, ropa, electrónica y más. Donados por personas de tu comunidad a menos de 50 km. Gratis, siempre."

---

### HIGH Priority (Next sprint)

**6. Create an About / Team page**
Name the founders, their backgrounds, and the origin story. Provides Person/Organization schema anchors, gives AI models an entity to reference, dramatically improves E-E-A-T Expertise and Authoritativeness scores.

**7. Publish platform statistics on the homepage**
Real numbers are among the most AI-citable signals. Even modest, accurate numbers ("X objetos donados en Y ciudades") transform a marketing page into a citable data source.

**8. Add /items/ pages to sitemap.xml**
Generate a dynamic sitemap section for active item pages using Supabase data. Since items expire after 7 days, regenerate or serve the sitemap dynamically.

**9. Fix item description truncation bug in JSON-LD**
Decouple the JSON-LD Product schema `description` from the meta description truncation logic. Structured data should use the full item description.

**10. Implement server-side ItemList schema on /explorar**
Generate JSON-LD alongside the item data that already renders the visible cards. Include `Product` types with `Offer` (price: 0 EUR) and Schema.org `itemCondition` enum values. Must be SSR — client-side injection won't be seen by AI crawlers.

**11. Replace WebPage with Article + speakable on /como-funciona pages**
Match `og:type: article` already set in Open Graph. Add `datePublished`, `dateModified`, `author`, and `speakable` with CSS selectors targeting the most citable content sections.

**12. Create LinkedIn company page**
Confirmed 404 at linkedin.com/company/regalalo. A complete profile (description in ES + EN, industry: Platform/Sharing Economy, website, founding year) directly improves Bing Copilot entity recognition and ChatGPT verification.

**13. Add og:image and twitter:card to /explorar**
Page is missing OG image entirely. Twitter card uses `summary` (small thumbnail). Create a branded OG image and add proper social tags.

**14. Create llms-full.txt with complete documentation**
Include: complete reputation point tables verbatim, three-step process with all constraints, category taxonomy, FAQ content, and guiding principles. AI models that access this can cite the site without crawling individual pages.

**15. Fix llms.txt inconsistency**
Remove `/explorar` and `/items/` from the non-standard "Aplicación (no indexar)" section. These paths contain public, citable content that robots.txt correctly allows. Replace section with standard `## Optional` structure.

---

### MEDIUM Priority

**16. Add 3-5 user testimonials or community stories**
Named users (first name + city + specific outcome) serve as Experience signals and AI-citable social proof.

**17. Rewrite H2 headings to question format**
"Cómo funciona" → "¿Cómo funciona Regálalo?" plus a 40-60 word direct answer paragraph below each. This is the answer-target pattern Google AIO and Bing Copilot extract.

**18. Fix www→non-www 307 redirect to 301**
Add `"permanent": true` in `vercel.json` redirects config.

**19. Add width/height attributes to item card images**
All `<img>` in /explorar lack dimension attributes — measurable CLS risk.

**20. Add visible dates to all content pages**
Add `<time datetime="...">` with actual last-modified dates (not dynamically-generated today's date) to all page bodies.

**21. Establish Reddit community presence**
Authentic participation in r/espana, r/sostenibilidad, or equivalent communities. Reddit threads are crawled by Common Crawl and heavily weighted by Perplexity.

**22. Add OAI-SearchBot and Bingbot explicitly to robots.txt**
Currently inheriting via wildcard. Explicit entries signal intentional openness to ChatGPT's search infrastructure and Bing.

**23. Add Content-Signal directive to robots.txt**
```
Content-Signal: ai-train=yes, search=yes, ai-retrieval=yes, ai-personalization=no
```

**24. Implement IndexNow protocol**
Place key file at `https://regalalo.org/{key}.txt`, submit via `api.indexnow.org` on publish/update. Meaningful Bing freshness advantage.

**25. Fix SoftwareApplication operatingSystem**
Change `"Web"` → `"Web Browser"`. One-line fix enabling App rich result eligibility.

**26. Fix CSP header on homepage**
Apply the CSP already in Express middleware to the homepage static asset via `vercel.json` headers config.

---

### LOW Priority

**27. Create YouTube channel + explainer video**
Strongest Google ecosystem signal for Gemini. Even a single verified channel with one 2-3 min video creates a linkable Google ecosystem node.

**28. Add preconnect for Supabase image CDN**
```html
<link rel="preconnect" href="https://xfgdrkyttlulvvjwuros.supabase.co">
```
Reduces DNS + TLS time for first image load on /explorar and item pages.

**29. Add BreadcrumbList to homepage**
Present on /explorar and /reputacion, missing on homepage. Easy win given the pattern is already established.

**30. Rename non-standard llms.txt section**
Remove `## Aplicación (no indexar)` — the spec doesn't define this. Exclusions belong in robots.txt.

**31. Consider slug-based item URLs**
Hybrid pattern like `/items/bolso-maternal-a14435b0` improves SERP quality and link shareability.

**32. Add aggregateRating to SoftwareApplication schema**
Once sufficient user feedback exists — most visually prominent element in App rich results.

---

## Key Strengths to Preserve

1. **AI crawler access (100/100)** — The robots.txt is exemplary. GPTBot, PerplexityBot, and ClaudeBot are all explicitly named and welcomed. Don't change this.
2. **Server-side rendering** — All public content available in initial HTML. No JavaScript execution required for AI crawlers.
3. **Multilingual structure** — ES/CA/EN with correct hreflang on homepage. A meaningful differentiator.
4. **Reputation system documentation** — The /como-funciona/reputacion page is the most citable content on the site: specific numeric values, escalating logic, concrete timelines. Expand it, don't simplify it.
5. **Privacy-first design** — 7-day auto-deletion, no internal chat, contact only after delivery confirmation — strong differentiating trust signals. Make them more prominent.
6. **llms.txt exists** — Structure is correct and the blockquote description is well-written. Most sites don't have this at all.

---

## 30-Day Quick Win Plan

| Week | Actions | Impact |
|---|---|---|
| Week 1 | Write meta descriptions for all 7 pages; fix item description truncation bug; add `sameAs` to Organization schema; create Wikidata entity | Cross-platform, immediate |
| Week 2 | Create LinkedIn company page; add og:image to /explorar; fix 307→301 redirect; add width/height to item card images | Entity + technical |
| Week 3 | Create llms-full.txt; fix llms.txt /explorar inconsistency; rewrite H2s to question format; add Article+speakable to /como-funciona | AI citability |
| Week 4 | Publish platform statistics on homepage; draft and pitch 2 press articles; add IndexNow; fix CSP on homepage | Brand authority foundation |

---

## Content Gap Priority List

For AI models to cite Regalalo.org beyond direct brand queries, this content needs to exist:

1. **About/Team page** — founders, origin story, mission
2. "Guía para donar objetos gratis en España en 2026" — pillar article targeting pre-discovery queries
3. "¿Es seguro Regálalo?" — safety and trust page with specifics
4. "Estadísticas e impacto de la comunidad" — platform data (users, objects donated, waste diverted, cities)
5. "Historias de la comunidad" — 5-10 real user stories with named participants and outcomes
6. Category guides — Cómo donar muebles / ropa / electrónica
7. Comparison content — "Regálalo vs Wallapop vs Vinted — ¿cuál elegir para donar?"
8. Expanded FAQ targeting broader contextual queries

---

## Schema Templates (Ready to Deploy)

### 1. Organization with sameAs (HIGHEST PRIORITY)

Replace the existing Organization block in homepage `<head>`:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Regálalo",
  "alternateName": "Regalalo",
  "url": "https://regalalo.org/",
  "description": "Plataforma comunitaria española de redistribución gratuita de objetos. Los usuarios donan y reciben sin dinero; el acceso depende del historial de participación, no del poder adquisitivo.",
  "logo": {
    "@type": "ImageObject",
    "url": "https://regalalo.org/og-image.png",
    "width": 1200,
    "height": 630
  },
  "foundingDate": "2026",
  "foundingLocation": { "@type": "Country", "name": "Spain" },
  "areaServed": { "@type": "Country", "name": "Spain" },
  "inLanguage": ["es", "ca", "en"],
  "sameAs": [
    "REPLACE: LinkedIn company page URL",
    "REPLACE: Twitter/X profile URL",
    "REPLACE: Wikidata Q-number URL",
    "REPLACE: Wikipedia article URL (once created)",
    "REPLACE: Crunchbase URL"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "hola@regalalo.org",
    "availableLanguage": ["Spanish", "Catalan", "English"]
  }
}
```

### 2. ItemList for /explorar (server-side generated)

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Objetos gratuitos disponibles en España",
  "description": "Tablón de objetos gratuitos disponibles en Regálalo. Filtra por categoría, estado y zona.",
  "url": "https://regalalo.org/explorar",
  "numberOfItems": "REPLACE: active item count",
  "itemListOrder": "https://schema.org/ItemListUnordered",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Product",
        "name": "REPLACE: item name",
        "description": "REPLACE: full item description (not truncated)",
        "image": "REPLACE: Supabase image URL",
        "url": "REPLACE: https://regalalo.org/items/{uuid}",
        "category": "REPLACE: category",
        "itemCondition": "REPLACE: https://schema.org/LikeNewCondition",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock",
          "availableAtOrFrom": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "ES",
              "addressLocality": "REPLACE: city"
            }
          }
        }
      }
    }
  ]
}
```

### 3. Article + speakable for /como-funciona pages

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Tu reputación en Regálalo — Sistema de puntos",
  "description": "Aprende cómo funciona la reputación en Regálalo: cómo ganar puntos donando, qué pasa si no te presentas y cómo afecta tu historial a tu posición en la lista.",
  "url": "https://regalalo.org/como-funciona/reputacion",
  "inLanguage": "es",
  "datePublished": "REPLACE: ISO 8601 date",
  "dateModified": "REPLACE: ISO 8601 last-updated date",
  "image": "https://regalalo.org/og-image.png",
  "author": { "@type": "Organization", "name": "Regálalo", "url": "https://regalalo.org/" },
  "publisher": { "@type": "Organization", "name": "Regálalo", "url": "https://regalalo.org/" },
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["h1", "h2", "p:first-of-type"]
  }
}
```

---

*Report generated by GEO-SEO Claude Code Skill — 2026-06-16*
*Methodology: 5 parallel subagent analysis (AI Visibility, Platform, Technical, Content, Schema)*
